[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ExecutionOutput

# Interface: ExecutionOutput

Defined in: [src/types/pes-types.ts:420](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/pes-types.ts#L420)

Represents the structured output from an LLM execution call during the PES Agent's
execution phase. This is parsed from the raw LLM response.

 ExecutionOutput

## Properties

### content?

> `optional` **content**: `string`

Defined in: [src/types/pes-types.ts:433](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/pes-types.ts#L433)

The main response content from the LLM.
This is the primary textual output from the execution step.

***

### nextStepDecision?

> `optional` **nextStepDecision**: `"continue"` \| `"wait"` \| `"complete_item"` \| `"update_plan"`

Defined in: [src/types/pes-types.ts:451](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/pes-types.ts#L451)

The agent's decision on how to proceed after this execution.
- 'continue': Proceed to the next iteration or step.
- 'wait': Pause and wait for external input (rare in execution phase).
- 'complete_item': Mark the current item as complete and move to the next.
- 'update_plan': Modify the execution plan (intent, todo list, etc.).

***

### thoughts?

> `optional` **thoughts**: `string`

Defined in: [src/types/pes-types.ts:426](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/pes-types.ts#L426)

The agent's thoughts or reasoning for this execution step.
This may include decision-making logic or reflections.

***

### toolCalls?

> `optional` **toolCalls**: [`ParsedToolCall`](ParsedToolCall.md)[]

Defined in: [src/types/pes-types.ts:440](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/pes-types.ts#L440)

Any tool calls the LLM decided to make during execution.
These are parsed and will be executed by the ToolSystem.

***

### updatedPlan?

> `optional` **updatedPlan**: `object`

Defined in: [src/types/pes-types.ts:462](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/pes-types.ts#L462)

Updates to the plan if the agent decided to modify it.
This can include changes to intent, plan description, or the todo list.

#### intent?

> `optional` **intent**: `string`

#### plan?

> `optional` **plan**: `string`

#### todoList?

> `optional` **todoList**: [`TodoItem`](TodoItem.md)[]
