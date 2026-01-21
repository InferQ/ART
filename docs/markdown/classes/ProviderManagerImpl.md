[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ProviderManagerImpl

# Class: ProviderManagerImpl

Defined in: [src/systems/reasoning/ProviderManagerImpl.ts:148](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/reasoning/ProviderManagerImpl.ts#L148)

Default implementation of the IProviderManager interface.

## Remarks

This class provides intelligent management of LLM provider adapters with the following capabilities:

**Lifecycle Management:**
- Creates new adapter instances on demand
- Reuses idle instances when possible
- Properly shuts down instances when they're no longer needed

**Concurrency Control:**
- Enforces maximum parallel API calls per provider (configurable)
- Implements a queue-based system for requests exceeding limits
- Prevents resource exhaustion by queuing when all instances are busy

**Provider Types:**
- API-based providers (OpenAI, Anthropic, etc.):
  - Multiple instances can be created and pooled
  - Instances have an idle timeout after which they're evicted
  - Supports concurrent requests up to the configured limit

- Local providers (Ollama, local LLMs):
  - Enforced singleton pattern (only one instance can be active)
  - Prevents multiple simultaneous requests to the same local instance
  - Throws specific errors if conflicting requests are made

**Request Queuing:**
- When an API provider's limit is reached, new requests are queued
- Requests are processed in FIFO (First-In-First-Out) order
- When an instance becomes available (released), queued requests are served
- Prevents request loss and ensures fair resource allocation

**Error Handling:**
- Throws specific errors for provider-related failures
  - Includes UnknownProviderError for unregistered providers
  - Includes LocalProviderConflictError for conflicting local requests
  - Includes LocalInstanceBusyError for busy local instances
  - Ensures proper cleanup even when errors occur

**Security:**
- Never includes secrets (API keys) in signature strings for logging
- Sanitizes configuration signatures to prevent sensitive data leakage

Usage Example:
```typescript
const manager = new ProviderManagerImpl({
  availableProviders: [
    { name: 'openai', adapter: OpenAIAdapter, baseOptions: { apiKey: 'sk-...' } },
    { name: 'ollama', adapter: OllamaAdapter, isLocal: true }
  ],
  maxParallelApiInstancesPerProvider: 3,
  apiInstanceIdleTimeoutSeconds: 300
});

// Get an adapter
const accessor = await manager.getAdapter({
  providerName: 'openai',
  modelId: 'gpt-4',
  adapterOptions: { temperature: 0.7 }
});

// Use the adapter
const stream = await accessor.adapter.call(prompt, options);
for await (const event of stream) { ... }

// Release the adapter (important!)
accessor.release();
```

 ProviderManagerImpl

## Implements

IProviderManager

## Implements

- [`IProviderManager`](../interfaces/IProviderManager.md)

## Constructors

### Constructor

> **new ProviderManagerImpl**(`config`): `ProviderManagerImpl`

Defined in: [src/systems/reasoning/ProviderManagerImpl.ts:194](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/reasoning/ProviderManagerImpl.ts#L194)

Creates a new ProviderManagerImpl instance.

#### Parameters

##### config

[`ProviderManagerConfig`](../interfaces/ProviderManagerConfig.md)

Configuration for the provider manager.

#### Returns

`ProviderManagerImpl`

#### Remarks

The configuration must include:
- `availableProviders`: Array of provider entries with adapter classes
- `maxParallelApiInstancesPerProvider`: Maximum concurrent API calls per provider (optional)
- `apiInstanceIdleTimeoutSeconds`: Idle timeout for API instances in seconds (optional)

## Methods

### getAdapter()

> **getAdapter**(`config`): `Promise`\<[`ManagedAdapterAccessor`](../interfaces/ManagedAdapterAccessor.md)\>

Defined in: [src/systems/reasoning/ProviderManagerImpl.ts:304](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/reasoning/ProviderManagerImpl.ts#L304)

Gets a managed adapter instance based on runtime configuration.

#### Parameters

##### config

[`RuntimeProviderConfig`](../interfaces/RuntimeProviderConfig.md)

The runtime provider configuration specifying which provider and model to use.

#### Returns

`Promise`\<[`ManagedAdapterAccessor`](../interfaces/ManagedAdapterAccessor.md)\>

A promise resolving to a ManagedAdapterAccessor containing the adapter and release function.

#### Remarks

This method implements sophisticated adapter management:

1. **Cache Check**: First checks if an existing instance matches the requested configuration
   - If found and idle, reuses it immediately
   - Updates lastUsedTimestamp for idle timeout tracking
   - Clears any existing idle timer

2. **Local Provider Constraints**: For local providers (isLocal: true):
   - Only one instance of a local provider can be active at a time
   - If requesting a different model of an active local instance, throws LocalProviderConflictError
   - If the same local instance is already active and busy, throws LocalInstanceBusyError
   - This prevents concurrent access issues with local LLMs

3. **API Provider Concurrency**:
   - Counts currently active instances for this provider
   - If under maxParallelApiInstancesPerProvider, creates new instance
   - If at the limit, queues the request instead of failing
   - Ensures fair resource allocation and prevents request loss

4. **Instance Creation**: Creates new instances using provider's adapter class
   - Merges base options from provider entry with runtime adapter options
   - Provider-specific options (API keys) are merged in
   - Adapter instantiation errors are wrapped in AdapterInstantiationError

5. **Accessor Return**: Returns an object with:
   - adapter: The ready-to-use ProviderAdapter instance
   - release: Function to release the adapter back to the manager

#### Throws

If the provider name is not registered.

#### Throws

If requesting a different model of an active local provider.

#### Throws

If the requested local instance is currently busy.

#### Example

```typescript
// Request with a pooled instance
const accessor = await manager.getAdapter({
  providerName: 'openai',
  modelId: 'gpt-4',
  adapterOptions: { temperature: 0.7 }
});
const stream = await accessor.adapter.call(prompt, options);
for await (const event of stream) { ... }
accessor.release();

// Request that will be queued if limit reached
const accessor2 = await manager.getAdapter({
  providerName: 'openai',
  modelId: 'gpt-4'
});
// ... request completes ...
```

#### Implementation of

[`IProviderManager`](../interfaces/IProviderManager.md).[`getAdapter`](../interfaces/IProviderManager.md#getadapter)

***

### getAvailableProviders()

> **getAvailableProviders**(): `string`[]

Defined in: [src/systems/reasoning/ProviderManagerImpl.ts:240](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/reasoning/ProviderManagerImpl.ts#L240)

Returns an array of all registered provider names.

#### Returns

`string`[]

Array of provider name strings.

#### Implementation of

[`IProviderManager`](../interfaces/IProviderManager.md).[`getAvailableProviders`](../interfaces/IProviderManager.md#getavailableproviders)
