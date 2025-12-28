[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / BlockingToolSuspendedResult

# Interface: BlockingToolSuspendedResult

Defined in: src/types/hitl-types.ts:475

Extended ToolResult for blocking tools that return 'suspended' status.

## Remarks

When a blocking tool returns 'suspended', it should include the
feedbackSchema so the UI knows what to render.

## Properties

### callId

> **callId**: `string`

Defined in: src/types/hitl-types.ts:477

***

### feedbackSchema?

> `optional` **feedbackSchema**: [`HITLFeedbackSchema`](HITLFeedbackSchema.md)

Defined in: src/types/hitl-types.ts:484

The feedback schema for the UI to render.
If not provided, the framework uses the tool's schema config.

***

### metadata?

> `optional` **metadata**: `object`

Defined in: src/types/hitl-types.ts:498

Metadata including the suspensionId.

#### Index Signature

\[`key`: `string`\]: `unknown`

#### suspensionId

> **suspensionId**: `string`

***

### output?

> `optional` **output**: `object`

Defined in: src/types/hitl-types.ts:489

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

Defined in: src/types/hitl-types.ts:476

***

### toolName

> **toolName**: `string`

Defined in: src/types/hitl-types.ts:478
