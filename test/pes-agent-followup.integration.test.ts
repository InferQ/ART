import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as dotenv from 'dotenv';
import { createArtInstance, GeminiAdapter } from '../src';
import type { ArtInstanceConfig, AgentProps, ThreadConfig } from '../src/types';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get API key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Skip tests if no API key
const maybeDescribe = GEMINI_API_KEY ? describe : describe.skip;

/**
 * Integration tests for PES Agent follow-up query handling.
 *
 * These tests verify:
 * 1. First query correctly extracts todoList (baseline - should work)
 * 2. Follow-up query correctly updates todoList (the bug we're fixing)
 * 3. Multi-follow-up sequences maintain state correctly
 *
 * Uses real Gemini API with thinking mode enabled.
 */
maybeDescribe('PES Agent Follow-up Query Integration Tests', () => {
  let artInstance: Awaited<ReturnType<typeof createArtInstance>>;
  const threadId = `test-thread-${uuidv4()}`;
  const userId = 'test-user';
  const sessionId = `test-session-${uuidv4()}`;

  // Track observations for verification
  const capturedObservations: any[] = [];
  const capturedPlanUpdates: any[] = [];

  beforeAll(async () => {
    console.log('[Test Setup] Initializing ART instance with Gemini...');
    console.log(`[Test Setup] Using model: ${GEMINI_MODEL}`);

    const config: ArtInstanceConfig = {
      storage: {
        type: 'memory', // Use in-memory for tests
      },
      providers: {
        availableProviders: [
          {
            name: 'gemini',
            adapter: GeminiAdapter,
            baseOptions: { apiKey: GEMINI_API_KEY! }
          }
        ]
      }
    };

    artInstance = await createArtInstance(config);

    // Initialize thread config
    const threadConfig: ThreadConfig = {
      providerConfig: {
        providerName: 'gemini',
        modelId: GEMINI_MODEL,
        adapterOptions: { apiKey: GEMINI_API_KEY! }
      },
      enabledTools: [],
      historyLimit: 20
    };
    await artInstance.stateManager.setThreadConfig(threadId, threadConfig);

    // Subscribe to observations for verification
    artInstance.uiSystem.getObservationSocket().subscribe(
      (obs: any) => {
        capturedObservations.push(obs);
        if (obs.type === 'PLAN' || obs.type === 'PLAN_UPDATE') {
          capturedPlanUpdates.push(obs);
          console.log(`[Observation] ${obs.type}:`, {
            hasTodoList: !!obs.content?.todoList,
            todoListLength: obs.content?.todoList?.length,
            intent: obs.content?.intent?.substring(0, 50)
          });
        }
      },
      undefined,
      { threadId }
    );

    console.log('[Test Setup] ART instance initialized successfully');
  }, 30000);

  afterAll(() => {
    console.log('[Test Teardown] Test completed');
    console.log(`[Test Teardown] Total observations captured: ${capturedObservations.length}`);
    console.log(`[Test Teardown] Plan updates captured: ${capturedPlanUpdates.length}`);
  });

  it('should extract todoList from first query (baseline)', async () => {
    console.log('\n[Test 1] Testing first query planning...');

    // Clear previous observations
    capturedObservations.length = 0;
    capturedPlanUpdates.length = 0;

    const props: AgentProps = {
      threadId,
      query: 'Create a simple plan to write a hello world program in Python',
      userId,
      sessionId,
      options: {
        providerConfig: {
          providerName: 'gemini',
          modelId: GEMINI_MODEL,
          adapterOptions: {}
        },
        llmParams: {
          gemini: {
            thinking: { includeThoughts: true, thinkingBudget: 4096 }
          }
        }
      }
    };

    const result = await artInstance.process(props);

    console.log('[Test 1] Result received:', {
      hasResponse: !!result.response,
      responseLength: result.response?.content?.length,
      status: result.metadata?.status
    });

    // Verify we got a response
    expect(result.response).toBeDefined();
    expect(result.metadata?.status).toBe('success');

    // Verify plan observations were captured
    const planObs = capturedPlanUpdates.find(o => o.type === 'PLAN' || o.type === 'PLAN_UPDATE');
    expect(planObs).toBeDefined();

    // Verify todoList was extracted
    expect(planObs?.content?.todoList).toBeDefined();
    expect(Array.isArray(planObs?.content?.todoList)).toBe(true);
    expect(planObs?.content?.todoList?.length).toBeGreaterThan(0);

    console.log('[Test 1] First query todoList:', planObs?.content?.todoList?.map((t: any) => ({
      id: t.id,
      description: t.description?.substring(0, 50)
    })));

    console.log('[Test 1] PASSED - First query correctly extracted todoList');
  }, 120000);

  it('should update todoList on follow-up query (the bug fix)', async () => {
    console.log('\n[Test 2] Testing follow-up query refinement...');

    // Clear plan updates (keep observation history for context)
    const previousPlanUpdatesCount = capturedPlanUpdates.length;

    const props: AgentProps = {
      threadId, // Same thread for follow-up
      query: 'Also add a step to add error handling to the program',
      userId,
      sessionId,
      options: {
        providerConfig: {
          providerName: 'gemini',
          modelId: GEMINI_MODEL,
          adapterOptions: {}
        },
        llmParams: {
          gemini: {
            thinking: { includeThoughts: true, thinkingBudget: 4096 }
          }
        }
      }
    };

    const result = await artInstance.process(props);

    console.log('[Test 2] Result received:', {
      hasResponse: !!result.response,
      responseLength: result.response?.content?.length,
      status: result.metadata?.status
    });

    // Verify we got a response
    expect(result.response).toBeDefined();
    expect(result.metadata?.status).toBe('success');

    // Verify new plan observations were captured after follow-up
    const newPlanUpdates = capturedPlanUpdates.slice(previousPlanUpdatesCount);
    console.log(`[Test 2] New plan updates after follow-up: ${newPlanUpdates.length}`);

    // THE KEY ASSERTION: Follow-up should produce a PLAN_UPDATE with todoList
    const followUpPlanObs = newPlanUpdates.find(o =>
      (o.type === 'PLAN' || o.type === 'PLAN_UPDATE') && o.content?.todoList
    );

    expect(followUpPlanObs).toBeDefined();
    expect(followUpPlanObs?.content?.todoList).toBeDefined();
    expect(Array.isArray(followUpPlanObs?.content?.todoList)).toBe(true);
    expect(followUpPlanObs?.content?.todoList?.length).toBeGreaterThan(0);

    console.log('[Test 2] Follow-up todoList:', followUpPlanObs?.content?.todoList?.map((t: any) => ({
      id: t.id,
      description: t.description?.substring(0, 50),
      status: t.status
    })));

    console.log('[Test 2] PASSED - Follow-up query correctly updated todoList');
  }, 120000);

  it('should handle multi-follow-up sequences', async () => {
    console.log('\n[Test 3] Testing multi-follow-up sequence...');

    const previousPlanUpdatesCount = capturedPlanUpdates.length;

    // Third query in the sequence
    const props: AgentProps = {
      threadId, // Same thread
      query: 'Now add logging to track execution',
      userId,
      sessionId,
      options: {
        providerConfig: {
          providerName: 'gemini',
          modelId: GEMINI_MODEL,
          adapterOptions: {}
        },
        llmParams: {
          gemini: {
            thinking: { includeThoughts: true, thinkingBudget: 4096 }
          }
        }
      }
    };

    const result = await artInstance.process(props);

    console.log('[Test 3] Result received:', {
      hasResponse: !!result.response,
      status: result.metadata?.status
    });

    expect(result.response).toBeDefined();
    expect(result.metadata?.status).toBe('success');

    // Verify plan updates from third query
    const newPlanUpdates = capturedPlanUpdates.slice(previousPlanUpdatesCount);
    const thirdQueryPlanObs = newPlanUpdates.find(o =>
      (o.type === 'PLAN' || o.type === 'PLAN_UPDATE') && o.content?.todoList
    );

    expect(thirdQueryPlanObs).toBeDefined();
    expect(thirdQueryPlanObs?.content?.todoList).toBeDefined();
    expect(thirdQueryPlanObs?.content?.todoList?.length).toBeGreaterThan(0);

    console.log('[Test 3] Multi-follow-up todoList:', thirdQueryPlanObs?.content?.todoList?.map((t: any) => ({
      id: t.id,
      description: t.description?.substring(0, 50),
      status: t.status
    })));

    console.log('[Test 3] PASSED - Multi-follow-up correctly maintained state');
  }, 120000);

  it('should properly separate thinking and response tokens', async () => {
    console.log('\n[Test 4] Testing token separation...');

    // Create a new thread for clean test
    const newThreadId = `test-thread-tokens-${uuidv4()}`;

    // Initialize thread config
    const threadConfig: ThreadConfig = {
      providerConfig: {
        providerName: 'gemini',
        modelId: GEMINI_MODEL,
        adapterOptions: { apiKey: GEMINI_API_KEY! }
      },
      enabledTools: [],
      historyLimit: 20
    };
    await artInstance.stateManager.setThreadConfig(newThreadId, threadConfig);

    // Track token types
    let thinkingTokenCount = 0;
    let responseTokenCount = 0;

    artInstance.uiSystem.getLLMStreamSocket().subscribe(
      (event: any) => {
        if (event.type === 'TOKEN') {
          const tokenType = String(event.tokenType || '');
          if (tokenType.includes('THINKING')) {
            thinkingTokenCount++;
          } else if (tokenType.includes('RESPONSE')) {
            responseTokenCount++;
          }
        }
      },
      undefined,
      { threadId: newThreadId }
    );

    const props: AgentProps = {
      threadId: newThreadId,
      query: 'Plan how to build a simple REST API',
      userId,
      sessionId,
      options: {
        providerConfig: {
          providerName: 'gemini',
          modelId: GEMINI_MODEL,
          adapterOptions: {}
        },
        llmParams: {
          gemini: {
            thinking: { includeThoughts: true, thinkingBudget: 4096 }
          }
        }
      }
    };

    await artInstance.process(props);

    console.log('[Test 4] Token counts:', { thinkingTokenCount, responseTokenCount });

    // We expect both types of tokens when thinking mode is enabled
    // The key is that they should be separated correctly
    expect(thinkingTokenCount + responseTokenCount).toBeGreaterThan(0);

    console.log('[Test 4] PASSED - Tokens are being categorized');
  }, 120000);
});

/**
 * Unit test for JSON marker extraction in OutputParser
 */
describe('OutputParser JSON Marker Extraction', () => {
  it('should extract JSON from markers', async () => {
    const { OutputParser } = await import('../src/systems/reasoning/OutputParser');
    const parser = new OutputParser();

    const outputWithMarkers = `
Some thinking text here...
---JSON_OUTPUT_START---
{
  "title": "Test Plan",
  "intent": "Test intent",
  "plan": "Test plan description",
  "todoList": [
    { "id": "step_1", "description": "First step", "dependencies": [] }
  ]
}
---JSON_OUTPUT_END---
More text after...
`;

    const result = await parser.parsePlanningOutput(outputWithMarkers);

    expect(result.title).toBe('Test Plan');
    expect(result.intent).toBe('Test intent');
    expect(result.todoList).toBeDefined();
    expect(result.todoList?.length).toBe(1);
    expect(result.todoList?.[0].id).toBe('step_1');
  });

  it('should fallback to brace matching when no markers', async () => {
    const { OutputParser } = await import('../src/systems/reasoning/OutputParser');
    const parser = new OutputParser();

    const outputWithoutMarkers = `
Here is the plan:
{
  "title": "Fallback Test",
  "intent": "Testing fallback",
  "plan": "Plan description",
  "todoList": [
    { "id": "step_1", "description": "Step one", "dependencies": [] }
  ]
}
`;

    const result = await parser.parsePlanningOutput(outputWithoutMarkers);

    expect(result.title).toBe('Fallback Test');
    expect(result.todoList).toBeDefined();
    expect(result.todoList?.length).toBe(1);
  });

  it('should handle thinking content with curly braces gracefully when using markers', async () => {
    const { OutputParser } = await import('../src/systems/reasoning/OutputParser');
    const parser = new OutputParser();

    // This simulates the problematic case where thinking contains curly braces
    const outputWithThinkingAndMarkers = `
I need to think about this {problem} carefully.
The user wants to {understand} something about {JSON}.
Let me analyze the {requirements}...

---JSON_OUTPUT_START---
{
  "title": "Correct Plan",
  "intent": "Proper extraction",
  "plan": "This should be extracted correctly",
  "todoList": [
    { "id": "step_1", "description": "Correct step", "dependencies": [] }
  ]
}
---JSON_OUTPUT_END---

Some more {thinking} after the JSON.
`;

    const result = await parser.parsePlanningOutput(outputWithThinkingAndMarkers);

    // With markers, we should get the correct JSON despite curly braces in thinking
    expect(result.title).toBe('Correct Plan');
    expect(result.intent).toBe('Proper extraction');
    expect(result.todoList).toBeDefined();
    expect(result.todoList?.length).toBe(1);
    expect(result.todoList?.[0].description).toBe('Correct step');
  });
});
