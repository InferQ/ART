# PES Agent Concept Document

## Overview

The **PES (Plan-Execute-Synthesize)** Agent is the flagship orchestration engine within the ART framework. It is designed to handle complex, multi-step queries by breaking them down into a persistent, structured plan (`TodoList`), executing that plan step-by-step with state recovery, and synthesizing a final response.

Unlike simple ReAct agents that might loop indefinitely or lose context, the PES Agent uses a **"Plan-and-Solve"** architecture. This ensures that even long-running tasks are robust, observable, and resumable.

## Core Concepts & Scope

### 1. Plan-and-Solve Architecture

The fundamental philosophy of the PES Agent is that **planning is distinct from execution**.

- **Planning:** The agent first thinks holistically about the user's request, decomposing it into a discrete list of dependencies (`TodoList`).
- **Execution:** The agent works through this list one item at a time. Each item is its own "micro-task" that can involve multiple tool calls or thoughts.
- **Synthesis:** Once all necessary steps are done, the agent compiles the findings into a cohesive answer.

### 2. State Persistence & Resilience

Every significant change in the agent's lifecycle (plan creation, item start, item completion) is persisted to the `StateManager`.

- **Resumability:** If the server crashes or the process is killed mid-task, the next request to the same `threadId` will automatically load the saved state and resume execution from the `PENDING` item.
- **State Object (`PESAgentStateData`):**
  ```typescript
  interface PESAgentStateData {
    threadId: string;
    intent: string; // High-level user intent
    title: string; // Conversation title
    plan: string; // Textual summary of the plan
    todoList: TodoItem[]; // The structured tasks
    currentStepId: string | null;
    isPaused: boolean;
    suspension?: {
      // New in v0.4.6
      suspensionId: string;
      itemId: string;
      toolCall: ParsedToolCall;
      iterationState: any[];
    };
    stepOutputs?: Record<string, StepOutputEntry>; // New in v0.4.10
  }
  ```

### 3. Agent-to-Agent (A2A) Delegation

The PES Agent is a native participant in the A2A system. It can act as an orchestrator that delegates specific sub-tasks to specialized agents (e.g., a "Coding Agent" or "Research Agent") and waits for their asynchronous completion.

---

## Architecture & Execution Flow

The PES Agent's lifecycle is divided into **6 distinct stages**:

### Stage 1: Configuration

- Loads `ThreadContext` and user/thread-specific personas.
- Resolves the **System Prompt** hierarchy (Base Persona + Thread Instructions + Call-specific Instructions).

### Stage 2: Context Gathering

- Fetches conversation history (standardized to `ArtStandardPrompt` format).
- Loads available tools from the `ToolRegistry`.

### Stage 3: Planning (or Refinement)

This is the "Brain" of the agent.

- **New Query:** If no active plan exists, the agent generates a `TodoList`.
  - _Observation:_ `INTENT`, `TITLE`, `PLAN`, `PLAN_UPDATE`.
- **Follow-up Query:** If a plan exists, the agent performs **Plan Refinement**. It updates the existing `TodoList` (e.g., adding new steps) to accommodate the new user request.

### Stage 4: Execution Loop

This is the "Engine" of the agent. It iterates through the `TodoList` until all items are `COMPLETED` or `FAILED`.

#### The Outer Loop (Task Management)

1. **Selection:** Finds the next `PENDING` item whose dependencies are met.
2. **Persistence:** Marks item as `IN_PROGRESS` and saves state.
3. **Execution:** Calls the inner "Process Item" handler.
4. **Result:** Updates item status to `COMPLETED` (with result) or `FAILED` and saves state.

#### The Inner Loop (ReAct per Item)

For _each_ Todo item, the agent enters a mini-ReAct loop (max 5 iterations):

1. **Context Construction:** The agent sees the _current item description_ and the _results of previous completed items_.
2. **Thought/Tool:** It can think, call local tools, or delegate to other agents.
3. **Dynamic Updates:** The execution step can return an `updatedPlan`, allowing the agent to modify _future_ steps based on _current_ findings (e.g., "I found a file I didn't expect, I need to add a step to read it").

#### Change Tracking (v0.4.15)

> **New in v0.4.15**: When the agent dynamically modifies its todo list, the `PLAN_UPDATE` observation includes detailed change tracking.

The framework automatically tracks changes to the todo list during execution:

- **What changed**: `added`, `modified`, `removed` arrays in the `changes` field
- **Before/after states**: For modifications and removals, both old and new states are available
- **Timestamps**: When each change was detected

This enables UI implementations to provide real-time visual feedback about plan evolution without manual comparison logic. For examples, see [How-To: Dynamic Todolist Modifications](../how-to/pes-todolist-dynamic-modifications.md#tracking-plan-changes).

### Stage 5: Synthesis

- Activated when all tasks are done.
- The agent is presented with a summary of **Completed Tasks** (and their results) and **Failed Tasks**.
- It generates a final user-facing response, separating "Main Content" from "UI Metadata" (e.g., citations, suggested next questions).

### Stage 6: Finalization

- Saves the final AI message to history.
- Records the `FINAL_RESPONSE` observation.

---

## Key Features & Capabilities

### 1. Robust Observability

The PES Agent emits a rich stream of observations via the `ObservationManager`. This allows UIs to render a "Thinking..." state that is granular and accurate.

- **Hierarchical IDs:** Execution observations (`TOOL_CALL`, `THOUGHTS`) are linked to the specific `todoItemId` via the `parentId` field. This allows UIs to show _exactly_ which step is generating a log.
- **Stream Events:** `LLM_STREAM_START` events signal exactly which phase (Planning, Execution Item #X, Synthesis) is generating tokens.

### 2. A2A Delegation Details

The `delegate_to_agent` tool is automatically injected into the execution context.

- **Mechanism:**
  1. Agent calls `delegate_to_agent(agentId, taskType, input)`.
  2. PES Agent creates an `A2ATask` in the repository.
  3. Uses `TaskDelegationService` to notify the target agent.
  4. **BLOCKS** the execution of the current Todo item.
  5. Polling loop checks `A2ATask` status until `COMPLETED`.
  6. Result is fed back to the PES Agent as a standard tool result.

### 3. Dynamic Plan Refinement

The plan is not static.

- **User-Driven:** "Actually, can you also check X?" triggers a re-plan.
- **Agent-Driven:** If a tool output reveals new work is needed, the agent can self-correct by emitting an `updatedPlan` structure during execution.

---

## System Prompts & Personas

The PES Agent uses a sophisticated prompt composition system:

1. **Base Persona:** Defined in code (default "Zoi") or injected at instantiation. Includes high-level goals.
2. **Prompt Templates:**
   - **Planning:** "You are a planning assistant... Create a structured plan..."
   - **Execution:** "You are executing step X... Previous results are Y..."
   - **Synthesis:** "Synthesize a final answer..."
3. **Custom Guidance:** All prompts support a `[BEGIN_CUSTOM_GUIDANCE]` block where thread-specific or user-specific instructions are injected.

---

## Developer Usage

### Initialization

```typescript
const pesAgent = new PESAgent({
  stateManager,
  conversationManager,
  toolRegistry,
  // ... other dependencies
});
```

### Processing a Request

```typescript
const response = await pesAgent.process({
  threadId: 'thread-123',
  query: 'Research the history of Rome and write a summary.',
  userId: 'user-456',
});
```

### Accessing State (e.g., for UI)

```typescript
const state = await stateManager.getAgentState(threadId);
const todoList = state.data.todoList; // Render this list to show progress
```

---

## Advanced: Tool-Aware Execution Framework (TAEF) & HITL V2

_New in v0.4.6_

### 1. Tool-Aware Execution Framework (TAEF)

To bridge the gap between "planning" to do something and "actually" doing it, the PES Agent now employs a specialized execution mode:

- **Step Classification:** Each step in the `TodoList` is classified as either a **Tool Step** (requires external action) or a **Reasoning Step** (internal thought).
- **Strict Validation:** The agent enforces that _required_ tools are actually called. If an LLM "hallucinates" a result without calling the tool, the framework intercepts it and issues an **Enforcement Prompt**, forcing a retry.
- **Token Separation:** Thinking tokens (for the UI stream) are rigorously separated from Response tokens (JSON), ensuring reliable parsing even with verbose models.

### 2. Smart Result Capture

In recent versions (v0.4.7+), the PES Agent implements "Smart Result Capture" to ensure that data fetched by tools is correctly associated with the `TodoItem`.

**The `output` Property Requirement:**
The framework's internal logic specifically scans the object returned by a tool's `execute()` method for a property named exactly `output`.

- **Success Scenario:** If a tool finishes and the LLM hasn't explicitly extracted a summary, the framework automatically populates `item.result` with `toolResult.output`.
- **Failure Scenario:** If your tool returns data in a differently named property (e.g., `{ data: [...] }` or `{ artifact: { ... } }`), the PES Agent will capture `undefined`. This leads to a "failure chain" where the agent believes information retrieval failed because the previous step's result appears empty in its prompt context.

**Best Practice:** Always wrap your tool's success payload in an `output` key.

### 3. Human-in-the-Loop (HITL) V2

The PES Agent now supports **Blocking Tools**—actions that require explicit user approval (e.g., `confirmation_tool`) before proceeding.

#### Key Design Principle

**User feedback IS the tool result.** When a user provides feedback (approval, text input, selection, etc.), the framework programmatically marks the tool call as SUCCESS with the feedback as the output. The LLM never needs to re-invoke the tool.

#### The Suspension Lifecycle

1.  **Trigger:** A tool is executed and returns a `status: 'suspended'`.
2.  **Suspension:**
    - The PES Agent halts the execution loop immediately.
    - It generates a `suspensionId` and persists the entire execution context (messages, current item) to `state.suspension`.
    - The agent pauses and returns a `suspended` status to the UI.
3.  **User Interaction:** The UI collects user feedback based on the tool's `feedbackSchema` (approval, text input, selection, etc.).
4.  **Resumption:**
    - When the client calls `resumeExecution` with user feedback, the framework:
    - Detects the existing `suspension` state
    - Hydrates the exact message history from the moment of suspension
    - Programmatically completes the tool with user feedback using `createHITLSuccessResult()`
    - Injects a `tool_result` message showing the tool COMPLETED successfully
    - Adds a system message guiding the LLM based on approval/rejection
    - Resumes execution, filtering out any duplicate calls to the completed blocking tool

#### Programmatic Completion Model

Unlike previous versions, the new HITL implementation:

- **No Re-Execution:** Blocking tools are not re-executed after approval. The framework creates a successful result programmatically with the user's feedback.
- **Explicit System Guidance:** Different system messages are injected for approvals vs. rejections:
  - **Approval:** "The blocking tool has been COMPLETED successfully. DO NOT call this tool again. Continue using the feedback provided."
  - **Rejection:** "The user has REJECTED this action. Do NOT retry. Find an alternative or proceed to the next step."
- **Duplicate Prevention:** The framework filters out any LLM attempts to re-call the same blocking tool, preventing infinite suspension loops.

#### Advanced Blocking Tool Configuration

Blocking tools support advanced features via `blockingConfig`:

```typescript
interface BlockingToolConfig {
  feedbackSchema?: HITLFeedbackSchema; // Defines expected input type (confirm, text, select, etc.)
  approvalPrompt?: string; // Message with {{variable}} placeholders
  completesOnApproval?: boolean; // Default: true - framework creates success result
  allowRetryOnReject?: boolean; // Default: true - allows re-planning after rejection
  timeoutMs?: number; // Optional timeout for user response
  category?: string; // For UI grouping (destructive, financial, etc.)
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}
```

This ensures that sensitive actions are never taken without consent, and the agent doesn't "forget" what it was doing during the wait.

---

## Advanced: Execution Configuration (v0.4.10)

### `ExecutionConfig`

The PES Agent's execution behavior is now fully configurable via `ExecutionConfig`:

```typescript
interface ExecutionConfig {
  maxIterations?: number; // Default: 5 - max LLM calls per todo item
  taefMaxRetries?: number; // Default: 2 - max retries when required tools not called
  toolResultMaxLength?: number; // Default: 60000 - max chars for tool result serialization
  enableA2ADelegation?: boolean; // Default: false - must be true to use delegate_to_agent
}
```

**Configuration Hierarchy:** Call options > Thread config > Instance config

### Step Output Table (`stepOutputs`)

_New in v0.4.10_

The PES Agent now maintains a structured **step output table** that:

- **Persists all step outputs** without truncation for cross-step data access
- **Enables resume capability** - full state saved after each step
- **Provides data for synthesis** - complete outputs available (up to `toolResultMaxLength`)

Each completed step is added to `state.stepOutputs` with:

```typescript
interface StepOutputEntry {
  stepId: string;
  description: string;
  stepType: 'tool' | 'reasoning';
  status: TodoItemStatus;
  completedAt?: number;
  rawResult?: any; // Full result, no truncation
  toolResults?: ToolResult[];
}
```

This ensures the LLM can access data from **any** previous step during execution, not just the immediately preceding one.
