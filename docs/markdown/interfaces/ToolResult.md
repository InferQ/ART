[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ToolResult

# Interface: ToolResult

Defined in: [src/types/index.ts:477](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L477)

Represents the structured result of a tool execution.

 ToolResult

## Properties

### callId

> **callId**: `string`

Defined in: [src/types/index.ts:482](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L482)

The unique identifier of the corresponding `ParsedToolCall` that initiated this execution attempt.

***

### error?

> `optional` **error**: `string`

Defined in: [src/types/index.ts:502](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L502)

A descriptive error message if the execution failed (`status` is 'error').

***

### metadata?

> `optional` **metadata**: `object`

Defined in: [src/types/index.ts:507](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L507)

Optional metadata about the execution (e.g., duration, cost, logs).

#### Index Signature

\[`key`: `string`\]: `any`

#### sources?

> `optional` **sources**: `object`[]

##### Index Signature

\[`key`: `string`\]: `any`

#### suspensionId?

> `optional` **suspensionId**: `string`

***

### output?

> `optional` **output**: `any`

Defined in: [src/types/index.ts:497](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L497)

The data returned by the tool upon successful execution. Structure may be validated against `outputSchema`.

***

### status

> **status**: `"error"` \| `"success"` \| `"suspended"`

Defined in: [src/types/index.ts:492](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L492)

Indicates whether the tool execution succeeded, failed, or was suspended.

***

### toolName

> **toolName**: `string`

Defined in: [src/types/index.ts:487](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L487)

The name of the tool that was executed.
