# ART Framework Configuration Guide

This guide provides a comprehensive overview of the `ArtInstanceConfig` object, the central configuration structure for creating an agent instance in the ART framework. It explains every available option, why it's used, and how to configure it effectively.

## Introduction

The `ArtInstanceConfig` object is passed to the `createArtInstance` factory function. It dictates everything about your agent: its "brain" (LLM provider), its "memory" (storage), its "personality" (prompts), its "hands" (tools), and its behavioral loops.

```typescript
import { createArtInstance } from 'art-framework';

const art = await createArtInstance({
  // ... configuration options
});
```

## Basic Configuration (Minimal Setup)

At a minimum, an agent requires **Storage** (to save state) and a **Provider** (to generate thoughts).

```typescript
const config = {
  storage: { type: 'memory' }, // Ephemeral storage
  providers: {
    availableProviders: [
      { name: 'openai', adapter: OpenAIAdapter }
    ]
  }
};
```

---

## Detailed Configuration Options

### 1. Storage (`storage`)

**Purpose**: Defines where the agent persists conversations, observations, and internal state.

**Type**: `StorageAdapter | { type: 'memory' | 'indexedDB', ... }`

#### Options:

*   **In-Memory (`type: 'memory'`)**:
    *   **Use Case**: Testing, temporary sessions, server-side stateless executions.
    *   **Data Persistence**: Lost when the process/page reloads.
    ```typescript
    storage: { type: 'memory' }
    ```

*   **IndexedDB (`type: 'indexedDB'`)**:
    *   **Use Case**: Browser-based persistent agents. Data survives page reloads.
    *   **Configuration**:
        *   `dbName` (optional): Name of the database (default: 'ARTDB').
        *   `version` (optional): Database version number.
        *   `objectStores` (optional): Advanced schema configuration.
    ```typescript
    storage: {
      type: 'indexedDB',
      dbName: 'MyAgentDB'
    }
    ```

*   **Custom Adapter**:
    *   **Use Case**: Connecting to Postgres, MongoDB, Redis, or other custom backends.
    *   **Usage**: Pass an instantiated class implementing the `StorageAdapter` interface.
    ```typescript
    storage: new MyPostgresAdapter(connectionString)
    ```

### 2. LLM Providers (`providers`)

**Purpose**: Manages connections to AI models (Reasoning Engines). The ART framework allows you to register multiple providers and switch between them dynamically.

**Type**: `ProviderManagerConfig`

#### Structure:

*   **`availableProviders`** (Required): An array of provider definitions.
    *   `name`: Unique string ID (e.g., 'openai', 'anthropic').
    *   `adapter`: The class constructor for the provider adapter.
    *   `isLocal`: (Optional) Boolean indicating if the model runs locally (e.g., Ollama).
*   **`maxParallelApiInstancesPerProvider`** (Optional): Limit concurrent requests (Default: 5).
*   **`apiInstanceIdleTimeoutSeconds`** (Optional): Cleanup idle connections (Default: 300).

```typescript
providers: {
  availableProviders: [
    { name: 'openai', adapter: OpenAIAdapter },
    { name: 'anthropic', adapter: AnthropicAdapter }
  ]
}
```

**Note**: API keys are usually passed at *runtime* (per thread or call) or via environment variables handled inside the Adapter's implementation, rather than in this static config.

### 3. Agent Core (`agentCore`)

**Purpose**: Defines the internal logic loop of the agent.

**Type**: `new (dependencies: any) => IAgentCore`

*   **Default**: `PESAgent` (Plan-Execute-Synthesize Agent).
*   **Customization**: You can provide your own class if you have built a custom agent architecture (e.g., a ReAct agent or a specialized workflow automation agent).

```typescript
import { MyCustomAgent } from './agents/MyCustomAgent';

const config = {
  // ...
  agentCore: MyCustomAgent
};
```

### 4. Tools (`tools`)

**Purpose**: Capabilities the agent can invoke to interact with the world.

**Type**: `IToolExecutor[]`

*   **Usage**: Pass an array of instantiated tool classes.

```typescript
tools: [
  new CalculatorTool(),
  new WeatherTool(apiKey),
  new DatabaseQueryTool(connection)
]
```

### 5. Agent Identity & Persona (`persona`)

**Purpose**: Defines the "character" of the agent. This deeply influences the system prompts used during the Planning and Synthesis phases.

**Type**: `AgentPersona`

#### Fields:

*   **`name`**: The agent's name (e.g., "DataWizard").
*   **`prompts`**: Stage-specific system prompt templates.
    *   **`planning`**: Instructions for the internal monologue/reasoning phase.
    *   **`synthesis`**: Instructions for the final response to the user (tone, style).
    *   **`execution`**: (Optional) Override for the tool execution loop prompt.

```typescript
persona: {
  name: "HelpDeskBot",
  prompts: {
    planning: "You are an expert troubleshooter. Focus on root cause analysis.",
    synthesis: "Be polite, concise, and professional. Use bullet points for steps."
  }
}
```

### 6. Execution Behavior (`execution`)

**Purpose**: Fine-tunes the PES (Plan-Execute-Synthesize) loop mechanics, specifically the Tool-Aware Execution Framework (TAEF).

**Type**: `ExecutionConfig`

#### Fields:

*   **`maxIterations`**: Max LLM turns per Todo item (Default: 5). Prevents infinite loops.
*   **`taefMaxRetries`**: Retries if the LLM fails to call a required tool (Default: 2).
*   **`toolResultMaxLength`**: Truncates massive tool outputs to save context window (Default: 60000 chars).
*   **`enableA2ADelegation`**: (Boolean) Injects the `delegate_to_agent` tool, allowing this agent to sub-contract tasks.

```typescript
execution: {
  maxIterations: 10,
  toolResultMaxLength: 5000, // Strict token saving
  enableA2ADelegation: true
}
```

### 7. State Management (`stateSavingStrategy`)

**Purpose**: Controls when the agent's internal state (variables, memory) is persisted to storage.

**Type**: `'explicit' | 'implicit'` (Default: `'explicit'`)

*   **`'explicit'`**: State is only saved when code calls `stateManager.setAgentState()`. Best for predictable performance.
*   **`'implicit'`**: The framework compares state at the start and end of execution. If changed, it auto-saves. Convenient but has slight overhead.

### 8. Logging (`logger`)

**Purpose**: Controls the verbosity of the internal logger.

**Type**: `{ level: LogLevel }`

*   **Levels**: `'debug' | 'info' | 'warn' | 'error' | 'none'`

```typescript
logger: {
  level: 'debug' // See all internal thoughts and state changes
}
```

### 9. Advanced Capabilities

#### Authentication (`authConfig`)

**Purpose**: Manages strategies for authenticating with external APIs or MCP servers.

*   **`enabled`**: Boolean to turn the system on.
*   **`strategies`**: Register strategies like OAuth2 or API Key management.

#### Model Context Protocol (`mcpConfig`)

**Purpose**: Connects to external MCP servers to dynamically load tools and resources at runtime.

*   **`enabled`**: Boolean.
*   **`discoveryEndpoint`**: (Optional) URL to a Zyntopia-compatible discovery service.

#### Agent-to-Agent (`a2aConfig`)

**Purpose**: Configures how this agent participates in a multi-agent swarm.

*   **`discoveryEndpoint`**: URL to find other agents.
*   **`callbackUrl`**: The HTTP endpoint where *this* agent can receive webhook callbacks for async task completion.

## Full Configuration Example

Here is an example of a fully configured, production-ready agent instance:

```typescript
const art = await createArtInstance({
  // Persist to IndexedDB
  storage: { 
    type: 'indexedDB', 
    dbName: 'EnterpriseAssistantDB' 
  },

  // Register providers
  providers: {
    availableProviders: [
      { name: 'anthropic', adapter: AnthropicAdapter },
      { name: 'openai', adapter: OpenAIAdapter }
    ],
    maxParallelApiInstancesPerProvider: 10
  },

  // Define Persona
  persona: {
    name: "Atlas",
    prompts: {
      planning: "Analyze requests methodically. Break complex tasks into sub-steps.",
      synthesis: "Answer directly. Do not apologize. Provide code examples where relevant."
    }
  },

  // Execution Tuning
  execution: {
    maxIterations: 8,
    enableA2ADelegation: true // Can hire other agents
  },

  // Capabilities
  tools: [
    new FileSystemTool(),
    new WebSearchTool()
  ],

  // Advanced Systems
  authConfig: { enabled: true },
  mcpConfig: { enabled: true }, // Load dynamic tools from servers
  
  // Debugging
  logger: { level: 'info' }
});
```
