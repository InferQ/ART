# ART Framework Bug Report & DX Audit (v0.4.10)

## 1. Tool Result Naming Mismatch (Critical)

### Issue
The `PESAgent` implementation of "Smart Result Capture" (introduced in v0.4.7+) is hardcoded to look for a property named `output` in the tool execution return value. However, the framework's own documentation and examples often use `data`.

### Code Evidence (from `PESAgent.ts` / `index.js` bundle)
```javascript
// Within _executeTodoList loop
let y = await this._processTodoItem(e, g, t, n, r, o, s);
// ...
if ((y.output === undefined || y.output === null || y.output === "") && x.length > 0) {
    let S = x[x.length - 1]; // Last tool result
    g.result = S.output; // <--- This assumes the tool returned { output: ... }
} else {
    g.result = y.output;
}
```

### Impact
If a tool returns `{ status: 'success', data: { ... } }` (common pattern), `g.result` remains `undefined`. This causes the synthesis phase and subsequent reasoning steps to see empty results for previous tasks, leading to the LLM reporting that "information retrieval failed" even when logs show the tool succeeded.

### Recommended Fix
The framework should be property-agnostic or support a fallback chain (e.g., `result.output || result.data || result`).

---

## 2. ReAct Loop Deadlock (Redundant Tool Calls)

### Issue
When an agent is executing a `tool` step, it often enters a loop where it calls the same tool repeatedly (up to `maxIterations`) with the exact same arguments, even if the first call returned valid data.

### Root Cause Analysis
Within `_processTodoItem`, the framework pushes a `tool_result` message into the internal iteration state (`T`).
```javascript
T.push({
    role: "tool_result",
    content: JSON.stringify(B.output || B.error),
    name: B.toolName,
    tool_call_id: B.callId
});
```
However, the model (specifically observed with Gemini) continues to emit the same tool call in the next turn. This indicates that:
1.  The `GeminiAdapter` (or others) might not be correctly translating the `tool_result` role into the provider's specific "Function Response" format.
2.  Or, the framework is not correctly interleaving the tool result messages with the previous `assistant` tool-call messages, causing the LLM to lose context or think its call was never answered.

### Impact
Massive token waste and latency. The agent retries 5 times (default `maxIterations`) and then eventually fails the step because it never received a terminal "content" response from the model.

---

## 3. Step Output Table Truncation logic

### Issue
The `te()` utility (likely "truncate" or "toEntry") used in `PESAgent` defaults to a very short length (e.g., 200 characters) when building the context for synthesis if not explicitly configured, even though the changelog mentions a configurable `toolResultMaxLength`.

### Code Evidence
```javascript
// PESAgent synthesis context builder
let O = te(m.result, u); // u is toolResultMaxLength
```
While the variable `u` is passed, the `te` function itself often falls back to defaults or fails to handle complex objects properly if they don't exactly match the expected `output` structure.

---

## 4. Observations vs. State Sync

### Issue
There is a slight race condition between `ITEM_STATUS_CHANGE` observations and the actual persistence of `todoList` in the `StateManager`. The frontend often receives a status change event before the `stepOutputs` map has been updated in the DB, leading to UI flickering or "undefined" result displays in the sidebar.

---

## Summary of Requested Fixes
1.  **Standardize Tool Returns**: Update `IToolExecutor` interface to clearly define `output` as the primary data property.
2.  **Fix Adapter Translation**: Ensure `tool_result` roles are correctly translated for Gemini (`FunctionResponse`), OpenAI (`tool` role), and Anthropic.
3.  **Refine ReAct Loop**: If a tool step is classified as `stepType: 'tool'`, the loop should strictly expect a terminal synthesis or acknowledgement after the tool result is provided to the LLM.
