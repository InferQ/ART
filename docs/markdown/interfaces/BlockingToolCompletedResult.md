[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / BlockingToolCompletedResult

# Interface: BlockingToolCompletedResult

Defined in: src/types/hitl-types.ts:511

The successful result created by the framework when user provides feedback.

## Remarks

This is what the LLM sees after resumption - a normal successful tool result.
The content field contains a description, and output contains the feedback.

## Properties

### callId

> **callId**: `string`

Defined in: src/types/hitl-types.ts:513

***

### metadata?

> `optional` **metadata**: `object`

Defined in: src/types/hitl-types.ts:544

Metadata about the completion.

#### Index Signature

\[`key`: `string`\]: `unknown`

#### completedAt

> **completedAt**: `number`

Timestamp of when feedback was received.

#### suspensionId?

> `optional` **suspensionId**: `string`

The original suspension ID that was resumed.

#### waitDurationMs?

> `optional` **waitDurationMs**: `number`

Duration from suspension to completion in ms.

***

### output

> **output**: `object`

Defined in: src/types/hitl-types.ts:519

The user's feedback structured as the tool output.

#### approved

> **approved**: `boolean`

Whether the user approved the action.

#### feedback

> **feedback**: [`HITLFeedback`](HITLFeedback.md)

The feedback provided by the user.

#### message

> **message**: `string`

Human-readable summary of what happened.

#### value?

> `optional` **value**: `unknown`

The actual value provided (varies by input type).

***

### status

> **status**: `"success"`

Defined in: src/types/hitl-types.ts:512

***

### toolName

> **toolName**: `string`

Defined in: src/types/hitl-types.ts:514
