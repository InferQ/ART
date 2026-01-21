[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ToolResult

# Interface: ToolResult

Defined in: [src/types/index.ts:535](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L535)

Represents the structured result of a tool execution.

 ToolResult

## Properties

### callId

> **callId**: `string`

Defined in: [src/types/index.ts:540](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L540)

The unique identifier of the corresponding `ParsedToolCall` that initiated this execution attempt.

***

### error?

> `optional` **error**: `string`

Defined in: [src/types/index.ts:560](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L560)

A descriptive error message if the execution failed (`status` is 'error').

***

### metadata?

> `optional` **metadata**: `object`

Defined in: [src/types/index.ts:565](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L565)

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

Defined in: [src/types/index.ts:555](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L555)

The data returned by the tool upon successful execution. Structure may be validated against `outputSchema`.

***

### status

> **status**: `"suspended"` \| `"success"` \| `"error"`

Defined in: [src/types/index.ts:550](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L550)

Indicates whether the tool execution succeeded, failed, or was suspended.

***

### toolName

> **toolName**: `string`

Defined in: [src/types/index.ts:545](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L545)

The name of the tool that was executed.
