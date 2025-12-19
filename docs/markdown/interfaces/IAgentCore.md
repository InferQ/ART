[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / IAgentCore

# Interface: IAgentCore

Defined in: [src/core/interfaces.ts:57](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L57)

Interface for the central agent orchestrator.

## Methods

### process()

> **process**(`props`): `Promise`\<[`AgentFinalResponse`](AgentFinalResponse.md)\>

Defined in: [src/core/interfaces.ts:65](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L65)

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
