# ART Framework Data Flow & Robustness Audit (v0.4.10)

This report identifies critical data flow inconsistencies, state management flaws, and observability gaps discovered during a holistic system audit.

## 1. HITL Result Loss & Redundant Execution (Critical)

### Issue
When a batch of tool calls is executed and one triggers a suspension (HITL), the `PESAgent` breaks the execution loop without pushing successful tool results from the same batch into the permanent iteration state.

### Root Cause
In `_processTodoItem` (src/core/agents/pes-agent.ts), if a `suspended` status is detected in `toolResults`, the loop `break`s. While the state is saved with `iterationState`, it does not include the results of other tools that successfully finished in that same turn.

### Impact
Upon resumption, the agent restarts the turn with a history that includes the *request* for the tools but *not* the results of the successful ones. This forces the LLM to call the same tools again (redundant execution), which is dangerous for non-idempotent tools.

---

## 2. Incomplete Conversation History (Major)

### Issue
The `PESAgent` only persists the final synthesized answer to the `ConversationManager`. Intermediate turns (LLM planning thoughts, tool call requests, and `tool_result` messages) are never saved to the permanent thread history.

### Impact
Follow-up queries lack the full context of how the agent arrived at its previous answer. The agent only "remembers" its final summary, leading to "memory loss" regarding specific data points it retrieved but didn't summarize in the final output.

---

## 3. History Role Mapping & Metadata Loss (Major)

### Issue
The `formatHistoryForPrompt` method maps `MessageRole.TOOL` to a generic `tool` role and discards message `metadata`.

### Root Cause
```typescript
case MessageRole.TOOL: role = 'tool'; break; // in pes-agent.ts
```
Metadata containing `tool_call_id` and `name` is not passed to the `ArtStandardPrompt`.

### Impact
Provider adapters (Gemini, Anthropic) require `tool_call_id` and `name` to correctly associate results with calls. By stripping this, the adapters treat results as plain text or invalid turns, causing the LLM to lose track of data sources.

---

## 4. Fragile Thought Extraction (Major)

### Issue
`XmlMatcher` (and subsequently `OutputParser`) treats unclosed `<think>` tags at the end of a response as a successful match for the entire remaining string.

### Impact
If an LLM response is truncated (e.g., reaching `maxOutputTokens`) while inside a reasoning block, the framework classifies the *entire* remaining string as a "thought." This leaves the `content` and `toolCalls` empty, causing the agent to fail as it cannot find the required JSON structure.

---

## 5. A2A Blocking Poll & Task Duplication (Major)

### Issue
A2A delegation uses a blocking `while` loop with a 30-second timeout to poll for task completion.

### Impact
1. **Performance**: Blocks the execution thread.
2. **Reliability**: If the process restarts during the poll, there is no record of the "waiting" status in `PESAgentStateData`. The agent will restart the step and likely submit a duplicate A2A task, leading to resource waste and potential side effects.

---

## 6. Step Result Fallback Data Loss (Medium)

### Issue
If an item executes multiple tools and the LLM doesn't provide a synthesized string, the framework falls back to using *only* the output of the last tool as the item's result.

### Impact
Data from all tools except the last one in a batch is lost for subsequent steps. Although `stepOutputs` exists, it is not yet utilized by the prompt builders to provide cross-step context.

---

## 7. Mismatched execution-stage THOUGHTS (Medium)

### Issue
Observations of type `THOUGHTS` are recorded during the execution stage, but they use a generic `parentId` and are often emitted with metadata that conflates them with the general planning phase.

### Gap
There is no specific identification for thoughts *per todo list item/step*. 

### Requirement
Execution stage thoughts should be uniquely identified and linked to their specific `TodoItem`. This allows UI components to display reasoning specifically for the step currently in progress, rather than mixing it with global agent thoughts.
