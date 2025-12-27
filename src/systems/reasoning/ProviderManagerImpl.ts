/**
 * @module systems/reasoning/ProviderManagerImpl
 *
 * This module provides the default implementation of the IProviderManager interface.
 * It manages the lifecycle of provider adapters, handles concurrency limits,
 * supports both API-based and local providers, and implements intelligent pooling
 * and queueing strategies.
 *
 * Key features:
 * - Multi-provider support with dynamic adapter registration
 * - Concurrency limiting per provider (configurable)
 * - Instance pooling and reuse for API-based providers
 * - Singleton pattern for local providers (e.g., Ollama)
 * - Request queuing for API providers when limits are reached
 * - Automatic idle timeout and eviction for API instances
 * - Safe error handling with proper cleanup
 *
 * @see IProviderManager for the interface definition
 * @see AvailableProviderEntry for provider registration
 * @see RuntimeProviderConfig for runtime provider configuration
 * @see ManagedAdapterAccessor for managed adapter access
 */

import {
  IProviderManager,
  ProviderManagerConfig,
  RuntimeProviderConfig,
  ManagedAdapterAccessor,
  AvailableProviderEntry,
} from '@/types/providers';
import { ProviderAdapter } from '@/core/interfaces';
import {
  UnknownProviderError,
  LocalProviderConflictError,
  LocalInstanceBusyError,
  AdapterInstantiationError,
} from '@/errors';

/**
 * Internal type to track managed adapter instances.
 *
 * @interface ManagedInstance
 * @property adapter - The actual ProviderAdapter instance.
 * @property configSignature - Unique signature string identifying this instance's configuration.
 * @property state - Current state of the instance ('idle' or 'active').
 * @property lastUsedTimestamp - Timestamp when this instance was last used (for idle eviction).
 * @property idleTimer - Node.js Timeout reference for idle timeout tracking.
 *
 * @private
 */
interface ManagedInstance {
  adapter: ProviderAdapter;
  configSignature: string;
  state: 'idle' | 'active';
  lastUsedTimestamp?: number;
  idleTimer?: NodeJS.Timeout;
}

/**
 * Internal type for tracking queued requests.
 *
 * @interface QueuedRequest
 * @property config - The runtime provider configuration for this request.
 * @property resolve - Promise resolve function called when adapter is available.
 * @property reject - Promise reject function called if request fails.
 *
 * @private
 */
interface QueuedRequest {
  config: RuntimeProviderConfig;
  resolve: (value: ManagedAdapterAccessor | PromiseLike<ManagedAdapterAccessor>) => void;
  reject: (reason?: any) => void;
}

/**
 * Default implementation of the IProviderManager interface.
 *
 * @remarks
 * This class provides intelligent management of LLM provider adapters with the following capabilities:
 *
 * **Lifecycle Management:**
 * - Creates new adapter instances on demand
 * - Reuses idle instances when possible
 * - Properly shuts down instances when they're no longer needed
 *
 * **Concurrency Control:**
 * - Enforces maximum parallel API calls per provider (configurable)
 * - Implements a queue-based system for requests exceeding limits
 * - Prevents resource exhaustion by queuing when all instances are busy
 *
 * **Provider Types:**
 * - API-based providers (OpenAI, Anthropic, etc.):
 *   - Multiple instances can be created and pooled
 *   - Instances have an idle timeout after which they're evicted
 *   - Supports concurrent requests up to the configured limit
 *
 * - Local providers (Ollama, local LLMs):
 *   - Enforced singleton pattern (only one instance can be active)
 *   - Prevents multiple simultaneous requests to the same local instance
 *   - Throws specific errors if conflicting requests are made
 *
 * **Request Queuing:**
 * - When an API provider's limit is reached, new requests are queued
 * - Requests are processed in FIFO (First-In-First-Out) order
 * - When an instance becomes available (released), queued requests are served
 * - Prevents request loss and ensures fair resource allocation
 *
 * **Error Handling:**
 * - Throws specific errors for provider-related failures
 *   - Includes UnknownProviderError for unregistered providers
 *   - Includes LocalProviderConflictError for conflicting local requests
 *   - Includes LocalInstanceBusyError for busy local instances
 *   - Ensures proper cleanup even when errors occur
 *
 * **Security:**
 * - Never includes secrets (API keys) in signature strings for logging
 * - Sanitizes configuration signatures to prevent sensitive data leakage
 *
 * Usage Example:
 * ```typescript
 * const manager = new ProviderManagerImpl({
 *   availableProviders: [
 *     { name: 'openai', adapter: OpenAIAdapter, baseOptions: { apiKey: 'sk-...' } },
 *     { name: 'ollama', adapter: OllamaAdapter, isLocal: true }
 *   ],
 *   maxParallelApiInstancesPerProvider: 3,
 *   apiInstanceIdleTimeoutSeconds: 300
 * });
 *
 * // Get an adapter
 * const accessor = await manager.getAdapter({
 *   providerName: 'openai',
 *   modelId: 'gpt-4',
 *   adapterOptions: { temperature: 0.7 }
 * });
 *
 * // Use the adapter
 * const stream = await accessor.adapter.call(prompt, options);
 * for await (const event of stream) { ... }
 *
 * // Release the adapter (important!)
 * accessor.release();
 * ```
 *
 * @class ProviderManagerImpl
 * @implements IProviderManager
 */
export class ProviderManagerImpl implements IProviderManager {
  /**
   * Map of registered provider configurations.
   * Keys are provider names (e.g., 'openai', 'anthropic', 'ollama_local').
   * @private
   */
  private availableProviders: Map<string, AvailableProviderEntry>;

  /**
   * Maximum number of concurrent active instances per API-based provider.
   * Default: 5
   * @private
   */
  private maxParallelApiInstancesPerProvider: number;

  /**
   * Timeout in milliseconds for an API instance before it's evicted.
   * Default: 300,000ms (5 minutes)
   * @private
   */
  private apiInstanceIdleTimeoutMs: number;

  /**
   * Map of currently managed adapter instances.
   * Keys are configuration signatures, values are instance metadata.
   * @private
   */
  private managedInstances: Map<string, ManagedInstance>;

  /**
   * Queue of pending requests that couldn't be immediately fulfilled.
   * @private
   */
  private requestQueue: QueuedRequest[];

  /**
   * Creates a new ProviderManagerImpl instance.
   *
   * @param config - Configuration for the provider manager.
   *
   * @remarks
   * The configuration must include:
   * - `availableProviders`: Array of provider entries with adapter classes
   * - `maxParallelApiInstancesPerProvider`: Maximum concurrent API calls per provider (optional)
   * - `apiInstanceIdleTimeoutSeconds`: Idle timeout for API instances in seconds (optional)
   */
  constructor(config: ProviderManagerConfig) {
    this.availableProviders = new Map(config.availableProviders.map((p) => [p.name, p]));
    this.maxParallelApiInstancesPerProvider = config.maxParallelApiInstancesPerProvider ?? 5;
    this.apiInstanceIdleTimeoutMs = (config.apiInstanceIdleTimeoutSeconds ?? 300) * 1000;
    this.managedInstances = new Map();
    this.requestQueue = [];
  }

  /**
   * Generates a stable configuration signature for caching and lookup.
   *
   * @remarks
   * The signature is used as the key in the managedInstances map.
   * It includes provider name and model ID, allowing different instances
   * of the same provider with different models to coexist.
   *
   * Security Note: Never includes sensitive data like API keys.
   * Keys are replaced with '***' before being used in the signature.
   *
   * @param config - The runtime provider configuration.
   * @returns A stable string signature uniquely identifying this configuration.
   *
   * @private
   */
  private _getConfigSignature(config: RuntimeProviderConfig): string {
    const sortedAdapterOptions = config.adapterOptions
      ? Object.keys(config.adapterOptions)
          .sort()
          .reduce((obj: any, key) => {
            // Never include secrets (API keys) in signature
            obj[key] = key.toLowerCase().includes('key') ? '***' : config.adapterOptions[key];
            return obj;
          }, {})
      : {};
    return JSON.stringify({
      providerName: config.providerName,
      modelId: config.modelId,
      adapterOptions: sortedAdapterOptions,
    });
  }

  /**
   * Returns an array of all registered provider names.
   *
   * @returns Array of provider name strings.
   */
  getAvailableProviders(): string[] {
    return Array.from(this.availableProviders.keys());
  }

  /**
   * Gets a managed adapter instance based on runtime configuration.
   *
   * @remarks
   * This method implements sophisticated adapter management:
   *
   * 1. **Cache Check**: First checks if an existing instance matches the requested configuration
   *    - If found and idle, reuses it immediately
   *    - Updates lastUsedTimestamp for idle timeout tracking
   *    - Clears any existing idle timer
   *
   * 2. **Local Provider Constraints**: For local providers (isLocal: true):
   *    - Only one instance of a local provider can be active at a time
   *    - If requesting a different model of an active local instance, throws LocalProviderConflictError
   *    - If the same local instance is already active and busy, throws LocalInstanceBusyError
   *    - This prevents concurrent access issues with local LLMs
   *
   * 3. **API Provider Concurrency**:
   *    - Counts currently active instances for this provider
   *    - If under maxParallelApiInstancesPerProvider, creates new instance
   *    - If at the limit, queues the request instead of failing
   *    - Ensures fair resource allocation and prevents request loss
   *
   * 4. **Instance Creation**: Creates new instances using provider's adapter class
   *    - Merges base options from provider entry with runtime adapter options
   *    - Provider-specific options (API keys) are merged in
   *    - Adapter instantiation errors are wrapped in AdapterInstantiationError
   *
   * 5. **Accessor Return**: Returns an object with:
   *    - adapter: The ready-to-use ProviderAdapter instance
   *    - release: Function to release the adapter back to the manager
   *
   * @param config - The runtime provider configuration specifying which provider and model to use.
   *
   * @returns A promise resolving to a ManagedAdapterAccessor containing the adapter and release function.
   *
   * @throws {UnknownProviderError} If the provider name is not registered.
   * @throws {LocalProviderConflictError} If requesting a different model of an active local provider.
   * @throws {LocalInstanceBusyError} If the requested local instance is currently busy.
   *
   * @example
   * ```typescript
   * // Request with a pooled instance
   * const accessor = await manager.getAdapter({
   *   providerName: 'openai',
   *   modelId: 'gpt-4',
   *   adapterOptions: { temperature: 0.7 }
   * });
   * const stream = await accessor.adapter.call(prompt, options);
   * for await (const event of stream) { ... }
   * accessor.release();
   *
   * // Request that will be queued if limit reached
   * const accessor2 = await manager.getAdapter({
   *   providerName: 'openai',
   *   modelId: 'gpt-4'
   * });
   * // ... request completes ...
   * ```
   */
  async getAdapter(config: RuntimeProviderConfig): Promise<ManagedAdapterAccessor> {
    const configSignature = this._getConfigSignature(config);

    // 1. Check cache for existing instance
    const existingInstance = this.managedInstances.get(configSignature);

    // 2. Check local provider constraints
    const providerEntry = this.availableProviders.get(config.providerName);
    if (!providerEntry) {
      throw new UnknownProviderError(config.providerName);
    }

    if (providerEntry.isLocal) {
      let idleLocalProviderDifferentSignature: ManagedInstance | undefined = undefined;

      for (const [sig, instance] of this.managedInstances.entries()) {
        const entry = this.availableProviders.get(
          instance.configSignature.split('"providerName":"')[1].split('"')[0]
        );
        if (entry?.isLocal) {
          if (instance.state === 'active') {
            if (sig !== configSignature) {
              throw new LocalProviderConflictError(config.providerName, entry.name);
            } else {
              throw new LocalInstanceBusyError(config.providerName, config.modelId);
            }
          } else if (instance.state === 'idle' && sig !== configSignature) {
            idleLocalProviderDifferentSignature = instance;
          }
        }
      }

      // If a compatible idle local instance was found, evict it first
      if (idleLocalProviderDifferentSignature) {
        await this._evictInstance(idleLocalProviderDifferentSignature.configSignature);
      }

      // Local providers are singletons, so we don't need to check concurrency
      const adapterInstance: ProviderAdapter = new providerEntry.adapter(config);
      const newManagedInstance: ManagedInstance = {
        adapter: adapterInstance,
        configSignature: configSignature,
        state: 'active',
      };
      this.managedInstances.set(configSignature, newManagedInstance);

      const release = () => this._releaseAdapter(configSignature);
      return { adapter: adapterInstance, release };
    }

    // 3. Check API provider concurrency limits
    if (!providerEntry.isLocal) {
      const activeApiInstancesCount = Array.from(this.managedInstances.values()).filter(
        (instance) => {
          const entry = this.availableProviders.get(
            instance.configSignature.split('"providerName":"')[1].split('"')[0]
          );
          return (
            entry &&
            !entry.isLocal &&
            instance.state === 'active' &&
            entry.name === config.providerName
          );
        }
      ).length;

      if (activeApiInstancesCount >= this.maxParallelApiInstancesPerProvider) {
        // Queue the request if limit reached
        return new Promise<ManagedAdapterAccessor>((resolve, reject) => {
          this.requestQueue.push({ config, resolve, reject });
        });
      }
    }

    // 4. Create new instance
    let adapterInstance: ProviderAdapter;
    try {
      // Merge baseOptions from provider entry with runtime adapterOptions
      const adapterOptions = {
        ...providerEntry.baseOptions,
        ...config.adapterOptions,
        providerName: config.providerName,
      };
      adapterInstance = new providerEntry.adapter(adapterOptions);
    } catch (error: any) {
      throw new AdapterInstantiationError(config.providerName, error);
    }

    const newManagedInstance: ManagedInstance = {
      adapter: adapterInstance,
      configSignature: configSignature,
      state: 'active',
    };
    this.managedInstances.set(configSignature, newManagedInstance);

    // 5. Return accessor
    const release = () => this._releaseAdapter(configSignature);
    return { adapter: adapterInstance, release };
  }

  /**
   * Internal method to release an adapter instance back to the manager.
   *
   * @param configSignature - The signature of the instance to release.
   *
   * @remarks
   * This method:
   * 1. Marks the instance as 'idle'
   * 2. Clears any idle timer
   * 3. Clears lastUsedTimestamp
   * 4. Does NOT delete the instance from managedInstances
   * 5. Checks request queue for pending requests that can now be fulfilled
   *
   * The instance remains in the pool for future reuse.
   *
   * @private
   */
  private _releaseAdapter(configSignature: string): void {
    const instance = this.managedInstances.get(configSignature);
    if (!instance) {
      return;
    }

    instance.state = 'idle';
    instance.lastUsedTimestamp = Date.now();

    const providerEntry = this.availableProviders.get(
      instance.configSignature.split('"providerName":"')[1].split('"')[0]
    );

    // Start idle timer for API instances
    if (providerEntry && !providerEntry.isLocal) {
      if (instance.idleTimer) {
        clearTimeout(instance.idleTimer);
        instance.idleTimer = undefined;
      }
      instance.idleTimer = setTimeout(() => {
        this._evictInstance(configSignature);
      }, this.apiInstanceIdleTimeoutMs);
    }

    // Check request queue
    if (this.requestQueue.length > 0) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) {
        this.getAdapter(nextRequest.config).then(nextRequest.resolve).catch(nextRequest.reject);
      }
    }
  }

  /**
   * Internal method to evict an instance from the manager.
   *
   * @param configSignature - The signature of the instance to evict.
   *
   * @remarks
   * This method:
   * 1. Calls the adapter's shutdown method if available
   * 2. Removes the instance from managedInstances
   * 3. Clears the idle timer if present
   *
   * Eviction can happen due to:
   * - Idle timeout (for API instances)
   * - Manager shutdown (not implemented yet but reserved)
   *
   * @private
   */
  private async _evictInstance(configSignature: string): Promise<void> {
    const instance = this.managedInstances.get(configSignature);

    if (!instance) {
      return;
    }

    if (instance.adapter.shutdown) {
      try {
        await instance.adapter.shutdown();
      } catch (_error) {
        // swallow adapter shutdown errors
      }
    }

    if (instance.idleTimer) {
      clearTimeout(instance.idleTimer);
      instance.idleTimer = undefined;
    }

    this.managedInstances.delete(configSignature);
  }
}
