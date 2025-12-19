[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ExecutionMetadata

# Interface: ExecutionMetadata

Defined in: [src/types/index.ts:831](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L831)

Metadata summarizing an agent execution cycle, including performance metrics and outcomes.

 ExecutionMetadata

## Properties

### error?

> `optional` **error**: `string`

Defined in: [src/types/index.ts:876](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L876)

A top-level error message if the overall status is 'error' or 'partial'.

***

### llmCalls

> **llmCalls**: `number`

Defined in: [src/types/index.ts:861](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L861)

The number of calls made to the `ReasoningEngine`.

***

### llmCost?

> `optional` **llmCost**: `number`

Defined in: [src/types/index.ts:871](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L871)

An optional estimated cost for the LLM calls made during this execution.

***

### llmMetadata?

> `optional` **llmMetadata**: [`LLMMetadata`](LLMMetadata.md)

Defined in: [src/types/index.ts:881](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L881)

Aggregated metadata from LLM calls made during the execution.

***

### status

> **status**: `"error"` \| `"success"` \| `"partial"`

Defined in: [src/types/index.ts:851](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L851)

The overall status of the execution ('success', 'error', or 'partial' if some steps failed but a response was generated).

***

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:836](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L836)

The thread ID associated with this execution cycle.

***

### toolCalls

> **toolCalls**: `number`

Defined in: [src/types/index.ts:866](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L866)

The number of tool execution attempts made by the `ToolSystem`.

***

### totalDurationMs

> **totalDurationMs**: `number`

Defined in: [src/types/index.ts:856](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L856)

The total duration of the `agent.process()` call in milliseconds.

***

### traceId?

> `optional` **traceId**: `string`

Defined in: [src/types/index.ts:841](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L841)

The trace ID used during this execution, if provided.

***

### userId?

> `optional` **userId**: `string`

Defined in: [src/types/index.ts:846](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L846)

The user ID associated with the execution, if provided.
