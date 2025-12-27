# Building Custom Tools

Custom tools are the primary way to extend your agent's capabilities. Whether it's querying a database, calling a weather API, or interacting with the local file system, tools provide the "hands" for your agent.

## The `IToolExecutor` Interface

All tools in the ART framework must implement the `IToolExecutor` interface (from `@art-framework/core`).

```typescript
export interface IToolExecutor {
  /**
   * Returns the metadata schema for the tool.
   */
  getSchema(): ToolSchema;

  /**
   * Executes the tool logic.
   */
  execute(args: any, context: ExecutionContext): Promise<ToolResult>;
}
```

## Step-by-Step Implementation

### 1. Define the Schema

The schema tells the LLM what your tool does and what arguments it accepts. It uses JSON Schema for the `inputSchema`.

```typescript
const schema = {
  name: "get_weather",
  description: "Fetches current weather for a given city.",
  inputSchema: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: "The name of the city, e.g., 'San Francisco'."
      },
      unit: {
        type: "string",
        enum: ["celsius", "fahrenheit"],
        default: "celsius"
      }
    },
    required: ["city"]
  }
};
```

### 2. Implement the `execute` Method

The `execute` method contains your business logic. It receives the arguments (validated by the framework against your schema) and an `ExecutionContext`.

> [!CAUTION]
> **CRITICAL: The `output` Key**
> For the PES Agent to correctly capture and pass data between steps, your success result **MUST** contain an `output` property.

```typescript
async execute(args: { city: string, unit?: string }): Promise<ToolResult> {
  try {
    const weatherData = await weatherApi.fetch(args.city, args.unit);

    return {
      callId: "...", // Usually handled by the framework during runtime
      toolName: "get_weather",
      status: 'success',
      output: weatherData // <-- Framework looks specifically for this key
    };
  } catch (error) {
    return {
      callId: "...",
      toolName: "get_weather",
      status: 'error',
      error: `Failed to fetch weather: ${error.message}`
    };
  }
}
```

## Example: A Search Tool

```typescript
import { IToolExecutor, ToolSchema, ToolResult, ExecutionContext } from 'art-framework';

export class MySearchTool implements IToolExecutor {
  getSchema(): ToolSchema {
    return {
      name: "web_search",
      description: "Search the web for information.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" }
        },
        required: ["query"]
      }
    };
  }

  async execute(args: { query: string }, context: ExecutionContext): Promise<ToolResult> {
    const results = await someSearchApi(args.query);

    return {
      callId: "", // Framework populates this
      toolName: "web_search",
      status: 'success',
      output: results // Ensure results are placed in 'output'
    };
  }
}
```

## Registering Your Tool

Once your tool is built, register it in your `ArtInstanceConfig`:

```typescript
const art = await createArtInstance({
  // ...
  tools: [new MySearchTool()]
});
```

## Troubleshooting: "Information Retrieval Failed"

If your agent successfully calls a tool but then claims it "couldn't find any information," check your tool's return object.

**Incorrect (Common Mistake):**
```typescript
return {
  status: 'success',
  results: [1, 2, 3] // PESAgent will not see this data!
};
```

**Correct:**
```typescript
return {
  status: 'success',
  output: [1, 2, 3] // Data is correctly captured and visible to the agent.
};
```
