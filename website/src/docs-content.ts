// Documentation content and metadata
// This file contains all the markdown content embedded as strings

export interface DocMeta {
  slug: string;
  title: string;
  description: string;
  icon?: string;
  readTime?: string;
  order: number;
}

export interface DocContent extends DocMeta {
  content: string;
}

// Concepts documentation
export const conceptsDocs: DocContent[] = [
  {
    slug: 'pes-agent',
    title: 'PES Agent',
    description: 'The flagship Plan-Execute-Synthesize orchestration engine for complex, multi-step queries.',
    icon: '🧠',
    readTime: '8 min',
    order: 1,
    content: `# PES Agent Concept Document

## Overview

The **PES (Plan-Execute-Synthesize)** Agent is the flagship orchestration engine within the ART framework. It is designed to handle complex, multi-step queries by breaking them down into a persistent, structured plan (\`TodoList\`), executing that plan step-by-step with state recovery, and synthesizing a final response.

Unlike simple ReAct agents that might loop indefinitely or lose context, the PES Agent uses a **"Plan-and-Solve"** architecture. This ensures that even long-running tasks are robust, observable, and resumable.

## Core Concepts & Scope

### 1. Plan-and-Solve Architecture
The fundamental philosophy of the PES Agent is that **planning is distinct from execution**.
- **Planning:** The agent first thinks holistically about the user's request, decomposing it into a discrete list of dependencies (\`TodoList\`).
- **Execution:** The agent works through this list one item at a time. Each item is its own "micro-task" that can involve multiple tool calls or thoughts.
- **Synthesis:** Once all necessary steps are done, the agent compiles the findings into a cohesive answer.

### 2. State Persistence & Resilience
Every significant change in the agent's lifecycle (plan creation, item start, item completion) is persisted to the \`StateManager\`.
- **Resumability:** If the server crashes or the process is killed mid-task, the next request to the same \`threadId\` will automatically load the saved state and resume execution from the \`PENDING\` item.
- **State Object (\`PESAgentStateData\`):**
  \`\`\`typescript
  interface PESAgentStateData {
      threadId: string;
      intent: string;      // High-level user intent
      title: string;       // Conversation title
      plan: string;        // Textual summary of the plan
      todoList: TodoItem[]; // The structured tasks
      currentStepId: string | null;
      isPaused: boolean;
      suspension?: {       // New in v0.4.7
          suspensionId: string;
          itemId: string;
          toolCall: ParsedToolCall;
          iterationState: any[];
      };
  }
  \`\`\`

### 3. Agent-to-Agent (A2A) Delegation
The PES Agent is a native participant in the A2A system. It can act as an orchestrator that delegates specific sub-tasks to specialized agents (e.g., a "Coding Agent" or "Research Agent") and waits for their asynchronous completion.

---

## Architecture & Execution Flow

The PES Agent's lifecycle is divided into **6 distinct stages**:

### Stage 1: Configuration
- Loads \`ThreadContext\` and user/thread-specific personas.
- Resolves the **System Prompt** hierarchy (Base Persona + Thread Instructions + Call-specific Instructions).

### Stage 2: Context Gathering
- Fetches conversation history (standardized to \`ArtStandardPrompt\` format).
- Loads available tools from the \`ToolRegistry\`.

### Stage 3: Planning (or Refinement)
This is the "Brain" of the agent.
- **New Query:** If no active plan exists, the agent generates a \`TodoList\`.
    - *Observation:* \`INTENT\`, \`TITLE\`, \`PLAN\`, \`PLAN_UPDATE\`.
- **Follow-up Query:** If a plan exists, the agent performs **Plan Refinement**. It updates the existing \`TodoList\` (e.g., adding new steps) to accommodate the new user request.

### Stage 4: Execution Loop
This is the "Engine" of the agent. It iterates through the \`TodoList\` until all items are \`COMPLETED\` or \`FAILED\`.

#### The Outer Loop (Task Management)
1. **Selection:** Finds the next \`PENDING\` item whose dependencies are met.
2. **Persistence:** Marks item as \`IN_PROGRESS\` and saves state.
3. **Execution:** Calls the inner "Process Item" handler.
4. **Result:** Updates item status to \`COMPLETED\` (with result) or \`FAILED\` and saves state.

#### The Inner Loop (ReAct per Item)
For *each* Todo item, the agent enters a mini-ReAct loop (max 5 iterations):
1. **Context Construction:** The agent sees the *current item description* and the *results of previous completed items*.
2. **Thought/Tool:** It can think, call local tools, or delegate to other agents.
3. **Dynamic Updates:** The execution step can return an \`updatedPlan\`, allowing the agent to modify *future* steps based on *current* findings (e.g., "I found a file I didn't expect, I need to add a step to read it").

### Stage 5: Synthesis
- Activated when all tasks are done.
- The agent is presented with a summary of **Completed Tasks** (and their results) and **Failed Tasks**.
- It generates a final user-facing response, separating "Main Content" from "UI Metadata" (e.g., citations, suggested next questions).

### Stage 6: Finalization
- Saves the final AI message to history.
- Records the \`FINAL_RESPONSE\` observation.

---

## Key Features & Capabilities

### 1. Robust Observability
The PES Agent emits a rich stream of observations via the \`ObservationManager\`. This allows UIs to render a "Thinking..." state that is granular and accurate.
- **Hierarchical IDs:** Execution observations (\`TOOL_CALL\`, \`THOUGHTS\`) are linked to the specific \`todoItemId\` via the \`parentId\` field. This allows UIs to show *exactly* which step is generating a log.
- **Stream Events:** \`LLM_STREAM_START\` events signal exactly which phase (Planning, Execution Item #X, Synthesis) is generating tokens.

### 2. A2A Delegation Details
The \`delegate_to_agent\` tool is automatically injected into the execution context.
- **Mechanism:**
    1. Agent calls \`delegate_to_agent(agentId, taskType, input)\`.
    2. PES Agent creates an \`A2ATask\` in the repository.
    3. Uses \`TaskDelegationService\` to notify the target agent.
    4. **BLOCKS** the execution of the current Todo item.
    5. Polling loop checks \`A2ATask\` status until \`COMPLETED\`.
    6. Result is fed back to the PES Agent as a standard tool result.

### 3. Dynamic Plan Refinement
The plan is not static.
- **User-Driven:** "Actually, can you also check X?" triggers a re-plan.
- **Agent-Driven:** If a tool output reveals new work is needed, the agent can self-correct by emitting an \`updatedPlan\` structure during execution.

---

## System Prompts & Personas

The PES Agent uses a sophisticated prompt composition system:

1. **Base Persona:** Defined in code (default "Zoi") or injected at instantiation. Includes high-level goals.
2. **Prompt Templates:**
    - **Planning:** "You are a planning assistant... Create a structured plan..."
    - **Execution:** "You are executing step X... Previous results are Y..."
    - **Synthesis:** "Synthesize a final answer..."
3. **Custom Guidance:** All prompts support a \`[BEGIN_CUSTOM_GUIDANCE]\` block where thread-specific or user-specific instructions are injected.

---

## Developer Usage

### Initialization
\`\`\`typescript
const pesAgent = new PESAgent({
    stateManager,
    conversationManager,
    toolRegistry,
    // ... other dependencies
});
\`\`\`

### Processing a Request
\`\`\`typescript
const response = await pesAgent.process({
    threadId: "thread-123",
    query: "Research the history of Rome and write a summary.",
    userId: "user-456"
});
\`\`\`

### Accessing State (e.g., for UI)
\`\`\`typescript
const state = await stateManager.getAgentState(threadId);
const todoList = state.data.todoList; // Render this list to show progress
\`\`\`

---

## Advanced: Tool-Aware Execution Framework (TAEF) & HITL V2

*New in v0.4.7*

### 1. Tool-Aware Execution Framework (TAEF)
To bridge the gap between "planning" to do something and "actually" doing it, the PES Agent now employs a specialized execution mode:
*   **Step Classification:** Each step in the \`TodoList\` is classified as either a **Tool Step** (requires external action) or a **Reasoning Step** (internal thought).
*   **Strict Validation:** The agent enforces that *required* tools are actually called. If an LLM "hallucinates" a result without calling the tool, the framework intercepts it and issues an **Enforcement Prompt**, forcing a retry.
*   **Token Separation:** Thinking tokens (for the UI stream) are rigorously separated from Response tokens (JSON), ensuring reliable parsing even with verbose models.

### 2. Human-in-the-Loop (HITL) V2
The PES Agent now supports **Blocking Tools**—actions that require explicit user approval (e.g., \`confirmation_tool\`) before proceeding.

#### The Suspension Lifecycle
1.  **Trigger:** A tool is executed and returns a \`status: 'suspended'\`.
2.  **Suspension:**
    *   The PES Agent halts the execution loop immediately.
    *   It generates a \`suspensionId\` and persists the entire execution context (messages, current item) to \`state.suspension\`.
    *   The agent pauses and returns a \`suspended\` status to the UI.
3.  **User Interaction:** The user sees a confirmation request (or other UI) driven by the blocking tool.
4.  **Resumption:**
    *   When the user approves/denies, the client calls \`resumeExecution\` (or just sends a new message to the thread).
    *   The agent detects the existing \`suspension\` state.
    *   It **hydrates** the exact message history from the moment of suspension.
    *   It feeds the user's input (e.g., "Approved") as the tool result and resumes the execution loop exactly where it left off.

This ensures that sensitive actions are never taken without consent, and the agent doesn't "forget" what it was doing during the wait.
`
  },
  {
    slug: 'observations',
    title: 'Observation System',
    description: 'Capture, persist, and broadcast internal agent events in real-time for transparency and debugging.',
    icon: '👁️',
    readTime: '5 min',
    order: 2,
    content: `# Observation System

Reflecting the internal state and execution flow of an agent is critical for transparency, debugging, and user experience. The **Observation System** in the ART framework provides a standardized way to capture, persist, and broadcast these events in real-time.

Observations are immutable records of significant events that occur during an agent's lifecycle, from inferred intents and planning to tool executions and final responses.

## Core Concepts

The system revolves around a few key components:

1.  **\`Observation\`**: The fundamental data structure representing a single event.
2.  **\`ObservationType\`**: A categorical classification of events (e.g., \`PLAN\`, \`TOOL_EXECUTION\`).
3.  **\`ObservationManager\`**: The central service responsible for lifecycle management—creating, persisting, and broadcasting observations.
4.  **\`ObservationSocket\`**: A real-time channel (typically WebSocket-based) that pushes new observations to connected clients (like a UI).
5.  **\`IObservationRepository\`**: An abstraction for the storage layer, allowing observations to be saved to various backends (InMemory, IndexedDB, Supabase, etc.).

## The Observation Structure

Every observation adheres to a strict interface defined in \`src/types/index.ts\`.

\`\`\`typescript
export interface Observation {
  id: string;           // Unique UUID
  threadId: string;     // formatting the conversation thread
  parentId?: string;    // Optional ID linking to a parent object (e.g., a specific TodoItem)
  traceId?: string;     // Distributed tracing ID
  timestamp: number;    // Unix timestamp (ms)
  type: ObservationType;// Category of event
  title: string;        // Human-readable summary
  content: any;         // The payload (structure varies by type)
  metadata?: Record<string, any>; // Extra context
}
\`\`\`

## Observation Types

The \`ObservationType\` enum defines the vocabulary of events the system can express. Below is an exhaustive list of these types and their typical payloads.

### Core Execution Flow

| Type | Description | Typical Content |
| :--- | :--- | :--- |
| **\`INTENT\`** | The agent's understanding of what the user wants to achieve. | \`{ intent: string }\` |
| **\`TITLE\`** | A generated concise title for the conversation thread. | \`{ title: string }\` |
| **\`PLAN\`** | The logical steps the agent intends to take. | \`{ plan: string; rawOutput?: string }\` |
| **\`PLAN_UPDATE\`** | Updates to the existing plan structure. | _Varies based on update_ |
| **\`THOUGHTS\`** | The agent's internal monologue or reasoning process before acting. | \`{ thought: string }\` |
| **\`SYNTHESIS\`** | Events related to the synthesis phase, often where the final response is constructed. | _Varies_ |
| **\`FINAL_RESPONSE\`** | The final message delivered to the user. | \`{ message: ConversationMessage; uiMetadata?: object }\` |

### Tool Usage

| Type | Description | Typical Content |
| :--- | :--- | :--- |
| **\`TOOL_CALL\`** | The decision to call one or more tools. | \`{ toolCalls: ParsedToolCall[] }\` |
| **\`TOOL_EXECUTION\`** | The result of a specific tool execution. | \`{ callId: string; toolName: string; status: 'success' \\| 'error'; output?: any; error?: string }\` |

### State & Status

| Type | Description | Typical Content |
| :--- | :--- | :--- |
| **\`STATE_UPDATE\`** | Changes to the agent's persistent memory/state. | _Application defined_ |
| **\`ITEM_STATUS_CHANGE\`** | Status updates for specific Todo items (e.g., PENDING -> IN_PROGRESS). | _TodoItem status details_ |
| **\`ERROR\`** | Critical errors encountered during execution. | \`{ error: string; stack?: string }\` |

### Streaming Events (LLM)

These types capture the granular progress of an LLM generation stream.

| Type | Description |
| :--- | :--- |
| **\`LLM_STREAM_START\`** | Stream connection established. |
| **\`LLM_STREAM_METADATA\`** | Metadata about the generation (token counts, latency). Content: \`LLMMetadata\`. |
| **\`LLM_STREAM_END\`** | Stream finished successfully. |
| **\`LLM_STREAM_ERROR\`** | Stream interrupted or failed. |

## Usage Example

### Recording an Observation

The \`ObservationManager\` handles the details of ID generation and timestamping. Consumers only need to provide the core data.

\`\`\`typescript
// Inside an agent or system service
await this.observationManager.record({
    threadId: "thread-123",
    type: ObservationType.THOUGHTS,
    content: { thought: "I should check the database for existing records." },
    metadata: { confidence: 0.9 }
});
\`\`\`

### Listening for Observations (Client-Side)

The UI or other clients subscribe via the \`ObservationSocket\` to receive updates in real-time.

\`\`\`typescript
socket.on('observation', (obs: Observation) => {
    console.log(\`New event: \${obs.title}\`, obs.content);
    // Update UI state...
});
\`\`\`
`
  },
  {
    slug: 'state-management',
    title: 'State Management',
    description: 'Robust and flexible state management for agents to maintain persistent memory across conversation turns.',
    icon: '💾',
    readTime: '7 min',
    order: 3,
    content: `# ART Framework State Management Concept

## Overview

The ART (Agentic Reactive Triad) Framework provides a robust and flexible state management system that allows agents to maintain persistent memory across conversation turns. This system is centered around three key concepts:

1. **ThreadConfig**: Configuration settings for a specific conversation thread
2. **AgentState**: Dynamic, evolving state data that agents can use as memory
3. **StateManager**: The orchestration layer that manages loading, saving, and caching of thread context

## Core Components

### ThreadConfig

\`ThreadConfig\` holds the configuration for a single conversation thread. This includes:

- Provider configuration (which LLM provider and model to use)
- Enabled tools for this thread
- History limit (how many past messages to retrieve)
- System prompt overrides
- Agent persona customizations

This configuration is typically set once when a new conversation starts and remains relatively static throughout the conversation.

### AgentState

\`AgentState\` represents the dynamic, evolving state of the agent for a specific thread. This serves as the agent's "memory".

For the **PESAgent** (starting v0.3.9), the state is structured to support its Plan-and-Solve workflow:

\`\`\`typescript
interface PESAgentStateData {
    threadId: string;
    intent: string;
    title: string;
    plan: string; // High level description
    todoList: TodoItem[];
    currentStepId: string | null;
    isPaused: boolean;
}
\`\`\`

The generic \`AgentState\` interface wraps this data:

\`\`\`typescript
interface AgentState {
  data: PESAgentStateData | any; // Application specific data
  version?: number;
  [key: string]: any;
}
\`\`\`

### ThreadContext

\`ThreadContext\` is a container that holds both \`ThreadConfig\` and \`AgentState\` for a thread:

\`\`\`typescript
interface ThreadContext {
  config: ThreadConfig;
  state: AgentState | null;
}
\`\`\`

### StateManager

The \`StateManager\` is the central service that orchestrates loading, saving, and caching of \`ThreadConfig\` and \`AgentState\`. It acts as an abstraction layer over the configured \`StorageAdapter\`.

Key features of the StateManager include:

1. **Thread Context Management**: Loading and saving complete thread contexts
2. **State Saving Strategies**: Supporting both explicit and implicit state saving
3. **Tool Permission Management**: Enabling/disabling tools for specific threads
4. **Configuration Management**: Managing thread-specific configurations

## State Saving Strategies

The ART framework supports two state saving strategies that can be configured when creating an ART instance:

### Explicit Strategy (Default)

In this mode, the agent's state is only saved when you explicitly call \`art.stateManager.setAgentState()\`. This gives you full control but requires you to manage state saving manually within your agent's logic.

**Note on PESAgent:** The \`PESAgent\` implementation internally handles explicit state saving at critical checkpoints (Plan creation, item start, item completion).

\`\`\`typescript
const config: ArtInstanceConfig = {
  // ... other config
  stateSavingStrategy: 'explicit'
};
\`\`\`

### Implicit Strategy

In this mode, the \`StateManager\` automatically saves the \`AgentState\` at the end of a processing cycle, but only if it detects that the state object has been modified. It does this by keeping a snapshot of the state from when it was loaded and comparing it to the state after the agent has run.

\`\`\`typescript
const config: ArtInstanceConfig = {
  // ... other config
  stateSavingStrategy: 'implicit'
};
\`\`\`

## Storage Adapters

The state management system uses storage adapters to persist data. ART provides several built-in adapters:

1. **InMemoryStorageAdapter**: Keeps all data in memory (not persistent)
2. **IndexedDBStorageAdapter**: Uses browser's IndexedDB for client-side persistence
3. **SupabaseStorageAdapter**: Connects to a Supabase (Postgres) database for server-side/cloud persistence

## Working with State in Practice

### Initializing Thread Configuration

Before an agent can process requests for a new thread, you must set up its initial configuration:

\`\`\`typescript
await art.stateManager.setThreadConfig(threadId, {
  providerConfig: {
    provider: 'openai',
    model: 'gpt-4',
    apiKey: 'your-api-key'
  },
  enabledTools: ['calculator', 'web-search'],
  historyLimit: 10
});
\`\`\`

### Loading Thread Context

The agent automatically loads thread context when processing requests, but you can also load it manually:

\`\`\`typescript
const context = await art.stateManager.loadThreadContext(threadId);
\`\`\`

### Saving Agent State

With the explicit strategy, you explicitly save state:

\`\`\`typescript
await art.stateManager.setAgentState(threadId, {
  data: {
    // Custom state data or PESAgentStateData
  },
  version: 1
});
\`\`\`

### Modifying Thread Configuration

You can dynamically modify thread configurations:

\`\`\`typescript
// Enable additional tools
await art.stateManager.enableToolsForThread(threadId, ['file-upload']);

// Disable tools
await art.stateManager.disableToolsForThread(threadId, ['web-search']);

// Get currently enabled tools
const tools = await art.stateManager.getEnabledToolsForThread(threadId);
\`\`\`

## Best Practices

1. **Initialize Configuration First**: Always set up the thread configuration before processing requests
2. **Use Appropriate Storage Adapter**: Choose the right storage adapter for your use case (memory for testing, IndexedDB for web apps, Supabase for server/cloud apps)
3. **Consider State Saving Strategy**: Use explicit strategy for fine-grained control, implicit for automatic management
4. **Handle State Updates Efficiently**: With implicit strategy, modify the state object in place rather than replacing it entirely
5. **Version Your State**: Use the version field in AgentState to track state schema changes
`
  },
  {
    slug: 'ui-system',
    title: 'UI System',
    description: 'The bridge between core agent logic and user interface with reactive real-time data streaming.',
    icon: '🎨',
    readTime: '12 min',
    order: 4,
    content: `# ART Framework UI System

The UI System in the ART Framework is the bridge between the core agent logic and the user interface. It provides a reactive and robust mechanism for displaying data, capturing user interactions, and visualizing the agent's internal state in real-time. This system is designed to be flexible, allowing developers to build a wide range of UIs, from simple chat windows to complex debugging and task management dashboards.

## Core Architecture

The architecture is centered around the \`UISystem\`, a central hub that provides access to four specialized **sockets**. Each socket is a dedicated communication channel for a specific type of data. This separation of concerns ensures that UI components only subscribe to the data they need, making the system efficient and scalable.

All sockets are built on a publish-subscribe model. UI components can **subscribe** to a socket to receive real-time updates and can also query the socket to retrieve **historical data**.

## The Sockets

The \`UISystem\` provides access to the following four sockets:

1.  **\`ConversationSocket\`**: For chat messages.
2.  **\`ObservationSocket\`**: For the agent's internal events and "thoughts".
3.  **\`LLMStreamSocket\`**: For real-time streaming of the Language Model's output.
4.  **\`A2ATaskSocket\`**: For monitoring tasks in multi-agent systems.

---

### 1. ConversationSocket

This is the primary socket for building chat interfaces. It manages the flow of messages between the user and the agent.

#### Purpose

-   Display real-time conversation history.
-   Load past messages in a conversation thread.

#### Data Transmitted: \`ConversationMessage\`

Each message sent through this socket is an object with the following structure:

| Field       | Type                                | Description                                                              |
| :---------- | :---------------------------------- | :----------------------------------------------------------------------- |
| \`messageId\` | \`string\`                            | A unique identifier for the message.                                     |
| \`threadId\`  | \`string\`                            | The identifier of the conversation thread.                               |
| \`role\`      | \`enum\` (\`USER\`, \`AI\`, \`SYSTEM\`, \`TOOL\`) | The sender of the message.                                               |
| \`content\`   | \`string\`                            | The textual content of the message.                                      |
| \`timestamp\` | \`number\`                            | A Unix timestamp (in milliseconds) when the message was created.         |
| \`metadata\`  | \`object\` (optional)                 | Any additional data, such as related tool call information.              |

---

### 2. ObservationSocket

This socket provides a window into the agent's "mind," broadcasting events that occur during its execution cycle. It's invaluable for debugging and for UIs that want to show the agent's "thought process."

#### Purpose

-   Visualize the agent's step-by-step plan.
-   Display tool calls and their results.
-   Debug errors and monitor the agent's state.

#### Data Transmitted: \`Observation\`

| Field       | Type                    | Description                                                              |
| :---------- | :---------------------- | :----------------------------------------------------------------------- |
| \`id\`        | \`string\`                | A unique identifier for the observation.                                 |
| \`threadId\`  | \`string\`                | The identifier of the conversation thread.                               |
| \`traceId\`   | \`string\` (optional)     | An identifier for tracing a request across multiple components.          |
| \`timestamp\` | \`number\`                | A Unix timestamp (in milliseconds).                                      |
| \`type\`      | \`enum\` (\`INTENT\`, \`PLAN\`, ...) | The category of the event (see \`ObservationType\` enum for a full list). |
| \`title\`     | \`string\`                | A concise, human-readable summary of the observation.                    |
| \`content\`   | \`any\`                   | The main data payload, which varies depending on the \`type\`.             |
| \`metadata\`  | \`object\` (optional)     | Additional context, such as the source of the event.                     |

---

### 3. LLMStreamSocket

This socket is designed for high-performance, real-time UI updates. It streams the raw output from the Language Model as it's being generated.

#### Purpose

-   Create a "typewriter" or streaming text effect for the agent's responses.
-   Differentiate between the agent's internal "thinking" tokens and its final response.
-   Handle stream-related events like metadata and errors.

#### Data Transmitted: \`StreamEvent\`

| Field       | Type                                  | Description                                                              |
| :---------- | :------------------------------------ | :----------------------------------------------------------------------- |
| \`type\`      | \`'TOKEN'\`, \`'METADATA'\`, \`'ERROR'\`, \`'END'\` | The type of the stream event.                                            |
| \`data\`      | \`any\`                                 | The content of the event (e.g., a \`string\` for \`TOKEN\`, an \`object\` for \`METADATA\`). |
| \`tokenType\` | \`string\` (optional, enum-like)        | A specific classification for \`TOKEN\` events (e.g., \`AGENT_THOUGHT_LLM_RESPONSE\`). |
| \`threadId\`  | \`string\`                              | The identifier of the conversation thread.                               |
| \`traceId\`   | \`string\`                              | The identifier for the agent execution cycle.                            |
| \`sessionId\` | \`string\` (optional)                   | An identifier for a specific UI tab or window.                           |

---

### 4. A2ATaskSocket

This socket is for advanced use cases involving multiple agents. It monitors the entire lifecycle of agent-to-agent (A2A) tasks.

#### Purpose

-   Build dashboards to track the status of tasks delegated between agents.
-   Manage and visualize complex workflows in multi-agent systems.
-   Debug task failures and monitor agent workloads.

#### Data Transmitted: \`A2ATaskEvent\`

This event is a wrapper that contains information about the event itself (\`eventType\`, \`timestamp\`) and the full task object. The core data is the \`task\` property, which is an \`A2ATask\` object.

| Field (\`A2ATask\`) | Type                  | Description                                                              |
| :---------------- | :-------------------- | :----------------------------------------------------------------------- |
| \`taskId\`          | \`string\`              | Unique identifier for the task.                                          |
| \`threadId\`        | \`string\`              | The thread this task belongs to.                                         |
| \`status\`          | \`enum\` (\`PENDING\`, ...) | The current status of the task.                                          |
| \`payload\`         | \`object\`              | The task's parameters, including \`taskType\` and \`input\` data.            |
| \`sourceAgent\`     | \`A2AAgentInfo\`        | Information about the agent that created the task.                       |
| \`targetAgent\`     | \`A2AAgentInfo\` (opt)  | Information about the agent assigned to the task.                        |
| \`priority\`        | \`enum\` (\`LOW\`, ...)   | The priority level of the task.                                          |
| \`metadata\`        | \`A2ATaskMetadata\`     | Timestamps, retry counts, correlation IDs, etc.                          |
| \`result\`          | \`A2ATaskResult\` (opt) | The result of the task execution.                                        |

---

## Example: Subscribing to TITLE updates

A UI component can subscribe to the \`ObservationSocket\` to receive \`TITLE\` events and set the thread title reactively:

\`\`\`typescript
const unsubscribe = art.uiSystem.getObservationSocket().subscribe(
  (obs) => {
    if (obs.type === 'TITLE' && obs.content?.title) {
      updateThreadTitle(obs.content.title);
    }
  },
  'TITLE',
  { threadId }
);

// Later, to stop listening
unsubscribe();
\`\`\`
`
  },
  {
    slug: 'mcp-system',
    title: 'MCP System',
    description: 'Model Context Protocol integration for connecting to external tools and services.',
    icon: '🔌',
    readTime: '15 min',
    order: 5,
    content: `## MCP in the ART Framework

### What this guide covers
- **Data model** expected by ART's MCP implementation
- **How discovery service cards map** to ART's \`McpServerConfig\`
- **Minimal ArtMcpConfig JSON** for a production-ready Linear HTTP server
- **Initialization & usage** with \`McpManager\` and proxy tools
- **Auth & CORS requirements** and troubleshooting

### Architecture overview
- **ConfigManager**: Loads/persists \`ArtMcpConfig\` in \`localStorage\` under \`art_mcp_config\`, validates and auto-fixes missing arrays (\`tools\`, \`resources\`, \`resourceTemplates\`).
- **McpManager**: Reads config, optionally merges discovery results, pre-registers proxy tools, manages on-demand connections and authentication, and uninstalls servers.
- **McpProxyTool**: Wraps each MCP tool as an ART tool (schema-first), name format: \`mcp_{serverId}_{toolName}\`.
- **McpClientController**: Handles OAuth 2.1 + PKCE, session persistence, CORS via companion extension, streamable HTTP transport, tool listing/calls, token refresh, and sticky \`Mcp-Session-Id\`.
- **Persistence**:
  - \`localStorage\`: \`art_mcp_config\`, \`mcp_client_id\`
  - \`sessionStorage\`: \`access_token\`, \`refresh_token\`, \`token_expires_at\`, \`mcp_oauth_discovery\`, \`mcp_session_id\`, \`code_verifier\`, \`state\`

### Data model expected by ART
- **ArtMcpConfig**: root object \`{ mcpServers: Record<string, McpServerConfig> }\`
- **McpServerConfig** (per-server "card"):
  - \`id\`: unique id (used in tool name prefix)
  - \`type\`: \`'streamable-http'\` (browser-supported transport)
  - \`enabled\`: boolean
  - \`displayName?\`, \`description?\`
  - \`connection\`: \`StreamableHttpConnection\` with \`url\` and optional \`oauth\`
  - \`installation?\`: \`{ source: 'git' | 'npm' | 'manual', ... }\`
  - \`timeout?\`: ms
  - \`tools\`: \`McpToolDefinition[]\` (pre-registration hints; live discovery can replace/update)
  - \`resources\`: \`McpResource[]\` (reserved; current client does not consume)
  - \`resourceTemplates\`: \`McpResourceTemplate[]\` (reserved)

### Minimal ArtMcpConfig JSON (Linear HTTP)
This is a minimal, ready-to-use config entry derived from the sample Linear service card for the ART framework.

\`\`\`json
{
  "mcpServers": {
    "linear-http": {
      "id": "linear-http",
      "type": "streamable-http",
      "enabled": true,
      "displayName": "Linear MCP Server",
      "description": "Linear MCP server using direct HTTP transport for issue tracking.",
      "connection": {
        "url": "https://mcp.linear.app/mcp",
        "oauth": {
          "type": "pkce",
          "authorizationEndpoint": "https://linear.app/oauth/authorize",
          "tokenEndpoint": "https://linear.app/oauth/token",
          "clientId": "public",
          "scopes": "read write issues:create",
          "redirectUri": "https://your.app/callback",
          "resource": "https://mcp.linear.app/mcp"
        }
      },
      "timeout": 30000,
      "tools": [],
      "resources": [],
      "resourceTemplates": []
    }
  }
}
\`\`\`

### Initialization & usage
Enable MCP and register tools from config (and optionally discovery):

\`\`\`typescript
import { McpManager } from '@/systems/mcp';
import { ToolRegistry, StateManager } from '@/core/interfaces';

const toolRegistry: ToolRegistry = /* your registry */;
const stateManager: StateManager = /* your state manager */;

const mcp = new McpManager(toolRegistry, stateManager);
await mcp.initialize({ enabled: true });
\`\`\`

Tools from the Linear server will be registered with names like:
- \`mcp_linear-http_list_issues\`
- \`mcp_linear-http_create_issue\`
- \`mcp_linear-http_update_issue\`
- \`mcp_linear-http_list_teams\`

### Authentication & CORS
- The browser client performs OAuth 2.1 + PKCE and persists session tokens.
- Provide a route/handler for \`/callback\` to receive the authorization code.
- ART requires a companion extension for CORS permissions.

### Troubleshooting
- **OAuth failures**: Ensure your app serves \`/callback\`, scopes match, and time sync is reasonable.
- **Permission errors**: Approve the MCP host in the companion extension.
- **Missing tools**: Seed \`tools\` in config or run install/refresh logic that calls \`listTools()\`.
- **401 during tool call**: Token refresh is automatic; if it fails, a re-auth flow is triggered.
`
  }
];

// How-To Guides documentation
export const howToDocs: DocContent[] = [
  {
    slug: 'connecting-your-ui',
    title: 'Connecting Your UI',
    description: 'Learn how to use the ART Framework\'s public UI System API to build reactive and real-time user interfaces.',
    icon: '🔗',
    readTime: '10 min',
    order: 1,
    content: `# How to Connect Your UI to the ART Framework

This guide provides a comprehensive walkthrough for developers on how to use the ART Framework's public UI System API to build reactive and real-time user interfaces. You will learn how to access the UI sockets, subscribe to events, and fetch historical data to create a rich user experience.

## Prerequisites

Before you begin, you must complete two essential steps:

1.  **Create an \`ArtInstance\`**: This is the main entry point to the framework.
2.  **Set the \`ThreadConfig\` for a conversation**: You **must** configure each conversation thread before you can process messages or listen for events on that thread.

\`\`\`javascript
import { createArtInstance, ThreadConfig } from 'art-framework';
import { artConfig } from './art.config.js';

let art;
const threadId = 'user-123-session-1';

async function initialize() {
  art = await createArtInstance(artConfig);
  
  const initialThreadConfig: ThreadConfig = {
    providerConfig: {
      providerName: 'openai',
      modelId: 'gpt-4o',
      adapterOptions: {
        apiKey: 'sk-your-real-openai-api-key'
      }
    },
    enabledTools: ['CalculatorTool'],
    historyLimit: 50
  };

  await art.stateManager.setThreadConfig(threadId, initialThreadConfig);
}

initialize();
\`\`\`

## 1. Accessing the UI System

The entry point to all UI-related functionality is the \`uiSystem\` object, which is a property of your \`ArtInstance\`.

\`\`\`javascript
const uiSystem = art.uiSystem;
\`\`\`

## 2. Understanding Sockets

The UI System is built on a **publish-subscribe** model. It exposes four specialized **sockets**, each acting as a dedicated channel for a specific type of data.

-   **Subscribing**: Your UI components can \`subscribe\` to a socket to listen for new data in real-time.
-   **Unsubscribing**: Every \`subscribe\` call returns an \`unsubscribe\` function to prevent memory leaks.
-   **Fetching History**: Most sockets have a \`getHistory\` method that allows you to retrieve a log of past data.

---

## 3. Connecting to the ConversationSocket

This is the most common socket, used for building chat interfaces.

### Getting the Socket

\`\`\`javascript
const conversationSocket = art.uiSystem.getConversationSocket();
\`\`\`

### Subscribing to New Messages

\`\`\`javascript
const unsubscribe = conversationSocket.subscribe(
  (message) => {
    console.log('New message received:', message);
  },
  undefined,
  { threadId: 'user-123-session-1' }
);
\`\`\`

### Fetching Message History

\`\`\`javascript
async function loadChatHistory(threadId) {
  const messages = await conversationSocket.getHistory(
    undefined,
    { threadId: threadId, limit: 50 }
  );
  console.log(\`Loaded \${messages.length} messages.\`);
}
\`\`\`

---

## 4. Connecting to the ObservationSocket

This socket lets you visualize the agent's internal "thought process."

\`\`\`javascript
const observationSocket = art.uiSystem.getObservationSocket();

const unsubscribe = observationSocket.subscribe(
  (observation) => {
    if (observation.type === 'TOOL_CALL') {
      console.log('Agent is calling a tool:', observation.content);
    }
  },
  'TOOL_CALL',
  { threadId: 'user-123-session-1' }
);
\`\`\`

---

## 5. Connecting to the LLMStreamSocket

This socket is essential for creating a "typewriter" effect for the agent's response.

\`\`\`javascript
const llmStreamSocket = art.uiSystem.getLLMStreamSocket();

let finalMessage = '';
const unsubscribe = llmStreamSocket.subscribe(
  (streamEvent) => {
    switch (streamEvent.type) {
      case 'TOKEN':
        if (streamEvent.tokenType === 'FINAL_SYNTHESIS_LLM_RESPONSE') {
          finalMessage += streamEvent.data;
        }
        break;
      case 'END':
        console.log('Stream ended. Final message:', finalMessage);
        break;
    }
  },
  undefined,
  { threadId: 'user-123-session-1' }
);
\`\`\`

---

## 6. Connecting to the A2ATaskSocket

This socket is for advanced applications that involve multiple agents.

\`\`\`javascript
const a2aTaskSocket = art.uiSystem.getA2ATaskSocket();

const unsubscribe = a2aTaskSocket.subscribe(
  (taskEvent) => {
    console.log(\`Task \${taskEvent.task.taskId} moved to status: \${taskEvent.task.status}\`);
  },
  { status: ['COMPLETED', 'FAILED'] },
  { threadId: 'user-123-session-1' }
);
\`\`\`
`
  },
  {
    slug: 'creating-and-switching-agents',
    title: 'Creating and Switching Agents',
    description: 'Create custom agents, modify existing ones, and dynamically switch between different agents.',
    icon: '🤖',
    readTime: '8 min',
    order: 2,
    content: `# How to Create and Switch Between Agents in ART Framework

The ART framework provides a flexible agent system that allows developers to create custom agents or modify existing ones. This guide will show you how to create a modified version of the PES agent, create completely new agents, and dynamically switch between different agents.

## Prerequisites

Before you begin, ensure you have:
- A basic understanding of the ART framework architecture
- Familiarity with TypeScript/JavaScript
- An initialized ART instance

## 1. Creating a Modified Version of the PES Agent

The PES (Plan-Execute-Synthesize) agent is the default agent in ART. You can create a modified version by extending the existing PESAgent class.

### Extending the PESAgent Class

\`\`\`typescript
import { PESAgent } from 'art-framework';
import type { AgentProps, AgentFinalResponse } from 'art-framework';

export class CustomPESAgent extends PESAgent {
  async process(props: AgentProps): Promise<AgentFinalResponse> {
    console.log('Custom logic before processing');
    
    const result = await super.process(props);
    
    console.log('Custom logic after processing');
    
    return result;
  }
}
\`\`\`

## 2. Creating Completely New Agents

To create a completely new agent, you need to implement the \`IAgentCore\` interface.

\`\`\`typescript
import { IAgentCore } from 'art-framework';
import type { 
  AgentProps, 
  AgentFinalResponse, 
  ConversationMessage, 
  MessageRole 
} from 'art-framework';
import { generateUUID } from 'art-framework';

export class SimpleAgent implements IAgentCore {
  constructor(private dependencies: {
    stateManager: any;
    conversationManager: any;
    toolRegistry: any;
    reasoningEngine: any;
  }) {}

  async process(props: AgentProps): Promise<AgentFinalResponse> {
    const startTime = Date.now();
    const traceId = props.traceId ?? generateUUID();
    
    // Your agent logic here...
    
    return {
      response: finalAiMessage,
      metadata: {
        threadId: props.threadId,
        traceId: traceId,
        status: 'success',
        totalDurationMs: Date.now() - startTime,
      }
    };
  }
}
\`\`\`

## 3. Dynamically Switching Between Agents

The ART framework allows you to dynamically switch between different agents at initialization time.

### Setting the Agent at Initialization

\`\`\`typescript
import { createArtInstance } from 'art-framework';
import { CustomPESAgent } from './custom-pes-agent';
import type { ArtInstanceConfig } from 'art-framework';

const configWithCustomPES: ArtInstanceConfig = {
  storage: { type: 'memory' },
  providers: {
    // Your provider configuration
  },
  agentCore: CustomPESAgent,
  tools: []
};

const artWithCustomPES = await createArtInstance(configWithCustomPES);
\`\`\`

## Best Practices

1. **Maintain Compatibility**: Ensure your custom agents implement the \`IAgentCore\` interface correctly.
2. **Error Handling**: Implement proper error handling in your custom agents.
3. **Observations**: Record meaningful observations during agent execution.
4. **Resource Management**: Properly manage resources like LLM connections.
5. **Testing**: Thoroughly test your custom agents.
6. **Documentation**: Document your custom agents' behavior and configuration options.
`
  },
  {
    slug: 'customizing-agent-persona',
    title: 'Customizing Agent Persona',
    description: 'Define agent identity and behavior through a powerful, multi-layered persona system.',
    icon: '🎭',
    readTime: '5 min',
    order: 3,
    content: `# How to Customize the Agent's Persona

The ART framework provides a powerful, multi-layered system for customizing the identity and behavior of your agent. This is achieved by defining an \`AgentPersona\` at the instance, thread, or even individual call level, allowing for incredible flexibility.

## What is an Agent Persona?

The \`AgentPersona\` is a configuration object that defines two key aspects of your agent:

-   \`name\`: A string that sets the agent's identity (e.g., "Zoi", "CodeBot").
-   \`prompts\`: An object containing separate system prompts for the two main stages:
    -   \`planning\`: A system prompt that guides the agent's reasoning and tool selection.
    -   \`synthesis\`: A system prompt that shapes the agent's tone and final response structure.

\`\`\`typescript
export interface AgentPersona {
  name: string;
  prompts: {
    planning?: string;
    synthesis?: string;
  };
}
\`\`\`

## The Override Hierarchy

The agent's final persona is resolved using a clear hierarchy:

1.  **Call-level Persona**: Most specific, overrides all others for that single execution.
2.  **Thread-level Persona**: Applies to all executions within a specific conversation thread.
3.  **Instance-level Persona**: Default persona for all agents in the instance.

## How to Use Personas

### 1. Instance-Level (Default Persona)

\`\`\`typescript
import { createArtInstance } from 'art-framework';
import type { ArtInstanceConfig, AgentPersona } from 'art-framework';

const defaultPersona: AgentPersona = {
  name: 'CodeBot',
  prompts: {
    planning: 'You are an expert software engineer...',
    synthesis: 'You are CodeBot, a friendly and helpful coding assistant...'
  }
};

const config: ArtInstanceConfig = {
  storage: { type: 'memory' },
  providers: { /* ... */ },
  persona: defaultPersona,
};

const art = await createArtInstance(config);
\`\`\`

### 2. Thread-Level (Mode Switching)

\`\`\`typescript
const expertModePersona: Partial<AgentPersona> = {
  prompts: {
    synthesis: 'You are CodeBot, speaking to an expert user. Be concise and technical.'
  }
};

const result = await art.process({
  query: 'Implement a binary search tree in Rust.',
  threadId: 'expert-thread-1',
  threadConfig: {
    providerConfig: { /* ... */ },
    persona: expertModePersona,
  },
});
\`\`\`

### 3. Call-Level (Dynamic, One-Time Changes)

\`\`\`typescript
const oneTimePersona: Partial<AgentPersona> = {
  name: 'SecurityAnalyst',
  prompts: {
    planning: 'You are a security analyst. Analyze the following code for vulnerabilities.',
  }
};

const result = await art.process({
  query: 'Review this login function for security issues...',
  threadId: 'expert-thread-1',
  options: {
    persona: oneTimePersona,
  }
});
\`\`\`

By combining these three levels, you have complete control over your agent's identity and behavior.
`
  },
  {
    slug: 'streaming-gemini-thoughts',
    title: 'Streaming Gemini Thoughts',
    description: 'Enable Gemini thinking, stream thought tokens to UI, and persist them for later retrieval.',
    icon: '💭',
    readTime: '5 min',
    order: 4,
    content: `### Using streamed thinking tokens in your UI (and persisting them)

This guide shows how to:
- Enable Gemini thinking
- Stream planning and synthesis thought tokens via \`LLMStreamSocket\`
- Persist thoughts to storage and/or your own DB
- Retrieve persisted thoughts

### 1) Enable Gemini "thinking" on your call

Ensure you're using a Gemini 2.5 model and pass the thinking flags.

\`\`\`typescript
const response = await art.process({
  query: 'Draft a plan, then write a short story',
  threadId,
  options: {
    llmParams: {
      stream: true,
      gemini: {
        thinking: { includeThoughts: true, thinkingBudget: 8096 }
      }
    }
  }
});
\`\`\`

- Planning stream tokens will be typed as \`AGENT_THOUGHT_LLM_THINKING\` / \`AGENT_THOUGHT_LLM_RESPONSE\`.
- Synthesis stream tokens will be typed as \`FINAL_SYNTHESIS_LLM_THINKING\` / \`FINAL_SYNTHESIS_LLM_RESPONSE\`.

### 2) Stream thinking tokens to your UI with LLMStreamSocket

\`\`\`typescript
const llm = art.uiSystem.getLLMStreamSocket();

const unsubscribe = llm.subscribe(
  (evt) => {
    if (evt.type !== 'TOKEN') return;
    const text = String(evt.data ?? '');

    if (evt.tokenType === 'AGENT_THOUGHT_LLM_THINKING') {
      renderPlanningThought(text);
    } else if (evt.tokenType === 'FINAL_SYNTHESIS_LLM_THINKING') {
      renderSynthesisThought(text);
    }
  },
  undefined,
  { threadId }
);
\`\`\`

### 3) Persist thoughts (built-in)

The default \`PESAgent\` automatically records \`ObservationType.THOUGHTS\` for any thinking tokens detected. These are saved through your configured storage adapter.

\`\`\`typescript
const art = await createArtInstance({
  storage: { type: 'indexedDB', dbName: 'MyArtDB' },
  providers: {
    availableProviders: [{ name: 'gemini', adapter: GeminiAdapter }]
  },
});
\`\`\`

### 4) Retrieve persisted thoughts (history)

\`\`\`typescript
import { ObservationType } from 'art-framework';

const obs = art.uiSystem.getObservationSocket();
const history = await obs.getHistory(ObservationType.THOUGHTS, { threadId });

history.forEach((o) => {
  if (o.metadata?.phase === 'planning') renderPlanningThought(o.content?.text);
  if (o.metadata?.phase === 'synthesis') renderSynthesisThought(o.content?.text);
});
\`\`\`

### Notes

- Thinking availability depends on the model. Use Gemini 2.5 family models.
- Real-time UI: use \`LLMStreamSocket\`.
- Persistence/replay: use \`ObservationSocket\` (THOUGHTS).
`
  },
  {
    slug: 'supabase-persistence',
    title: 'Supabase Persistence',
    description: 'Use Supabase as a backend storage solution for persistent, cross-device data storage.',
    icon: '🗄️',
    readTime: '8 min',
    order: 5,
    content: `# Using Supabase for Persistence in ART Framework

## Introduction

The ART framework provides a flexible storage system. The \`SupabaseStorageAdapter\` enables you to use Supabase as a backend storage solution for your ART applications.

Supabase is an open-source Firebase alternative that provides a PostgreSQL database with real-time capabilities, authentication, and auto-generated APIs.

## SupabaseStorageAdapter Features

1. **Persistent Storage**: Data is stored in a Supabase PostgreSQL database.
2. **Collection Mapping**: Maps ART collections to Supabase tables.
3. **CRUD Operations**: Supports Create, Read, Update, and Delete operations.
4. **Query Capabilities**: Implements basic equality filters, limit/skip pagination, and single-key sorting.

## Configuration Options

\`\`\`typescript
interface SupabaseConfig {
  url: string;
  apiKey: string;
  schema?: string;
  tables?: {
    conversations?: string;
    observations?: string;
    state?: string;
    a2a_tasks?: string;
  };
  client?: any;
}
\`\`\`

## Basic Setup

\`\`\`typescript
import { createArtInstance } from '@art-framework/core';
import { SupabaseStorageAdapter } from '@art-framework/integrations/storage/supabase';

const supabaseStorage = new SupabaseStorageAdapter({
  url: 'https://your-project.supabase.co',
  apiKey: 'your-supabase-api-key',
  schema: 'public',
  tables: {
    conversations: 'chat_messages',
    observations: 'agent_observations',
    state: 'thread_states',
    a2a_tasks: 'agent_tasks'
  }
});

const art = await createArtInstance({
  storage: supabaseStorage,
  providers: { /* ... */ },
  tools: []
});
\`\`\`

## Required Database Schema

\`\`\`sql
-- Conversations table
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  threadId TEXT,
  messageId TEXT,
  role TEXT,
  content TEXT,
  timestamp BIGINT,
  metadata JSONB
);

-- Observations table
CREATE TABLE observations (
  id TEXT PRIMARY KEY,
  threadId TEXT,
  traceId TEXT,
  timestamp BIGINT,
  type TEXT,
  title TEXT,
  content JSONB,
  metadata JSONB
);

-- State table
CREATE TABLE state (
  id TEXT PRIMARY KEY,
  config JSONB,
  state JSONB
);

-- A2A Tasks table
CREATE TABLE a2a_tasks (
  id TEXT PRIMARY KEY,
  taskId TEXT,
  threadId TEXT,
  status TEXT,
  payload JSONB,
  sourceAgent JSONB,
  targetAgent JSONB,
  priority TEXT,
  metadata JSONB,
  result JSONB,
  callbackUrl TEXT,
  dependencies TEXT[]
);
\`\`\`

## Best Practices

1. **Use Service Keys Carefully**: Only use service keys on the server-side.
2. **Secure Your Data**: Use Supabase's Row Level Security (RLS) policies.
3. **Monitor Performance**: Consider adding indexes to your tables.
4. **Handle Network Failures**: Implement retry logic for critical operations.
`
  },
  {
    slug: 'creating-custom-provider-adapter',
    title: 'Creating Custom Provider Adapter',
    description: 'Build a custom provider adapter to integrate any LLM inference provider with ART.',
    icon: '⚡',
    readTime: '20 min',
    order: 6,
    content: `# How to Create a Custom Provider Adapter for ART Framework

This guide explains how to create a custom provider adapter for the ART framework to integrate with any LLM inference provider.

## Overview

The ART framework uses a standardized interface for all LLM providers through the \`ProviderAdapter\` interface. Each adapter is responsible for:

1. Translating ART's \`ArtStandardPrompt\` format to the provider's specific API format
2. Making API calls to the LLM provider
3. Converting provider responses into ART's \`StreamEvent\` format
4. Handling both streaming and non-streaming responses

## Core Interface: ProviderAdapter

\`\`\`typescript
export interface ProviderAdapter extends ReasoningEngine {
  readonly providerName: string;
  shutdown?(): Promise<void>;
}

export interface ReasoningEngine {
  call(prompt: ArtStandardPrompt, options: CallOptions): Promise<AsyncIterable<StreamEvent>>;
}
\`\`\`

## StreamEvent Format

\`\`\`typescript
interface StreamEvent {
  type: 'TOKEN' | 'METADATA' | 'ERROR' | 'END';
  data: any;
  tokenType?: 'LLM_THINKING' | 'LLM_RESPONSE' | 'AGENT_THOUGHT_LLM_THINKING' | 'AGENT_THOUGHT_LLM_RESPONSE' | 'FINAL_SYNTHESIS_LLM_THINKING' | 'FINAL_SYNTHESIS_LLM_RESPONSE';
  threadId: string;
  traceId: string;
  sessionId?: string;
}
\`\`\`

## Step-by-Step Implementation

### 1. Create the Adapter Class

\`\`\`typescript
import { ProviderAdapter } from '@/core/interfaces';
import { ArtStandardPrompt, CallOptions, StreamEvent } from '@/types';

export class YourProviderAdapter implements ProviderAdapter {
  readonly providerName = 'your-provider-name';
  private apiKey: string;
  private defaultModel: string;

  constructor(options: YourProviderAdapterOptions) {
    if (!options.apiKey) {
      throw new Error('YourProviderAdapter requires an apiKey.');
    }
    this.apiKey = options.apiKey;
    this.defaultModel = options.model || 'default-model-id';
  }

  async call(prompt: ArtStandardPrompt, options: CallOptions): Promise<AsyncIterable<StreamEvent>> {
    // Translate prompt, make API call, return stream events
  }

  async shutdown(): Promise<void> {
    // Clean up resources
  }
}
\`\`\`

### 2. Register Your Adapter

\`\`\`typescript
import { createArtInstance } from 'art-framework';
import { YourProviderAdapter } from './your-provider-adapter';

const art = await createArtInstance({
  storage: { type: 'memory' },
  providers: {
    availableProviders: [
      {
        name: 'your-provider',
        adapter: YourProviderAdapter,
      }
    ]
  },
});
\`\`\`

### 3. Use in Thread Configuration

\`\`\`typescript
const threadConfig = {
  providerConfig: {
    providerName: 'your-provider',
    modelId: 'your-model-id',
    adapterOptions: {
      apiKey: 'your-api-key',
    }
  },
  enabledTools: [],
  historyLimit: 10
};

await art.stateManager.setThreadConfig('your-thread-id', threadConfig);
\`\`\`

## Best Practices

1. **Follow ART's Message Role Mapping**: Map ART's standardized roles correctly.
2. **Handle Errors Properly**: Convert provider-specific errors to ARTError.
3. **Implement Token Type Classification**: Properly classify token types based on call context.
4. **Use the Framework Logger**: Use \`Logger\` from ART for consistent logging.
5. **Test Thoroughly**: Test both streaming and non-streaming modes.
`
  },
  {
    slug: 'using-hitl-pausing',
    title: 'Using HITL Pausing',
    description: 'Learn how to implement Human-in-the-Loop approval flows using blocking tools and agent suspension.',
    icon: '⏸️',
    readTime: '10 min',
    order: 7,
    content: `# How-to Guide: Using Human-in-the-Loop (HITL) with the PES Agent

This guide explains how to implement Human-in-the-Loop (HITL) functionality using the PES (Plan-Execute-Synthesize) Agent in ART version 0.4.7+.

## Overview

HITL allows the agent to pause execution when a sensitive or "blocking" tool is called. The agent saves its entire execution state and waits for a user decision (Approval/Rejection) before resuming.

---

## 1. Defining a Blocking Tool

To make a tool "blocking," you must set its \`executionMode\` to \`'blocking'\` in the schema and return a \`status: 'suspended'\` from its \`execute\` method.

\`\`\`typescript
import { IToolExecutor, ToolSchema, ToolResult, ExecutionContext } from 'art-framework';

export class ConfirmationTool implements IToolExecutor {
  schema: ToolSchema = {
    name: 'confirm_action',
    description: 'Requests user approval for sensitive actions.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', description: 'The action to confirm' },
        cost: { type: 'number' }
      },
      required: ['action']
    },
    executionMode: 'blocking' // CRITICAL: This enables HITL behavior
  };

  async execute(input: any, context: ExecutionContext): Promise<ToolResult> {
    // Return 'suspended' status to trigger the HITL flow
    return {
      toolName: 'confirm_action',
      status: 'suspended',
      output: { 
        message: \`Action requires approval: \${input.action}\`,
        cost: input.cost 
      }
    };
  }
}
\`\`\`

---

## 2. Handling Suspension in the UI

When a blocking tool is executed, the agent's \`process()\` call will return a response with \`status: 'suspended'\`. Additionally, an observation of type \`AGENT_SUSPENDED\` is emitted.

### Detecting Suspension (via Observations)
Subscribing to observations is the recommended way to handle suspension in streaming UIs.

\`\`\`typescript
art.uiSystem.getObservationSocket().subscribe((observation) => {
  if (observation.type === 'AGENT_SUSPENDED') {
    const { suspensionId, toolName, toolInput, toolOutput } = observation.content;
    
    console.log(\`Agent is waiting for approval for: \${toolName}\`);
    // Render your dialog using these details and the suspensionId
  }
});
\`\`\`

---

## 3. Resuming Execution

Once the user makes a decision, call \`art.resumeExecution()\`.

### Resume Decision Payload
\`\`\`typescript
{
  approved: boolean;
  reason?: string;
  modifiedArgs?: Record<string, unknown>;
}
\`\`\`

### Resuming from UI
\`\`\`typescript
async function handleUserApproval(suspensionId: string, approved: boolean) {
  const result = await art.resumeExecution(
    threadId,
    suspensionId,
    { approved, reason: approved ? "User approved" : "Too risky" }
  );
}
\`\`\`

---

## 4. Handling Rejection

When \`approved: false\` is passed, the framework appends the rejection to the history with a system instruction telling the agent to find an alternative approach or proceed to the next step.

---

## 5. Persistence & Page Refresh

### Checking for Suspended State on Load
\`\`\`typescript
const suspendedState = await art.checkForSuspendedState(threadId);

if (suspendedState) {
  const { suspensionId, toolName, toolInput } = suspendedState;
  // Restore the confirmation dialog
}
\`\`\`
`
  }
];

// Helper functions
export function getConceptBySlug(slug: string): DocContent | undefined {
  return conceptsDocs.find(doc => doc.slug === slug);
}

export function getHowToBySlug(slug: string): DocContent | undefined {
  return howToDocs.find(doc => doc.slug === slug);
}

export function getAllConcepts(): DocContent[] {
  return [...conceptsDocs].sort((a, b) => a.order - b.order);
}

export function getAllHowTos(): DocContent[] {
  return [...howToDocs].sort((a, b) => a.order - b.order);
}
