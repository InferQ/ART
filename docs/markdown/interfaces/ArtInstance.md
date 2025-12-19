[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ArtInstance

# Interface: ArtInstance

Defined in: [src/core/interfaces.ts:631](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L631)

## Properties

### authManager?

> `readonly` `optional` **authManager**: `null` \| [`AuthManager`](../classes/AuthManager.md)

Defined in: [src/core/interfaces.ts:645](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L645)

Accessor for the Auth Manager, used for handling authentication.

***

### conversationManager

> `readonly` **conversationManager**: [`ConversationManager`](ConversationManager.md)

Defined in: [src/core/interfaces.ts:639](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L639)

Accessor for the Conversation Manager, used for managing message history.

***

### observationManager

> `readonly` **observationManager**: [`ObservationManager`](ObservationManager.md)

Defined in: [src/core/interfaces.ts:643](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L643)

Accessor for the Observation Manager, used for recording and retrieving observations.

***

### process()

> `readonly` **process**: (`props`) => `Promise`\<[`AgentFinalResponse`](AgentFinalResponse.md)\>

Defined in: [src/core/interfaces.ts:633](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L633)

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

### stateManager

> `readonly` **stateManager**: `StateManager`

Defined in: [src/core/interfaces.ts:637](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L637)

Accessor for the State Manager, used for managing thread configuration and state.

***

### toolRegistry

> `readonly` **toolRegistry**: `ToolRegistry`

Defined in: [src/core/interfaces.ts:641](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L641)

Accessor for the Tool Registry, used for managing available tools.

***

### uiSystem

> `readonly` **uiSystem**: `UISystem`

Defined in: [src/core/interfaces.ts:635](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L635)

Accessor for the UI System, used to get sockets for subscriptions.
