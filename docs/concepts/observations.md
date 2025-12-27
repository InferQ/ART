# Observation System

Reflecting the internal state and execution flow of an agent is critical for transparency, debugging, and user experience. The **Observation System** in the ART framework provides a standardized way to capture, persist, and broadcast these events in real-time.

Observations are immutable records of significant events that occur during an agent's lifecycle, from inferred intents and planning to tool executions and final responses.

## Core Concepts

The system revolves around a few key components:

1.  **`Observation`**: The fundamental data structure representing a single event.
2.  **`ObservationType`**: A categorical classification of events (e.g., `PLAN`, `TOOL_EXECUTION`).
3.  **`ObservationManager`**: The central service responsible for lifecycle management—creating, persisting, and broadcasting observations.
4.  **`ObservationSocket`**: A real-time channel (typically WebSocket-based) that pushes new observations to connected clients (like a UI).
5.  **`IObservationRepository`**: An abstraction for the storage layer, allowing observations to be saved to various backends (InMemory, IndexedDB, Supabase, etc.).

## The Observation Structure

Every observation adheres to a strict interface defined in `src/types/index.ts`.

```typescript
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
```

## Observation Types

The `ObservationType` enum defines the vocabulary of events the system can express. Below is an exhaustive list of these types and their typical payloads.

### Core Execution Flow

| Type | Description | Typical Content |
| :--- | :--- | :--- |
| **`INTENT`** | The agent's understanding of what the user wants to achieve. | `{ intent: string }` |
| **`TITLE`** | A generated concise title for the conversation thread. | `{ title: string }` |
| **`PLAN`** | The logical steps the agent intends to take. | `{ plan: string; rawOutput?: string }` |
| **`PLAN_UPDATE`** | Updates to the existing plan structure. | _Varies based on update_ |
| **`THOUGHTS`** | The agent's internal monologue or reasoning process before acting. | `{ thought: string }` |
| **`SYNTHESIS`** | Events related to the synthesis phase, often where the final response is constructed. | _Varies_ |
| **`FINAL_RESPONSE`** | The final message delivered to the user. | `{ message: ConversationMessage; uiMetadata?: object }` |

### Tool Usage

| Type | Description | Typical Content |
| :--- | :--- | :--- |
| **`TOOL_CALL`** | The decision to call one or more tools. | `{ toolCalls: ParsedToolCall[] }` |
| **`TOOL_EXECUTION`** | The result of a specific tool execution. | `{ callId: string; toolName: string; status: 'success' | 'error'; output?: any; error?: string }` |

> [!NOTE]
> For `TOOL_EXECUTION` observations, the `output` property is populated directly from the `output` key returned by the tool's `execute()` method. Ensure your custom tools return data using this key for it to be visible in observations and to the PES Agent.

### State & Status

| Type | Description | Typical Content |
| :--- | :--- | :--- |
| **`STATE_UPDATE`** | Changes to the agent's persistent memory/state. | _Application defined_ |
| **`ITEM_STATUS_CHANGE`** | Status updates for specific Todo items (e.g., PENDING -> IN_PROGRESS). | _TodoItem status details_ |
| **`ERROR`** | Critical errors encountered during execution. | `{ error: string; stack?: string }` |

### Streaming Events (LLM)

These types capture the granular progress of an LLM generation stream.

| Type | Description |
| :--- | :--- |
| **`LLM_STREAM_START`** | Stream connection established. |
| **`LLM_STREAM_METADATA`** | Metadata about the generation (token counts, latency). Content: `LLMMetadata`. |
| **`LLM_STREAM_END`** | Stream finished successfully. |
| **`LLM_STREAM_ERROR`** | Stream interrupted or failed. |

## Usage Example

### Recording an Observation

The `ObservationManager` handles the details of ID generation and timestamping. Consumers only need to provide the core data.

```typescript
// Inside an agent or system service
await this.observationManager.record({
    threadId: "thread-123",
    type: ObservationType.THOUGHTS,
    content: { thought: "I should check the database for existing records." },
    metadata: { confidence: 0.9 }
});
```

### Listening for Observations (Client-Side)

The UI or other clients subscribe via the `ObservationSocket` to receive updates in real-time.

```typescript
socket.on('observation', (obs: Observation) => {
    console.log(`New event: ${obs.title}`, obs.content);
    // Update UI state...
});
```
