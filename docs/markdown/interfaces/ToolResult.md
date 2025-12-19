[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ToolResult

# Interface: ToolResult

Defined in: [src/types/index.ts:487](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L487)

Represents the structured result of a tool execution.

 ToolResult

## Properties

### callId

> **callId**: `string`

Defined in: [src/types/index.ts:492](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L492)

The unique identifier of the corresponding `ParsedToolCall` that initiated this execution attempt.

***

### error?

> `optional` **error**: `string`

Defined in: [src/types/index.ts:512](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L512)

A descriptive error message if the execution failed (`status` is 'error').

***

### metadata?

> `optional` **metadata**: `object`

Defined in: [src/types/index.ts:517](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L517)

Optional metadata about the execution (e.g., duration, cost, logs).

#### Index Signature

\[`key`: `string`\]: `any`

#### sources?

> `optional` **sources**: `object`[]

##### Index Signature

\[`key`: `string`\]: `any`

***

### output?

> `optional` **output**: `any`

Defined in: [src/types/index.ts:507](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L507)

The data returned by the tool upon successful execution. Structure may be validated against `outputSchema`.

***

### status

> **status**: `"error"` \| `"success"`

Defined in: [src/types/index.ts:502](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L502)

Indicates whether the tool execution succeeded or failed.

***

### toolName

> **toolName**: `string`

Defined in: [src/types/index.ts:497](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L497)

The name of the tool that was executed.
