[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AgentProps

# Interface: AgentProps

Defined in: [src/types/index.ts:752](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L752)

Properties required to initiate an agent processing cycle.

 AgentProps

## Properties

### isResume?

> `optional` **isResume**: `boolean`

Defined in: [src/types/index.ts:789](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L789)

Internal flag indicating this is a resume from a suspended state.
Set automatically by `resumeExecution()` - do not set manually for regular queries.
When true, the agent continues from the suspended step without triggering plan refinement.

***

### options?

> `optional` **options**: [`AgentOptions`](AgentOptions.md)

Defined in: [src/types/index.ts:782](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L782)

Optional runtime options that can override default behaviors for this specific `process` call.

***

### query

> **query**: `string`

Defined in: [src/types/index.ts:757](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L757)

The user's input query or request to the agent.

***

### resumeDecision?

> `optional` **resumeDecision**: `object`

Defined in: [src/types/index.ts:795](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L795)

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

Defined in: [src/types/index.ts:767](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L767)

An optional identifier for the specific UI session, useful for targeting UI updates.

***

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:762](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L762)

The mandatory identifier for the conversation thread. All context is scoped to this ID.

***

### traceId?

> `optional` **traceId**: `string`

Defined in: [src/types/index.ts:777](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L777)

An optional identifier used for tracing a request across multiple systems or services.

***

### userId?

> `optional` **userId**: `string`

Defined in: [src/types/index.ts:772](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L772)

An optional identifier for the user interacting with the agent.
