# Investigation Report: Execution Prompt & TAEF Improvements

## 1. Investigation Findings

### 1.1 Hardcoded TAEF Parameters
In `src/core/agents/pes-agent.ts`, the Tool-Aware Execution Framework (TAEF) parameters are hardcoded within the `_processTodoItem` method:
- `MAX_ITEM_ITERATIONS = 5` (Line ~457)
- `MAX_VALIDATION_RETRIES = 2` (Line ~458)

This prevents users from configuring the agent's persistence and retry behavior, leading to potential token waste or premature failure in complex scenarios.

### 1.2 Prompt Structure & Context Gap
The current execution prompt (`_buildToolStepPrompt`) injects `Previous Steps Results`, but lacks explicit instruction on **how** to use this context.
- **Problem**: The LLM sees the previous output but often hallucinates empty arguments (e.g., `urls: []`) instead of extracting values (e.g., URLs from a search result).
- **Current Prompt**: "Previous Steps Results: ..." followed by "Required Tools: ...".
- **Missing**: A clear directive to map outputs from Step N-1 to inputs of Step N.

### 1.3 Token Inefficiency
Currently, the **entire** tool list with **full schemas** is injected into:
1. The **Planning Prompt** (`_performPlanning`).
2. The **Execution Prompt** (`_processTodoItem`) for *every* step.

For agents with many complex tools, this consumes a massive amount of context tokens, degrading performance and increasing cost.

---

## 2. Proposed Holistic Solution

### 2.1 Configuration Enhancements

**Update `src/types/index.ts` & `src/core/interfaces.ts`**:

```typescript
// in ArtInstanceConfig
execution?: {
    maxIterations?: number;      // Default: 5
    taefMaxRetries?: number;     // Default: 2
}

// in StageSpecificPrompts
execution?: string; // Allow custom execution prompt template
```

**Update `PESAgent`**:
- Read these values from `finalPersona` and `runtimeProviderConfig` (or a new `executionConfig` object derived from thread context).
- Use them to initialize the loop counters in `_processTodoItem`.

### 2.2 Dynamic Tool Injection Strategy

We will implement a two-tier tool injection system to optimize token usage.

#### A. Planning Phase (Lightweight)
In `_performPlanning`, instead of injecting full JSON schemas, we inject a **Tool Manifesto**:
```json
[
  {
    "name": "webSearch",
    "description": "Search the internet for information.",
    "capabilities": ["querying"]
  },
  {
    "name": "calculator",
    "description": "Perform mathematical calculations.",
    "capabilities": ["math"]
  }
]
```
*Benefit*: Drastically reduces tokens while providing enough context for the LLM to select the right tool name.

#### B. Execution Phase (Just-in-Time Schema)
In `_processTodoItem`, we dynamically construct the `executionTools` list based on the **Current Step's Requirements**:

1. **Primary Tools**: If `item.requiredTools` is set (e.g., `["webExtract"]`), inject the **FULL JSON Schema** for these tools. This ensures the LLM has precise syntax for the call it *must* make.
2. **Auxiliary Tools**: Determine if other tools should be visible.
    - *Strict Mode*: Only `requiredTools` + `delegate_to_agent`.
    - *Flexible Mode*: `requiredTools` + lightweight descriptions of others (in case the plan needs to change).
    - *Proposal*: Default to **Strict Mode** for Tool Steps to ensure focus and prevent hallucinated tool usage.

### 2.3 Enhanced Execution Prompt

Update `_buildToolStepPrompt` to include a **Data Flow Directive**:

```typescript
const dataFlowInstruction = `
## DATA FLOW & CONTEXT
You have access to 'Previous Steps Results'.
- **CRITICAL**: You must EXTRACT data from these results to populate your tool arguments.
- **Example**: If a previous step returned a list of URLs, and this step requires a 'url' argument, copy the URL exactly.
- **Do NOT** use placeholders (like "example.com" or "[]") if real data is available.
`;

return `...
${dataFlowInstruction}
...
`;
```

### 2.4 Implementation Plan

1.  **Refactor Types**: Add `execution` config and prompt fields.
2.  **Update `PESAgent` Logic**:
    *   Implement config reading for TAEF limits.
    *   Refactor `_buildToolStepPrompt` to use the new template.
    *   Implement "JIT Schema Injection" inside `_processTodoItem` logic, filtering `availableTools` based on `item.requiredTools`.
3.  **Optimize Planning**: Modify `_performPlanning` to map tools to the lightweight format.

---

## 3. Next Steps

This report serves as the blueprint for the fix. The GitHub issue #41 covers the high-level request, but this internal plan details the implementation strategy for the token optimization as well.
