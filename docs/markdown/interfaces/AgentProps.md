[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AgentProps

# Interface: AgentProps

Defined in: [src/types/index.ts:706](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L706)

Properties required to initiate an agent processing cycle.

 AgentProps

## Properties

### isResume?

> `optional` **isResume**: `boolean`

Defined in: [src/types/index.ts:743](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L743)

Internal flag indicating this is a resume from a suspended state.
Set automatically by `resumeExecution()` - do not set manually for regular queries.
When true, the agent continues from the suspended step without triggering plan refinement.

***

### options?

> `optional` **options**: [`AgentOptions`](AgentOptions.md)

Defined in: [src/types/index.ts:736](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L736)

Optional runtime options that can override default behaviors for this specific `process` call.

***

### query

> **query**: `string`

Defined in: [src/types/index.ts:711](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L711)

The user's input query or request to the agent.

***

### sessionId?

> `optional` **sessionId**: `string`

Defined in: [src/types/index.ts:721](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L721)

An optional identifier for the specific UI session, useful for targeting UI updates.

***

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:716](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L716)

The mandatory identifier for the conversation thread. All context is scoped to this ID.

***

### traceId?

> `optional` **traceId**: `string`

Defined in: [src/types/index.ts:731](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L731)

An optional identifier used for tracing a request across multiple systems or services.

***

### userId?

> `optional` **userId**: `string`

Defined in: [src/types/index.ts:726](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L726)

An optional identifier for the user interacting with the agent.
