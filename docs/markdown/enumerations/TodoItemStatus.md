[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / TodoItemStatus

# Enumeration: TodoItemStatus

Defined in: [src/types/pes-types.ts:24](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L24)

Represents the current status of a TodoItem within the PES Agent's execution plan.
These states track the lifecycle of individual steps throughout the agent's processing.

## Enumeration Members

### CANCELLED

> **CANCELLED**: `"cancelled"`

Defined in: [src/types/pes-types.ts:53](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L53)

The item was cancelled before execution could complete.
This may occur due to user intervention, timeout, or agent decision.

***

### COMPLETED

> **COMPLETED**: `"completed"`

Defined in: [src/types/pes-types.ts:41](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L41)

The item has been successfully completed.
The agent will not re-execute items in this state.

***

### FAILED

> **FAILED**: `"failed"`

Defined in: [src/types/pes-types.ts:47](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L47)

The item execution failed and could not be completed.
The agent may retry the item or skip it based on configuration.

***

### IN\_PROGRESS

> **IN\_PROGRESS**: `"in_progress"`

Defined in: [src/types/pes-types.ts:35](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L35)

The item is currently being executed by the agent.
Only one item should be in this state at a time per thread.

***

### PENDING

> **PENDING**: `"pending"`

Defined in: [src/types/pes-types.ts:29](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L29)

The item has been created but has not yet started execution.
This is the initial state for all newly planned items.

***

### WAITING

> **WAITING**: `"waiting"`

Defined in: [src/types/pes-types.ts:59](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L59)

The item is waiting for external conditions to be met.
This is typically used for A2A (Agent-to-Agent) tasks waiting for remote completion.
