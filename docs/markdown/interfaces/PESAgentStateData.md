[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / PESAgentStateData

# Interface: PESAgentStateData

Defined in: [src/types/pes-types.ts:199](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L199)

Represents the persistent state data for a PES Agent instance associated with a thread.
This state is saved to storage and persists across multiple execution cycles.

 PESAgentStateData

## Properties

### currentStepId

> **currentStepId**: `null` \| `string`

Defined in: [src/types/pes-types.ts:240](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L240)

The ID of the todo item currently being executed.
If null, no item is currently active (e.g., planning phase, completed state).

***

### intent

> **intent**: `string`

Defined in: [src/types/pes-types.ts:212](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L212)

The user's intent extracted from their query.
This is a concise summary of what the user wants to accomplish.

***

### isPaused

> **isPaused**: `boolean`

Defined in: [src/types/pes-types.ts:247](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L247)

Indicates whether the agent is currently paused.
This flag is set when HITL (Human-in-the-Loop) is triggered.

***

### pendingA2ATasks?

> `optional` **pendingA2ATasks**: `object`

Defined in: [src/types/pes-types.ts:323](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L323)

Pending A2A tasks that the agent is waiting for.
This enables recovery after process restart by tracking submitted but incomplete A2A tasks.

#### itemId

> **itemId**: `string`

The TodoItem ID that triggered the A2A delegation.

#### submittedAt

> **submittedAt**: `number`

When the tasks were submitted.

#### taskIds

> **taskIds**: `string`[]

The IDs of the A2A tasks being waited on.

#### Since

0.4.11

***

### plan

> **plan**: `string`

Defined in: [src/types/pes-types.ts:226](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L226)

The high-level plan describing how the agent will address the user's intent.
This is a human-readable description of the overall approach.

***

### stepOutputs?

> `optional` **stepOutputs**: `Record`\<`string`, [`StepOutputEntry`](StepOutputEntry.md)\>

Defined in: [src/types/pes-types.ts:314](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L314)

A table of outputs from completed steps.
This persists step outputs for use during resume operations and synthesis.
Keys are step IDs, values are [StepOutputEntry](StepOutputEntry.md) objects.

#### Remarks

This enables cross-step data access and ensures that the synthesis phase
has access to all relevant information from completed steps.

***

### suspension?

> `optional` **suspension**: `object`

Defined in: [src/types/pes-types.ts:263](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L263)

Suspension context for HITL (Human-in-the-Loop) functionality.
When a blocking tool is called, the agent suspends execution and stores
the context here to allow resumption after user input.

#### itemId

> **itemId**: `string`

The ID of the TodoItem that triggered the suspension.
This identifies which step is waiting for human input.

#### iterationState

> **iterationState**: [`ArtStandardPrompt`](../type-aliases/ArtStandardPrompt.md)

The captured message history (ArtStandardPrompt) at the time of suspension.
This allows the agent to resume execution with the correct context.

#### partialToolResults?

> `optional` **partialToolResults**: [`ToolResult`](ToolResult.md)[]

Tool results from successful tools in the same batch that completed
before the suspending tool was executed.
This prevents data loss when a batch contains both successful and suspending tools.

##### Since

0.4.11

#### suspensionId

> **suspensionId**: `string`

Unique identifier for this suspension event.
Used to match resume requests to the correct suspension.

#### toolCall

> **toolCall**: [`ParsedToolCall`](ParsedToolCall.md)

The specific tool call that triggered the suspension.
This is the call that requires human approval or input.

#### Remarks

This field is only present when the agent is in a suspended state.

***

### threadId

> **threadId**: `string`

Defined in: [src/types/pes-types.ts:205](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L205)

The thread ID this state belongs to.
Links the state to a specific conversation thread.

***

### title

> **title**: `string`

Defined in: [src/types/pes-types.ts:219](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L219)

A concise title for the thread, typically <= 10 words.
Generated based on the user's query and context.

***

### todoList

> **todoList**: [`TodoItem`](TodoItem.md)[]

Defined in: [src/types/pes-types.ts:233](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/pes-types.ts#L233)

The complete list of todo items representing the execution plan.
This array contains all steps the agent needs to take, in execution order.
