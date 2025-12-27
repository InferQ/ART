[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ArtInstance

# Interface: ArtInstance

Defined in: [src/core/interfaces.ts:631](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L631)

## Properties

### authManager?

> `readonly` `optional` **authManager**: `null` \| [`AuthManager`](../classes/AuthManager.md)

Defined in: [src/core/interfaces.ts:674](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L674)

Accessor for the Auth Manager, used for handling authentication.

***

### checkForSuspendedState()

> `readonly` **checkForSuspendedState**: (`threadId`) => `Promise`\<`null` \| \{ `itemId`: `string`; `suspensionId`: `string`; `toolInput`: `any`; `toolName`: `string`; \}\>

Defined in: [src/core/interfaces.ts:656](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L656)

Checks if a thread is currently in a suspended state (waiting for HITL approval).
Use this on app initialization to detect and restore suspension UI after page refresh.

#### Parameters

##### threadId

`string`

The ID of the thread to check.

#### Returns

`Promise`\<`null` \| \{ `itemId`: `string`; `suspensionId`: `string`; `toolInput`: `any`; `toolName`: `string`; \}\>

Suspension info if suspended, null otherwise.

***

### conversationManager

> `readonly` **conversationManager**: [`ConversationManager`](ConversationManager.md)

Defined in: [src/core/interfaces.ts:668](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L668)

Accessor for the Conversation Manager, used for managing message history.

***

### observationManager

> `readonly` **observationManager**: [`ObservationManager`](ObservationManager.md)

Defined in: [src/core/interfaces.ts:672](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L672)

Accessor for the Observation Manager, used for recording and retrieving observations.

***

### process()

> `readonly` **process**: (`props`) => `Promise`\<[`AgentFinalResponse`](AgentFinalResponse.md)\>

Defined in: [src/core/interfaces.ts:633](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L633)

The main method to process a user query using the configured Agent Core.

Processes a user query through the configured agent reasoning pattern (e.g., PES).
Orchestrates interactions between various ART subsystems.

#### Parameters

##### props

[`AgentProps`](AgentProps.md)

The input properties for the agent execution, including the query, thread ID, and injected dependencies.

#### Returns

`Promise`\<[`AgentFinalResponse`](AgentFinalResponse.md)\>

A promise that resolves with the final agent response and execution metadata.

#### Throws

If a critical error occurs during orchestration that prevents completion.

***

### resumeExecution()

> `readonly` **resumeExecution**: (`threadId`, `suspensionId`, `decision`) => `Promise`\<[`AgentFinalResponse`](AgentFinalResponse.md)\>

Defined in: [src/core/interfaces.ts:640](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L640)

Resumes a suspended agent execution (HITL).

#### Parameters

##### threadId

`string`

The ID of the suspended thread.

##### suspensionId

`string`

The ID provided in the suspension observation/state.

##### decision

The user's decision payload.

###### approved

`boolean`

###### modifiedArgs?

`Record`\<`string`, `unknown`\>

###### reason?

`string`

#### Returns

`Promise`\<[`AgentFinalResponse`](AgentFinalResponse.md)\>

***

### stateManager

> `readonly` **stateManager**: `StateManager`

Defined in: [src/core/interfaces.ts:666](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L666)

Accessor for the State Manager, used for managing thread configuration and state.

***

### toolRegistry

> `readonly` **toolRegistry**: `ToolRegistry`

Defined in: [src/core/interfaces.ts:670](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L670)

Accessor for the Tool Registry, used for managing available tools.

***

### uiSystem

> `readonly` **uiSystem**: `UISystem`

Defined in: [src/core/interfaces.ts:664](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L664)

Accessor for the UI System, used to get sockets for subscriptions.
