[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / PESAgent

# Class: PESAgent

Defined in: [src/core/agents/pes-agent.ts:87](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/agents/pes-agent.ts#L87)

Implements the Plan-Execute-Synthesize (PES) agent orchestration logic.
Refactored to support persistent TodoList execution and iterative refinement.

## Implements

- [`IAgentCore`](../interfaces/IAgentCore.md)

## Constructors

### Constructor

> **new PESAgent**(`dependencies`): `PESAgent`

Defined in: [src/core/agents/pes-agent.ts:91](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/agents/pes-agent.ts#L91)

#### Parameters

##### dependencies

`PESAgentDependencies`

#### Returns

`PESAgent`

## Methods

### process()

> **process**(`props`): `Promise`\<[`AgentFinalResponse`](../interfaces/AgentFinalResponse.md)\>

Defined in: [src/core/agents/pes-agent.ts:118](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/agents/pes-agent.ts#L118)

Processes a user query through the PES (Plan-Execute-Synthesize) reasoning loop.
This is the main entry point for the agent's execution logic.

The process involves:
1. **Configuration**: Loading thread context, resolving system prompts, and determining the active persona.
2. **Context Gathering**: Retrieving conversation history and available tools.
3. **Planning**: Generating a new plan (Todo List) or refining an existing one based on the new query.
4. **Execution**: Iterating through the Todo List, executing tasks, calling tools, and managing dependencies.
5. **Synthesis**: Aggregating results to generate a final, coherent response for the user.
6. **Finalization**: Saving the response and updating the conversation history.

#### Parameters

##### props

[`AgentProps`](../interfaces/AgentProps.md)

The input properties for the agent execution, including the user query, thread ID, and optional configuration overrides.

#### Returns

`Promise`\<[`AgentFinalResponse`](../interfaces/AgentFinalResponse.md)\>

A promise that resolves with the final agent response and detailed execution metadata.

#### Implementation of

[`IAgentCore`](../interfaces/IAgentCore.md).[`process`](../interfaces/IAgentCore.md#process)
