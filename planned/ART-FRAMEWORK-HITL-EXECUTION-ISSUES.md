# ART Framework: HITL & Tool Execution Issues Analysis

## Executive Summary

After thorough analysis of the ART framework codebase against the reported issues, I've identified a **fundamental architectural gap** between how the framework instructs the LLM during planning and how it expects the LLM to behave during execution. The core issue is **prompt-behavior disconnect**: the framework has all the mechanical components for tool execution working correctly, but the LLM guidance is insufficient to reliably trigger tool invocation during the todo list execution loop.

---

## Verified Issues

### Issue 1: Prompt Guidance Gap Between Planning and Execution Phases

**Severity: HIGH**

**Location**: `src/core/agents/pes-agent.ts:316-361` (planning) vs `src/core/agents/pes-agent.ts:626-654` (execution)

**Evidence**:
The planning phase prompt at line 330-353 tells the LLM:
```typescript
Your goal is to understand the user's query and create a structured plan (Todo List) to answer it.
The todo list should be a logical, methodical, sensible list of steps...
Each step should be an ACTION, e.g., "Execute tool X to...", "Calculate Y..."
```

However, this instruction only describes **how to write todoList descriptions** - it doesn't create an actionable contract between the step description and actual tool invocation.

The execution phase prompt at line 626-654 tells the LLM:
```typescript
You are executing a step in a larger plan.
Current Task: ${item.description}
...
Use tools if necessary. To use a tool, you MUST include it in the 'toolCalls' array in the JSON response.
```

**The Gap**: The planning LLM writes natural language descriptions like "Search for population data" while the execution LLM must independently:
1. Interpret this description
2. Decide which tool maps to it
3. Correctly format a JSON `toolCalls` array

There's no enforcement mechanism ensuring the LLM will actually invoke tools rather than just describing what it would do.

---

### Issue 2: TodoList Item Completion Without Tool Execution Validation

**Severity: HIGH**

**Location**: `src/core/agents/pes-agent.ts:553-566`

**Evidence**:
```typescript
if (itemResult.status === 'success') {
    pendingItem.status = TodoItemStatus.COMPLETED;
    pendingItem.result = itemResult.output;
} else if (itemResult.status === 'wait') {
    // ...
}
```

Items are marked `COMPLETED` when `_processTodoItem` returns successfully, regardless of whether any tools were actually invoked. The status flow is:

```
PENDING → IN_PROGRESS → (LLM generates output) → COMPLETED
                        ↑
                        └─ No validation that tools were called
```

**Real-World Impact**: A step like "Execute webSearch tool to find population data" can be marked COMPLETED even if the LLM simply outputs: "I need to search for population data" without actually calling any tool.

---

### Issue 3: Execution Output Parsing Doesn't Enforce Tool Usage

**Severity: MEDIUM**

**Location**: `src/systems/reasoning/OutputParser.ts:183-249`

**Evidence**:
The `parseExecutionOutput` method gracefully handles both:
- LLM outputs with `toolCalls` array → parsed and returned
- LLM outputs without `toolCalls` → treated as content-only response

```typescript
if (jsonContent && typeof jsonContent === 'object') {
    // ... handles toolCalls if present
} else {
    // No JSON found, treat everything as content
    result.content = processedOutput;
}
```

This is appropriate for flexibility but creates the "silent skip" problem: if the LLM outputs prose instead of structured JSON with tool calls, the framework considers the step executed successfully.

---

### Issue 4: Missing Tool Requirement Declarations in TodoList Schema

**Severity: MEDIUM**

**Location**: `src/types/pes-types.ts:14-29`

**Evidence**:
The `TodoItem` interface:
```typescript
export interface TodoItem {
    id: string;
    description: string;
    status: TodoItemStatus;
    dependencies?: string[]; // IDs of tasks that must be finished first
    result?: any;
    thoughts?: string[];
    toolCalls?: ParsedToolCall[];
    toolResults?: ToolResult[];
    // ...
}
```

**What's Missing**: There's no field like `requiredTools?: string[]` that would allow the planning phase to declare "this step MUST call these tools" and the execution phase to validate against it.

---

### Issue 5: HITL Blocking Tool Mechanism Works, But Is Fragile

**Severity: LOW-MEDIUM**

**Location**: `src/core/agents/pes-agent.ts:803-843`

**Evidence**:
The suspension mechanism is correctly implemented:
```typescript
const suspendedResult = toolResults.find(r => r.status === 'suspended');

if (suspendedResult) {
    Logger.info(`[${traceId}] Suspension triggered by tool ${suspendedResult.toolName}`);
    // ... saves state, returns suspended status
}
```

**The Issue**: This mechanism only works IF the tool is actually invoked. The blocking tool (`ConfirmationTool`) works correctly when called, but the LLM often fails to call it because:
1. The tool description says "YOU MUST EXECUTE THIS TOOL" but the LLM ignores this
2. There's no framework-level enforcement of "when description contains X, tool Y must be called"

---

## Issues NOT Found (Contrary to Original Report)

### Original Claim: "HITL Tool's Promise Never Starts"

**Status: NOT ACCURATE**

The framework doesn't use browser events/promises for HITL. Looking at `ConfirmationTool.ts`:
```typescript
async execute(input: any, context: ExecutionContext): Promise<ToolResult> {
    return {
        status: 'suspended',
        output: { message: `Please confirm: ${input.action}`, details: input.details },
        // ...
    };
}
```

The tool returns `suspended` status immediately. The framework handles this correctly in `pes-agent.ts:807-843`. The issue is that the tool doesn't get invoked, not that the suspension mechanism is broken.

### Original Claim: "handleToolSideEffects is UI-Only"

**Status: NOT APPLICABLE TO FRAMEWORK**

This refers to application-level code (`chat-context.tsx`) in the user's application, not the ART framework itself. The framework's `ToolSystem.ts:52-134` correctly executes tools and returns results.

---

## Root Cause Analysis

The fundamental issue is an **LLM Guidance Architecture Gap**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PLANNING PHASE                    EXECUTION PHASE              │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │ LLM sees:        │              │ LLM sees:        │        │
│  │ - User query     │              │ - Step desc      │        │
│  │ - Tool schemas   │              │ - Tool schemas   │        │
│  │                  │              │ - Previous results│       │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                 │                   │
│           ▼                                 ▼                   │
│  "Create todoList with        "Execute step, optionally        │
│   descriptive steps"           call tools if needed"           │
│           │                                 │                   │
│           ▼                                 ▼                   │
│  TodoItem {                    LLM can:                        │
│    description: string         - Output JSON with toolCalls    │
│    // No tool requirement      - Output prose (no tools)       │
│  }                             - Describe what it would do     │
│                                          │                      │
│                                          ▼                      │
│                                Item marked COMPLETED            │
│                                (regardless of tool usage)       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

The gap is in the **contract** between planning and execution:
1. Planning doesn't declare tool requirements
2. Execution doesn't validate tool usage
3. Completion happens without verification

---

## Proposed Holistic Fix

### Approach: Tool-Aware Execution Framework (TAEF)

The fix requires changes at three levels:

#### Level 1: Schema Enhancement (TodoItem with Tool Requirements)

```typescript
// Enhanced TodoItem interface
export interface TodoItem {
    id: string;
    description: string;
    status: TodoItemStatus;
    dependencies?: string[];

    // NEW: Step type classification
    stepType?: 'tool' | 'reasoning';    // Explicit step type declaration

    // NEW: Tool execution requirements (only for tool steps)
    requiredTools?: string[];           // Tools that MUST be called (when stepType is 'tool')
    expectedOutcome?: string;           // Description of expected result
    toolValidationMode?: 'strict' | 'advisory';  // Enforce or warn

    // Execution tracking
    result?: any;
    actualToolCalls?: ParsedToolCall[];  // What was actually called
    toolResults?: ToolResult[];
    validationStatus?: 'passed' | 'failed' | 'skipped';
}
```

#### Level 2: Planning Prompt Enhancement

**Important Design Principle**: Not every todo list item needs to be a tool call. The planning LLM should create a sensible mix of:

1. **Tool Steps**: Steps that require external data, user interaction, or side effects (e.g., search, confirm, calculate)
2. **Reasoning Steps**: Steps where the LLM processes, analyzes, or synthesizes context from previous steps without needing external tools

The framework should only enforce tool validation on steps that explicitly declare tool requirements.

```typescript
const enhancedPlanningPrompt = `
You are a planning assistant. Create a structured plan that may include both tool-based and reasoning-based steps.

STEP TYPES:
1. **Tool Steps**: When you need external data, user input, or to perform actions.
   - MUST include "requiredTools" array specifying which tools to call
   - Examples: searching the web, getting user confirmation, performing calculations

2. **Reasoning Steps**: When you need to analyze, synthesize, or process information from previous steps.
   - Do NOT include "requiredTools" - these steps use LLM reasoning only
   - Examples: comparing data, drawing conclusions, formatting responses

CRITICAL: Only specify "requiredTools" when that step genuinely requires tool invocation.
For reasoning/synthesis steps, omit "requiredTools" entirely.

Output Format:
---JSON_OUTPUT_START---
{
  "todoList": [
    {
      "id": "step_1",
      "description": "Search for population statistics",
      "stepType": "tool",
      "requiredTools": ["webSearch"],           // ← Tool step: explicit declaration
      "expectedOutcome": "Retrieved population data for top 5 countries"
    },
    {
      "id": "step_2",
      "description": "Analyze the retrieved data to identify trends",
      "stepType": "reasoning",                  // ← Reasoning step: no tools needed
      "expectedOutcome": "Identified top 3 population growth trends"
    },
    {
      "id": "step_3",
      "description": "Get user confirmation before proceeding with detailed analysis",
      "stepType": "tool",
      "requiredTools": ["displayConfirmation"], // ← HITL tool step
      "expectedOutcome": "User approval received"
    },
    {
      "id": "step_4",
      "description": "Synthesize findings into a comprehensive summary",
      "stepType": "reasoning",                  // ← Reasoning step: works with prior context
      "expectedOutcome": "Final summary ready for presentation"
    }
  ]
}
---JSON_OUTPUT_END---

Available Tools:
${JSON.stringify(toolsJson, null, 2)}
`;
```

#### Level 2b: Execution Prompt Enhancement

The execution prompt must also be step-type aware. For **tool steps**, it should strongly emphasize tool invocation. For **reasoning steps**, it should focus on processing context.

```typescript
private buildExecutionPrompt(item: TodoItem, completedItemsContext: string, executionTools: any[]): string {
    const isToolStep = item.stepType === 'tool' || (item.requiredTools && item.requiredTools.length > 0);

    if (isToolStep) {
        // TOOL STEP PROMPT: Emphasize tool invocation
        return `You are executing a TOOL STEP in a larger plan.

Current Task: ${item.description}
Required Tools: ${item.requiredTools?.join(', ') || 'None specified'}
Expected Outcome: ${item.expectedOutcome || 'Complete the task'}

Previous Steps Results:
${completedItemsContext}

CRITICAL INSTRUCTIONS FOR TOOL STEPS:
1. This step REQUIRES you to invoke tools. You MUST include the required tools in your 'toolCalls' array.
2. Do NOT just describe what you would do - actually call the tools.
3. If you include 'toolCalls', do NOT include any text after the JSON block.
4. The system will suspend and provide tool results in the next turn.

Available Tools:
${JSON.stringify(executionTools, null, 2)}

Output Format:
\`\`\`json
{
  "toolCalls": [
    { "toolName": "${item.requiredTools?.[0] || 'toolName'}", "arguments": { ... } }
  ]
}
\`\`\`
`;
    } else {
        // REASONING STEP PROMPT: Emphasize analysis and synthesis
        return `You are executing a REASONING STEP in a larger plan.

Current Task: ${item.description}
Expected Outcome: ${item.expectedOutcome || 'Provide analysis or synthesis'}

Previous Steps Results:
${completedItemsContext}

INSTRUCTIONS FOR REASONING STEPS:
1. This step requires you to ANALYZE, SYNTHESIZE, or PROCESS the information from previous steps.
2. You do NOT need to call any tools for this step.
3. Focus on drawing insights, making comparisons, or preparing output based on available context.
4. Provide your reasoning and conclusions in the 'content' field.

Output Format:
\`\`\`json
{
  "content": "Your analysis, synthesis, or reasoning output here...",
  "nextStepDecision": "continue"
}
\`\`\`

If during your reasoning you realize you actually need external data that wasn't retrieved, you MAY include a 'toolCalls' array, but this should be rare for reasoning steps.
`;
    }
}
```

This step-type-aware prompting significantly improves LLM compliance:
- **Tool steps** get explicit "YOU MUST CALL TOOLS" instructions with the required tool names
- **Reasoning steps** get explicit "FOCUS ON ANALYSIS" instructions, reducing false tool calls

---

#### Level 3: Execution Validation Enhancement

The validation logic respects the `stepType` distinction:
- **Tool steps** (`stepType: 'tool'`): Validate that declared `requiredTools` were actually invoked
- **Reasoning steps** (`stepType: 'reasoning'`): Skip tool validation entirely - LLM output is accepted as-is

```typescript
// Enhanced _processTodoItem with conditional validation
private async _processTodoItem(
    props: AgentProps,
    item: TodoItem,
    // ... other params
): Promise<ProcessItemResult> {

    // Execute as normal...
    const parsed = await this.deps.outputParser.parseExecutionOutput(responseText);

    // NEW: Validate tool usage ONLY for tool-type steps
    const isToolStep = item.stepType === 'tool' || (item.requiredTools && item.requiredTools.length > 0);

    if (isToolStep && item.requiredTools && item.requiredTools.length > 0) {
        const calledToolNames = new Set(parsed.toolCalls?.map(tc => tc.toolName) || []);
        const missingTools = item.requiredTools.filter(t => !calledToolNames.has(t));

        if (missingTools.length > 0) {
            if (item.toolValidationMode === 'strict') {
                // RE-PROMPT the LLM with explicit instruction
                return await this._retryWithToolEnforcement(item, missingTools, parsed);
            } else {
                // Log warning but continue
                Logger.warn(`Step ${item.id} did not invoke required tools: ${missingTools.join(', ')}`);
                item.validationStatus = 'failed';
            }
        } else {
            item.validationStatus = 'passed';
        }
    } else {
        // Reasoning step or no tool requirements - validation not applicable
        item.validationStatus = 'skipped';
    }

    // ... continue with normal flow
}

private async _retryWithToolEnforcement(
    item: TodoItem,
    missingTools: string[],
    previousAttempt: ExecutionOutput
): Promise<ProcessItemResult> {

    const enforcementPrompt = `
Your previous response did not call the required tools: ${missingTools.join(', ')}

This step REQUIRES you to call these tools. You MUST include them in your toolCalls array.
Do not describe what you would do - actually call the tools.

REQUIRED OUTPUT FORMAT:
\`\`\`json
{
  "toolCalls": [
    { "toolName": "${missingTools[0]}", "arguments": { ... } }
  ]
}
\`\`\`

Try again. Call the required tools.
`;

    // Re-call LLM with enforcement prompt
    return await this._executeWithPrompt(item, enforcementPrompt);
}
```

#### Level 4: Execution Loop Enhancement

```typescript
// Enhanced execution loop with validation checkpoints
while (loopContinue && loopCount < MAX_LOOPS) {
    // ... existing logic ...

    const itemResult = await this._processTodoItem(/* ... */);

    // NEW: Check validation status before marking complete
    if (itemResult.status === 'success') {
        if (pendingItem.validationStatus === 'failed' && pendingItem.toolValidationMode === 'strict') {
            // Don't mark complete - retry or fail
            pendingItem.status = TodoItemStatus.IN_PROGRESS;
            continue; // Retry the item
        }

        pendingItem.status = TodoItemStatus.COMPLETED;
        pendingItem.result = itemResult.output;
        pendingItem.actualToolCalls = itemResult.toolCalls; // Track what was called
    }

    // ... rest of loop ...
}
```

---

## Implementation Phases

### Phase 1: Schema & Type Changes (Low Risk)
- Update `TodoItem` interface in `src/types/pes-types.ts`
- Add `stepType`, `requiredTools`, `validationStatus`, `expectedOutcome` fields
- Update OutputParser to handle new fields from planning output
- **Estimated complexity**: Small

### Phase 2: Prompt Enhancements (Medium Risk)
- **Planning Prompt**: Modify `_performPlanning` to instruct LLM about step types
- **Execution Prompt**: Add `buildExecutionPrompt()` method with step-type-aware prompting
- Ensure backward compatibility with existing plans (treat missing `stepType` as 'reasoning')
- **Estimated complexity**: Medium

### Phase 3: Execution Validation (Higher Risk)
- Implement `_retryWithToolEnforcement` method
- Add conditional validation logic to `_processTodoItem`
- Skip validation for reasoning steps, enforce for tool steps
- Add configurable validation modes ('strict' vs 'advisory')
- **Estimated complexity**: Medium-High

### Phase 4: Testing & Edge Cases
- Test with various LLM providers (Gemini, OpenAI, Anthropic may format differently)
- Verify reasoning steps complete without false validation failures
- Verify tool steps actually invoke declared tools
- Add retry limits to prevent infinite loops on stubborn LLMs
- Test HITL flow end-to-end with blocking tools
- **Estimated complexity**: Medium

---

## Alternative Approaches Considered

### Approach A: Parser-Based Tool Detection
Analyze step descriptions and auto-inject tool requirements.
- **Rejected because**: Too fragile, relies on keyword matching

### Approach B: Two-Pass Execution
First pass: LLM outputs tool calls. Second pass: Execute and synthesize.
- **Rejected because**: Doubles latency, doesn't solve the core issue

### Approach C: Strict JSON-Only LLM Mode
Force LLM to always output structured JSON, never prose.
- **Rejected because**: Reduces flexibility for simple conversational steps

### Approach D: Tool-Aware Execution Framework (Selected)
Explicit declaration during planning, validation during execution.
- **Selected because**: Clean contract, configurable strictness, backward compatible

---

## Files Requiring Changes

| File | Change Type | Risk |
|------|-------------|------|
| `src/types/pes-types.ts` | Add `stepType`, `requiredTools`, `validationStatus` fields to TodoItem | Low |
| `src/core/agents/pes-agent.ts` | Add `buildExecutionPrompt()`, validation logic, retry mechanism | High |
| `src/core/agents/pes-agent.ts` | Update `_performPlanning()` with enhanced planning prompt | Medium |
| `src/core/agents/pes-agent.ts` | Update `_processTodoItem()` with step-type-aware execution | High |
| `src/systems/reasoning/OutputParser.ts` | Parse new TodoItem fields from planning output | Low |
| `src/core/interfaces.ts` | Update type exports | Low |

---

## Conclusion

The ART framework has solid mechanical foundations for tool execution. The HITL suspension mechanism, tool registration, and execution flow all work correctly. The gap is in the **LLM guidance layer** - there's no contract ensuring that planned tool usage actually happens during execution.

The proposed Tool-Aware Execution Framework (TAEF) addresses this by:
1. **Distinguishing step types**: Explicitly classifying steps as either `tool` (requires external invocation) or `reasoning` (LLM processes context from previous steps)
2. **Making tool requirements explicit**: When a step requires tools, declaring them upfront during planning
3. **Conditional validation**: Only enforcing tool invocation on steps that declare tool requirements - reasoning steps are validated by their output content, not tool usage
4. **Retry mechanisms**: For tool steps where validation fails, re-prompting the LLM with explicit instructions
5. **Backward compatibility**: Supporting 'advisory' mode for gradual adoption

This holistic fix ensures that:
- When a user says "search for data and ask me before proceeding," those tool steps will invoke the required tools
- When a step genuinely needs to analyze or synthesize previous results without external data, the LLM can do so without false validation failures
- The planning LLM creates semantically meaningful plans that mix tool invocations with reasoning as appropriate for the task
