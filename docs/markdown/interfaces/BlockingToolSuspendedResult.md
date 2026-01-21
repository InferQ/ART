[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / BlockingToolSuspendedResult

# Interface: BlockingToolSuspendedResult

Defined in: [src/types/hitl-types.ts:475](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L475)

Extended ToolResult for blocking tools that return 'suspended' status.

## Remarks

When a blocking tool returns 'suspended', it should include the
feedbackSchema so the UI knows what to render.

## Properties

### callId

> **callId**: `string`

Defined in: [src/types/hitl-types.ts:477](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L477)

***

### feedbackSchema?

> `optional` **feedbackSchema**: [`HITLFeedbackSchema`](HITLFeedbackSchema.md)

Defined in: [src/types/hitl-types.ts:484](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L484)

The feedback schema for the UI to render.
If not provided, the framework uses the tool's schema config.

***

### metadata?

> `optional` **metadata**: `object`

Defined in: [src/types/hitl-types.ts:498](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L498)

Metadata including the suspensionId.

#### Index Signature

\[`key`: `string`\]: `unknown`

#### suspensionId

> **suspensionId**: `string`

***

### output?

> `optional` **output**: `object`

Defined in: [src/types/hitl-types.ts:489](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L489)

Display content to show in the suspension UI.

#### details?

> `optional` **details**: `Record`\<`string`, `unknown`\>

#### message

> **message**: `string`

#### previewData?

> `optional` **previewData**: `unknown`

***

### status

> **status**: `"suspended"`

Defined in: [src/types/hitl-types.ts:476](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L476)

***

### toolName

> **toolName**: `string`

Defined in: [src/types/hitl-types.ts:478](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L478)
