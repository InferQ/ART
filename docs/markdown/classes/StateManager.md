[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / StateManager

# Class: StateManager

Defined in: [src/systems/context/managers/StateManager.ts:44](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/context/managers/StateManager.ts#L44)

Manages thread-specific configuration (ThreadConfig) and state (AgentState)
using an underlying StateRepository.

This class serves as the central point for accessing and modifying the persistent context
of a conversation thread. It supports two state saving strategies:

1. **Explicit**: The agent is responsible for calling `setAgentState()` whenever it wants to persist changes.
   `saveStateIfModified()` is a no-op. This gives fine-grained control but requires discipline.

2. **Implicit**: State is loaded via `loadThreadContext()` and cached. The agent modifies the state object in-memory.
   Calls to `saveStateIfModified()` (typically at the end of an execution cycle) compare the current state
   against the initial snapshot and persist only if changes are detected. This simplifies agent logic.

## Implements

- `StateManager`

## Constructors

### Constructor

> **new StateManager**(`stateRepository`, `strategy?`): `StateManager`

Defined in: [src/systems/context/managers/StateManager.ts:54](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/context/managers/StateManager.ts#L54)

Creates an instance of StateManager.

#### Parameters

##### stateRepository

[`IStateRepository`](../interfaces/IStateRepository.md)

The repository for persisting state.

##### strategy?

[`StateSavingStrategy`](../type-aliases/StateSavingStrategy.md) = `'explicit'`

The state saving strategy to use.

#### Returns

`StateManager`

## Methods

### clearCache()

> **clearCache**(): `void`

Defined in: [src/systems/context/managers/StateManager.ts:364](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/context/managers/StateManager.ts#L364)

Clears the internal context cache. Useful if the underlying storage is manipulated externally
during an agent's processing cycle, though this is generally not recommended.
Or for testing purposes.

#### Returns

`void`

***

### disableToolsForThread()

> **disableToolsForThread**(`threadId`, `toolNames`): `Promise`\<`void`\>

Defined in: [src/systems/context/managers/StateManager.ts:315](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/context/managers/StateManager.ts#L315)

Disables specific tools for a conversation thread by removing them from the thread's enabled tools list.
This method loads the current thread configuration, updates the enabledTools array,
and persists the changes. Cache is invalidated to ensure fresh data on next load.

#### Parameters

##### threadId

`string`

The unique identifier of the thread.

##### toolNames

`string`[]

Array of tool names to disable for this thread.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the tools are disabled.

#### Throws

If threadId is empty, toolNames is empty, or if the repository fails.

#### Implementation of

`IStateManager.disableToolsForThread`

***

### enableToolsForThread()

> **enableToolsForThread**(`threadId`, `toolNames`): `Promise`\<`void`\>

Defined in: [src/systems/context/managers/StateManager.ts:278](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/context/managers/StateManager.ts#L278)

Enables specific tools for a conversation thread by adding them to the thread's enabled tools list.
This method loads the current thread configuration, updates the enabledTools array,
and persists the changes. Cache is invalidated to ensure fresh data on next load.

#### Parameters

##### threadId

`string`

The unique identifier of the thread.

##### toolNames

`string`[]

Array of tool names to enable for this thread.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the tools are enabled.

#### Throws

If threadId is empty, toolNames is empty, or if the repository fails.

#### Implementation of

`IStateManager.enableToolsForThread`

***

### getEnabledToolsForThread()

> **getEnabledToolsForThread**(`threadId`): `Promise`\<`string`[]\>

Defined in: [src/systems/context/managers/StateManager.ts:350](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/context/managers/StateManager.ts#L350)

Gets the list of currently enabled tools for a specific thread.
This is a convenience method that loads the thread context and returns the enabledTools array.

#### Parameters

##### threadId

`string`

The unique identifier of the thread.

#### Returns

`Promise`\<`string`[]\>

A promise that resolves to an array of enabled tool names, or empty array if no tools are enabled.

#### Throws

If the thread context cannot be loaded.

#### Implementation of

`IStateManager.getEnabledToolsForThread`

***

### getThreadConfigValue()

> **getThreadConfigValue**\<`T`\>(`threadId`, `key`): `Promise`\<`undefined` \| `T`\>

Defined in: [src/systems/context/managers/StateManager.ts:132](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/context/managers/StateManager.ts#L132)

Retrieves a specific value from the thread's configuration (`ThreadConfig`).
Loads the context first (which might come from cache in implicit mode).

#### Type Parameters

##### T

`T`

The expected type of the configuration value.

#### Parameters

##### threadId

`string`

The ID of the thread.

##### key

`string`

The top-level configuration key.

#### Returns

`Promise`\<`undefined` \| `T`\>

A promise resolving to the configuration value, or `undefined`.

#### Implementation of

`IStateManager.getThreadConfigValue`

***

### isToolEnabled()

> **isToolEnabled**(`threadId`, `toolName`): `Promise`\<`boolean`\>

Defined in: [src/systems/context/managers/StateManager.ts:114](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/context/managers/StateManager.ts#L114)

Checks if a specific tool is permitted for use within a given thread.
It loads the thread's context and checks the `enabledTools` array in the configuration.

#### Parameters

##### threadId

`string`

The ID of the thread.

##### toolName

`string`

The name of the tool to check.

#### Returns

`Promise`\<`boolean`\>

A promise resolving to `true` if the tool is listed in the thread's `enabledTools` config, `false` otherwise or if the context/config cannot be loaded.

#### Implementation of

`IStateManager.isToolEnabled`

***

### loadThreadContext()

> **loadThreadContext**(`threadId`, `_userId?`): `Promise`\<[`ThreadContext`](../interfaces/ThreadContext.md)\>

Defined in: [src/systems/context/managers/StateManager.ts:76](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/context/managers/StateManager.ts#L76)

Loads the complete context (`ThreadConfig` and `AgentState`) for a specific thread.

- In **Implicit** mode: Caches the loaded context and creates a snapshot of the `AgentState`.
  This snapshot is used later by `saveStateIfModified` to detect changes. Subsequent loads
  within the same lifecycle might return the cached object to maintain reference consistency.
- In **Explicit** mode: Simply fetches data from the repository.

#### Parameters

##### threadId

`string`

The unique identifier for the thread.

##### \_userId?

`string`

Optional user identifier (currently unused).

#### Returns

`Promise`\<[`ThreadContext`](../interfaces/ThreadContext.md)\>

A promise resolving to the `ThreadContext` object.

#### Throws

If `threadId` is empty or if the repository fails to find the context.

#### Implementation of

`IStateManager.loadThreadContext`

***

### saveStateIfModified()

> **saveStateIfModified**(`threadId`): `Promise`\<`void`\>

Defined in: [src/systems/context/managers/StateManager.ts:157](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/context/managers/StateManager.ts#L157)

Persists the thread's `AgentState` if it has been modified.

Behavior depends on the `stateSavingStrategy`:
- **'explicit'**: This method is a no-op for `AgentState` persistence and logs a warning. State must be saved manually via `setAgentState`.
- **'implicit'**: Compares the current `AgentState` (from the cached `ThreadContext` modified by the agent)
  with the snapshot taken during `loadThreadContext`. If different, saves the state
  to the repository and updates the snapshot.

#### Parameters

##### threadId

`string`

The ID of the thread whose state might need saving.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the state is saved or the operation is skipped.

#### Implementation of

`IStateManager.saveStateIfModified`

***

### setAgentState()

> **setAgentState**(`threadId`, `state`): `Promise`\<`void`\>

Defined in: [src/systems/context/managers/StateManager.ts:241](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/context/managers/StateManager.ts#L241)

Explicitly sets or updates the AgentState for a specific thread by calling the underlying state repository.

- If in **Implicit** mode: This also updates the cached snapshot to prevent `saveStateIfModified`
  from re-saving the same state immediately (optimizing writes).

#### Parameters

##### threadId

`string`

The unique identifier of the thread.

##### state

[`AgentState`](../interfaces/AgentState.md)

The AgentState object to save. Must not be undefined or null.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the state is saved.

#### Throws

If threadId or state is undefined/null, or if the repository fails.

#### Implementation of

`IStateManager.setAgentState`

***

### setThreadConfig()

> **setThreadConfig**(`threadId`, `config`): `Promise`\<`void`\>

Defined in: [src/systems/context/managers/StateManager.ts:216](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/context/managers/StateManager.ts#L216)

Sets or completely replaces the configuration (`ThreadConfig`) for a specific thread
by calling the underlying state repository. This also clears any cached context for the thread.

#### Parameters

##### threadId

`string`

The ID of the thread.

##### config

[`ThreadConfig`](../interfaces/ThreadConfig.md)

The complete `ThreadConfig` object.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the configuration is saved.

#### Implementation of

`IStateManager.setThreadConfig`
