[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AgentFactory

# Class: AgentFactory

Defined in: [src/core/agent-factory.ts:123](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/agent-factory.ts#L123)

Handles the instantiation and wiring of all core ART framework components based on provided configuration.
This class performs the dependency injection needed to create a functional `ArtInstance`.
It's typically used internally by the `createArtInstance` function.

## Constructors

### Constructor

> **new AgentFactory**(`config`): `AgentFactory`

Defined in: [src/core/agent-factory.ts:151](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/agent-factory.ts#L151)

Creates a new AgentFactory instance.

#### Parameters

##### config

[`ArtInstanceConfig`](../interfaces/ArtInstanceConfig.md)

The configuration specifying which adapters and components to use.

#### Returns

`AgentFactory`

## Methods

### createAgent()

> **createAgent**(): [`IAgentCore`](../interfaces/IAgentCore.md)

Defined in: [src/core/agent-factory.ts:284](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/agent-factory.ts#L284)

Creates an instance of the configured Agent Core (e.g., `PESAgent`) and injects
all necessary initialized dependencies (managers, systems, etc.).
Requires `initialize()` to have been successfully called beforehand.

#### Returns

[`IAgentCore`](../interfaces/IAgentCore.md)

An instance implementing the `IAgentCore` interface.

#### Throws

If `initialize()` was not called or if essential components failed to initialize.

***

### getAuthManager()

> **getAuthManager**(): `null` \| [`AuthManager`](AuthManager.md)

Defined in: [src/core/agent-factory.ts:334](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/agent-factory.ts#L334)

Gets the initialized Auth Manager instance.

#### Returns

`null` \| [`AuthManager`](AuthManager.md)

***

### getConversationManager()

> **getConversationManager**(): `null` \| [`ConversationManager`](../interfaces/ConversationManager.md)

Defined in: [src/core/agent-factory.ts:330](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/agent-factory.ts#L330)

Gets the initialized Conversation Manager instance.

#### Returns

`null` \| [`ConversationManager`](../interfaces/ConversationManager.md)

***

### getMcpManager()

> **getMcpManager**(): `null` \| [`McpManager`](McpManager.md)

Defined in: [src/core/agent-factory.ts:336](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/agent-factory.ts#L336)

Gets the initialized MCP Manager instance.

#### Returns

`null` \| [`McpManager`](McpManager.md)

***

### getObservationManager()

> **getObservationManager**(): `null` \| [`ObservationManager`](../interfaces/ObservationManager.md)

Defined in: [src/core/agent-factory.ts:332](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/agent-factory.ts#L332)

Gets the initialized Observation Manager instance.

#### Returns

`null` \| [`ObservationManager`](../interfaces/ObservationManager.md)

***

### getStateManager()

> **getStateManager**(): `null` \| `StateManager`

Defined in: [src/core/agent-factory.ts:328](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/agent-factory.ts#L328)

Gets the initialized State Manager instance.

#### Returns

`null` \| `StateManager`

***

### getStorageAdapter()

> **getStorageAdapter**(): `null` \| [`StorageAdapter`](../interfaces/StorageAdapter.md)

Defined in: [src/core/agent-factory.ts:322](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/agent-factory.ts#L322)

Gets the initialized Storage Adapter instance.

#### Returns

`null` \| [`StorageAdapter`](../interfaces/StorageAdapter.md)

***

### getToolRegistry()

> **getToolRegistry**(): `null` \| `ToolRegistry`

Defined in: [src/core/agent-factory.ts:326](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/agent-factory.ts#L326)

Gets the initialized Tool Registry instance.

#### Returns

`null` \| `ToolRegistry`

***

### getUISystem()

> **getUISystem**(): `null` \| `UISystem`

Defined in: [src/core/agent-factory.ts:324](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/agent-factory.ts#L324)

Gets the initialized UI System instance.

#### Returns

`null` \| `UISystem`

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/core/agent-factory.ts:166](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/agent-factory.ts#L166)

Asynchronously initializes all core components based on the configuration.
This includes setting up the storage adapter, repositories, managers, tool registry,
reasoning engine, and UI system.
This method MUST be called before `createAgent()`.

#### Returns

`Promise`\<`void`\>

A promise that resolves when initialization is complete.

#### Throws

If configuration is invalid or initialization fails for a component.
