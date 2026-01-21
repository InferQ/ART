[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ArtInstanceConfig

# Interface: ArtInstanceConfig

Defined in: [src/types/index.ts:1336](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1336)

Configuration for creating an ART instance.

 ArtInstanceConfig

## Properties

### a2aConfig?

> `optional` **a2aConfig**: `object`

Defined in: [src/types/index.ts:1425](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1425)

Optional: Configuration for A2A services.

#### callbackUrl?

> `optional` **callbackUrl**: `string`

The callback URL for receiving A2A task updates.

#### discoveryEndpoint?

> `optional` **discoveryEndpoint**: `string`

The endpoint for discovering A2A agents.

***

### agentCore()?

> `optional` **agentCore**: (`dependencies`) => [`IAgentCore`](IAgentCore.md)

Defined in: [src/types/index.ts:1360](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1360)

The agent core implementation class to use.
Defaults to `PESAgent` if not provided.

#### Parameters

##### dependencies

`any`

#### Returns

[`IAgentCore`](IAgentCore.md)

#### Example

```ts
MyCustomAgentClass
```

***

### authConfig?

> `optional` **authConfig**: `object`

Defined in: [src/types/index.ts:1409](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1409)

Optional configuration for authentication strategies.
Used for secure connections to external services and MCP servers.

#### enabled?

> `optional` **enabled**: `boolean`

Whether to enable authentication manager. Defaults to false.

#### strategies?

> `optional` **strategies**: `object`[]

Pre-configured authentication strategies to register at startup.

***

### execution?

> `optional` **execution**: [`ExecutionConfig`](ExecutionConfig.md)

Defined in: [src/types/index.ts:1397](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1397)

Optional: Configuration for execution phase behavior (TAEF parameters).

***

### logger?

> `optional` **logger**: `object`

Defined in: [src/types/index.ts:1383](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1383)

Optional configuration for the framework's logger.

#### level?

> `optional` **level**: [`LogLevel`](../enumerations/LogLevel.md)

Minimum log level to output. Defaults to 'info'.

***

### mcpConfig?

> `optional` **mcpConfig**: [`McpManagerConfig`](McpManagerConfig.md)

Defined in: [src/types/index.ts:1403](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1403)

Optional configuration for MCP (Model Context Protocol) manager.
Enables connection to external MCP servers for dynamic tool loading.

***

### persona?

> `optional` **persona**: [`AgentPersona`](AgentPersona.md)

Defined in: [src/types/index.ts:1392](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1392)

Optional: Defines the default identity and high-level guidance for the agent.
This can be overridden at the thread or call level.

***

### providers

> **providers**: [`ProviderManagerConfig`](ProviderManagerConfig.md)

Defined in: [src/types/index.ts:1351](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1351)

Configuration for the ProviderManager, defining available LLM provider adapters.

***

### stateSavingStrategy?

> `optional` **stateSavingStrategy**: [`StateSavingStrategy`](../type-aliases/StateSavingStrategy.md)

Defined in: [src/types/index.ts:1378](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1378)

Defines the strategy for saving `AgentState`. Defaults to 'explicit'.

#### Remarks

- 'explicit': `AgentState` is only saved when `StateManager.setAgentState()` is explicitly called by the agent.
              `StateManager.saveStateIfModified()` will be a no-op for `AgentState` persistence.
- 'implicit': `AgentState` is loaded by `StateManager.loadThreadContext()`. If modified by the agent,
              `StateManager.saveStateIfModified()` will attempt to automatically persist these changes.
              `StateManager.setAgentState()` will still work for explicit saves in this mode.

***

### storage

> **storage**: [`StorageAdapter`](StorageAdapter.md) \| \{ `dbName?`: `string`; `objectStores?`: `any`[]; `type`: `"memory"` \| `"indexedDB"`; `version?`: `number`; \}

Defined in: [src/types/index.ts:1346](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1346)

Configuration for the storage adapter.
Can be a pre-configured `StorageAdapter` instance,
or an object specifying the type and options for a built-in adapter.

#### Example

```ts
{ type: 'indexedDB', dbName: 'MyArtDB' }
```

***

### tools?

> `optional` **tools**: [`IToolExecutor`](IToolExecutor.md)[]

Defined in: [src/types/index.ts:1365](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1365)

An optional array of tool executor instances to register at initialization.
