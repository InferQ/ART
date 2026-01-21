[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AgentFactory

# Class: AgentFactory

Defined in: [src/core/agent-factory.ts:123](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/agent-factory.ts#L123)

Handles the instantiation and wiring of all core ART framework components based on provided configuration.
This class performs the dependency injection needed to create a functional `ArtInstance`.
It's typically used internally by the `createArtInstance` function.

## Constructors

### Constructor

> **new AgentFactory**(`config`): `AgentFactory`

Defined in: [src/core/agent-factory.ts:151](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/agent-factory.ts#L151)

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

Defined in: [src/core/agent-factory.ts:284](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/agent-factory.ts#L284)

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

> **getAuthManager**(): [`AuthManager`](AuthManager.md) \| `null`

Defined in: [src/core/agent-factory.ts:334](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/agent-factory.ts#L334)

Gets the initialized Auth Manager instance.

#### Returns

[`AuthManager`](AuthManager.md) \| `null`

***

### getConversationManager()

> **getConversationManager**(): [`ConversationManager`](../interfaces/ConversationManager.md) \| `null`

Defined in: [src/core/agent-factory.ts:330](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/agent-factory.ts#L330)

Gets the initialized Conversation Manager instance.

#### Returns

[`ConversationManager`](../interfaces/ConversationManager.md) \| `null`

***

### getMcpManager()

> **getMcpManager**(): [`McpManager`](McpManager.md) \| `null`

Defined in: [src/core/agent-factory.ts:336](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/agent-factory.ts#L336)

Gets the initialized MCP Manager instance.

#### Returns

[`McpManager`](McpManager.md) \| `null`

***

### getObservationManager()

> **getObservationManager**(): [`ObservationManager`](../interfaces/ObservationManager.md) \| `null`

Defined in: [src/core/agent-factory.ts:332](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/agent-factory.ts#L332)

Gets the initialized Observation Manager instance.

#### Returns

[`ObservationManager`](../interfaces/ObservationManager.md) \| `null`

***

### getStateManager()

> **getStateManager**(): `StateManager` \| `null`

Defined in: [src/core/agent-factory.ts:328](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/agent-factory.ts#L328)

Gets the initialized State Manager instance.

#### Returns

`StateManager` \| `null`

***

### getStorageAdapter()

> **getStorageAdapter**(): [`StorageAdapter`](../interfaces/StorageAdapter.md) \| `null`

Defined in: [src/core/agent-factory.ts:322](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/agent-factory.ts#L322)

Gets the initialized Storage Adapter instance.

#### Returns

[`StorageAdapter`](../interfaces/StorageAdapter.md) \| `null`

***

### getToolRegistry()

> **getToolRegistry**(): `ToolRegistry` \| `null`

Defined in: [src/core/agent-factory.ts:326](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/agent-factory.ts#L326)

Gets the initialized Tool Registry instance.

#### Returns

`ToolRegistry` \| `null`

***

### getUISystem()

> **getUISystem**(): `UISystem` \| `null`

Defined in: [src/core/agent-factory.ts:324](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/agent-factory.ts#L324)

Gets the initialized UI System instance.

#### Returns

`UISystem` \| `null`

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/core/agent-factory.ts:166](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/agent-factory.ts#L166)

Asynchronously initializes all core components based on the configuration.
This includes setting up the storage adapter, repositories, managers, tool registry,
reasoning engine, and UI system.
This method MUST be called before `createAgent()`.

#### Returns

`Promise`\<`void`\>

A promise that resolves when initialization is complete.

#### Throws

If configuration is invalid or initialization fails for a component.
