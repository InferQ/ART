[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / PESAgent

# Class: PESAgent

Defined in: [src/core/agents/pes-agent.ts:91](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/agents/pes-agent.ts#L91)

Implements the Plan-Execute-Synthesize (PES) agent orchestration logic.
Refactored to support persistent TodoList execution and iterative refinement.

## Implements

- [`IAgentCore`](../interfaces/IAgentCore.md)

## Constructors

### Constructor

> **new PESAgent**(`dependencies`): `PESAgent`

Defined in: [src/core/agents/pes-agent.ts:95](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/agents/pes-agent.ts#L95)

#### Parameters

##### dependencies

`PESAgentDependencies`

#### Returns

`PESAgent`

## Methods

### process()

> **process**(`props`): `Promise`\<[`AgentFinalResponse`](../interfaces/AgentFinalResponse.md)\>

Defined in: [src/core/agents/pes-agent.ts:107](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/agents/pes-agent.ts#L107)

Processes a user query through the configured agent reasoning pattern (e.g., PES).
Orchestrates interactions between various ART subsystems.

#### Parameters

##### props

[`AgentProps`](../interfaces/AgentProps.md)

The input properties for the agent execution, including the query, thread ID, and injected dependencies.

#### Returns

`Promise`\<[`AgentFinalResponse`](../interfaces/AgentFinalResponse.md)\>

A promise that resolves with the final agent response and execution metadata.

#### Throws

If a critical error occurs during orchestration that prevents completion.

#### Implementation of

[`IAgentCore`](../interfaces/IAgentCore.md).[`process`](../interfaces/IAgentCore.md#process)
