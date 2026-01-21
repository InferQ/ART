[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / HITLContext

# Interface: HITLContext

Defined in: [src/types/hitl-types.ts:436](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L436)

HITL-specific context passed to tools via ExecutionContext.

## Remarks

This enables blocking tools to know if they're being called
for initial suspension vs. post-approval execution.

## Properties

### feedback?

> `optional` **feedback**: [`HITLFeedback`](HITLFeedback.md)

Defined in: [src/types/hitl-types.ts:451](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L451)

The user's feedback if resuming from approval.

***

### isResuming

> **isResuming**: `boolean`

Defined in: [src/types/hitl-types.ts:440](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L440)

True if this execution is resuming from a previous suspension.

***

### originalArgs?

> `optional` **originalArgs**: `Record`\<`string`, `unknown`\>

Defined in: [src/types/hitl-types.ts:461](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L461)

The original tool arguments that were suspended.

***

### suspensionId?

> `optional` **suspensionId**: `string`

Defined in: [src/types/hitl-types.ts:456](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L456)

The original suspension ID being resumed.

***

### wasApproved?

> `optional` **wasApproved**: `boolean`

Defined in: [src/types/hitl-types.ts:446](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L446)

True if the user approved the action.
Only meaningful when isResuming is true.
