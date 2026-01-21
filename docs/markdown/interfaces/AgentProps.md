[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AgentProps

# Interface: AgentProps

Defined in: [src/types/index.ts:764](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L764)

Properties required to initiate an agent processing cycle.

 AgentProps

## Properties

### isResume?

> `optional` **isResume**: `boolean`

Defined in: [src/types/index.ts:801](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L801)

Internal flag indicating this is a resume from a suspended state.
Set automatically by `resumeExecution()` - do not set manually for regular queries.
When true, the agent continues from the suspended step without triggering plan refinement.

***

### options?

> `optional` **options**: [`AgentOptions`](AgentOptions.md)

Defined in: [src/types/index.ts:794](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L794)

Optional runtime options that can override default behaviors for this specific `process` call.

***

### query

> **query**: `string`

Defined in: [src/types/index.ts:769](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L769)

The user's input query or request to the agent.

***

### resumeDecision?

> `optional` **resumeDecision**: `object`

Defined in: [src/types/index.ts:807](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L807)

The decision payload provided by the user when resuming from a HITL suspension.
Passed automatically by `resumeExecution()`.

#### approved

> **approved**: `boolean`

#### modifiedArgs?

> `optional` **modifiedArgs**: `Record`\<`string`, `unknown`\>

#### reason?

> `optional` **reason**: `string`

***

### sessionId?

> `optional` **sessionId**: `string`

Defined in: [src/types/index.ts:779](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L779)

An optional identifier for the specific UI session, useful for targeting UI updates.

***

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:774](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L774)

The mandatory identifier for the conversation thread. All context is scoped to this ID.

***

### traceId?

> `optional` **traceId**: `string`

Defined in: [src/types/index.ts:789](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L789)

An optional identifier used for tracing a request across multiple systems or services.

***

### userId?

> `optional` **userId**: `string`

Defined in: [src/types/index.ts:784](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L784)

An optional identifier for the user interacting with the agent.
