[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ArtInstanceConfig

# Interface: ArtInstanceConfig

Defined in: [src/types/index.ts:1324](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1324)

Configuration for creating an ART instance.

 ArtInstanceConfig

## Properties

### a2aConfig?

> `optional` **a2aConfig**: `object`

Defined in: [src/types/index.ts:1413](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1413)

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

Defined in: [src/types/index.ts:1348](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1348)

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

Defined in: [src/types/index.ts:1397](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1397)

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

Defined in: [src/types/index.ts:1385](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1385)

Optional: Configuration for execution phase behavior (TAEF parameters).

***

### logger?

> `optional` **logger**: `object`

Defined in: [src/types/index.ts:1371](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1371)

Optional configuration for the framework's logger.

#### level?

> `optional` **level**: [`LogLevel`](../enumerations/LogLevel.md)

Minimum log level to output. Defaults to 'info'.

***

### mcpConfig?

> `optional` **mcpConfig**: [`McpManagerConfig`](McpManagerConfig.md)

Defined in: [src/types/index.ts:1391](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1391)

Optional configuration for MCP (Model Context Protocol) manager.
Enables connection to external MCP servers for dynamic tool loading.

***

### persona?

> `optional` **persona**: [`AgentPersona`](AgentPersona.md)

Defined in: [src/types/index.ts:1380](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1380)

Optional: Defines the default identity and high-level guidance for the agent.
This can be overridden at the thread or call level.

***

### providers

> **providers**: [`ProviderManagerConfig`](ProviderManagerConfig.md)

Defined in: [src/types/index.ts:1339](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1339)

Configuration for the ProviderManager, defining available LLM provider adapters.

***

### stateSavingStrategy?

> `optional` **stateSavingStrategy**: [`StateSavingStrategy`](../type-aliases/StateSavingStrategy.md)

Defined in: [src/types/index.ts:1366](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1366)

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

Defined in: [src/types/index.ts:1334](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1334)

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

Defined in: [src/types/index.ts:1353](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1353)

An optional array of tool executor instances to register at initialization.
