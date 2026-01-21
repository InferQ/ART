[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ArtInstance

# Interface: ArtInstance

Defined in: [src/core/interfaces.ts:630](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L630)

## Properties

### authManager?

> `readonly` `optional` **authManager**: [`AuthManager`](../classes/AuthManager.md) \| `null`

Defined in: [src/core/interfaces.ts:673](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L673)

Accessor for the Auth Manager, used for handling authentication.

***

### checkForSuspendedState()

> `readonly` **checkForSuspendedState**: (`threadId`) => `Promise`\<\{ `itemId`: `string`; `suspensionId`: `string`; `toolInput`: `any`; `toolName`: `string`; \} \| `null`\>

Defined in: [src/core/interfaces.ts:655](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L655)

Checks if a thread is currently in a suspended state (waiting for HITL approval).
Use this on app initialization to detect and restore suspension UI after page refresh.

#### Parameters

##### threadId

`string`

The ID of the thread to check.

#### Returns

`Promise`\<\{ `itemId`: `string`; `suspensionId`: `string`; `toolInput`: `any`; `toolName`: `string`; \} \| `null`\>

Suspension info if suspended, null otherwise.

***

### conversationManager

> `readonly` **conversationManager**: [`ConversationManager`](ConversationManager.md)

Defined in: [src/core/interfaces.ts:667](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L667)

Accessor for the Conversation Manager, used for managing message history.

***

### observationManager

> `readonly` **observationManager**: [`ObservationManager`](ObservationManager.md)

Defined in: [src/core/interfaces.ts:671](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L671)

Accessor for the Observation Manager, used for recording and retrieving observations.

***

### process()

> `readonly` **process**: (`props`) => `Promise`\<[`AgentFinalResponse`](AgentFinalResponse.md)\>

Defined in: [src/core/interfaces.ts:632](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L632)

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

Defined in: [src/core/interfaces.ts:639](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L639)

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

Defined in: [src/core/interfaces.ts:665](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L665)

Accessor for the State Manager, used for managing thread configuration and state.

***

### toolRegistry

> `readonly` **toolRegistry**: `ToolRegistry`

Defined in: [src/core/interfaces.ts:669](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L669)

Accessor for the Tool Registry, used for managing available tools.

***

### uiSystem

> `readonly` **uiSystem**: `UISystem`

Defined in: [src/core/interfaces.ts:663](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L663)

Accessor for the UI System, used to get sockets for subscriptions.
