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
| **`PLAN_UPDATE`** | Updates to the existing plan structure. | `{ todoList: TodoItem[]; changes: TodoListChanges }` |
| **`THOUGHTS`** | The agent's internal reasoning process. Recorded across all phases. See [Standardized THOUGHTS](#standardized-thoughts-v0411) below. | `{ text: string }` |
| **`SYNTHESIS`** | Events related to the synthesis phase, often where the final response is constructed. | _Varies_ |
| **`FINAL_RESPONSE`** | The final message delivered to the user. | `{ message: ConversationMessage; uiMetadata?: object }` |

### Standardized THOUGHTS (v0.4.11)

> [!IMPORTANT]
> **Breaking Change**: In v0.4.11, the THOUGHTS observation system was standardized to consistently capture agent reasoning across all three PES agent phases: Planning, Execution, and Synthesis.

THOUGHTS observations are now recorded with enhanced metadata:

| Field | Description |
| :--- | :--- |
| `content.text` | The thinking token text from the LLM |
| `metadata.phase` | `'planning'` \| `'execution'` \| `'synthesis'` |
| `metadata.tokenType` | The LLM tokenType (e.g., `PLANNING_LLM_THINKING`) |
| `metadata.timestamp` | Unix timestamp when the token was emitted |
| `metadata.stepId` | (Execution only) The TodoItem ID being executed |
| `metadata.stepDescription` | (Execution only) The TodoItem description |

**Phase-Specific TokenTypes:**

| Phase | Thinking TokenType | Response TokenType |
| :--- | :--- | :--- |
| Planning | `PLANNING_LLM_THINKING` | `PLANNING_LLM_RESPONSE` |
| Execution | `EXECUTION_LLM_THINKING` | `EXECUTION_LLM_RESPONSE` |
| Synthesis | `SYNTHESIS_LLM_THINKING` | `SYNTHESIS_LLM_RESPONSE` |

**Migration from v0.4.10:**
- `AGENT_THOUGHT_LLM_THINKING` → `PLANNING_LLM_THINKING` or `EXECUTION_LLM_THINKING`
- `AGENT_THOUGHT_LLM_RESPONSE` → `PLANNING_LLM_RESPONSE` or `EXECUTION_LLM_RESPONSE`
- `FINAL_SYNTHESIS_LLM_THINKING` → `SYNTHESIS_LLM_THINKING`
- `FINAL_SYNTHESIS_LLM_RESPONSE` → `SYNTHESIS_LLM_RESPONSE`

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

## PLAN_UPDATE Content Structure

> **New in v0.4.15**: `PLAN_UPDATE` observations now include detailed change tracking.

The `content` field of `PLAN_UPDATE` observations contains:

| Field | Type | Description |
|-------|------|-------------|
| `todoList` | `TodoItem[]` | The complete, updated todo list |
| `changes` | `TodoListChanges` | Detailed change deltas (added, modified, removed) |

### Change Tracking Structure

```typescript
interface TodoListChanges {
  timestamp: number;           // When changes were detected
  changes: TodoItemChange[];   // All changes as a flat array
  added: TodoItemChange[];     // Convenience: only additions
  modified: TodoItemChange[];  // Convenience: only modifications
  removed: TodoItemChange[];   // Convenience: only removals
}

interface TodoItemChange {
  type: TodoItemChangeType;    // ADDED, MODIFIED, or REMOVED
  itemId: string;
  timestamp: number;
  item?: TodoItem;             // Present for ADDED and MODIFIED
  previousItem?: TodoItem;     // Present for MODIFIED (before) and REMOVED
}
```

### UI Integration Benefits

This change tracking enables UI implementations to:
- Show visual indicators when items are added/modified/removed
- Animate transitions between plan states
- Highlight specific changes for user attention
- Build change history timelines
- Provide real-time feedback without manual comparison logic

### Example Usage

```typescript
import { ObservationType, TodoItemChangeType } from 'art-framework';

socket.subscribe(
  (observation) => {
    if (observation.type === ObservationType.PLAN_UPDATE) {
      const { todoList, changes } = observation.content;

      // Display summary
      console.log(
        `${changes.added.length} added, ` +
        `${changes.modified.length} modified, ` +
        `${changes.removed.length} removed`
      );

      // Handle specific changes
      changes.added.forEach(c => showBadge(c.itemId, 'added'));
      changes.modified.forEach(c => highlightChange(c.itemId));
      changes.removed.forEach(c => fadeOut(c.itemId));
    }
  },
  ObservationType.PLAN_UPDATE
);
```

For comprehensive examples, see [How-To: Dynamic Todolist Modifications](../how-to/pes-todolist-dynamic-modifications.md#tracking-plan-changes).

## Usage Example

### Recording an Observation

The `ObservationManager` handles the details of ID generation and timestamping. Consumers only need to provide the core data.

```typescript
// Inside an agent or system service
await this.observationManager.record({
    threadId: "thread-123",
    type: ObservationType.THOUGHTS,
    content: { text: "I should check the database for existing records." },
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
