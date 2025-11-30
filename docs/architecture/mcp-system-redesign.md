# MCP System Architectural Redesign

## Executive Summary

This document presents a complete architectural redesign of ART's MCP (Model Context Protocol) system to support:

1. **Dynamic server management** - Add/remove MCP servers at runtime without app restart
2. **Multi-tier configuration** - App-level, user-level, thread-level, and call-level tool activation
3. **Programmatic tool calling** - Anthropic's advanced pattern for efficient tool orchestration
4. **Automatic tool search** - Context-aware, automatic tool discovery and loading
5. **Privacy-first design** - Credential isolation per user
6. **Zero hardcoded configuration** - Everything configurable at runtime

## Critical Issues in Current Implementation

### 1. **Global, Static Configuration**
```typescript
// ConfigManager.ts:26 - Single global localStorage key
private configKey = 'art_mcp_config';
```
**Problem**: All users share the same MCP config. No multi-tenancy support.

**Impact**:
- User A's LinkedIn MCP server credentials accessible to User B
- Cannot have per-user server configurations
- Cannot isolate different app deployments

### 2. **Hardcoded Default Server**
```typescript
// ConfigManager.ts:128-155 - Hardcoded Tavily server
private createDefaultConfig(): ArtMcpConfig {
  const tavilyCard: McpServerConfig = {
    id: "tavily_search_remote",
    type: "streamable-http",
    enabled: true,
    // ... hardcoded configuration
  };
}
```

**Problem**: Framework dictates which MCP servers apps must have.

**Impact**:
- App developers can't control default servers
- Users forced to have servers they don't need
- No clean slate for custom apps

### 3. **Initialization-Time Server Loading**
```typescript
// agent-factory.ts:276 - MCP initialized once at startup
await this.mcpManager.initialize(this.config.mcpConfig);
```

**Problem**: All servers connect at app startup, all tools loaded into context.

**Impact**:
- 55K+ tokens consumed before any conversation starts
- Cannot add servers after app initialization
- Poor token efficiency (Anthropic showed 85% waste)

### 4. **No Thread-Level Control**
```typescript
// McpManager has no concept of threads or contexts
// All tools available to all conversations at all times
```

**Problem**: Cannot limit MCP servers to specific conversations.

**Impact**:
- Personal conversation has access to work Slack
- Cannot disable expensive tools for quick queries
- No cost control per conversation

### 5. **No Programmatic Tool Calling Support**
```typescript
// McpProxyTool doesn't support allowed_callers
// No code execution integration
```

**Problem**: Cannot use Anthropic's programmatic tool calling pattern.

**Impact**:
- Each tool call requires full inference pass
- Intermediate results pollute context (37% token waste)
- Cannot process large datasets efficiently

### 6. **Manual Tool Management**
```typescript
// No Tool Search Tool implementation
// All tools loaded upfront or not at all
```

**Problem**: No automatic, context-aware tool discovery.

**Impact**:
- User must manually decide which servers to enable
- No optimization for current task
- Tool selection accuracy issues

## Proposed Architecture

### Layer 1: Storage Abstraction

```typescript
/**
 * Multi-tenant, hierarchical storage for MCP configuration
 */
interface McpStorageAdapter {
  // App-level configuration (provided by developers)
  getAppConfig(): Promise<McpAppConfig>;
  setAppConfig(config: McpAppConfig): Promise<void>;

  // User-level configuration (added by end users)
  getUserConfig(userId: string): Promise<McpUserConfig>;
  setUserConfig(userId: string, config: McpUserConfig): Promise<void>;

  // Thread-level active servers (temporary, per conversation)
  getThreadActiveServers(threadId: string): Promise<string[]>;
  setThreadActiveServers(threadId: string, serverIds: string[]): Promise<void>;

  // Credentials (isolated per user, encrypted)
  getUserCredentials(userId: string, serverId: string): Promise<OAuth2Tokens>;
  setUserCredentials(userId: string, serverId: string, tokens: OAuth2Tokens): Promise<void>;
  clearUserCredentials(userId: string, serverId: string): Promise<void>;

  // Deferred tools (Tool Search Tool pattern)
  getDeferredTools(): Promise<Map<string, McpToolDefinition>>;
  setDeferredTools(tools: Map<string, McpToolDefinition>): Promise<void>;
}

/**
 * App-level config: Developer-defined servers
 */
interface McpAppConfig {
  // Servers bundled with the app
  servers: McpServerConfig[];

  // Discovery settings
  discovery?: {
    enabled: boolean;
    endpoint?: string;
    autoDiscover?: boolean; // Auto-add discovered servers
  };

  // Defaults
  defaults?: {
    deferLoading: boolean; // Use Tool Search Tool by default
    enableProgrammaticCalling: boolean;
  };
}

/**
 * User-level config: User-added servers
 */
interface McpUserConfig {
  // Servers added by this specific user
  servers: McpServerConfig[];

  // User preferences
  preferences?: {
    autoLoadTools?: boolean; // Auto-enable Tool Search
    maxServersPerThread?: number;
    costLimits?: {
      maxCallsPerHour?: number;
      maxTokensPerDay?: number;
    };
  };
}
```

**Storage Implementation**:
```typescript
class IndexedDBMcpStorage implements McpStorageAdapter {
  private db: IDBDatabase;

  // Object stores:
  // - app_config: { id: 'singleton', config: McpAppConfig }
  // - user_configs: { userId: string, config: McpUserConfig }
  // - thread_servers: { threadId: string, serverIds: string[] }
  // - credentials: { userId_serverId: string, tokens: encrypted }
  // - deferred_tools: { toolName: string, definition: McpToolDefinition }
}
```

### Layer 2: Registry - Dynamic Server & Tool Management

```typescript
/**
 * Central registry for MCP servers and tools
 * Supports dynamic add/remove without restart
 */
class McpRegistry extends EventEmitter {
  private storage: McpStorageAdapter;
  private connections: Map<string, McpConnection>;
  private loadedTools: Map<string, McpToolRuntime>;
  private deferredTools: Map<string, McpToolDefinition>;

  constructor(storage: McpStorageAdapter) {
    super();
    this.storage = storage;
    this.connections = new Map();
    this.loadedTools = new Map();
    this.deferredTools = new Map();
  }

  // ===== Server Lifecycle =====

  /**
   * Register a new MCP server dynamically
   * @param config Server configuration
   * @param scope 'app' or 'user' level
   * @param userId Required if scope is 'user'
   */
  async registerServer(
    config: McpServerConfig,
    scope: 'app' | 'user',
    userId?: string
  ): Promise<void> {
    // Validate configuration
    this.validateServerConfig(config);

    // Save to appropriate storage level
    if (scope === 'app') {
      const appConfig = await this.storage.getAppConfig();
      appConfig.servers.push(config);
      await this.storage.setAppConfig(appConfig);
    } else if (scope === 'user' && userId) {
      const userConfig = await this.storage.getUserConfig(userId);
      userConfig.servers.push(config);
      await this.storage.setUserConfig(userId, userConfig);
    }

    // If tools should be deferred, register them as deferred
    if (config.defer_loading !== false) {
      await this.registerDeferredTools(config);
    } else {
      // Immediately discover and load tools
      await this.discoverAndLoadTools(config, userId);
    }

    // Emit event for UI updates
    this.emit('server:registered', {
      serverId: config.id,
      scope,
      userId
    });

    Logger.info(`MCP server "${config.id}" registered at ${scope} level`);
  }

  /**
   * Unregister a server (does not disconnect if in use)
   */
  async unregisterServer(
    serverId: string,
    scope: 'app' | 'user',
    userId?: string
  ): Promise<void> {
    // Remove from storage
    if (scope === 'app') {
      const appConfig = await this.storage.getAppConfig();
      appConfig.servers = appConfig.servers.filter(s => s.id !== serverId);
      await this.storage.setAppConfig(appConfig);
    } else if (scope === 'user' && userId) {
      const userConfig = await this.storage.getUserConfig(userId);
      userConfig.servers = userConfig.servers.filter(s => s.id !== serverId);
      await this.storage.setUserConfig(userId, userConfig);
    }

    // Unload tools from this server
    await this.unloadServerTools(serverId);

    // Clear credentials
    if (userId) {
      await this.storage.clearUserCredentials(userId, serverId);
    }

    this.emit('server:unregistered', { serverId, scope, userId });
  }

  /**
   * Update server configuration
   */
  async updateServer(
    serverId: string,
    updates: Partial<McpServerConfig>,
    scope: 'app' | 'user',
    userId?: string
  ): Promise<void> {
    // Implementation: merge updates, save, reconnect if needed
  }

  /**
   * Get connection to a server (creates if doesn't exist)
   */
  async getConnection(
    serverId: string,
    userId: string
  ): Promise<McpConnection> {
    const key = `${userId}:${serverId}`;

    if (this.connections.has(key)) {
      return this.connections.get(key)!;
    }

    // Find server config (check user, then app)
    const config = await this.findServerConfig(serverId, userId);
    if (!config) {
      throw new Error(`Server "${serverId}" not found`);
    }

    // Create connection
    const connection = await this.createConnection(config, userId);
    this.connections.set(key, connection);

    return connection;
  }

  // ===== Tool Management =====

  /**
   * Register tools as deferred (Tool Search Tool pattern)
   */
  private async registerDeferredTools(
    serverConfig: McpServerConfig
  ): Promise<void> {
    for (const tool of serverConfig.tools) {
      const toolKey = `mcp_${serverConfig.id}_${tool.name}`;
      this.deferredTools.set(toolKey, {
        ...tool,
        serverId: serverConfig.id,
        defer_loading: true
      });
    }

    await this.storage.setDeferredTools(this.deferredTools);
  }

  /**
   * Load a specific tool on-demand
   */
  async loadTool(
    serverId: string,
    toolName: string,
    userId: string
  ): Promise<void> {
    const toolKey = `mcp_${serverId}_${toolName}`;

    // Check if already loaded
    if (this.loadedTools.has(toolKey)) {
      return;
    }

    // Get tool definition (from deferred or discover)
    let toolDef = this.deferredTools.get(toolKey);
    if (!toolDef) {
      const connection = await this.getConnection(serverId, userId);
      const tools = await connection.listTools();
      toolDef = tools.find(t => t.name === toolName);
    }

    if (!toolDef) {
      throw new Error(`Tool "${toolName}" not found on server "${serverId}"`);
    }

    // Create runtime wrapper
    const toolRuntime = new McpToolRuntime(
      toolDef,
      serverId,
      this,
      userId
    );

    this.loadedTools.set(toolKey, toolRuntime);

    // Register with ART's tool registry
    await this.artToolRegistry.registerTool(toolRuntime);

    this.emit('tool:loaded', { toolKey, serverId, toolName });
  }

  /**
   * Unload a tool (remove from context)
   */
  async unloadTool(toolKey: string): Promise<void> {
    const toolRuntime = this.loadedTools.get(toolKey);
    if (toolRuntime) {
      await this.artToolRegistry.unregisterTool(toolKey);
      this.loadedTools.delete(toolKey);
      this.emit('tool:unloaded', { toolKey });
    }
  }

  // ===== Helper Methods =====

  private async findServerConfig(
    serverId: string,
    userId: string
  ): Promise<McpServerConfig | null> {
    // Check user config first
    const userConfig = await this.storage.getUserConfig(userId);
    const userServer = userConfig.servers.find(s => s.id === serverId);
    if (userServer) return userServer;

    // Check app config
    const appConfig = await this.storage.getAppConfig();
    const appServer = appConfig.servers.find(s => s.id === serverId);
    return appServer || null;
  }
}
```

### Layer 3: Context Manager - Thread & Call-Level Control

```typescript
/**
 * Manages MCP context for threads and individual calls
 */
class McpContextManager {
  private registry: McpRegistry;
  private storage: McpStorageAdapter;
  private toolSearchService: ToolSearchService;

  /**
   * Set which MCP servers are active for a specific thread
   */
  async setThreadServers(
    threadId: string,
    serverIds: string[],
    userId: string
  ): Promise<void> {
    // Validate servers exist
    for (const serverId of serverIds) {
      const config = await this.registry.findServerConfig(serverId, userId);
      if (!config) {
        throw new Error(`Server "${serverId}" not found`);
      }
    }

    // Save to storage
    await this.storage.setThreadActiveServers(threadId, serverIds);

    // Load tools from these servers (if not deferred)
    for (const serverId of serverIds) {
      const config = await this.registry.findServerConfig(serverId, userId);
      if (!config.defer_loading) {
        await this.registry.discoverAndLoadTools(config, userId);
      }
    }
  }

  /**
   * Get tools available for a specific thread
   */
  async getThreadTools(
    threadId: string,
    userId: string
  ): Promise<McpToolDefinition[]> {
    const activeServerIds = await this.storage.getThreadActiveServers(threadId);
    const tools: McpToolDefinition[] = [];

    for (const serverId of activeServerIds) {
      const serverTools = await this.registry.getServerTools(serverId);
      tools.push(...serverTools);
    }

    return tools;
  }

  /**
   * Automatically resolve tools for a specific prompt (Tool Search Tool)
   */
  async resolveToolsForPrompt(
    prompt: string,
    threadId: string,
    userId: string,
    context?: {
      conversationHistory?: any[];
      maxTools?: number;
      costLimit?: number;
    }
  ): Promise<McpToolDefinition[]> {
    // Get available servers for this thread
    const activeServerIds = await this.storage.getThreadActiveServers(threadId);

    // Get all deferred tools from these servers
    const deferredTools = await this.registry.getDeferredToolsForServers(activeServerIds);

    // Search for relevant tools
    const relevantTools = await this.toolSearchService.search({
      query: prompt,
      availableTools: deferredTools,
      context: context?.conversationHistory,
      maxResults: context?.maxTools || 10
    });

    // Load the discovered tools
    for (const tool of relevantTools) {
      await this.registry.loadTool(tool.serverId, tool.name, userId);
    }

    return relevantTools;
  }

  /**
   * Disable a server for a specific thread (keep config, just deactivate)
   */
  async disableServerForThread(
    threadId: string,
    serverId: string
  ): Promise<void> {
    const activeServers = await this.storage.getThreadActiveServers(threadId);
    const updated = activeServers.filter(id => id !== serverId);
    await this.storage.setThreadActiveServers(threadId, updated);
  }
}
```

### Layer 4: Tool Search Service

```typescript
/**
 * Implements Anthropic's Tool Search Tool pattern
 */
class ToolSearchService {
  /**
   * Search for relevant tools using multiple strategies
   */
  async search(options: {
    query: string;
    availableTools: McpToolDefinition[];
    context?: any[];
    maxResults?: number;
    strategy?: 'regex' | 'bm25' | 'semantic';
  }): Promise<McpToolDefinition[]> {
    const { query, availableTools, maxResults = 10, strategy = 'bm25' } = options;

    switch (strategy) {
      case 'regex':
        return this.regexSearch(query, availableTools, maxResults);
      case 'bm25':
        return this.bm25Search(query, availableTools, maxResults);
      case 'semantic':
        return this.semanticSearch(query, availableTools, maxResults);
      default:
        return this.bm25Search(query, availableTools, maxResults);
    }
  }

  /**
   * Regex-based search (fast, simple)
   */
  private regexSearch(
    query: string,
    tools: McpToolDefinition[],
    maxResults: number
  ): McpToolDefinition[] {
    const keywords = query.toLowerCase().split(/\s+/);
    const scored = tools.map(tool => {
      const text = `${tool.name} ${tool.description}`.toLowerCase();
      const score = keywords.reduce((s, kw) => {
        return s + (text.includes(kw) ? 1 : 0);
      }, 0);
      return { tool, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(s => s.tool);
  }

  /**
   * BM25 algorithm (better ranking)
   */
  private bm25Search(
    query: string,
    tools: McpToolDefinition[],
    maxResults: number
  ): McpToolDefinition[] {
    // BM25 implementation
    // (Use a library like @nick-bull/bm25 or implement)
  }

  /**
   * Semantic search using embeddings
   */
  private async semanticSearch(
    query: string,
    tools: McpToolDefinition[],
    maxResults: number
  ): Promise<McpToolDefinition[]> {
    // Use embedding API (OpenAI, Voyage, etc.)
    // Compare cosine similarity
  }
}
```

### Layer 5: Programmatic Tool Executor

```typescript
/**
 * Handles tool execution from code (Anthropic's Programmatic Tool Calling)
 */
class ProgrammaticToolExecutor {
  private registry: McpRegistry;

  /**
   * Execute a tool called from code execution environment
   */
  async executeFromCode(
    toolName: string,
    args: any,
    context: {
      caller: {
        type: 'code_execution_20250825';
        tool_id: string;
      };
      userId: string;
      threadId: string;
    }
  ): Promise<any> {
    // Parse tool name (format: mcp_serverId_toolName)
    const match = toolName.match(/^mcp_([^_]+)_(.+)$/);
    if (!match) {
      throw new Error(`Invalid MCP tool name: ${toolName}`);
    }

    const [, serverId, actualToolName] = match;

    // Verify tool is allowed to be called from code
    const toolDef = await this.registry.getToolDefinition(serverId, actualToolName);
    if (!toolDef.allowed_callers?.includes(context.caller.type)) {
      throw new Error(`Tool "${toolName}" not allowed for programmatic calling`);
    }

    // Get connection
    const connection = await this.registry.getConnection(serverId, context.userId);

    // Execute tool
    const result = await connection.callTool(actualToolName, args);

    // Result does NOT go back to Claude's context
    // It's processed by the code execution environment

    return result;
  }
}
```

## Configuration Hierarchy Example

```typescript
// ===== App-level config (in developer's code) =====
const artInstance = await createArtInstance({
  mcp: {
    // Servers provided by the app developer
    appServers: [
      {
        id: 'company-knowledge-base',
        url: 'https://mcp.company.com/kb',
        defer_loading: true,
        scope: 'app' // Available to all users
      }
    ],

    // Discovery settings
    discovery: {
      enabled: true,
      endpoint: 'https://mcp-registry.com/api',
      autoDiscover: false // User must manually add
    },

    // Defaults
    defaults: {
      deferLoading: true, // Use Tool Search by default
      enableProgrammaticCalling: true
    }
  }
});

// ===== User adds their own server =====
await artInstance.mcp.registerServer({
  id: 'my-linkedin',
  url: 'https://mcp.linkedin.com',
  oauth: { /* user's credentials */ },
  defer_loading: true
}, 'user', currentUserId);

// ===== Thread-specific activation =====
// User starts a new job-hunting conversation
await artInstance.mcp.setThreadServers(
  threadId,
  ['my-linkedin'], // Only LinkedIn active for this thread
  currentUserId
);

// ===== Automatic tool search per call =====
// User asks: "Find software engineer jobs in San Francisco"
// Tool Search automatically:
// 1. Searches deferred tools for "linkedin job search"
// 2. Loads linkedin.searchJobs tool
// 3. Makes it available to Claude for this call only
// 4. Returns only final results to context
```

## Migration Path

### Phase 1: Refactor Storage (Non-Breaking)
- Create `McpStorageAdapter` interface
- Implement `IndexedDBMcpStorage`
- Migrate `ConfigManager` to use new storage
- **Breaking**: None (internal refactor)

### Phase 2: Add Registry (Additive)
- Implement `McpRegistry`
- Add dynamic `registerServer` / `unregisterServer` APIs
- **Breaking**: None (new features)

### Phase 3: Add Context Manager (Additive)
- Implement `McpContextManager`
- Add thread-level APIs
- **Breaking**: None (opt-in features)

### Phase 4: Tool Search Service (Opt-in)
- Implement `ToolSearchService`
- Add `defer_loading` support
- **Breaking**: None (opt-in via config)

### Phase 5: Programmatic Calling (Opt-in)
- Implement `ProgrammaticToolExecutor`
- Add `allowed_callers` support
- **Breaking**: None (opt-in via tool config)

### Phase 6: Deprecate Old APIs
- Mark `ConfigManager` as deprecated
- Provide migration guide
- **Breaking**: Deprecation warnings

## Benefits Summary

| Feature | Current | After Redesign |
|---------|---------|----------------|
| **Add server at runtime** | ❌ Requires restart | ✅ Dynamic registration |
| **Per-user servers** | ❌ Global config | ✅ User-level isolation |
| **Per-thread activation** | ❌ All or nothing | ✅ Thread-specific |
| **Token efficiency** | ❌ 55K+ tokens upfront | ✅ 8.7K tokens (85% reduction) |
| **Programmatic calling** | ❌ Not supported | ✅ Full support |
| **Automatic tool search** | ❌ Manual management | ✅ Context-aware auto-loading |
| **Credential isolation** | ❌ Shared globally | ✅ Per-user encryption |
| **Multi-tenancy** | ❌ Single tenant | ✅ Multi-tenant ready |

## Next Steps

1. Review and approve architecture
2. Create detailed implementation plan for each phase
3. Design public API surface
4. Build prototype of Phase 1 (Storage refactor)
5. Gather feedback from app developers using ART

---

**Version**: 1.0
**Date**: 2025-11-30
**Authors**: ART Framework Team
**Status**: DRAFT - Awaiting Review
