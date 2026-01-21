[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / IStateRepository

# Interface: IStateRepository

Defined in: [src/core/interfaces.ts:520](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L520)

Repository for managing ThreadConfig and AgentState.

## Methods

### getAgentState()

> **getAgentState**(`threadId`): `Promise`\<[`AgentState`](AgentState.md) \| `null`\>

Defined in: [src/core/interfaces.ts:523](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L523)

#### Parameters

##### threadId

`string`

#### Returns

`Promise`\<[`AgentState`](AgentState.md) \| `null`\>

***

### getThreadConfig()

> **getThreadConfig**(`threadId`): `Promise`\<[`ThreadConfig`](ThreadConfig.md) \| `null`\>

Defined in: [src/core/interfaces.ts:521](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L521)

#### Parameters

##### threadId

`string`

#### Returns

`Promise`\<[`ThreadConfig`](ThreadConfig.md) \| `null`\>

***

### getThreadContext()

> **getThreadContext**(`threadId`): `Promise`\<[`ThreadContext`](ThreadContext.md) \| `null`\>

Defined in: [src/core/interfaces.ts:526](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L526)

#### Parameters

##### threadId

`string`

#### Returns

`Promise`\<[`ThreadContext`](ThreadContext.md) \| `null`\>

***

### setAgentState()

> **setAgentState**(`threadId`, `state`): `Promise`\<`void`\>

Defined in: [src/core/interfaces.ts:524](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L524)

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

Defined in: [src/core/interfaces.ts:522](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L522)

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

Defined in: [src/core/interfaces.ts:527](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L527)

#### Parameters

##### threadId

`string`

##### context

[`ThreadContext`](ThreadContext.md)

#### Returns

`Promise`\<`void`\>
