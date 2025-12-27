# ART Framework Issues

## Issue 1: Execution Prompt Not Guiding LLM to Use Previous Tool Results

### Problem Description

When executing a tool step that depends on results from a previous step, the LLM fails to extract and use data from the conversation history. Specifically, when a plan includes:

1. Step 1: `webSearch` - Returns URLs in results
2. Step 2: `webExtract` - Should use URLs from Step 1

The LLM calls `webExtract` with `{"urls": []}` (empty array) instead of extracting actual URLs from the webSearch results in the conversation history.

### Console Logs Demonstrating the Issue

```
[FunctionalTool] ▶ Executing webSearch with args: {
  "query": "Google ADK official documentation"
}
[FunctionalTool] webSearch response status: 200
[FunctionalTool] webSearch result: {
  "query": "Google ADK official documentation",
  "answer": "...",
  "results": [
    {
      "title": "Agent Development Kit - Google",
      "url": "https://google.github.io/adk-docs/",  // <-- URL is here!
      "content": "..."
    }
  ]
}
[FunctionalTool] ✓ webSearch completed successfully

// Later, when executing webExtract step:
[FunctionalTool] ▶ Executing webExtract with args: {
  "urls": []  // <-- Empty! LLM didn't extract URL from previous results
}
[FunctionalTool] webExtract returned error: urls parameter is empty

[ART] TAEF Validation: Step step_2 missing required tools: webExtract
[ART] TAEF: Retrying step step_2 with tool enforcement prompt (retry 1/2)

// Retry also fails with empty urls...
```

### Root Cause Analysis

The `_buildToolStepPrompt` method in `pes-agent.ts` generates the execution prompt, but it doesn't guide the LLM to:

1. Look at previous tool results in the conversation history
2. Extract relevant data (like URLs) from those results
3. Use that data as input for the current tool

Current prompt structure (from minified code):
```javascript
_buildToolStepPrompt(e,t,n,r){
  let o=e.requiredTools?.join(", ")||"Check available tools",
  s=e.expectedOutcome||"Complete the task successfully";
  return `You are executing a TOOL STEP in a larger plan.
  ...
```

The prompt tells the LLM WHAT tools to call but not HOW to get the input data from previous steps.

### Proposed Fix

1. **Make the execution prompt customizable** via `ArtInstanceConfig`:

```typescript
interface ArtInstanceConfig {
  // ... existing config
  persona: {
    name: string;
    prompts: {
      planning: string;
      synthesis: string;
      execution?: string;  // NEW: Custom execution prompt
    }
  }
}
```

2. **Enhance the default execution prompt** to include guidance like:

```
You are executing a TOOL STEP in a larger plan.

## IMPORTANT: Using Previous Step Results
Look at the conversation history above. Previous tool results contain data you may need.
For example:
- If webSearch was called, extract URLs from its results to use with webExtract
- If a tool returned data, use that data as input for the current step

## Current Step
Description: ${stepDescription}
Required Tools: ${requiredTools}
Expected Outcome: ${expectedOutcome}

## Tool Call Format
Output a JSON object with your tool calls:
{
  "toolCalls": [
    {
      "toolName": "webExtract",
      "arguments": {
        "urls": "https://actual-url-from-previous-search.com"  // Use REAL URLs from history!
      }
    }
  ]
}

CRITICAL: Do NOT use empty arrays or placeholder values. Extract actual data from previous results.
```

---

## Issue 2: TAEF Max Retry Count is Hardcoded

### Problem Description

The TAEF (Tool-Aware Execution Framework) validation retry count is hardcoded to `k=2` in the PES Agent:

```javascript
// From pes-agent.ts (minified)
let I=5,k=2,S=0,x=0
// I=5: max iterations
// k=2: max TAEF validation retries (hardcoded!)
```

This means:
- 3 total attempts per step (initial + 2 retries)
- Cannot be configured via `ArtInstanceConfig`
- Users cannot reduce retries to save tokens/time or increase for complex steps

### Console Logs

```
[ART] TAEF Validation: Step step_2 missing required tools: webExtract
[ART] TAEF: Retrying step step_2 with tool enforcement prompt (retry 1/2)
// ... retry fails ...
[ART] TAEF: Retrying step step_2 with tool enforcement prompt (retry 2/2)
// ... retry fails ...
[ART] TAEF: Max validation retries (2) reached for step step_2
```

### Proposed Fix

Make TAEF retry count configurable via `ArtInstanceConfig`:

```typescript
interface ArtInstanceConfig {
  // ... existing config
  execution?: {
    maxIterations?: number;      // Default: 5
    taefMaxRetries?: number;     // Default: 2
    taefValidationMode?: 'strict' | 'advisory';  // Already exists per-step
  }
}
```

Usage:
```typescript
const config: ArtInstanceConfig = {
  // ... other config
  execution: {
    taefMaxRetries: 1,  // Only 1 retry (2 total attempts)
  }
};
```

---

## Summary of Requested Changes

| Feature | Current State | Requested Change |
|---------|--------------|------------------|
| Execution prompt | Hardcoded in `_buildToolStepPrompt` | Make customizable via `persona.prompts.execution` |
| Execution guidance | Doesn't guide LLM to use previous results | Add guidance for extracting data from history |
| TAEF max retries | Hardcoded `k=2` | Make configurable via `execution.taefMaxRetries` |
| TAEF max iterations | Hardcoded `I=5` | Make configurable via `execution.maxIterations` |

### Impact

These changes would:
1. Fix the webExtract empty URL issue by guiding LLM during execution
2. Allow users to tune retry behavior for their use case
3. Reduce token usage when fewer retries are acceptable
4. Enable more complex workflows when more retries are needed

### Workarounds Currently Used

1. **Improved tool descriptions** - Added detailed guidance in tool schemas
2. **Planning prompt updates** - Discouraged planning webExtract, prefer webSearch snippets
3. **Cannot work around** - TAEF retry count (requires framework change)
