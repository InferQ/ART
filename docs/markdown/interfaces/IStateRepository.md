[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / IStateRepository

# Interface: IStateRepository

Defined in: [src/core/interfaces.ts:521](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L521)

Repository for managing ThreadConfig and AgentState.

## Methods

### getAgentState()

> **getAgentState**(`threadId`): `Promise`\<`null` \| [`AgentState`](AgentState.md)\>

Defined in: [src/core/interfaces.ts:524](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L524)

#### Parameters

##### threadId

`string`

#### Returns

`Promise`\<`null` \| [`AgentState`](AgentState.md)\>

***

### getThreadConfig()

> **getThreadConfig**(`threadId`): `Promise`\<`null` \| [`ThreadConfig`](ThreadConfig.md)\>

Defined in: [src/core/interfaces.ts:522](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L522)

#### Parameters

##### threadId

`string`

#### Returns

`Promise`\<`null` \| [`ThreadConfig`](ThreadConfig.md)\>

***

### getThreadContext()

> **getThreadContext**(`threadId`): `Promise`\<`null` \| [`ThreadContext`](ThreadContext.md)\>

Defined in: [src/core/interfaces.ts:527](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L527)

#### Parameters

##### threadId

`string`

#### Returns

`Promise`\<`null` \| [`ThreadContext`](ThreadContext.md)\>

***

### setAgentState()

> **setAgentState**(`threadId`, `state`): `Promise`\<`void`\>

Defined in: [src/core/interfaces.ts:525](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L525)

#### Parameters

##### threadId

`string`

##### state

[`AgentState`](AgentState.md)

#### Returns

`Promise`\<`void`\>

***

### setThreadConfig()

> **setThreadConfig**(`threadId`, `config`): `Promise`\<`void`\>

Defined in: [src/core/interfaces.ts:523](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L523)

#### Parameters

##### threadId

`string`

##### config

[`ThreadConfig`](ThreadConfig.md)

#### Returns

`Promise`\<`void`\>

***

### setThreadContext()

> **setThreadContext**(`threadId`, `context`): `Promise`\<`void`\>

Defined in: [src/core/interfaces.ts:528](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L528)

#### Parameters

##### threadId

`string`

##### context

[`ThreadContext`](ThreadContext.md)

#### Returns

`Promise`\<`void`\>
