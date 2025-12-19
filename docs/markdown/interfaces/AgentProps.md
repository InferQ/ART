[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AgentProps

# Interface: AgentProps

Defined in: [src/types/index.ts:723](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L723)

Properties required to initiate an agent processing cycle via `agent.process()`.

 AgentProps

## Properties

### options?

> `optional` **options**: [`AgentOptions`](AgentOptions.md)

Defined in: [src/types/index.ts:753](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L753)

Optional runtime options that can override default behaviors for this specific `process` call.

***

### query

> **query**: `string`

Defined in: [src/types/index.ts:728](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L728)

The user's input query or request to the agent.

***

### sessionId?

> `optional` **sessionId**: `string`

Defined in: [src/types/index.ts:738](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L738)

An optional identifier for the specific UI session, useful for targeting UI updates via sockets.

***

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:733](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L733)

The mandatory identifier for the conversation thread. All context is scoped to this ID.

***

### traceId?

> `optional` **traceId**: `string`

Defined in: [src/types/index.ts:748](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L748)

An optional identifier used for tracing a request across multiple systems or services.

***

### userId?

> `optional` **userId**: `string`

Defined in: [src/types/index.ts:743](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L743)

An optional identifier for the user interacting with the agent.
