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
      intent: string;      // High-level user intent
      title: string;       // Conversation title
      plan: string;        // Textual summary of the plan
      todoList: TodoItem[]; // The structured tasks
      currentStepId: string | null;
      isPaused: boolean;
      suspension?: {       // New in v0.4.6
          suspensionId: string;
          itemId: string;
          toolCall: ParsedToolCall;
          iterationState: any[];
      };
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
    - *Observation:* `INTENT`, `TITLE`, `PLAN`, `PLAN_UPDATE`.
- **Follow-up Query:** If a plan exists, the agent performs **Plan Refinement**. It updates the existing `TodoList` (e.g., adding new steps) to accommodate the new user request.

### Stage 4: Execution Loop
This is the "Engine" of the agent. It iterates through the `TodoList` until all items are `COMPLETED` or `FAILED`.

#### The Outer Loop (Task Management)
1. **Selection:** Finds the next `PENDING` item whose dependencies are met.
2. **Persistence:** Marks item as `IN_PROGRESS` and saves state.
3. **Execution:** Calls the inner "Process Item" handler.
4. **Result:** Updates item status to `COMPLETED` (with result) or `FAILED` and saves state.

#### The Inner Loop (ReAct per Item)
For *each* Todo item, the agent enters a mini-ReAct loop (max 5 iterations):
1. **Context Construction:** The agent sees the *current item description* and the *results of previous completed items*.
2. **Thought/Tool:** It can think, call local tools, or delegate to other agents.
3. **Dynamic Updates:** The execution step can return an `updatedPlan`, allowing the agent to modify *future* steps based on *current* findings (e.g., "I found a file I didn't expect, I need to add a step to read it").

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
- **Hierarchical IDs:** Execution observations (`TOOL_CALL`, `THOUGHTS`) are linked to the specific `todoItemId` via the `parentId` field. This allows UIs to show *exactly* which step is generating a log.
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
    threadId: "thread-123",
    query: "Research the history of Rome and write a summary.",
    userId: "user-456"
});
```

### Accessing State (e.g., for UI)
```typescript
const state = await stateManager.getAgentState(threadId);
const todoList = state.data.todoList; // Render this list to show progress
```

---

## Advanced: Tool-Aware Execution Framework (TAEF) & HITL V2

*New in v0.4.6*

### 1. Tool-Aware Execution Framework (TAEF)
To bridge the gap between "planning" to do something and "actually" doing it, the PES Agent now employs a specialized execution mode:
*   **Step Classification:** Each step in the `TodoList` is classified as either a **Tool Step** (requires external action) or a **Reasoning Step** (internal thought).
*   **Strict Validation:** The agent enforces that *required* tools are actually called. If an LLM "hallucinates" a result without calling the tool, the framework intercepts it and issues an **Enforcement Prompt**, forcing a retry.
*   **Token Separation:** Thinking tokens (for the UI stream) are rigorously separated from Response tokens (JSON), ensuring reliable parsing even with verbose models.

### 2. Human-in-the-Loop (HITL) V2
The PES Agent now supports **Blocking Tools**—actions that require explicit user approval (e.g., `confirmation_tool`) before proceeding.

#### The Suspension Lifecycle
1.  **Trigger:** A tool is executed and returns a `status: 'suspended'`.
2.  **Suspension:**
    *   The PES Agent halts the execution loop immediately.
    *   It generates a `suspensionId` and persists the entire execution context (messages, current item) to `state.suspension`.
    *   The agent pauses and returns a `suspended` status to the UI.
3.  **User Interaction:** The user sees a confirmation request (or other UI) driven by the blocking tool.
4.  **Resumption:**
    *   When the user approves/denies, the client calls `resumeExecution` (or just sends a new message to the thread).
    *   The agent detects the existing `suspension` state.
    *   It **hydrates** the exact message history from the moment of suspension.
    *   It feeds the user's input (e.g., "Approved") as the tool result and resumes the execution loop exactly where it left off.

This ensures that sensitive actions are never taken without consent, and the agent doesn't "forget" what it was doing during the wait.