# Question 2: Parallelism Within Tool Calls and Todo Lists in ART Framework

**Investigation Date**: 2025-01-17
**Investigators**: 6 Expert Agents (Todo Dependencies, Tool Execution, State & Observations, LLM Calls, Edge Cases, Performance)
**Status**: RESEARCH COMPLETE - IMPLEMENTATION PLAN READY

---

## Executive Summary

### Current State: Strictly Sequential Execution

The ART framework's PES (Plan-Execute-Synthesize) agent executes everything sequentially:

```typescript
// Current: Todo items - one at a time
while (loopContinue) {
    const item = findNextPendingItem();
    await processItem(item);  // Blocks until complete
}

// Current: Tools - one at a time
for (const call of toolCalls) {
    const result = await executeTool(call);  // Blocks until complete
    results.push(result);
}

// Current: LLM calls - serialized
const response = await llm.call(prompt);  // Blocks until complete
```

### What Needs to Change

1. **Todo Item Parallelism** - Execute independent todo items concurrently
2. **Tool Call Parallelism** - Execute independent tools concurrently
3. **LLM Call Parallelism** - Make parallel LLM calls where appropriate
4. **State Synchronization** - Atomic operations for concurrent access
5. **Observation Ordering** - Sequence numbers for parallel events

### Estimated Effort: 6-10 weeks

| Phase | Duration | Complexity | Risk |
|-------|----------|------------|------|
| Foundation | 2-3 weeks | Medium | Low |
| Tool Parallelism | 1-2 weeks | Low | Low |
| LLM Parallelism | 2-3 weeks | High | Medium |
| Testing & Polish | 1-2 weeks | Medium | Low |

---

## Part 1: Todo Item Parallelism

### 1.1 Current Dependency Mechanism

**File**: `src/core/agents/pes-agent.ts`, `src/types/pes-types.ts`

```typescript
interface TodoItem {
    id: string;
    description: string;
    status: TodoItemStatus;  // PENDING | IN_PROGRESS | COMPLETED | FAILED
    dependencies?: string[];  // IDs of items that must complete first
    stepType: 'tool' | 'reasoning';
}

// Current execution: Sequential dependency resolution
while (loopContinue && loopCount < MAX_LOOPS) {
    const pendingItem = pesState.todoList.find(item => {
        if (item.status !== TodoItemStatus.PENDING) return false;
        if (!item.dependencies || item.dependencies.length === 0) return true;

        // Check if all dependencies are complete
        return item.dependencies.every(depId => {
            const depItem = pesState.todoList.find(i => i.id === depId);
            return depItem && depItem.status === TodoItemStatus.COMPLETED;
        });
    });

    if (!pendingItem) break;

    // Execute ONE item at a time
    const itemResult = await this._processTodoItem(...);
}
```

### 1.2 Dependency Graph Analysis

**Key Insight**: Todo items form a Directed Acyclic Graph (DAG). Items at the same "topological level" have no dependencies on each other and can run in parallel.

**Example**:
```
Level 0:  [A] [B] [C]           ← No dependencies, can run in parallel
              ↓   ↓   ↓
Level 1:      [D] [E]           ← Depend on A, B, C respectively
                  ↓   ↓
Level 2:          [F]           ← Depends on D and E
```

### 1.3 Proposed Algorithm: Topological-Level Parallel Execution

**File**: `src/core/agents/pes-agent.ts` (new methods)

```typescript
/**
 * Builds a dependency graph and calculates topological levels
 */
interface DependencyGraph {
    items: Map<string, TodoItem>;
    dependencies: Map<string, Set<string>>;    // itemId -> dependencies
    dependents: Map<string, Set<string>>;      // itemId -> items that depend on this
    levels: Map<string, number>;               // itemId -> topological level
}

function buildDependencyGraph(todoList: TodoItem[]): DependencyGraph {
    const graph: DependencyGraph = {
        items: new Map(),
        dependencies: new Map(),
        dependents: new Map(),
        levels: new Map(),
    };

    // Initialize
    todoList.forEach(item => {
        graph.items.set(item.id, item);
        graph.dependencies.set(item.id, new Set(item.dependencies || []));
        graph.dependents.set(item.id, new Set());
        graph.levels.set(item.id, 0);
    });

    // Build reverse dependencies
    todoList.forEach(item => {
        (item.dependencies || []).forEach(depId => {
            graph.dependents.get(depId)?.add(item.id);
        });
    });

    // Calculate topological levels using Kahn's algorithm variant
    const calculateLevels = () => {
        const inDegree = new Map<string, number>();
        graph.items.forEach((_, id) => {
            inDegree.set(id, graph.dependencies.get(id)!.size);
        });

        const queue: string[] = [];
        inDegree.forEach((degree, id) => {
            if (degree === 0) queue.push(id);
        });

        while (queue.length > 0) {
            const id = queue.shift()!;
            const currentLevel = graph.levels.get(id)!;

            graph.dependents.get(id)!.forEach(dependentId => {
                const newLevel = Math.max(
                    graph.levels.get(dependentId)!,
                    currentLevel + 1
                );
                graph.levels.set(dependentId, newLevel);

                const newInDegree = inDegree.get(dependentId)! - 1;
                inDegree.set(dependentId, newInDegree);
                if (newInDegree === 0) queue.push(dependentId);
            });
        }
    };

    calculateLevels();

    // Detect circular dependencies
    const visited = new Set<string>();
    const detectCycle = (id: string, path: string[]): boolean => {
        if (path.includes(id)) {
            throw new CircularDependencyError([...path, id]);
        }
        if (visited.has(id)) return false;
        visited.add(id);

        for (const depId of graph.dependencies.get(id)!) {
            if (detectCycle(depId, [...path, id])) return true;
        }
        return false;
    };

    graph.items.forEach((_, id) => {
        if (!visited.has(id)) detectCycle(id, []);
    });

    return graph;
}

/**
 * Group items by topological level
 */
function groupByLevel(graph: DependencyGraph): Map<number, TodoItem[]> {
    const levels = new Map<number, TodoItem[]>();

    graph.items.forEach(item => {
        const level = graph.levels.get(item.id) || 0;
        if (!levels.has(level)) levels.set(level, []);
        levels.get(level)!.push(item);
    });

    return levels;
}
```

### 1.4 Parallel Todo Execution

**File**: `src/core/agents/pes-agent.ts`

```typescript
interface ExecutionConfig {
    // Existing config...
    maxIterations: number;
    toolResultMaxLength: number;

    // New parallelism config
    maxTodoConcurrency?: number;           // Default: 1 (sequential)
    enableParallelTodoItems?: boolean;     // Default: false
    enableParallelTools?: boolean;         // Default: false
    maxToolConcurrency?: number;           // Default: 4
}

/**
 * Parallel execution of todo items by topological level
 */
private async _executeTodoListParallel(
    props: AgentProps,
    pesState: PESAgentStateData,
    availableTools: any[],
    runtimeProviderConfig: RuntimeProviderConfig,
    traceId: string,
    executionConfig: ExecutionConfig
): Promise<ExecuteTodoListResult> {
    const maxConcurrency = executionConfig.maxTodoConcurrency || 3;
    const graph = buildDependencyGraph(pesState.todoList);
    const levelGroups = groupByLevel(graph);

    const results = new Map<string, ItemResult>();

    // Execute each level sequentially, items within level in parallel
    for (const [level, items] of levelGroups) {
        this.deps.observationManager.record({
            threadId: props.threadId,
            traceId,
            type: ObservationType.PARALLEL_EXECUTION_START,
            content: { level, itemCount: items.length },
        });

        // Execute all items in this level in parallel (with concurrency limit)
        const levelResults = await this._executeItemsInParallel(
            items,
            pesState,
            availableTools,
            runtimeProviderConfig,
            props.threadId,
            traceId,
            executionConfig,
            maxConcurrency
        );

        // Update state with results
        for (const result of levelResults) {
            results.set(result.itemId, result);
            await this._updateItemState(result.itemId, result, pesState);
            await this._saveState(props.threadId, pesState);
        }

        // Check if any item failed - should we continue?
        const hasFailure = Array.from(results.values()).some(r => !r.success);
        if (hasFailure && executionConfig.stopOnFirstError) {
            break;
        }
    }

    return { results: Array.from(results.values()) };
}

/**
 * Execute multiple items in parallel with concurrency limit
 */
private async _executeItemsInParallel(
    items: TodoItem[],
    pesState: PESAgentStateData,
    availableTools: any[],
    runtimeProviderConfig: RuntimeProviderConfig,
    threadId: string,
    traceId: string,
    executionConfig: ExecutionConfig,
    maxConcurrency: number
): Promise<ItemResult[]> {
    // Semaphore for concurrency control
    class Semaphore {
        private permits: number;
        private queue: Array<() => void> = [];

        constructor(permits: number) {
            this.permits = permits;
        }

        async acquire(): Promise<void> {
            if (this.permits > 0) {
                this.permits--;
                return;
            }
            await new Promise<void>(resolve => this.queue.push(resolve));
        }

        release(): void {
            this.permits++;
            const resolve = this.queue.shift();
            if (resolve) {
                this.permits--;
                resolve();
            }
        }
    }

    const semaphore = new Semaphore(maxConcurrency);

    const executeItem = async (item: TodoItem): Promise<ItemResult> => {
        await semaphore.acquire();
        try {
            return await this._processTodoItem(
                item,
                pesState,
                availableTools,
                runtimeProviderConfig,
                threadId,
                traceId,
                executionConfig
            );
        } finally {
            semaphore.release();
        }
    };

    // Execute all items and wait for completion
    const promises = items.map(item => executeItem(item));
    return Promise.all(promises);
}
```

### 1.5 Configuration Changes

**File**: `src/types/pes-types.ts`

```typescript
interface ExecutionConfig {
    // Existing fields...
    maxIterations: number;
    toolResultMaxLength: number;
    temperature?: number;

    // New parallelism fields
    maxTodoConcurrency?: number;           // Max parallel todo items (default: 1)
    enableParallelTodoItems?: boolean;     // Enable parallel todo execution (default: false)
    enableParallelTools?: boolean;         // Enable parallel tool execution (default: false)
    maxToolConcurrency?: number;           // Max parallel tools (default: 4)
    stopOnFirstError?: boolean;            // Stop on first error (default: false)
}
```

---

## Part 2: Tool Call Parallelism

### 2.1 Current Tool Execution

**File**: `src/systems/tool/ToolSystem.ts`

```typescript
async executeTools(
    toolCalls: ParsedToolCall[],
    threadId: string,
    traceId?: string
): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    // Strictly sequential execution
    for (const call of toolCalls) {
        // Validation, execution, observation recording...

        const executionResult = await executor.execute(call.arguments, executionContext);
        results.push(result);

        // Blocking tool halts execution
        if (result.status === 'suspended') {
            break;
        }
    }

    return results;
}
```

### 2.2 Tool Independence Criteria

Tools can run in parallel if they meet ALL these criteria:

1. **No Data Dependencies**
   - Tool's arguments don't reference outputs from other tools in the batch
   - No implicit dependencies through shared state

2. **Non-Blocking**
   - No tool has `executionMode: 'blocking'` in the batch
   - Or blocking tools are executed separately

3. **Resource Compatible**
   - Tools don't compete for exclusive resources
   - No rate limiting conflicts

4. **Error Isolation**
   - One tool's failure shouldn't prevent others from running
   - Use `Promise.allSettled` instead of `Promise.all`

### 2.3 Dependency Analysis Algorithm

```typescript
/**
 * Analyzes tool calls to determine dependency structure
 */
interface ToolDependencyGraph {
    independent: ParsedToolCall[];      // Can run immediately
    dependent: ParsedToolCall[];        // Must wait for dependencies
    blocking: ParsedToolCall[];         // Must run sequentially
}

function analyzeToolDependencies(toolCalls: ParsedToolCall[]): ToolDependencyGraph {
    const blocking: ParsedToolCall[] = [];
    const independent: ParsedToolCall[] = [];
    const dependent: ParsedToolCall[] = [];

    // Separate blocking tools first
    for (const call of toolCalls) {
        const toolSchema = getToolSchema(call.toolName);

        if (toolSchema.executionMode === 'blocking') {
            blocking.push(call);
        } else if (hasArgumentDependencies(call, toolCalls)) {
            dependent.push(call);
        } else {
            independent.push(call);
        }
    }

    return { independent, dependent, blocking };
}

/**
 * Check if a tool call has dependencies on other tool calls
 */
function hasArgumentDependencies(
    targetCall: ParsedToolCall,
    allCalls: ParsedToolCall[]
): boolean {
    // Check if arguments reference step outputs from other tools
    const args = JSON.stringify(targetCall.arguments);

    for (const call of allCalls) {
        if (call.callId === targetCall.callId) continue;

        // Look for patterns like {{stepOutputs.XYZ}} or similar
        if (args.includes(`stepOutputs`) && args.includes(call.callId)) {
            return true;
        }
    }

    return false;
}
```

### 2.4 Parallel Tool Execution Implementation

**File**: `src/systems/tool/ToolSystem.ts`

```typescript
interface ParallelToolConfig {
    enabled: boolean;
    maxConcurrency: number;
    timeout: number;
}

async executeToolsParallel(
    toolCalls: ParsedToolCall[],
    threadId: string,
    traceId?: string,
    config?: ParallelToolConfig
): Promise<ToolResult[]> {
    if (!toolCalls.length) return [];
    if (!config?.enabled || toolCalls.length === 1) {
        return this.executeTools(toolCalls, threadId, traceId);
    }

    const maxConcurrency = config.maxConcurrency || 4;

    // Analyze dependencies
    const { independent, blocking } = analyzeToolDependencies(toolCalls);

    const results: ToolResult[] = [];

    // Execute independent tools in parallel
    if (independent.length > 0) {
        const parallelResults = await this._executeParallelTools(
            independent,
            threadId,
            traceId,
            maxConcurrency
        );
        results.push(...parallelResults);
    }

    // Execute blocking tools sequentially
    for (const call of blocking) {
        const result = await this._executeSingleTool(call, threadId, traceId);
        results.push(result);

        if (result.status === 'suspended') {
            break; // Suspension halts remaining tools
        }
    }

    return this._orderResults(results, toolCalls);
}

/**
 * Execute tools in parallel with semaphore-based concurrency control
 */
private async _executeParallelTools(
    toolCalls: ParsedToolCall[],
    threadId: string,
    traceId: string | undefined,
    maxConcurrency: number
): Promise<ToolResult[]> {
    const semaphore = new Semaphore(maxConcurrency);

    const executeWithTimeout = async (call: ParsedToolCall): Promise<ToolResult> => {
        await semaphore.acquire();

        try {
            return await Promise.race([
                this._executeSingleTool(call, threadId, traceId),
                this._timeoutAfter(call, 30000), // 30 second timeout
            ]);
        } finally {
            semaphore.release();
        }
    };

    // Use allSettled to handle partial failures
    const settled = await Promise.allSettled(
        toolCalls.map(executeWithTimeout)
    );

    return settled.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            return this._createErrorResult(toolCalls[index], result.reason);
        }
    });
}

/**
 * Simple semaphore implementation
 */
class Semaphore {
    private permits: number;
    private queue: Array<() => void> = [];

    constructor(permits: number) {
        if (permits < 1) throw new Error('Permits must be >= 1');
        this.permits = permits;
    }

    async acquire(): Promise<void> {
        if (this.permits > 0) {
            this.permits--;
            return;
        }

        await new Promise<void>(resolve => {
            this.queue.push(resolve);
        });
    }

    release(): void {
        if (this.queue.length > 0) {
            const resolve = this.queue.shift()!;
            resolve();
        } else {
            this.permits++;
        }
    }
}
```

### 2.5 Handling HITL in Parallel Context

**Challenge**: Multiple tools could suspend simultaneously for user input.

**Solution**: Group suspensions and present them together.

```typescript
interface ParallelSuspensionContext {
    threadId: string;
    suspensionId: string;
    suspendedTools: Array<{
        callId: string;
        toolName: string;
        arguments: any;
    }>;
    timestamp: number;
}

async handleParallelSuspensions(
    suspensions: ToolResult[]
): Promise<ParallelSuspensionContext> {
    const suspensionId = generateId();

    // Group all suspended tools
    const suspendedTools = suspensions
        .filter(r => r.status === 'suspended')
        .map(r => ({
            callId: r.callId,
            toolName: r.toolName,
            arguments: r.arguments,
        }));

    // Create unified suspension context
    const context: ParallelSuspensionContext = {
        threadId: currentThreadId,
        suspensionId,
        suspendedTools,
        timestamp: Date.now(),
    };

    // Emit observation for UI to handle
    await this.observationManager.record({
        type: ObservationType.PARALLEL_SUSPENSION,
        content: context,
    });

    return context;
}

async resumeParallelSuspension(
    suspensionId: string,
    decisions: Map<string, HITLFeedback>
): Promise<void> {
    // Apply all decisions and resume
    for (const [callId, feedback] of decisions) {
        await this.resumeTool(callId, feedback);
    }
}
```

---

## Part 3: Parallel LLM Calls

### 3.1 Opportunities for Parallel LLM Calls

| Phase | Current | Parallel Opportunity |
|-------|---------|---------------------|
| Planning | Single LLM call | Intent + tasks + validation in parallel |
| Execution | One LLM per todo item | Independent items can call LLM in parallel |
| Synthesis | Single LLM call | Analysis + generation + UI metadata in parallel |

### 3.2 Stream Merging Strategies

**Challenge**: Multiple parallel LLM streams need to be merged for the UI.

```typescript
type MergeStrategy =
    | 'concat'      // Append results as they complete
    | 'interleave'  // Interleave tokens from all streams
    | 'alternate'   // Switch between streams periodically
    | 'select-best' // Choose best result based on quality

interface ParallelLLMOptions extends CallOptions {
    mergeStrategy?: MergeStrategy;
    maxConcurrency?: number;
    enableParallel?: boolean;
}

interface ParallelStreamEvent extends StreamEvent {
    sourceId: string;      // Which parallel call
    batchId: string;       // Group related calls
    mergeIndex?: number;   // Position in merged output
}
```

**Implementation**:

```typescript
async parallelLLMCalls(
    prompts: FormattedPrompt[],
    options: ParallelLLMOptions[]
): AsyncIterable<ParallelStreamEvent> {
    const maxConcurrency = options.maxConcurrency || 2;
    const semaphore = new Semaphore(maxConcurrency);

    const streams = prompts.map(async (prompt, index) => {
        await semaphore.acquire();
        try {
            const stream = await this.reasoningEngine.call(prompt, options[index]);
            return { index, stream };
        } finally {
            semaphore.release();
        }
    });

    const resolvedStreams = await Promise.all(streams);

    // Merge based on strategy
    switch (options[0]?.mergeStrategy) {
        case 'interleave':
            return this._interleaveStreams(resolvedStreams);
        case 'concat':
        default:
            return this._concatStreams(resolvedStreams);
    }
}

async *_concatStreams(
    resolvedStreams: Array<{ index: number; stream: AsyncIterable<StreamEvent> }>
): AsyncIterable<ParallelStreamEvent> {
    for (const { index, stream } of resolvedStreams) {
        for await (const event of stream) {
            yield { ...event, sourceId: index.toString() };
        }
    }
}

async *_interleaveStreams(
    resolvedStreams: Array<{ index: number; stream: AsyncIterable<StreamEvent> }>
): AsyncIterable<ParallelStreamEvent> {
    const iterators = resolvedStreams.map(s => ({
        index: s.index,
        iterator: s.stream[Symbol.asyncIterator](),
        current: null as IteratorResult<StreamEvent> | null,
    }));

    while (iterators.some(it => !it.current?.done)) {
        for (const it of iterators) {
            if (it.current?.done) continue;

            it.current = await it.iterator.next();
            if (!it.current.done) {
                yield { ...it.current.value, sourceId: it.index.toString() };
            }
        }
    }
}
```

### 3.3 Parallel Planning Phase

```typescript
async _performPlanningParallel(
    props: AgentProps,
    availableTools: any[],
    executionConfig: ExecutionConfig
): Promise<PlanningResult> {
    if (!executionConfig.enableParallelPlanning) {
        return this._performPlanning(props, availableTools, executionConfig);
    }

    // Build prompts for different aspects
    const intentPrompt = this._buildIntentAnalysisPrompt(props, availableTools);
    const tasksPrompt = this._buildTaskPlanningPrompt(props, availableTools);
    const validationPrompt = this._buildToolValidationPrompt(props, availableTools);

    // Execute in parallel
    const [intentResult, tasksResult, validationResult] = await Promise.all([
        this._callLLM(intentPrompt, props.threadId),
        this._callLLM(tasksPrompt, props.threadId),
        this._callLLM(validationPrompt, props.threadId),
    ]);

    // Merge results
    return {
        intent: intentResult.intent,
        todoList: tasksResult.todoList,
        validatedTools: validationResult.validatedTools,
    };
}
```

---

## Part 4: State & Observation Synchronization

### 4.1 Race Condition Risks

| Risk | Scenario | Impact |
|------|----------|--------|
| Lost updates | Two parallel items update same state | Data corruption |
| Inconsistent stepOutputs | Concurrent writes to stepOutputs | Wrong dependencies |
| Partial state saves | State saved mid-update | Inconsistent state |
| Observation reordering | Events out of order | Confusing timeline |

### 4.2 Optimistic Locking Implementation

**File**: `src/types/pes-types.ts`

```typescript
interface PESAgentStateData {
    // Existing fields...
    todoList: TodoItem[];
    stepOutputs: StepOutputs;
    currentStepId: string | null;

    // New fields for optimistic locking
    version: number;              // Increment on each update
    lastOperationId: string;      // Track last operation
    pendingUpdates: string[];     // Track in-flight updates
}
```

**File**: `src/systems/context/managers/StateManager.ts`

```typescript
interface StateUpdateOptions {
    expectedVersion?: number;
    operationId: string;
    retryOnConflict?: boolean;
    maxRetries?: number;
}

async atomicUpdate(
    threadId: string,
    updater: (state: PESAgentStateData) => PESAgentStateData,
    options: StateUpdateOptions
): Promise<void> {
    const { expectedVersion, operationId, retryOnConflict, maxRetries = 3 } = options;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const currentState = await this.loadAgentState(threadId);

        // Version check
        if (expectedVersion !== undefined && currentState.version !== expectedVersion) {
            if (retryOnConflict) {
                await this._exponentialBackoff(attempt);
                continue;
            }
            throw new ConcurrentModificationError(
                threadId,
                expectedVersion,
                currentState.version
            );
        }

        // Apply update
        const newState = updater(currentState);
        newState.version = currentState.version + 1;
        newState.lastOperationId = operationId;

        // Save and verify
        await this.saveAgentState(threadId, newState);

        // Verify successful save
        const saved = await this.loadAgentState(threadId);
        if (saved.version === newState.version) {
            return; // Success
        }
    }

    throw new StateUpdateError(threadId, 'Max retries exceeded');
}
```

### 4.3 Observation Sequencing

**File**: `src/types/index.ts`

```typescript
interface Observation {
    id: string;
    threadId: string;
    traceId?: string;
    type: ObservationType;
    content: any;
    timestamp: number;

    // New fields for parallel execution
    sequenceNumber?: number;   // Global sequence for ordering
    batchId?: string;          // Group related operations
    causalDependencies?: string[]; // Dependencies for ordering
}
```

**File**: `src/systems/observation/observation-manager.ts`

```typescript
class ObservationManager {
    private sequenceCounter = new Map<string, number>(); // threadId -> counter

    async recordWithSequence(
        data: Omit<Observation, 'id' | 'timestamp' | 'sequenceNumber'>
    ): Promise<Observation> {
        const threadId = data.threadId;

        // Get and increment sequence number
        const currentSequence = this.sequenceCounter.get(threadId) || 0;
        this.sequenceCounter.set(threadId, currentSequence + 1);

        const observation: Observation = {
            ...data,
            id: generateId(),
            timestamp: Date.now(),
            sequenceNumber: currentSequence,
        };

        // Save to storage
        await this.repository.addObservation(observation);

        // Broadcast
        this.socket.notify(observation);

        return observation;
    }

    async batchRecord(
        observations: Omit<Observation, 'id' | 'timestamp' | 'sequenceNumber'>[]
    ): Promise<Observation[]> {
        const threadId = observations[0]?.threadId;
        if (!threadId) return [];

        const startSequence = this.sequenceCounter.get(threadId) || 0;

        const result = observations.map((obs, index) => ({
            ...obs,
            id: generateId(),
            timestamp: Date.now(),
            sequenceNumber: startSequence + index,
        }));

        // Update counter
        this.sequenceCounter.set(threadId, startSequence + observations.length);

        // Batch save
        await this.repository.batchAddObservations(result);

        // Batch broadcast
        result.forEach(obs => this.socket.notify(obs));

        return result;
    }
}
```

### 4.4 Atomic State Operations

```typescript
type StateOperation =
    | { type: 'updateTodoItem'; itemId: string; updates: Partial<TodoItem> }
    | { type: 'updateStepOutput'; stepId: string; output: any }
    | { type: 'setCurrentStep'; stepId: string | null }
    | { type: 'addObservation'; observation: Observation };

interface BatchUpdateResult {
    success: boolean;
    operations: number;
    version: number;
}

async batchUpdate(
    threadId: string,
    operations: StateOperation[]
): Promise<BatchUpdateResult> {
    const operationId = generateId();

    return this.atomicUpdate(threadId, (state) => {
        let newState = { ...state };

        for (const op of operations) {
            switch (op.type) {
                case 'updateTodoItem':
                    newState.todoList = newState.todoList.map(item =>
                        item.id === op.itemId ? { ...item, ...op.updates } : item
                    );
                    break;

                case 'updateStepOutput':
                    newState.stepOutputs = {
                        ...newState.stepOutputs,
                        [op.stepId]: op.output,
                    };
                    break;

                case 'setCurrentStep':
                    newState.currentStepId = op.stepId;
                    break;

                case 'addObservation':
                    // Observations handled separately but tracked
                    break;
            }
        }

        return newState;
    }, { operationId });
}
```

---

## Part 5: Implementation Checklist

### Phase 1: Foundation (2-3 weeks)

**Core Infrastructure**
- [ ] Create `DependencyGraph` class with topological leveling
- [ ] Implement circular dependency detection
- [ ] Add `Semaphore` utility class
- [ ] Add optimistic locking to `StateManager`
- [ ] Create `StateSyncManager` interface
- [ ] Add sequence numbers to observations

**Type Definitions**
- [ ] Add parallel config to `ExecutionConfig`
- [ ] Add parallel fields to `TodoItem`
- [ ] Add `ParallelLLMOptions` interface
- [ ] Add `ParallelStreamEvent` interface
- [ ] Add `StateOperation` types

**Agent Modifications**
- [ ] Add `_executeTodoListParallel()` method
- [ ] Add `_executeItemsInParallel()` method
- [ ] Add dependency graph builder
- [ ] Add level-based grouping

**Tests**
- [ ] Unit tests for dependency graph
- [ ] Unit tests for topological sorting
- [ ] Unit tests for circular dependency detection
- [ ] Unit tests for semaphore
- [ ] Unit tests for optimistic locking

### Phase 2: Tool Parallelism (1-2 weeks)

**Tool System**
- [ ] Implement `executeToolsParallel()` method
- [ ] Add tool dependency analysis
- [ ] Add parallel/dependent/blocking separation
- [ ] Implement timeout handling
- [ ] Add partial failure handling

**HITL Integration**
- [ ] Parallel suspension context
- [ ] Grouped user approval UI
- [ ] Batch resume functionality

**Tests**
- [ ] Integration tests for parallel tools
- [ ] Tests for blocking tools in parallel
- [ ] Tests for tool dependencies
- [ ] Tests for partial failures

### Phase 3: LLM Parallelism (2-3 weeks)

**LLM Integration**
- [ ] Implement `parallelLLMCalls()` in ReasoningEngine
- [ ] Add stream merging strategies
- [ ] Implement concat merging
- [ ] Implement interleave merging
- [ ] Add parallel planning phase
- [ ] Add parallel synthesis phase

**Streaming**
- [ ] Update LLMStreamSocket for parallel events
- [ ] Add sourceId tracking
- [ ] Update UI to handle parallel streams

**Tests**
- [ ] Tests for parallel LLM calls
- [ ] Tests for stream merging
- [ ] Tests for planning parallelization
- [ ] Tests for synthesis parallelization

### Phase 4: Testing & Polish (1-2 weeks)

**Test Suite**
- [ ] Concurrency test suite (50+ threads)
- [ ] Stress tests (100+ parallel operations)
- [ ] Memory leak tests
- [ ] Chaos tests (random failures)

**Documentation**
- [ ] Parallel execution guide
- [ ] Configuration reference
- [ ] Migration guide
- [ ] Performance tuning guide

**Feature Flags**
- [ ] Add `enableParallelTodoItems` flag
- [ ] Add `enableParallelTools` flag
- [ ] Add `enableParallelLLMCalls` flag
- [ ] Add per-environment defaults

---

## Part 6: Edge Cases & Mitigation

| Edge Case | Detection | Prevention | Mitigation |
|-----------|-----------|-------------|------------|
| **Circular dependencies** | Graph cycle detection | Validation at planning time | Error at planning, suggest fix |
| **Deadlock** | Timeout detection | Careful dependency design | Break and retry with timeout |
| **State corruption** | Version checking | Optimistic locking | Retry with fresh state |
| **Observation reordering** | Sequence numbers | Atomic batch recording | Post-process ordering |
| **Resource exhaustion** | Semaphore limits | Configurable max concurrency | Queue and throttle |
| **Partial failure** | Promise.allSettled | Error isolation | Continue with successful |
| **Blocking tool in parallel** | Tool type check | Separate execution path | Execute blocking separately |
| **Memory leak** | Monitoring tests | Proper cleanup | Restart workers periodically |
| **Provider rate limit** | Error detection | Rate limiting per provider | Exponential backoff |
| **Lost updates** | Version stamps | Optimistic locking | Retry on version mismatch |

---

## Part 7: Performance Expectations

### Benchmark Scenarios

| Scenario | Current | With Parallelism | Speedup |
|----------|---------|------------------|---------|
| **5 independent tools (100ms each)** | 500ms | ~100ms | **5x** |
| **3 independent todo items (2s each)** | 6s | ~2s | **3x** |
| **10 web searches in parallel** | 10s | ~1s | **10x** |
| **Mixed workflow (some deps)** | 10s | ~4s | **2.5x** |

### Memory Trade-offs

| Aspect | Sequential | Parallel | Notes |
|--------|------------|----------|-------|
| Base memory | 50MB | 50MB | Same baseline |
| Per concurrent operation | 0MB | 5-10MB | Each parallel stream |
| 10 parallel operations | 50MB | 100-150MB | 2-3x increase |
| **Recommendation** | Monitor memory usage | Set limits | Adjust based on workload |

---

## Part 8: Files to Modify

| File | Changes | Complexity |
|------|---------|------------|
| `src/types/pes-types.ts` | Add parallel config to TodoItem, ExecutionConfig | Low |
| `src/types/index.ts` | Add ParallelLLMOptions, StateSyncManager interfaces | Low |
| `src/core/agents/pes-agent.ts` | Parallel todo execution, dependency graph | High |
| `src/systems/tool/ToolSystem.ts` | Parallel tool execution, semaphore | Medium |
| `src/systems/context/managers/StateManager.ts` | Optimistic locking, atomic operations | Medium |
| `src/systems/observation/observation-manager.ts` | Sequence numbers, batch recording | Medium |
| `src/systems/reasoning/ReasoningEngine.ts` | Parallel LLM call support | Medium |
| `src/systems/ui/llm-stream-socket.ts` | Parallel stream event handling | Low |

**New Files to Create**:

| File | Purpose |
|------|---------|
| `src/utils/DependencyGraph.ts` | Dependency graph building and analysis |
| `src/utils/Semaphore.ts` | Concurrency control utility |
| `src/systems/context/managers/StateSyncManager.ts` | Atomic state operations |
| `src/systems/reasoning/ParallelLLMExecutor.ts` | Parallel LLM execution |
| `tests/concurrency/parallel-todo.test.ts` | Parallel todo tests |
| `tests/concurrency/parallel-tools.test.ts` | Parallel tool tests |
| `tests/concurrency/parallel-llm.test.ts` | Parallel LLM tests |

---

## Part 9: Migration Strategy

### Step 1: Feature Flags (Week 1)

```typescript
// Feature flag configuration
const features = {
    parallelTodoItems: process.env.FEATURE_PARALLEL_TODOS === 'true',
    parallelTools: process.env.FEATURE_PARALLEL_TOOLS === 'true',
    parallelLLM: process.env.FEATURE_PARALLEL_LLM === 'true',
};

// Default configuration
const defaultConfig: ExecutionConfig = {
    enableParallelTodoItems: features.parallelTodoItems,
    enableParallelTools: features.parallelTools,
    maxTodoConcurrency: features.parallelTodoItems ? 3 : 1,
    maxToolConcurrency: features.parallelTools ? 4 : 1,
};
```

### Step 2: Gradual Rollout (Weeks 2-4)

1. **Week 2**: Tool parallelism only
   - Lowest risk
   - Immediate performance benefit
   - Easy to measure

2. **Week 3**: Todo item parallelism
   - Medium risk
   - Requires dependency testing
   - Monitor state consistency

3. **Week 4**: LLM parallelism
   - Higher risk
   - Requires stream merging
   - Monitor provider limits

### Step 3: Monitoring & Rollback (Ongoing)

```typescript
// Track parallel execution metrics
interface ParallelMetrics {
    enabledFeatures: string[];
    parallelExecutions: number;
    fallbacksToSequential: number;
    averageSpeedup: number;
    errorRate: number;
}

// Automatic rollback on high error rate
if (metrics.errorRate > 0.1) {
    Logger.warn('High error rate, disabling parallelism');
    features.parallelTools = false;
    features.parallelTodoItems = false;
}
```

---

## Conclusion

### Summary

| Question | Answer |
|----------|--------|
| Can we parallelize tool calls? | **YES** - With dependency analysis and semaphore control |
| Can we parallelize todo items? | **YES** - With topological-level execution |
| Can we parallelize LLM calls? | **YES** - With stream merging strategies |
| Is it production ready? | **NO** - Requires implementation (6-10 weeks) |
| What are the risks? | State corruption, race conditions, edge cases |
| What's the expected speedup? | **2.5-10x** depending on workload |

### Recommendations

1. **Start with tool parallelism** - Lowest risk, highest reward
2. **Use feature flags** - Enable gradual rollout
3. **Monitor closely** - Track metrics, have rollback ready
4. **Test thoroughly** - Concurrency tests are critical
5. **Document everything** - Parallel execution is complex

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| State corruption | Low | High | Optimistic locking |
| Deadlock | Very Low | High | Timeout detection |
| Performance regression | Low | Medium | Benchmarking |
| Complex debugging | High | Medium | Enhanced logging |
| Feature interaction bugs | Medium | High | Comprehensive testing |
