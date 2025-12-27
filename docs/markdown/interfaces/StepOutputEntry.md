[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / StepOutputEntry

# Interface: StepOutputEntry

Defined in: [src/types/pes-types.ts:349](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/pes-types.ts#L349)

Represents a cached output entry from a completed execution step.
These entries are persisted in the PESAgentStateData to enable resume
capability and cross-step data access.

 StepOutputEntry

## Properties

### completedAt?

> `optional` **completedAt**: `number`

Defined in: [src/types/pes-types.ts:382](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/pes-types.ts#L382)

The Unix timestamp (in milliseconds) when the step was completed.

***

### description

> **description**: `string`

Defined in: [src/types/pes-types.ts:362](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/pes-types.ts#L362)

A description of the step.
Matches the TodoItem.description.

***

### rawResult?

> `optional` **rawResult**: `any`

Defined in: [src/types/pes-types.ts:396](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/pes-types.ts#L396)

The raw result from the step execution.
This contains full, untruncated data for use by downstream steps.
For tool steps, this includes tool outputs. For reasoning steps,
this includes the LLM response.

#### Remarks

Unlike the step context which may truncate large outputs,
this rawResult preserves the complete data.

***

### status

> **status**: [`TodoItemStatus`](../enumerations/TodoItemStatus.md)

Defined in: [src/types/pes-types.ts:376](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/pes-types.ts#L376)

The final status of the step.
Matches the TodoItem.status at completion time.

***

### stepId

> **stepId**: `string`

Defined in: [src/types/pes-types.ts:355](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/pes-types.ts#L355)

The ID of the step this output belongs to.
Matches the TodoItem.id.

***

### stepType

> **stepType**: `"tool"` \| `"reasoning"`

Defined in: [src/types/pes-types.ts:369](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/pes-types.ts#L369)

The type of step that produced this output.
Matches the TodoItem.stepType.

***

### summary?

> `optional` **summary**: `string`

Defined in: [src/types/pes-types.ts:411](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/pes-types.ts#L411)

An optional summary of the step output.
This provides a quick reference without loading the full rawResult.
Useful for synthesis and debugging.

***

### toolResults?

> `optional` **toolResults**: [`ToolResult`](ToolResult.md)[]

Defined in: [src/types/pes-types.ts:403](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/pes-types.ts#L403)

Array of tool results if this was a tool-type step.
Contains all tool execution attempts including errors.
