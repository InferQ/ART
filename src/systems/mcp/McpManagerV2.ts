/**
 * @module systems/mcp/McpManagerV2
 * Next-generation MCP Manager with advanced Anthropic patterns
 *
 * Key Improvements over McpManager:
 * - Multi-tenant storage (IndexedDB with per-user isolation)
 * - Dynamic server registration (no hardcoded defaults)
 * - Thread-specific tool activation
 * - Tool Search Tool pattern (defer_loading)
 * - Programmatic Tool Calling support
 * - CORS edge function support (browser-friendly)
 *
 * Migration Guide:
 * - Replace McpManager with McpManagerV2 in agent-factory
 * - All server configs now stored in IndexedDB (not localStorage)
 * - Tools are registered on-demand (not upfront)
 * - Thread context required for tool resolution
 */

import { ToolRegistry, StateManager } from '@/core/interfaces';
import { ARTError, ErrorCode } from '@/errors';
import { Logger } from '@/utils/logger';
import { AuthManager } from '../auth/AuthManager';
import { McpProxyTool } from './McpProxyTool';
import { McpServerConfig, McpToolDefinition } from './types';
import { McpClientController } from './McpClient';

// New architecture components
import { IndexedDBMcpStorage } from './storage/IndexedDBMcpStorage';
import { McpRegistry } from './registry/McpRegistry';
import { McpContextManager } from './context/McpContextManager';
import { ToolSearchService } from './search/ToolSearchService';
import { ProgrammaticToolExecutor } from './executor/ProgrammaticToolExecutor';

/**
 * Configuration for McpManagerV2 initialization
 */
export interface McpManagerV2Config {
  /** Whether MCP is enabled */
  enabled?: boolean;
  /** Optional discovery endpoint for remote MCP servers */
  discoveryEndpoint?: string;
  /** User ID for multi-tenant isolation (from AuthManager) */
  userId: string;
  /** Optional CORS proxy URL (edge function) */
  corsProxyUrl?: string;
  /** Tool search strategy */
  toolSearchStrategy?: 'regex' | 'bm25' | 'semantic';
  /** Enable programmatic tool calling */
  enableProgrammaticCalling?: boolean;
}

/**
 * Next-generation MCP Manager implementing Anthropic's advanced tool use patterns
 *
 * @remarks
 * McpManagerV2 provides:
 * - **Multi-Tenant Storage**: Per-user isolated configuration in IndexedDB
 * - **Dynamic Registration**: Add/remove servers at runtime without restart
 * - **Thread-Specific Activation**: Different tools for different conversations
 * - **Tool Search Pattern**: On-demand tool loading reducing context by 85%
 * - **Programmatic Calling**: Code-based tool execution saving 37% tokens
 * - **CORS Edge Function**: Browser-friendly MCP connections
 *
 * Migration from McpManager:
 * 1. Replace `McpManager` with `McpManagerV2` in agent-factory
 * 2. Pass `userId` in config (from AuthManager)
 * 3. Update initialize() calls to include user context
 * 4. Use thread-specific APIs for tool resolution
 *
 * @see {@link McpManager} for legacy implementation
 * @see {@link McpRegistry} for server lifecycle management
 * @see {@link McpContextManager} for thread-specific control
 *
 * @class McpManagerV2
 */
export class McpManagerV2 {
  // Dependencies
  private toolRegistry: ToolRegistry;
  private stateManager: StateManager;
  private authManager?: AuthManager;

  // New architecture layers
  private storage: IndexedDBMcpStorage;
  private registry: McpRegistry;
  private contextManager: McpContextManager;
  private toolSearch: ToolSearchService;
  private executor: ProgrammaticToolExecutor;

  // Configuration
  private config: McpManagerV2Config;
  private corsProxyUrl?: string;

  /**
   * Creates an instance of McpManagerV2
   *
   * @param toolRegistry The tool registry to register proxy tools with
   * @param stateManager The state manager for thread context
   * @param authManager The authentication manager for user context
   * @param config Initial configuration
   */
  constructor(
    toolRegistry: ToolRegistry,
    stateManager: StateManager,
    authManager?: AuthManager,
    config?: Partial<McpManagerV2Config>
  ) {
    this.toolRegistry = toolRegistry;
    this.stateManager = stateManager;
    this.authManager = authManager;

    // Default configuration
    this.config = {
      enabled: true,
      userId: config?.userId || this.getUserId(),
      toolSearchStrategy: config?.toolSearchStrategy || 'bm25',
      enableProgrammaticCalling: config?.enableProgrammaticCalling !== false,
      ...config
    };

    // Initialize storage layer
    this.storage = new IndexedDBMcpStorage();

    // Initialize registry (event-driven server/connection management)
    this.registry = new McpRegistry(this.storage);

    // Initialize context manager (thread-specific control)
    this.contextManager = new McpContextManager(this.registry, this.storage);

    // Initialize tool search service
    this.toolSearch = new ToolSearchService();

    // Initialize programmatic executor
    this.executor = new ProgrammaticToolExecutor(this.registry);

    Logger.info('McpManagerV2: Initialized with multi-tenant architecture');
  }

  /**
   * Initializes the MCP system with optional discovery
   *
   * @param mcpConfig Configuration options
   * @returns Promise resolving when initialization is complete
   *
   * @example
   * ```typescript
   * await mcpManager.initialize({
   *   enabled: true,
   *   userId: 'user_123',
   *   discoveryEndpoint: 'https://api.example.com/mcp/discover',
   *   corsProxyUrl: 'https://cors-proxy.example.com/api/cors-proxy'
   * });
   * ```
   */
  async initialize(mcpConfig?: McpManagerV2Config): Promise<void> {
    if (mcpConfig?.enabled === false) {
      Logger.info('McpManagerV2: MCP is disabled. Skipping initialization.');
      return;
    }

    if (mcpConfig) {
      this.config = { ...this.config, ...mcpConfig };
    }

    this.corsProxyUrl = this.config.corsProxyUrl;

    Logger.info('McpManagerV2: Initializing multi-tenant MCP system...');

    try {
      // 1. Initialize storage
      await this.storage.init();
      Logger.info('McpManagerV2: Storage initialized');

      // 2. Get user configuration
      const userId = this.config.userId;
      const userConfig = await this.storage.getUserConfig(userId);
      Logger.info(`McpManagerV2: Found ${Object.keys(userConfig.servers).length} user servers`);

      // 3. Get app-level configuration
      const appConfig = await this.storage.getAppConfig();
      Logger.info(`McpManagerV2: Found ${Object.keys(appConfig.servers).length} app servers`);

      // 4. Discover remote servers (if endpoint provided)
      if (this.config.discoveryEndpoint) {
        try {
          const discovered = await this.discoverServers(this.config.discoveryEndpoint);
          Logger.info(`McpManagerV2: Discovered ${discovered.length} remote servers`);
        } catch (error: any) {
          Logger.warn(`McpManagerV2: Discovery failed: ${error.message}`);
        }
      }

      // 5. Load deferred tools (Tool Search pattern)
      const deferredTools = await this.storage.getDeferredTools();
      Logger.info(`McpManagerV2: Loaded ${deferredTools.size} deferred tools`);

      // 6. Set up registry event listeners
      this.setupRegistryListeners();

      Logger.info('McpManagerV2: Initialization complete');

    } catch (error: any) {
      Logger.error(`McpManagerV2: Initialization failed: ${error.message}`);
      throw new ARTError(
        `MCP initialization failed: ${error.message}`,
        ErrorCode.INITIALIZATION_ERROR
      );
    }
  }

  /**
   * Registers a new MCP server
   *
   * @param server Server configuration
   * @param scope Whether server is app-level or user-level
   * @returns Promise resolving when registration is complete
   *
   * @example
   * ```typescript
   * await mcpManager.registerServer({
   *   id: 'github',
   *   type: 'streamable-http',
   *   displayName: 'GitHub MCP',
   *   connection: { url: 'https://mcp.github.com' },
   *   defer_loading: true
   * }, 'user');
   * ```
   */
  async registerServer(
    server: McpServerConfig,
    scope: 'app' | 'user' = 'user'
  ): Promise<void> {
    const userId = scope === 'user' ? this.config.userId : undefined;

    Logger.info(`McpManagerV2: Registering server "${server.id}" (scope: ${scope})`);

    // Apply CORS proxy if configured
    if (this.corsProxyUrl && server.type === 'streamable-http') {
      server = this.applyCorsProxy(server);
    }

    // Register with registry
    await this.registry.registerServer(server, scope, userId);

    // If not deferred, register tools immediately
    if (!server.defer_loading) {
      await this.loadServerTools(server.id);
    }

    Logger.info(`McpManagerV2: Server "${server.id}" registered successfully`);
  }

  /**
   * Unregisters an MCP server
   *
   * @param serverId Server ID to unregister
   * @param scope Server scope
   * @returns Promise resolving when unregistration is complete
   */
  async unregisterServer(
    serverId: string,
    scope: 'app' | 'user' = 'user'
  ): Promise<void> {
    const userId = scope === 'user' ? this.config.userId : undefined;

    Logger.info(`McpManagerV2: Unregistering server "${serverId}"`);

    // Unregister tools
    await this.unloadServerTools(serverId);

    // Unregister from registry
    await this.registry.unregisterServer(serverId, scope, userId);

    Logger.info(`McpManagerV2: Server "${serverId}" unregistered`);
  }

  /**
   * Activates specific servers for a thread
   *
   * @param threadId Thread ID
   * @param serverIds Array of server IDs to activate
   * @returns Promise resolving when activation is complete
   *
   * @example
   * ```typescript
   * // Only use GitHub and Linear tools in this thread
   * await mcpManager.setThreadServers('thread_123', ['github', 'linear']);
   * ```
   */
  async setThreadServers(threadId: string, serverIds: string[]): Promise<void> {
    await this.contextManager.setThreadServers(
      threadId,
      serverIds,
      this.config.userId
    );
    Logger.info(`McpManagerV2: Thread "${threadId}" using servers: ${serverIds.join(', ')}`);
  }

  /**
   * Resolves tools for a given prompt using Tool Search pattern
   *
   * @param prompt User prompt
   * @param threadId Thread ID for context
   * @param options Search options
   * @returns Promise resolving to relevant tools
   *
   * @example
   * ```typescript
   * const tools = await mcpManager.resolveToolsForPrompt(
   *   'Create a pull request to fix the bug',
   *   'thread_123',
   *   { maxResults: 5 }
   * );
   * // Returns: [github_createPullRequest, github_updateIssue, ...]
   * ```
   */
  async resolveToolsForPrompt(
    prompt: string,
    threadId: string,
    options?: {
      maxResults?: number;
      minScore?: number;
    }
  ): Promise<McpToolDefinition[]> {
    return await this.contextManager.resolveToolsForPrompt(
      prompt,
      threadId,
      this.config.userId,
      {
        strategy: this.config.toolSearchStrategy,
        ...options
      }
    );
  }

  /**
   * Gets all available tools for a thread
   *
   * @param threadId Thread ID
   * @returns Promise resolving to tools
   */
  async getThreadTools(threadId: string): Promise<McpToolDefinition[]> {
    return await this.contextManager.getThreadTools(threadId, this.config.userId);
  }

  /**
   * Gets or creates a connection to an MCP server
   * Used by McpProxyTool for backwards compatibility
   *
   * @param serverId Server ID
   * @returns Promise resolving to client controller
   */
  async getOrCreateConnection(serverId: string): Promise<McpClientController> {
    return await this.registry.getConnection(serverId, this.config.userId);
  }

  /**
   * Executes a tool programmatically from code execution environment
   *
   * @param toolName Tool name (format: mcp_serverId_toolName)
   * @param args Tool arguments
   * @param context Execution context
   * @returns Promise resolving to execution result
   */
  async executeFromCode(
    toolName: string,
    args: any,
    context: {
      caller: { type: string; tool_id: string };
      threadId: string;
      timeout?: number;
    }
  ) {
    if (!this.config.enableProgrammaticCalling) {
      throw new ARTError(
        'Programmatic tool calling is disabled',
        ErrorCode.FEATURE_DISABLED
      );
    }

    return await this.executor.executeFromCode(toolName, args, {
      caller: context.caller,
      userId: this.config.userId,
      threadId: context.threadId,
      timeout: context.timeout
    });
  }

  /**
   * Shuts down all connections and cleans up resources
   *
   * @returns Promise resolving when shutdown is complete
   */
  async shutdown(): Promise<void> {
    Logger.info('McpManagerV2: Shutting down...');
    await this.registry.shutdown();
    Logger.info('McpManagerV2: Shutdown complete');
  }

  // ===== Private Helper Methods =====

  /**
   * Gets user ID from AuthManager or generates anonymous ID
   * @private
   */
  private getUserId(): string {
    if (this.authManager) {
      const user = (this.authManager as any).getCurrentUser?.();
      if (user?.id) return user.id;
    }
    // Generate anonymous user ID
    return `anonymous_${Date.now()}`;
  }

  /**
   * Applies CORS proxy to server configuration
   * @private
   */
  private applyCorsProxy(server: McpServerConfig): McpServerConfig {
    if (server.type !== 'streamable-http') return server;

    const connection = server.connection as any;
    const originalUrl = connection.url;

    // Wrap URL with CORS proxy
    const proxiedUrl = `${this.corsProxyUrl}?url=${encodeURIComponent(originalUrl)}`;

    return {
      ...server,
      connection: {
        ...connection,
        url: proxiedUrl,
        _originalUrl: originalUrl // Store original for reference
      }
    };
  }

  /**
   * Loads tools from a server and registers them
   * @private
   */
  private async loadServerTools(serverId: string): Promise<void> {
    try {
      const tools = await this.registry.getServerTools(serverId);

      for (const tool of tools) {
        // Create proxy tool
        const server = await this.registry.getServer(serverId);
        if (!server) continue;

        const proxyTool = new McpProxyTool(
          server,
          tool as any,
          this as any // McpProxyTool expects old interface
        );

        await this.toolRegistry.registerTool(proxyTool);
      }

      Logger.info(`McpManagerV2: Loaded ${tools.length} tools from "${serverId}"`);
    } catch (error: any) {
      Logger.error(`McpManagerV2: Failed to load tools from "${serverId}": ${error.message}`);
    }
  }

  /**
   * Unloads and unregisters tools from a server
   * @private
   */
  private async unloadServerTools(serverId: string): Promise<void> {
    const prefix = `mcp_${serverId}_`;

    if ((this.toolRegistry as any).unregisterTools) {
      await (this.toolRegistry as any).unregisterTools(
        (schema: any) => typeof schema?.name === 'string' && schema.name.startsWith(prefix)
      );
    }

    Logger.info(`McpManagerV2: Unloaded tools from "${serverId}"`);
  }

  /**
   * Sets up event listeners for registry events
   * @private
   */
  private setupRegistryListeners(): void {
    this.registry.on('server:registered', ({ serverId, scope }) => {
      Logger.info(`McpManagerV2: Server "${serverId}" registered (${scope})`);
    });

    this.registry.on('server:unregistered', ({ serverId }) => {
      Logger.info(`McpManagerV2: Server "${serverId}" unregistered`);
    });

    this.registry.on('server:connected', ({ serverId }) => {
      Logger.info(`McpManagerV2: Server "${serverId}" connected`);
    });

    this.registry.on('server:disconnected', ({ serverId }) => {
      Logger.info(`McpManagerV2: Server "${serverId}" disconnected`);
    });

    this.registry.on('tool:loaded', ({ toolKey }) => {
      Logger.debug(`McpManagerV2: Tool "${toolKey}" loaded`);
    });

    this.registry.on('tool:unloaded', ({ toolKey }) => {
      Logger.debug(`McpManagerV2: Tool "${toolKey}" unloaded`);
    });
  }

  /**
   * Discovers servers from remote endpoint
   * @private
   */
  private async discoverServers(endpoint: string): Promise<McpServerConfig[]> {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ART-Framework-MCP/2.0'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`Discovery failed: ${response.status}`);
      }

      const data = await response.json();
      const services = Array.isArray(data) ? data : (data.services || []);

      // Convert to MCP server configs and register
      const servers: McpServerConfig[] = [];

      for (const service of services) {
        if (service.service_type === 'MCP_SERVICE') {
          const server = this.convertServiceToServerConfig(service);
          if (server) {
            // Register discovered servers at app level
            await this.registerServer(server, 'app');
            servers.push(server);
          }
        }
      }

      return servers;

    } catch (error: any) {
      Logger.error(`McpManagerV2: Discovery failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Converts discovery service entry to MCP server config
   * @private
   */
  private convertServiceToServerConfig(service: any): McpServerConfig | null {
    try {
      if (!service.id || !service.name || !service.connection) {
        return null;
      }

      return {
        id: service.id,
        type: service.connection.type === 'sse' ? 'streamable-http' : service.connection.type,
        enabled: service.enabled !== false,
        displayName: service.name,
        description: service.description,
        connection: service.connection,
        timeout: service.timeout || 10000,
        tools: service.tools || [],
        defer_loading: service.defer_loading !== false, // Default to true for discovered
        scope: 'app',
        trustLevel: 'community',
        tags: service.tags || [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    } catch {
      return null;
    }
  }

  // ===== Legacy Compatibility Methods =====

  /**
   * Installs a server (legacy compatibility)
   * @deprecated Use registerServer() instead
   */
  async installServer(server: McpServerConfig): Promise<McpServerConfig> {
    Logger.warn('McpManagerV2: installServer() is deprecated. Use registerServer()');
    await this.registerServer(server, 'user');
    return server;
  }

  /**
   * Uninstalls a server (legacy compatibility)
   * @deprecated Use unregisterServer() instead
   */
  async uninstallServer(serverId: string): Promise<void> {
    Logger.warn('McpManagerV2: uninstallServer() is deprecated. Use unregisterServer()');
    await this.unregisterServer(serverId, 'user');
  }
}
