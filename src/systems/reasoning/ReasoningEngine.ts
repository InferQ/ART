/**
 * @module systems/reasoning/ReasoningEngine
 *
 * This module provides the default implementation of the ReasoningEngine interface,
 * which serves as the primary abstraction for interacting with Large Language Models (LLMs)
 * in the ART framework.
 *
 * Key features:
 * - Multi-provider support via IProviderManager
 * - Automatic adapter lifecycle management (acquisition, pooling, release)
 * - Streaming response support with proper resource cleanup
 * - Runtime provider selection based on thread/call configuration
 *
 * @see IReasoningEngine for the interface definition
 * @see ProviderAdapter for adapter interface to different LLM providers
 * @see IProviderManager for provider management interface
 */

import { ReasoningEngine as IReasoningEngine } from '@/core/interfaces';
import { FormattedPrompt, CallOptions, StreamEvent } from '@/types';
import { IProviderManager, ManagedAdapterAccessor, RuntimeProviderConfig } from '@/types/providers';
import { Logger } from '@/utils/logger';

/**
 * Default implementation of the ReasoningEngine interface.
 *
 * This class serves as the central point for all LLM interactions within the ART framework.
 * It abstracts away the specifics of dealing with different LLM providers (OpenAI, Anthropic,
 * Gemini, etc.) by delegating to provider-specific ProviderAdapter instances obtained from the
 * IProviderManager.
 *
 * Key responsibilities:
 * 1. Dynamic Provider Selection: Obtains the appropriate ProviderAdapter instance based on
 *    runtime configuration (RuntimeProviderConfig) specified in CallOptions. This allows different
 *    threads or calls to use different LLM providers or models.
 *
 * 2. Resource Management: Ensures that adapter instances are properly released back to the
 *    IProviderManager after use, enabling connection pooling, reuse, and proper cleanup.
 *    This is critical for maintaining performance and preventing resource leaks.
 *
 * 3. Streaming Support: Returns an AsyncIterable that yields tokens, metadata, and
 *    lifecycle events as they arrive from the LLM provider. The implementation wraps the
 *    adapter's stream to ensure proper resource cleanup even if iteration is aborted or errors occur.
 *
 * 4. Error Handling: Transforms provider-specific errors into a consistent interface and
 *    ensures adapters are released even when errors occur during call setup or stream processing.
 *
 * @class ReasoningEngine
 * @implements IReasoningEngine
 */
export class ReasoningEngine implements IReasoningEngine {
  /**
   * The provider manager instance used to obtain adapter instances at runtime.
   * This manager handles adapter instantiation, pooling, concurrency limits, and lifecycle management.
   * @private
   */
  private providerManager: IProviderManager;

  /**
   * Creates a new ReasoningEngine instance.
   *
   * @param providerManager - The IProviderManager instance responsible for managing provider adapters.
   *                            This manager must be pre-configured with available providers and their settings.
   *
   * @remarks
   * The engine does not create adapters directly but relies on the provider manager to supply
   * them on demand. This enables centralized management of provider credentials, connection pooling,
   * and concurrency control.
   */
  constructor(providerManager: IProviderManager) {
    this.providerManager = providerManager;
    Logger.info('ReasoningEngine initialized with ProviderManager');
  }

  /**
   * Executes an LLM call using a dynamically selected provider adapter.
   *
   * @remarks
   * This method orchestrates the entire LLM call lifecycle:
   *
   * 1. Provider Configuration Validation: Ensures that providerConfig is present in CallOptions.
   *    This is required for the multi-provider architecture.
   *
   * 2. Adapter Acquisition: Requests a ManagedAdapterAccessor from the IProviderManager.
   *    The manager handles:
   *    - Instantiating new adapters if needed
   *    - Reusing existing adapters from the pool
   *    - Enforcing concurrency limits (e.g., max parallel API calls per provider)
   *    - Managing singleton behavior for local providers (e.g., Ollama)
   *    - Queueing requests when limits are reached
   *
   * 3. Call Delegation: Delegates the actual LLM call to the obtained adapter's call method.
   *    The adapter is responsible for:
   *    - Formatting the prompt for the specific provider API
   *    - Making the HTTP request
   *    - Parsing provider responses into standard StreamEvent objects
   *    - Handling provider-specific streaming logic
   *
   * 4. Resource Cleanup: Wraps the adapter's stream in a generator that automatically calls
   *    accessor.release() when the stream is consumed, errors occur, or iteration is aborted.
   *    This ensures adapters are always returned to the pool, preventing resource leaks.
   *
   * 5. Error Handling: Catches and logs any errors during adapter acquisition or call execution,
   *    ensuring the adapter is released before re-throwing the error to the caller.
   *
   * @param prompt - The prompt to send to the LLM. This is the FormattedPrompt type,
   *                  which represents an array of standardized messages (ArtStandardMessage[]).
   *                  The provider adapter is responsible for translating this to the specific
   *                  API format required by the underlying LLM provider.
   *
   * @param options - Configuration options for this specific LLM call. Must include:
   *                  - threadId (string): Required for identifying the thread and loading its configuration
   *                  - providerConfig (RuntimeProviderConfig): Specifies which provider and model to use
   *                  - traceId (string, optional): For distributed tracing and debugging
   *                  - userId (string, optional): For user-specific configuration or logging
   *                  - sessionId (string, optional): For multi-tab/session UI scenarios
   *                  - stream (boolean, optional): Whether to request streaming responses (default: false)
   *                  - callContext (string, optional): Context for the call (e.g., 'AGENT_THOUGHT', 'FINAL_SYNTHESIS')
   *                  - Additional provider-specific parameters (e.g., temperature, max_tokens)
   *
   * @returns A promise resolving to an AsyncIterable<StreamEvent>. The iterable yields events as they arrive:
   *          - TOKEN: Individual text tokens from the LLM
   *          - METADATA: Metadata about the call (token counts, timing, stop reason)
   *          - END: Signal that the stream has completed successfully
   *          - ERROR: Indicates an error occurred during streaming
   *
   *          The returned iterable is wrapped to ensure proper adapter cleanup when iteration completes
   *          or is interrupted.
   *
   * @throws {Error} Throws various errors that may occur:
   *          - Missing "providerConfig" in CallOptions: If provider configuration is not supplied
   *          - Provider-specific errors from adapter acquisition or execution (e.g., authentication failures, rate limits)
   *          - Network errors or timeouts
   */
  async call(prompt: FormattedPrompt, options: CallOptions): Promise<AsyncIterable<StreamEvent>> {
    const providerConfig: RuntimeProviderConfig = options.providerConfig;

    if (!providerConfig) {
      throw new Error("CallOptions must include 'providerConfig' for multi-provider architecture.");
    }

    Logger.debug(
      `ReasoningEngine requesting adapter for provider: ${providerConfig.providerName}, model: ${providerConfig.modelId}`,
      { threadId: options.threadId, traceId: options.traceId, stream: options.stream }
    );

    let accessor: ManagedAdapterAccessor;
    try {
      accessor = await this.providerManager.getAdapter(providerConfig);
      Logger.debug(
        `ReasoningEngine obtained adapter for signature: ${accessor.adapter.providerName}`,
        { threadId: options.threadId, traceId: options.traceId }
      );
    } catch (error: any) {
      Logger.error(`ReasoningEngine failed to get adapter: ${error.message}`, {
        error,
        threadId: options.threadId,
        traceId: options.traceId,
      });
      throw error;
    }

    try {
      const streamResult = await accessor.adapter.call(prompt, options);

      const releasingGenerator = (async function* () {
        try {
          for await (const event of streamResult) {
            yield event;
          }
        } finally {
          accessor.release();
          Logger.debug(
            `ReasoningEngine released adapter for signature: ${accessor.adapter.providerName}`,
            { threadId: options.threadId, traceId: options.traceId }
          );
        }
      })();

      return releasingGenerator;
    } catch (error: any) {
      Logger.error(
        `ReasoningEngine encountered an error during adapter call or stream processing: ${error.message}`,
        { error, threadId: options.threadId, traceId: options.traceId }
      );
      accessor.release();
      Logger.debug(
        `ReasoningEngine released adapter after error for signature: ${accessor.adapter.providerName}`,
        { threadId: options.threadId, traceId: options.traceId }
      );
      throw error;
    }
  }
}
