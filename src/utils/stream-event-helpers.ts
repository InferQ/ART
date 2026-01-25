/**
 * @module utils/stream-event-helpers
 *
 * Shared utility functions for stream event creation and context extraction.
 * Provides consistent phase and tokenType mapping across all provider adapters.
 *
 * @since 0.4.16
 */

import type { StreamEvent } from '@/types';
import { Logger } from '@/utils/logger';

/**
 * Call context values that map to agent execution phases.
 *
 * @typedef {'PLANNING_THOUGHTS' | 'EXECUTION_THOUGHTS' | 'SYNTHESIS_THOUGHTS' | string} CallContext
 */
type CallContext = 'PLANNING_THOUGHTS' | 'EXECUTION_THOUGHTS' | 'SYNTHESIS_THOUGHTS' | string;

/**
 * Token context result containing both phase and tokenType.
 *
 * @interface TokenContext
 */
export interface TokenContext {
  /** The agent execution phase (planning, execution, synthesis, or undefined) */
  phase: 'planning' | 'execution' | 'synthesis' | undefined;
  /** The token type for TOKEN events */
  tokenType: string;
}

/**
 * Extracts phase and tokenType from callContext and thinking state.
 *
 * This function maps agent execution call contexts to their corresponding phases
 * and token types for stream events. It provides the foundational logic for
 * determining which phase an agent is in during LLM streaming.
 *
 * @param {CallContext | undefined} callContext - The call context identifier (e.g., 'PLANNING_THOUGHTS')
 * @param {boolean} isThinking - Whether the token is part of a thinking/reasoning block
 * @returns {TokenContext} Object containing phase and tokenType
 *
 * @example
 * ```typescript
 * const context = getStreamTokenContext('PLANNING_THOUGHTS', true);
 * // Returns: { phase: 'planning', tokenType: 'PLANNING_LLM_THINKING' }
 *
 * const context2 = getStreamTokenContext('EXECUTION_THOUGHTS', false);
 * // Returns: { phase: 'execution', tokenType: 'EXECUTION_LLM_RESPONSE' }
 *
 * const context3 = getStreamTokenContext(undefined, false);
 * // Returns: { phase: undefined, tokenType: 'LLM_RESPONSE' }
 * ```
 */
export function getStreamTokenContext(
  callContext: CallContext | undefined,
  isThinking: boolean
): TokenContext {
  switch (callContext) {
    case 'PLANNING_THOUGHTS':
      return {
        phase: 'planning',
        tokenType: isThinking ? 'PLANNING_LLM_THINKING' : 'PLANNING_LLM_RESPONSE'
      };
    case 'EXECUTION_THOUGHTS':
      return {
        phase: 'execution',
        tokenType: isThinking ? 'EXECUTION_LLM_THINKING' : 'EXECUTION_LLM_RESPONSE'
      };
    case 'SYNTHESIS_THOUGHTS':
      return {
        phase: 'synthesis',
        tokenType: isThinking ? 'SYNTHESIS_LLM_THINKING' : 'SYNTHESIS_LLM_RESPONSE'
      };
    default:
      // Graceful fallback for unrecognized or undefined callContext
      return {
        phase: undefined,
        tokenType: isThinking ? 'LLM_THINKING' : 'LLM_RESPONSE'
      };
  }
}

/**
 * Creates an ERROR stream event with phase context.
 *
 * This helper function standardizes ERROR event creation across all provider adapters,
 * ensuring that phase information is consistently included for observability and debugging.
 *
 * @param {Error | unknown} error - The error object or unknown error value
 * @param {string} threadId - The thread identifier for the event
 * @param {string} traceId - The trace identifier for correlation
 * @param {string} [sessionId] - Optional session identifier for UI targeting
 * @param {CallContext} [callContext] - Optional call context for phase extraction
 * @returns {StreamEvent} A properly formed ERROR stream event with phase
 *
 * @example
 * ```typescript
 * try {
 *   // ... some operation
 * } catch (error) {
 *   const errorEvent = createErrorStreamEvent(
 *     error,
 *     threadId,
 *     traceId,
 *     sessionId,
 *     'PLANNING_THOUGHTS'
 *   );
 *   yield errorEvent;
 * }
 * ```
 */
export function createErrorStreamEvent(
  error: Error | unknown,
  threadId: string,
  traceId: string,
  sessionId?: string,
  callContext?: CallContext
): StreamEvent {
  const { phase } = getStreamTokenContext(callContext, false);

  // Log for observability - helps debugging which phase errors occurred in
  Logger.debug(`[${traceId}] Creating ERROR event with phase: ${phase || 'undefined'}`, {
    phase,
    callContext,
    threadId,
    error
  });

  return {
    type: 'ERROR',
    data: error,
    phase,
    threadId,
    traceId,
    sessionId
  };
}
