/**
 * @fileoverview Tests for stream event phase property on ERROR events
 *
 * Verifies that ERROR events include the `phase` property properly populated
 * from callContext, providing observability into which agent execution phase
 * errors occurred in.
 *
 * @since 0.4.16
 */

import { describe, it, expect } from 'vitest';
import { getStreamTokenContext, createErrorStreamEvent } from '@/utils/stream-event-helpers';

describe('Stream Event Phase - ERROR Events', () => {
  describe('getStreamTokenContext', () => {
    it('should map PLANNING_THOUGHTS to planning phase', () => {
      const result = getStreamTokenContext('PLANNING_THOUGHTS', false);
      expect(result.phase).toBe('planning');
      expect(result.tokenType).toBe('PLANNING_LLM_RESPONSE');
    });

    it('should map EXECUTION_THOUGHTS to execution phase', () => {
      const result = getStreamTokenContext('EXECUTION_THOUGHTS', false);
      expect(result.phase).toBe('execution');
      expect(result.tokenType).toBe('EXECUTION_LLM_RESPONSE');
    });

    it('should map SYNTHESIS_THOUGHTS to synthesis phase', () => {
      const result = getStreamTokenContext('SYNTHESIS_THOUGHTS', false);
      expect(result.phase).toBe('synthesis');
      expect(result.tokenType).toBe('SYNTHESIS_LLM_RESPONSE');
    });

    it('should return undefined phase for undefined callContext', () => {
      const result = getStreamTokenContext(undefined, false);
      expect(result.phase).toBeUndefined();
      expect(result.tokenType).toBe('LLM_RESPONSE');
    });

    it('should return undefined phase for unrecognized callContext (graceful fallback)', () => {
      const result = getStreamTokenContext('UNKNOWN_CONTEXT' as any, false);
      expect(result.phase).toBeUndefined();
      expect(result.tokenType).toBe('LLM_RESPONSE');
    });

    it('should distinguish thinking vs response token types', () => {
      const planningThinking = getStreamTokenContext('PLANNING_THOUGHTS', true);
      expect(planningThinking.tokenType).toBe('PLANNING_LLM_THINKING');
      expect(planningThinking.phase).toBe('planning');

      const planningResponse = getStreamTokenContext('PLANNING_THOUGHTS', false);
      expect(planningResponse.tokenType).toBe('PLANNING_LLM_RESPONSE');
      expect(planningResponse.phase).toBe('planning');
    });
  });

  describe('createErrorStreamEvent', () => {
    const threadId = 'test-thread-123';
    const traceId = 'test-trace-456';
    const sessionId = 'test-session-789';
    const testError = new Error('Test error message');

    it('should create ERROR event with planning phase', () => {
      const event = createErrorStreamEvent(
        testError,
        threadId,
        traceId,
        sessionId,
        'PLANNING_THOUGHTS'
      );

      expect(event.type).toBe('ERROR');
      expect(event.phase).toBe('planning');
      expect(event.data).toBe(testError);
      expect(event.threadId).toBe(threadId);
      expect(event.traceId).toBe(traceId);
      expect(event.sessionId).toBe(sessionId);
    });

    it('should create ERROR event with execution phase', () => {
      const event = createErrorStreamEvent(
        testError,
        threadId,
        traceId,
        sessionId,
        'EXECUTION_THOUGHTS'
      );

      expect(event.type).toBe('ERROR');
      expect(event.phase).toBe('execution');
      expect(event.data).toBe(testError);
    });

    it('should create ERROR event with synthesis phase', () => {
      const event = createErrorStreamEvent(
        testError,
        threadId,
        traceId,
        sessionId,
        'SYNTHESIS_THOUGHTS'
      );

      expect(event.type).toBe('ERROR');
      expect(event.phase).toBe('synthesis');
      expect(event.data).toBe(testError);
    });

    it('should create ERROR event with undefined phase when callContext is undefined', () => {
      const event = createErrorStreamEvent(
        testError,
        threadId,
        traceId,
        sessionId,
        undefined
      );

      expect(event.type).toBe('ERROR');
      expect(event.phase).toBeUndefined();
      expect(event.data).toBe(testError);
    });

    it('should create ERROR event with undefined phase for invalid callContext (graceful fallback)', () => {
      const event = createErrorStreamEvent(
        testError,
        threadId,
        traceId,
        sessionId,
        'INVALID_CONTEXT' as any
      );

      expect(event.type).toBe('ERROR');
      expect(event.phase).toBeUndefined();
      expect(event.data).toBe(testError);
    });

    it('should handle Error objects correctly', () => {
      const error = new Error('Specific error');
      const event = createErrorStreamEvent(
        error,
        threadId,
        traceId,
        sessionId,
        'PLANNING_THOUGHTS'
      );

      expect(event.data).toBe(error);
      expect(event.phase).toBe('planning');
    });

    it('should handle unknown error types', () => {
      const unknownError = { customError: 'something went wrong' };
      const event = createErrorStreamEvent(
        unknownError,
        threadId,
        traceId,
        sessionId,
        'EXECUTION_THOUGHTS'
      );

      expect(event.data).toBe(unknownError);
      expect(event.phase).toBe('execution');
    });

    it('should create ERROR event without sessionId', () => {
      const event = createErrorStreamEvent(
        testError,
        threadId,
        traceId,
        undefined,
        'SYNTHESIS_THOUGHTS'
      );

      expect(event.type).toBe('ERROR');
      expect(event.phase).toBe('synthesis');
      expect(event.sessionId).toBeUndefined();
    });

    it('should include all required StreamEvent properties', () => {
      const event = createErrorStreamEvent(
        testError,
        threadId,
        traceId,
        sessionId,
        'PLANNING_THOUGHTS'
      );

      // Required properties
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('data');
      expect(event).toHaveProperty('threadId');
      expect(event).toHaveProperty('traceId');

      // Optional properties
      expect(event).toHaveProperty('phase');
      expect(event).toHaveProperty('sessionId');

      // Verify types
      expect(typeof event.type).toBe('string');
      expect(typeof event.threadId).toBe('string');
      expect(typeof event.traceId).toBe('string');
    });
  });

  describe('Phase Mapping Consistency', () => {
    it('should consistently map the same callContext to the same phase', () => {
      const context1 = getStreamTokenContext('PLANNING_THOUGHTS', false);
      const context2 = getStreamTokenContext('PLANNING_THOUGHTS', false);

      expect(context1.phase).toBe(context2.phase);
      expect(context1.tokenType).toBe(context2.tokenType);
    });

    it('should map all valid callContext values to valid phases', () => {
      const validContexts = [
        'PLANNING_THOUGHTS',
        'EXECUTION_THOUGHTS',
        'SYNTHESIS_THOUGHTS',
      ] as const;

      validContexts.forEach((context) => {
        const result = getStreamTokenContext(context, false);
        expect(result.phase).toBeDefined();
        expect(result.phase).toMatch(/^(planning|execution|synthesis)$/);
      });
    });
  });
});
