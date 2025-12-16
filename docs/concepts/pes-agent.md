# PES Agent Concept Document

## Overview

The PES (Plan-Execute-Synthesize) Agent is a core component of the ART framework that implements a structured, stateful approach to AI agent orchestration. Refactored in v0.3.9, it now uses a **Plan-and-Solve** architecture where queries are decomposed into a persisted `TodoList`. This allows for granular execution, pause/resume functionality, and dynamic plan refinement, making it highly robust for complex, multi-step tasks.

## Key Components and Their Roles

### 1. PESAgent Class
The main orchestrator that implements the IAgentCore interface. It coordinates all phases of the agent execution cycle, managing transitions between planning, execution, and synthesis.

### 2. Dependencies
The PESAgent relies on several key dependencies that are injected at initialization:
- **StateManager**: Manages thread configuration and persists the agent's `PESAgentStateData`.
- **ConversationManager**: Handles conversation history.
- **ToolRegistry**: Manages available tools.
- **ReasoningEngine**: Interfaces with LLM providers.
- **OutputParser**: Parses LLM responses into structured plans and execution results.
- **ObservationManager**: Records execution events, now supporting hierarchical observations.
- **ToolSystem**: Orchestrates tool execution.
- **UISystem**: Provides UI communication sockets.
- **A2ATaskRepository**: Manages Agent-to-Agent tasks.
- **AgentDiscoveryService**: Discovers remote agents (optional).
- **TaskDelegationService**: Delegates tasks to remote agents (optional).
- **SystemPromptResolver**: Resolves system prompt hierarchy.
- **Persona**: Optional agent persona defining name and stage-specific prompts.

### 3. PESAgentStateData
A structured state object persisted by the `StateManager` that tracks the agent's progress:
```typescript
interface PESAgentStateData {
    threadId: string;
    intent: string;
    title: string;
    plan: string; // High level description
    todoList: TodoItem[];
    currentStepId: string | null;
    isPaused: boolean;
}
```

## Workflow of the PES Agent

The PES agent follows a stateful workflow:

### Phase 1: Configuration & State Loading
- Loads thread context and configuration.
- Checks for existing `PESAgentStateData`.
- **If no state exists (New Query):** Proceed to Planning Phase.
- **If state exists (Follow-up):** Proceed to Plan Refinement Phase.

### Phase 2: Planning / Refinement
**Initial Planning:**
- Constructs a prompt with the user query and available tools.
- Calls the LLM to generate a structured `TodoList` along with `intent` and `title`.
- **Persists** the initial state.
- Records `INTENT`, `TITLE`, `PLAN`, and `PLAN_UPDATE` observations.

**Plan Refinement:**
- If the user provides a follow-up query while a plan is active, the agent prompts the LLM to *update* the existing `TodoList` (e.g., add new steps, modify existing ones).
- Updates and persists the state.

### Phase 3: Execution Loop (Todo List)
The agent iterates through the `TodoList` items until all are completed or a stop condition is met.

**For each loop iteration:**
1. **Item Selection:** Finds the next `PENDING` item whose dependencies are met.
2. **Status Update:** Marks item as `IN_PROGRESS` and persists state. Records `ITEM_STATUS_CHANGE`.
3. **Item Execution:**
   - Constructs a prompt focused *only* on the current item, including context from previous completed items.
   - **Inner Loop (ReAct):** The agent can think and use tools multiple times (max 5) to complete the single item.
   - **Tool Execution:** Executes local tools or delegates to A2A agents.
   - **A2A Support:** If `delegate_to_agent` is used, the agent waits for the remote task to complete before proceeding.
   - **Dynamic Updates:** The execution step can return an `updatedPlan`, allowing the agent to modify future steps based on current findings.
4. **Completion:** Marks item as `COMPLETED` (or `FAILED`) and persists state. Records `ITEM_STATUS_CHANGE`.

### Phase 4: Synthesis
- Constructs a synthesis prompt with the user query and a **summary of all completed and failed tasks**.
- Calls the LLM to generate a final response.
- Parses the response for main content and UI metadata (sources, suggestions).
- Records `SYNTHESIS` and `FINAL_RESPONSE` observations.

### Phase 5: Finalization
- Saves the final AI message to conversation history.
- Ensures final state is persisted.

## Developer Usage & Features

### 1. Granular Observability
The PES agent records detailed observations. New in this version is the `parentId` field, which links observations (like thoughts or tool calls) to the specific `TodoItem` being executed.

- **Primary Observations:** `INTENT`, `TITLE`, `PLAN`, `PLAN_UPDATE`, `FINAL_RESPONSE`.
- **Secondary Observations (Item-level):** `THOUGHTS`, `TOOL_CALL`, `TOOL_EXECUTION`, `ITEM_STATUS_CHANGE`. These will have `parentId` set to the `itemId`.

### 2. State Persistence & Resumability
Because `PESAgentStateData` is saved after every status change and plan update, the agent is resilient. If the process is interrupted (e.g., server restart), the next request to the same thread will detect the existing state and resume execution from the next pending item.

### 3. Dynamic Plan Refinement
The agent is not locked into its initial plan.
- **User Driven:** Users can change direction in follow-up messages, causing the agent to refine the plan.
- **Agent Driven:** During execution of a step, if the agent discovers new information, it can output an `updatedPlan` to modify the remaining TodoList.

### 4. A2A (Agent-to-Agent) Task System
The execution loop fully supports the A2A system. When a Todo item requires delegation:
1. The agent calls the `delegate_to_agent` tool.
2. The `PESAgent` creates and delegates the task.
3. The execution of that specific item *waits* (blocks) until the remote agent completes the task.
4. The result is fed back into the item's context.

## Workflow Flowchart

```mermaid
flowchart TD
    A[Start: User Query] --> B[Load Config & State]
    B --> C{State Exists?}
    C -->|No| D[Planning Phase]
    C -->|Yes| E[Refinement Phase]
    D --> F[Create & Save TodoList]
    E --> F
    F --> G[Execution Loop]
    G --> H{Pending Items?}
    H -->|Yes| I[Select Next Item]
    I --> J[Mark IN_PROGRESS & Save]
    J --> K[Execute Item (ReAct)]
    K --> L{Tools / A2A?}
    L -->|Yes| M[Execute/Delegate & Wait]
    M --> K
    L -->|No| N[Item Complete]
    N --> O[Mark COMPLETED & Save]
    O --> G
    H -->|No| P[Synthesis Phase]
    P --> Q[Finalize & Save History]
    Q --> R[End]
```
