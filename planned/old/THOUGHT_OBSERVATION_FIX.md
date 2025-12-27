# Refined Implementation Proposal: v0.4.11 Breaking Change

  Summary of Changes

  | Aspect                      | Current (v0.4.10)                          | New (v0.4.11)                                                   |
  |-----------------------------|--------------------------------------------|-----------------------------------------------------------------|
  | CallContext                 | 'AGENT_THOUGHT', 'FINAL_SYNTHESIS'         | 'PLANNING_THOUGHTS', 'EXECUTION_THOUGHTS', 'SYNTHESIS_THOUGHTS' |
  | TokenType                   | AGENT_THOUGHT_LLM_*, FINAL_SYNTHESIS_LLM_* | PLANNING_LLM_*, EXECUTION_LLM_*, SYNTHESIS_LLM_*                |
  | StreamEvent.phase           | ❌ None                                    | ✅ 'planning' | 'execution' | 'synthesis'                       |
  | StreamEvent.stepId          | ❌ None                                    | ✅ For execution phase                                          |
  | StreamEvent.stepDescription | ❌ None                                    | ✅ For execution phase                                          |
  | StreamEvent.timestamp       | ❌ None                                    | ✅ Token emission time                                          |
  | THOUGHTS Observations       | Only execution                             | All three phases                                                |
  | Backwards Compatibility     | N/A                                        | ❌ Breaking change                                              |

  ---
  1. Type Definitions (src/types/index.ts)

  CallContext

  /**
   * Provides context for the LLM call, identifying which phase of agent execution
   * is making the request. This determines the tokenType prefix in StreamEvents.
   *
   * @since 0.4.11 - Breaking change: Replaced 'AGENT_THOUGHT' and 'FINAL_SYNTHESIS'
   *                 with phase-specific values.
   */
  callContext?: 'PLANNING_THOUGHTS' | 'EXECUTION_THOUGHTS' | 'SYNTHESIS_THOUGHTS' | string;

  TokenType

  /**
   * Classification for TOKEN events, combining phase context and thinking detection.
   *
   * @since 0.4.11 - Breaking change: New phase-based naming scheme.
   */
  tokenType?:
    // Planning phase
    | 'PLANNING_LLM_THINKING'
    | 'PLANNING_LLM_RESPONSE'
    // Execution phase (per-step)
    | 'EXECUTION_LLM_THINKING'
    | 'EXECUTION_LLM_RESPONSE'
    // Synthesis phase
    | 'SYNTHESIS_LLM_THINKING'
    | 'SYNTHESIS_LLM_RESPONSE'
    // Generic fallback (when callContext not provided)
    | 'LLM_THINKING'
    | 'LLM_RESPONSE';

  Enhanced StreamEvent

  export interface StreamEvent {
    type: 'TOKEN' | 'METADATA' | 'ERROR' | 'END';
    data: any;
    tokenType?: TokenType;

    // NEW: Phase identification
    /** @since 0.4.11 */
    phase?: 'planning' | 'execution' | 'synthesis';

    // NEW: Execution step context (only present for EXECUTION_THOUGHTS phase)
    /** @since 0.4.11 - Only populated during execution phase */
    stepId?: string;
    /** @since 0.4.11 - Only populated during execution phase */
    stepDescription?: string;

    // NEW: Token emission timestamp
    /** @since 0.4.11 */
    timestamp?: number;

    // Existing fields
    threadId: string;
    traceId?: string;
    sessionId?: string;
  }

  ---
  2. Adapter Implementation Pattern

  All adapters (Gemini, Anthropic, OpenAI) will use this shared logic:

  interface TokenContext {
    tokenType: string;
    phase: 'planning' | 'execution' | 'synthesis' | undefined;
  }

  function getTokenContext(
    callContext: string | undefined,
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
        return {
          phase: undefined,
          tokenType: isThinking ? 'LLM_THINKING' : 'LLM_RESPONSE'
        };
    }
  }

  CallOptions Enhancement for Step Context

  export interface CallOptions {
    // ... existing fields ...
    callContext?: 'PLANNING_THOUGHTS' | 'EXECUTION_THOUGHTS' | 'SYNTHESIS_THOUGHTS' | string;

    /** @since 0.4.11 - Step context for execution phase, passed to StreamEvent */
    stepContext?: {
      stepId: string;
      stepDescription: string;
    };
  }

  ---
  3. PESAgent Changes

  Planning Phase (_performPlanning)

  const planningOptions: CallOptions = {
    threadId: props.threadId,
    traceId,
    userId: props.userId,
    sessionId: props.sessionId,
    stream: true,
    callContext: 'PLANNING_THOUGHTS',  // Changed from 'AGENT_THOUGHT'
    // ... rest unchanged
  };

  // In stream processing loop:
  if (tokenType.includes('THINKING')) {
    thinkingText += event.data;
    // NEW: Record THOUGHTS observation for planning
    await this.deps.observationManager.record({
      threadId: props.threadId,
      traceId,
      type: ObservationType.THOUGHTS,
      content: { text: event.data },
      metadata: {
        phase: 'planning',
        tokenType: event.tokenType,
        timestamp: Date.now()
      }
    });
  }

  Execution Phase (_processTodoItem)

  const options: CallOptions = {
    threadId: props.threadId,
    traceId,
    userId: props.userId,
    sessionId: props.sessionId,
    stream: true,
    callContext: 'EXECUTION_THOUGHTS',  // Changed from 'AGENT_THOUGHT'
    // NEW: Pass step context to be included in StreamEvent
    stepContext: {
      stepId: item.id,
      stepDescription: item.description
    },
    // ... rest unchanged
  };

  // Existing THOUGHTS recording remains (with stepId, stepDescription in metadata)

  Synthesis Phase (_performSynthesis)

  const synthesisOptions: CallOptions = {
    threadId: props.threadId,
    traceId,
    userId: props.userId,
    sessionId: props.sessionId,
    stream: true,
    callContext: 'SYNTHESIS_THOUGHTS',  // Changed from 'FINAL_SYNTHESIS'
    // ... rest unchanged
  };

  // In stream processing loop - ADD thinking token capture:
  let thinkingText = '';

  for await (const event of stream) {
    this.deps.uiSystem.getLLMStreamSocket().notify(event, {
      targetThreadId: event.threadId,
      targetSessionId: event.sessionId
    });

    if (event.type === 'TOKEN') {
      const tokenType = String(event.tokenType || '');
      if (tokenType.includes('THINKING')) {
        // NEW: Capture thinking tokens
        thinkingText += event.data;
        // NEW: Record THOUGHTS observation for synthesis
        await this.deps.observationManager.record({
          threadId: props.threadId,
          traceId,
          type: ObservationType.THOUGHTS,
          content: { text: event.data },
          metadata: {
            phase: 'synthesis',
            tokenType: event.tokenType,
            timestamp: Date.now()
          }
        });
      } else if (tokenType.includes('RESPONSE')) {
        finalResponseContent += event.data;
      }
    }
    // ... rest unchanged
  }

  ---
  4. Adapter StreamEvent Emission

  Each adapter will emit StreamEvents with the enhanced fields:

  // Example from GeminiAdapter
  const { tokenType, phase } = getTokenContext(callContext, isThought);

  yield {
    type: 'TOKEN',
    data: partText,
    tokenType,
    phase,
    timestamp: Date.now(),
    // Include step context if provided (execution phase only)
    ...(options.stepContext && {
      stepId: options.stepContext.stepId,
      stepDescription: options.stepContext.stepDescription
    }),
    threadId,
    traceId,
    sessionId
  };

  ---
  5. Documentation Updates

  5.1 New Section in docs/concepts/observations.md

  Add after the "Core Execution Flow" table:

  ## Standardized THOUGHTS Observations (v0.4.11+)

  Starting from v0.4.11, the ART framework records `THOUGHTS` observations for **all three phases**
  of agent execution: Planning, Execution, and Synthesis. This provides complete visibility into
  the agent's reasoning process.

  ### THOUGHTS Observation Structure

  | Field | Type | Description |
  |-------|------|-------------|
  | `type` | `ObservationType.THOUGHTS` | Always `THOUGHTS` |
  | `threadId` | `string` | The conversation thread ID |
  | `traceId` | `string` | Trace ID for the execution cycle |
  | `content.text` | `string` | The thinking/reasoning text |
  | `metadata.phase` | `'planning' \| 'execution' \| 'synthesis'` | Which phase generated this thought |
  | `metadata.tokenType` | `string` | The LLM token type (e.g., `PLANNING_LLM_THINKING`) |
  | `metadata.timestamp` | `number` | Unix timestamp (ms) when recorded |
  | `metadata.stepId` | `string` (execution only) | The step ID during execution |
  | `metadata.stepDescription` | `string` (execution only) | The step description during execution |
  | `parentId` | `string` (execution only) | Links to the TodoItem being executed |

  ### Phase-Specific Details

  #### Planning THOUGHTS
  Recorded during the initial planning or plan refinement phase. Contains the LLM's reasoning
  about how to approach the user's request.

  #### Execution THOUGHTS
  Recorded during each step of plan execution. Includes `stepId` and `stepDescription` to
  identify which step generated the thought. The `parentId` field links to the TodoItem.

  #### Synthesis THOUGHTS
  Recorded during the final response generation phase. Contains reasoning about how to
  formulate the final answer to the user.

  ### Example: Filtering by Phase

  ```typescript
  const history = await obs.getHistory(ObservationType.THOUGHTS, { threadId });

  const planningThoughts = history.filter(o => o.metadata?.phase === 'planning');
  const executionThoughts = history.filter(o => o.metadata?.phase === 'execution');
  const synthesisThoughts = history.filter(o => o.metadata?.phase === 'synthesis');

  ### 5.2 Update `docs/how-to/streaming-Gemini-Thoughts-to-the-UI.md`

  Replace entire content with comprehensive guide covering:
  - New tokenType values
  - New StreamEvent fields (`phase`, `stepId`, `stepDescription`, `timestamp`)
  - Filtering by phase in LLMStreamSocket
  - Filtering by phase in ObservationSocket history
  - Migration from v0.4.10

  ### 5.3 Add Reference in `docs/how-to/connecting-your-ui.md`

  Add in section 5 (LLMStreamSocket):

  ```markdown
  ### Filtering by Phase and Step

  The `StreamEvent` includes phase and step context to help you direct tokens to the
  appropriate UI components:

  ```javascript
  llmStreamSocket.subscribe(
    (evt) => {
      if (evt.type !== 'TOKEN') return;

      // Use phase to identify the agent stage
      switch (evt.phase) {
        case 'planning':
          if (evt.tokenType === 'PLANNING_LLM_THINKING') {
            renderPlanningThought(evt.data);
          }
          break;

        case 'execution':
          // Use stepId/stepDescription to identify which step
          if (evt.tokenType === 'EXECUTION_LLM_THINKING') {
            renderExecutionThought(evt.data, evt.stepId, evt.stepDescription);
          }
          break;

        case 'synthesis':
          if (evt.tokenType === 'SYNTHESIS_LLM_RESPONSE') {
            appendToFinalResponse(evt.data);
          }
          break;
      }
    },
    undefined,
    { threadId }
  );

  See Also: ./streaming-Gemini-Thoughts-to-the-UI.md
  for a complete guide on working with thinking tokens.

  ---

  ## 6. Migration Guide (for CHANGELOG and docs)

  ```markdown
  ## Breaking Changes in v0.4.11

  ### CallContext Renamed
  The `callContext` values have been renamed to be phase-specific:

  | Old Value | New Value |
  |-----------|-----------|
  | `'AGENT_THOUGHT'` | `'PLANNING_THOUGHTS'` or `'EXECUTION_THOUGHTS'` |
  | `'FINAL_SYNTHESIS'` | `'SYNTHESIS_THOUGHTS'` |

  ### TokenType Renamed
  All `tokenType` values have been renamed:

  | Old Value | New Value |
  |-----------|-----------|
  | `AGENT_THOUGHT_LLM_THINKING` | `PLANNING_LLM_THINKING` or `EXECUTION_LLM_THINKING` |
  | `AGENT_THOUGHT_LLM_RESPONSE` | `PLANNING_LLM_RESPONSE` or `EXECUTION_LLM_RESPONSE` |
  | `FINAL_SYNTHESIS_LLM_THINKING` | `SYNTHESIS_LLM_THINKING` |
  | `FINAL_SYNTHESIS_LLM_RESPONSE` | `SYNTHESIS_LLM_RESPONSE` |

  ### Migration Steps

  1. **Update LLMStreamSocket subscriptions**:
     ```typescript
     // Before (v0.4.10)
     if (evt.tokenType === 'AGENT_THOUGHT_LLM_THINKING') { ... }
     if (evt.tokenType === 'FINAL_SYNTHESIS_LLM_RESPONSE') { ... }

     // After (v0.4.11)
     if (evt.tokenType === 'PLANNING_LLM_THINKING') { ... }
     if (evt.tokenType === 'EXECUTION_LLM_THINKING') { ... }
     if (evt.tokenType === 'SYNTHESIS_LLM_RESPONSE') { ... }

     // Or use the new phase field:
     if (evt.phase === 'planning' && evt.tokenType?.includes('THINKING')) { ... }

  2. Update ObservationSocket history filtering:
  // Before (v0.4.10) - only execution thoughts were recorded
  history.filter(o => o.metadata?.phase === 'planning'); // Always empty!

  // After (v0.4.11) - all phases record THOUGHTS
  history.filter(o => o.metadata?.phase === 'planning');   // Now works!
  history.filter(o => o.metadata?.phase === 'execution');  // With stepId/stepDescription
  history.filter(o => o.metadata?.phase === 'synthesis');  // Now works!
  3. New StreamEvent fields available:
    - evt.phase - 'planning' | 'execution' | 'synthesis'
    - evt.stepId - Step ID (execution phase only)
    - evt.stepDescription - Step description (execution phase only)
    - evt.timestamp - Token emission timestamp

  ---

  ## 7. Files to Modify

  | File | Changes |
  |------|---------|
  | `src/types/index.ts` | Update `CallOptions.callContext`, `StreamEvent` interface |
  | `src/integrations/reasoning/gemini.ts` | New callContext mapping, emit enhanced StreamEvent |
  | `src/integrations/reasoning/anthropic.ts` | Same as gemini.ts |
  | `src/integrations/reasoning/openai.ts` | Same as gemini.ts |
  | `src/core/agents/pes-agent.ts` | Update callContext values, add THOUGHTS for planning/synthesis |
  | `docs/concepts/observations.md` | Add standardized THOUGHTS section |
  | `docs/how-to/streaming-Gemini-Thoughts-to-the-UI.md` | Complete rewrite with new API |
  | `docs/how-to/connecting-your-ui.md` | Add phase/step filtering examples |
  | `CHANGELOG.md` | Document breaking changes and migration |

  ---

  ## 8. Data Flow Summary

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                              PESAgent                                       │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │                                                                             │
  │  Planning Phase                                                             │
  │  ├─ callContext: 'PLANNING_THOUGHTS'                                       │
  │  ├─ StreamEvent: { phase: 'planning', tokenType: 'PLANNING_LLM_*' }        │
  │  └─ Observation: { metadata: { phase: 'planning' } }                       │
  │                                                                             │
  │  Execution Phase (per step)                                                 │
  │  ├─ callContext: 'EXECUTION_THOUGHTS'                                      │
  │  ├─ stepContext: { stepId, stepDescription }                               │
  │  ├─ StreamEvent: { phase: 'execution', stepId, stepDescription,            │
  │  │                 tokenType: 'EXECUTION_LLM_*', timestamp }               │
  │  └─ Observation: { metadata: { phase: 'execution', stepId,                 │
  │                                stepDescription }, parentId: stepId }       │
  │                                                                             │
  │  Synthesis Phase                                                            │
  │  ├─ callContext: 'SYNTHESIS_THOUGHTS'                                      │
  │  ├─ StreamEvent: { phase: 'synthesis', tokenType: 'SYNTHESIS_LLM_*' }      │
  │  └─ Observation: { metadata: { phase: 'synthesis' } }                      │
  │                                                                             │
  └─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                           Developer UI                                      │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │                                                                             │
  │  LLMStreamSocket (Real-time)          ObservationSocket (History)          │
  │  ├─ Filter by phase                   ├─ Filter by phase                   │
  │  ├─ Filter by tokenType               ├─ Filter by metadata.phase          │
  │  ├─ Route by stepId                   ├─ Group by stepId (execution)       │
  │  └─ Track by timestamp                └─ Retrieve full history             │
  │                                                                             │
  └─────────────────────────────────────────────────────────────────────────────┘