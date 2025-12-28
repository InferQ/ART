# Interface Contracts Reference

This document provides a comprehensive reference for the interface contracts that tool developers and framework consumers must adhere to when building extensions for the ART Framework.

## Overview

The ART Framework relies on well-defined interfaces to ensure consistent behavior across tools, adapters, and agents. Violating these contracts can lead to unexpected behavior such as:

- Missing data in synthesis phases
- UI components displaying "undefined" results
- The LLM incorrectly reporting "information retrieval failed"

---

## IToolExecutor Interface

The `IToolExecutor` interface defines the contract for all tool implementations.

```typescript
interface IToolExecutor {
  readonly schema: ToolSchema;
  execute(input: any, context: ExecutionContext): Promise<ToolResult>;
}
```

### The `execute()` Method Contract

The `execute()` method **MUST** return a `ToolResult` object with the following structure:

```typescript
interface ToolResult {
  callId: string; // Required: Must match the callId from the ParsedToolCall
  toolName: string; // Required: Must match the tool's schema name
  status: 'success' | 'error' | 'suspended'; // Required
  output?: any; // Required for success status
  error?: string; // Required for error status
  metadata?: {
    sources?: Array<{ sourceName: string; url?: string; [key: string]: any }>;
    suspensionId?: string; // Required for suspended status
    [key: string]: any;
  };
}
```

### Critical: The `output` Field

> [!IMPORTANT]
> The `output` field is the **primary data carrier** for successful tool executions. The PES Agent's "Smart Result Capture" logic specifically looks for this field.

#### ✅ Correct Pattern

```typescript
async execute(input: any, context: ExecutionContext): Promise<ToolResult> {
  const data = await fetchSomeData(input);

  return {
    callId: context.callId,
    toolName: this.schema.name,
    status: 'success',
    output: data  // ← Your data goes here
  };
}
```

#### ❌ Incorrect Patterns

```typescript
// DON'T: Return data in a 'data' property instead of 'output'
return {
  callId,
  toolName,
  status: 'success',
  data: myResult, // ← WRONG: Framework won't find this
};

// DON'T: Return naked data without the ToolResult wrapper
return myResult; // ← WRONG: Not a valid ToolResult

// DON'T: Return result in 'result' property
return {
  callId,
  toolName,
  status: 'success',
  result: myData, // ← WRONG: Use 'output' instead
};
```

---

## Tool Result Size Limits

### `toolResultMaxLength` Configuration

The PES Agent truncates tool results when building context for LLM calls. This is configurable via `ExecutionConfig`:

```typescript
interface ExecutionConfig {
  toolResultMaxLength?: number; // Default: 60000 characters
  // ... other options
}
```

### Default Behavior

| Context                   | Default Limit | Notes                                  |
| ------------------------- | ------------- | -------------------------------------- |
| Synthesis                 | 60,000 chars  | Configurable via `toolResultMaxLength` |
| Execution Context         | 60,000 chars  | Same as synthesis                      |
| `safeStringify()` default | 10,000 chars  | When called without explicit length    |

### Configuring at Different Levels

```typescript
// Instance level (createArtInstance)
const art = createArtInstance({
  executionConfig: {
    toolResultMaxLength: 100000, // 100KB limit
  },
});

// Call level (process options)
await art.process({
  query: '...',
  threadId: '...',
  options: {
    executionConfig: {
      toolResultMaxLength: 200000, // Override for this call
    },
  },
});
```

### When to Adjust

Increase `toolResultMaxLength` if:

- Your tools return large datasets (e.g., database queries, file contents)
- You notice truncation causing incomplete synthesis responses

Decrease it if:

- You're hitting token limits with your LLM provider
- Tool results contain verbose but non-essential data

---

## ToolSchema Interface

The `ToolSchema` interface defines how a tool is presented to the LLM:

```typescript
interface ToolSchema {
  name: string; // Unique identifier
  description: string; // Clear description for LLM
  inputSchema: JsonSchema; // JSON Schema for input validation
  outputSchema?: JsonSchema; // Optional: Expected output structure
  executionMode?: 'functional' | 'immediate' | 'blocking' | 'display';
  blockingConfig?: BlockingToolConfig; // For HITL tools
  displayConfig?: DisplayToolConfig; // For generative UI tools
  examples?: Array<{ input: any; output?: any; description?: string }>;
}
```

### Execution Modes

The framework supports three tool execution modes with different handling:

- **`functional`** (or `'immediate'` for backward compatibility): Regular tools that execute synchronously and return results immediately.

- **`blocking`**: HITL tools that require human input. They return `'suspended'` status initially, then the framework programmatically completes them with user feedback as output. No re-execution needed by default.

- **`display`**: Generative UI tools that render visual content. They complete immediately but their output is meant for rendering rather than LLM consumption.

### Naming Conventions

- Use `snake_case` for tool names (e.g., `web_search`, `file_read`)
- Keep names concise but descriptive
- Avoid special characters and spaces

### Description Best Practices

Write descriptions that help the LLM understand:

1. **What** the tool does
2. **When** to use it
3. **What** it returns

```typescript
// Good
description: 'Searches the web for current information. Use when the user asks about recent events, facts, or topics that require up-to-date data. Returns a list of relevant search results with titles, snippets, and URLs.';

// Bad
description: 'Web search';
```

---

## ExecutionContext Interface

The `ExecutionContext` provides runtime information to tools:

```typescript
interface ExecutionContext {
  threadId: string;
  traceId: string;
  callId: string;
  userId?: string;
  sessionId?: string;
}
```

Tools should use these values for:

- Logging and debugging (`traceId`)
- User-specific behavior (`userId`)
- Correlating results (`callId`)

---

## Common Pitfalls & Solutions

### 1. "Information Retrieval Failed" Despite Successful Tool

**Symptom:** LLM reports it couldn't retrieve information, but logs show tool succeeded.

**Cause:** Tool returned data in wrong property.

**Solution:** Ensure you return data in the `output` field:

```typescript
return { status: 'success', output: yourData, callId, toolName };
```

### 2. Truncated Results in Synthesis

**Symptom:** Final response missing details from tool results.

**Cause:** `toolResultMaxLength` is too low for your data.

**Solution:** Increase the limit:

```typescript
options: {
  executionConfig: {
    toolResultMaxLength: 100000;
  }
}
```

### 3. UI Shows "undefined" for Step Results

**Symptom:** Frontend receives `ITEM_STATUS_CHANGE` but displays undefined.

**Cause:** Race condition between observation and state sync (mitigated in v0.4.11+).

**Solution:** Use the `stepOutput` field in the observation content if available, or wait for state query.

---

## See Also

- [Building Custom Tools](file:///docs/how-to/building-custom-tools.md)
- [PES Agent Concepts](file:///docs/concepts/pes-agent.md)
- [API Reference Guide](file:///docs/art-framework-api-guide.md)
