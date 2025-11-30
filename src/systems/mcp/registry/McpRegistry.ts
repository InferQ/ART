/**
 * @module systems/mcp/registry/McpRegistry
 * Central registry for dynamic MCP server and tool management
 *
 * Key Features:
 * - Dynamic server registration/unregistration without app restart
 * - On-demand tool loading (Tool Search Tool pattern)
 * - Event-driven architecture for UI updates
 * - Multi-tenant support with per-user isolation
 * - Programmatic tool calling support
 */

import { EventEmitter } from 'events';
import { Logger } from '@/utils/logger';
import { ToolRegistry } from '@/core/interfaces';
import { McpStorageAdapter, DeferredToolEntry } from '../storage';
import { McpServerConfig, McpToolDefinition } from '../types';
import { McpClientController } from '../McpClient';
import { ARTError, ErrorCode } from '@/errors';

/**
 * Events emitted by McpRegistry
 */
export interface McpRegistryEvents {
  'server:registered': (event: { serverId: string; scope: 'app' | 'user'; userId?: string }) => void;
  'server:unregistered': (event: { serverId: string; scope: 'app' | 'user'; userId?: string }) => void;
  'server:updated': (event: { serverId: string; scope: 'app' | 'user'; userId?: string }) => void;
  'server:connected': (event: { serverId: string; userId: string }) => void;
  'server:disconnected': (event: { serverId: string; userId: string }) => void;
  'server:error': (event: { serverId: string; userId: string; error: Error }) => void;
  'tool:loaded': (event: { toolKey: string; serverId: string; toolName: string }) => void;
  'tool:unloaded': (event: { toolKey: string }) => void;
  'tool:called': (event: { toolKey: string; userId: string; duration: number }) => void;
}

/**
 * Runtime connection wrapper
 */
interface McpConnectionWrapper {
  serverId: string;
  userId: string;
  client: McpClientController;
  connectedAt: number;
  lastUsed: number;
}

/**
 * Runtime tool wrapper
 */
interface McpToolRuntime {
  toolKey: string;
  serverId: string;
  toolName: string;
  definition: McpToolDefinition;
  loadedAt: number;
  callCount: number;
  totalDuration: number;
}

/**
 * Central registry for MCP servers and tools
 * Supports dynamic add/remove without restart
 */
export class McpRegistry extends EventEmitter {
  private storage: McpStorageAdapter;
  private artToolRegistry: ToolRegistry;

  // Active connections: Map<userId:serverId, connection>
  private connections: Map<string, McpConnectionWrapper> = new Map();

  // Loaded tools: Map<toolKey, runtime>
  private loadedTools: Map<string, McpToolRuntime> = new Map();

  // Deferred tools cache (for fast lookup)
  private deferredToolsCache: Map<string, DeferredToolEntry> | null = null;

  // Connection pool limits
  private maxConnectionsPerUser: number = 10;
  private connectionIdleTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor(storage: McpStorageAdapter, artToolRegistry: ToolRegistry) {
    super();
    this.storage = storage;
    this.artToolRegistry = artToolRegistry;

    // Start cleanup interval for idle connections
    this.startConnectionCleanup();
  }

  // ===== Server Lifecycle Management =====

  /**
   * Register a new MCP server dynamically
   * @param config Server configuration
   * @param scope 'app' or 'user' level
   * @param userId Required if scope is 'user'
   * @returns Promise that resolves when registration is complete
   */
  async registerServer(
    config: McpServerConfig,
    scope: 'app' | 'user',
    userId?: string
  ): Promise<void> {
    Logger.info(`McpRegistry: Registering server "${config.id}" at ${scope} level`);

    // Validate configuration
    this.validateServerConfig(config);

    // Set scope and userId
    config.scope = scope;
    if (scope === 'user') {
      if (!userId) {
        throw new ARTError('userId required for user-scoped server', ErrorCode.INVALID_CONFIG);
      }
      config.userId = userId;
    }

    // Set timestamps
    config.createdAt = config.createdAt || Date.now();
    config.updatedAt = Date.now();

    // Save to storage
    if (scope === 'app') {
      const appConfig = await this.storage.getAppConfig();
      appConfig.servers.push(config);
      await this.storage.setAppConfig(appConfig);
    } else if (userId) {
      const userConfig = await this.storage.getUserConfig(userId);
      userConfig.servers.push(config);
      await this.storage.setUserConfig(userId, userConfig);
    }

    // Register tools
    if (config.defer_loading !== false) {
      // Defer loading tools (Tool Search Tool pattern)
      await this.registerDeferredTools(config);
    } else {
      // Immediately discover and load tools
      // Note: This requires connection, which requires userId
      if (userId) {
        await this.discoverAndLoadTools(config, userId);
      }
    }

    // Invalidate deferred tools cache
    this.deferredToolsCache = null;

    // Emit event
    this.emit('server:registered', { serverId: config.id, scope, userId });

    Logger.info(`McpRegistry: Server "${config.id}" registered successfully`);
  }

  /**
   * Unregister a server
   * @param serverId Server identifier
   * @param scope 'app' or 'user' level
   * @param userId Required if scope is 'user'
   */
  async unregisterServer(
    serverId: string,
    scope: 'app' | 'user',
    userId?: string
  ): Promise<void> {
    Logger.info(`McpRegistry: Unregistering server "${serverId}" from ${scope} level`);

    // Remove from storage
    if (scope === 'app') {
      const appConfig = await this.storage.getAppConfig();
      appConfig.servers = appConfig.servers.filter(s => s.id !== serverId);
      await this.storage.setAppConfig(appConfig);
    } else if (userId) {
      const userConfig = await this.storage.getUserConfig(userId);
      userConfig.servers = userConfig.servers.filter(s => s.id !== serverId);
      await this.storage.setUserConfig(userId, userConfig);
    }

    // Unload all tools from this server
    await this.unloadServerTools(serverId);

    // Disconnect all connections for this server
    await this.disconnectServer(serverId, userId);

    // Remove deferred tools
    const deferredTools = await this.storage.getDeferredToolsForServer(serverId);
    for (const tool of deferredTools) {
      await this.storage.removeDeferredTool(tool.toolKey);
    }

    // Clear credentials
    if (userId) {
      await this.storage.deleteUserCredentials(userId, serverId);
    }

    // Invalidate cache
    this.deferredToolsCache = null;

    // Emit event
    this.emit('server:unregistered', { serverId, scope, userId });

    Logger.info(`McpRegistry: Server "${serverId}" unregistered successfully`);
  }

  /**
   * Update server configuration
   * @param serverId Server identifier
   * @param updates Partial configuration updates
   * @param scope 'app' or 'user' level
   * @param userId Required if scope is 'user'
   */
  async updateServer(
    serverId: string,
    updates: Partial<McpServerConfig>,
    scope: 'app' | 'user',
    userId?: string
  ): Promise<void> {
    Logger.info(`McpRegistry: Updating server "${serverId}"`);

    // Get current config
    const currentConfig = await this.findServerConfig(serverId, scope, userId);
    if (!currentConfig) {
      throw new ARTError(`Server "${serverId}" not found`, ErrorCode.SERVER_NOT_FOUND);
    }

    // Merge updates
    const updatedConfig = { ...currentConfig, ...updates, updatedAt: Date.now() };

    // Save to storage
    if (scope === 'app') {
      const appConfig = await this.storage.getAppConfig();
      const index = appConfig.servers.findIndex(s => s.id === serverId);
      if (index >= 0) {
        appConfig.servers[index] = updatedConfig;
        await this.storage.setAppConfig(appConfig);
      }
    } else if (userId) {
      const userConfig = await this.storage.getUserConfig(userId);
      const index = userConfig.servers.findIndex(s => s.id === serverId);
      if (index >= 0) {
        userConfig.servers[index] = updatedConfig;
        await this.storage.setUserConfig(userId, userConfig);
      }
    }

    // If connection exists, reconnect if URL changed
    if (updates.connection) {
      await this.disconnectServer(serverId, userId);
    }

    // Emit event
    this.emit('server:updated', { serverId, scope, userId });

    Logger.info(`McpRegistry: Server "${serverId}" updated successfully`);
  }

  /**
   * Get or create a connection to a server
   * @param serverId Server identifier
   * @param userId User identifier
   * @returns Promise resolving to MCP client controller
   */
  async getConnection(serverId: string, userId: string): Promise<McpClientController> {
    const key = `${userId}:${serverId}`;

    // Check for existing connection
    const existing = this.connections.get(key);
    if (existing) {
      existing.lastUsed = Date.now();
      if (existing.client.isAuthenticated()) {
        await existing.client.ensureConnected();
        return existing.client;
      }
    }

    Logger.info(`McpRegistry: Creating connection for user ${userId} to server ${serverId}`);

    // Find server config
    const config = await this.findServerConfig(serverId, 'user', userId) ||
                   await this.findServerConfig(serverId, 'app');

    if (!config) {
      throw new ARTError(`Server "${serverId}" not found`, ErrorCode.SERVER_NOT_FOUND);
    }

    // Check connection limit
    const userConnections = Array.from(this.connections.values())
      .filter(c => c.userId === userId);
    if (userConnections.length >= this.maxConnectionsPerUser) {
      // Close oldest idle connection
      const oldest = userConnections.sort((a, b) => a.lastUsed - b.lastUsed)[0];
      await this.closeConnection(oldest.userId, oldest.serverId);
    }

    // Create new connection
    const client = this.createClient(config, userId);

    // Handle OAuth callback if needed
    const handled = await client.maybeHandleCallback();
    if (handled) {
      Logger.info(`McpRegistry: OAuth callback handled for ${serverId}`);
    }

    // Load existing session
    client.loadExistingSession();

    // Authenticate if needed
    if (!client.isAuthenticated()) {
      await client.startOAuth();
      // Note: This may redirect, code below might not execute
      await this.waitForAuth(client, 180000);
    }

    // Connect
    await client.connect();

    // Store connection
    const wrapper: McpConnectionWrapper = {
      serverId,
      userId,
      client,
      connectedAt: Date.now(),
      lastUsed: Date.now()
    };
    this.connections.set(key, wrapper);

    // Emit event
    this.emit('server:connected', { serverId, userId });

    Logger.info(`McpRegistry: Connection established for ${userId}:${serverId}`);
    return client;
  }

  // ===== Tool Management =====

  /**
   * Load a specific tool on-demand
   * @param serverId Server identifier
   * @param toolName Tool name
   * @param userId User identifier
   */
  async loadTool(serverId: string, toolName: string, userId: string): Promise<void> {
    const toolKey = `mcp_${serverId}_${toolName}`;

    // Check if already loaded
    if (this.loadedTools.has(toolKey)) {
      Logger.debug(`McpRegistry: Tool ${toolKey} already loaded`);
      return;
    }

    Logger.info(`McpRegistry: Loading tool ${toolKey}`);

    // Get tool definition from deferred tools or discover
    let toolDef = await this.getDeferredToolDefinition(toolKey);

    if (!toolDef) {
      // Not in deferred tools, discover from server
      const connection = await this.getConnection(serverId, userId);
      const tools = await connection.listTools();
      const discovered = tools.find(t => t.name === toolName);

      if (!discovered) {
        throw new ARTError(`Tool "${toolName}" not found on server "${serverId}"`, ErrorCode.TOOL_NOT_FOUND);
      }

      toolDef = {
        name: discovered.name,
        description: discovered.description,
        inputSchema: {}, // SDK provides minimal info
        serverId
      };
    }

    // Create runtime wrapper
    const runtime: McpToolRuntime = {
      toolKey,
      serverId,
      toolName,
      definition: toolDef,
      loadedAt: Date.now(),
      callCount: 0,
      totalDuration: 0
    };

    this.loadedTools.set(toolKey, runtime);

    // Register with ART's tool registry
    // Create a proxy tool that calls the MCP server
    const proxyTool = this.createProxyTool(runtime, userId);
    await this.artToolRegistry.registerTool(proxyTool);

    // Emit event
    this.emit('tool:loaded', { toolKey, serverId, toolName });

    Logger.info(`McpRegistry: Tool ${toolKey} loaded successfully`);
  }

  /**
   * Unload a tool
   * @param toolKey Tool key (mcp_serverId_toolName)
   */
  async unloadTool(toolKey: string): Promise<void> {
    const runtime = this.loadedTools.get(toolKey);
    if (!runtime) {
      Logger.warn(`McpRegistry: Tool ${toolKey} not loaded`);
      return;
    }

    Logger.info(`McpRegistry: Unloading tool ${toolKey}`);

    // Unregister from ART tool registry
    // Assuming ToolRegistry has an unregister method
    if ((this.artToolRegistry as any).unregisterTool) {
      await (this.artToolRegistry as any).unregisterTool(toolKey);
    }

    // Remove from loaded tools
    this.loadedTools.delete(toolKey);

    // Emit event
    this.emit('tool:unloaded', { toolKey });

    Logger.info(`McpRegistry: Tool ${toolKey} unloaded`);
  }

  /**
   * Get all loaded tools
   * @returns Array of loaded tool runtimes
   */
  getLoadedTools(): McpToolRuntime[] {
    return Array.from(this.loadedTools.values());
  }

  /**
   * Get tools for a specific server
   * @param serverId Server identifier
   * @returns Array of tool definitions
   */
  async getServerTools(serverId: string): Promise<McpToolDefinition[]> {
    // Get from deferred tools
    const deferredTools = await this.storage.getDeferredToolsForServer(serverId);
    return deferredTools.map(entry => entry.definition as McpToolDefinition);
  }

  // ===== Helper Methods =====

  private validateServerConfig(config: McpServerConfig): void {
    if (!config.id) {
      throw new ARTError('Server config must have an id', ErrorCode.INVALID_CONFIG);
    }
    if (!config.connection || !config.connection.url) {
      throw new ARTError('Server config must have a connection URL', ErrorCode.INVALID_CONFIG);
    }
    if (config.type !== 'streamable-http' && config.type !== 'websocket') {
      throw new ARTError('Only streamable-http and websocket transports supported', ErrorCode.UNSUPPORTED_TRANSPORT);
    }
  }

  private async findServerConfig(
    serverId: string,
    scope: 'app' | 'user',
    userId?: string
  ): Promise<McpServerConfig | null> {
    if (scope === 'app') {
      const appConfig = await this.storage.getAppConfig();
      return appConfig.servers.find(s => s.id === serverId) || null;
    } else if (userId) {
      const userConfig = await this.storage.getUserConfig(userId);
      return userConfig.servers.find(s => s.id === serverId) || null;
    }
    return null;
  }

  private async registerDeferredTools(config: McpServerConfig): Promise<void> {
    for (const tool of config.tools) {
      const toolKey = `mcp_${config.id}_${tool.name}`;
      const entry: DeferredToolEntry = {
        toolKey,
        serverId: config.id,
        toolName: tool.name,
        description: tool.description,
        definition: { ...tool, serverId: config.id },
        searchKeywords: this.extractSearchKeywords(tool),
        createdAt: Date.now()
      };
      await this.storage.addDeferredTool(entry);
    }
  }

  private async discoverAndLoadTools(config: McpServerConfig, userId: string): Promise<void> {
    try {
      const connection = await this.getConnection(config.id, userId);
      const tools = await connection.listTools();

      for (const tool of tools) {
        await this.loadTool(config.id, tool.name, userId);
      }
    } catch (error: any) {
      Logger.warn(`McpRegistry: Could not discover tools for ${config.id}: ${error.message}`);
    }
  }

  private async unloadServerTools(serverId: string): Promise<void> {
    const toolsToUnload = Array.from(this.loadedTools.values())
      .filter(runtime => runtime.serverId === serverId);

    for (const runtime of toolsToUnload) {
      await this.unloadTool(runtime.toolKey);
    }
  }

  private async disconnectServer(serverId: string, userId?: string): Promise<void> {
    const pattern = userId ? `${userId}:${serverId}` : `:${serverId}`;
    const connectionsToClose = Array.from(this.connections.entries())
      .filter(([key]) => key.includes(pattern));

    for (const [key, wrapper] of connectionsToClose) {
      await this.closeConnection(wrapper.userId, wrapper.serverId);
    }
  }

  private async closeConnection(userId: string, serverId: string): Promise<void> {
    const key = `${userId}:${serverId}`;
    const wrapper = this.connections.get(key);

    if (wrapper) {
      try {
        await wrapper.client.logout();
      } catch (error: any) {
        Logger.warn(`McpRegistry: Error closing connection ${key}: ${error.message}`);
      }
      this.connections.delete(key);
      this.emit('server:disconnected', { serverId, userId });
    }
  }

  private createClient(config: McpServerConfig, userId: string): McpClientController {
    const scopes = config.connection.oauth?.scopes;
    const scopeArray = Array.isArray(scopes) ? scopes : (scopes ? [scopes] : undefined);
    return McpClientController.create(config.connection.url, scopeArray);
  }

  private async waitForAuth(client: McpClientController, timeoutMs: number): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (client.isAuthenticated()) {
        return;
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    throw new ARTError('Authentication timeout', ErrorCode.TIMEOUT);
  }

  private async getDeferredToolDefinition(toolKey: string): Promise<McpToolDefinition | null> {
    // Use cache if available
    if (!this.deferredToolsCache) {
      this.deferredToolsCache = await this.storage.getDeferredTools();
    }

    const entry = this.deferredToolsCache.get(toolKey);
    return entry ? (entry.definition as McpToolDefinition) : null;
  }

  private extractSearchKeywords(tool: McpToolDefinition): string[] {
    const text = `${tool.name} ${tool.description || ''} ${tool.whenToUse || ''}`;
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  private createProxyTool(runtime: McpToolRuntime, userId: string): any {
    // This will be implemented as McpProxyTool
    // For now, return a placeholder
    return {
      schema: {
        name: runtime.toolKey,
        description: runtime.definition.description,
        parameters: runtime.definition.inputSchema
      },
      execute: async (args: any) => {
        const start = Date.now();
        try {
          const connection = await this.getConnection(runtime.serverId, userId);
          const result = await connection.callTool(runtime.toolName, args);

          const duration = Date.now() - start;
          runtime.callCount++;
          runtime.totalDuration += duration;

          this.emit('tool:called', { toolKey: runtime.toolKey, userId, duration });

          return result;
        } catch (error: any) {
          this.emit('server:error', { serverId: runtime.serverId, userId, error });
          throw error;
        }
      }
    };
  }

  private startConnectionCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const connectionsToClose: Array<[string, string]> = [];

      for (const [key, wrapper] of this.connections) {
        if (now - wrapper.lastUsed > this.connectionIdleTimeout) {
          connectionsToClose.push([wrapper.userId, wrapper.serverId]);
        }
      }

      for (const [userId, serverId] of connectionsToClose) {
        this.closeConnection(userId, serverId).catch(err => {
          Logger.warn(`McpRegistry: Cleanup error for ${userId}:${serverId}: ${err.message}`);
        });
      }
    }, 60000); // Run every minute
  }
}
