/**
 * @module systems/mcp/context/McpContextManager
 * Manages MCP context for threads and individual calls
 *
 * Key Features:
 * - Thread-specific server activation
 * - Call-specific tool resolution via Tool Search
 * - Override settings per thread
 * - Automatic tool discovery based on prompt
 */

import { Logger } from '@/utils/logger';
import { McpRegistry } from '../registry/McpRegistry';
import { McpStorageAdapter, McpThreadConfig } from '../storage';
import { McpToolDefinition } from '../types';
import { ARTError, ErrorCode } from '@/errors';

/**
 * Context for resolving tools for a specific call
 */
export interface ToolResolutionContext {
  /** Conversation history for context-aware search */
  conversationHistory?: any[];
  /** Maximum number of tools to load */
  maxTools?: number;
  /** Cost limit for this call */
  costLimit?: number;
  /** Preferred search strategy */
  searchStrategy?: 'regex' | 'bm25' | 'semantic';
}

/**
 * Manages MCP context for threads and calls
 */
export class McpContextManager {
  private registry: McpRegistry;
  private storage: McpStorageAdapter;

  constructor(registry: McpRegistry, storage: McpStorageAdapter) {
    this.registry = registry;
    this.storage = storage;
  }

  // ===== Thread-Level Configuration =====

  /**
   * Set which MCP servers are active for a specific thread
   * @param threadId Thread identifier
   * @param serverIds Array of server IDs to activate
   * @param userId User identifier
   */
  async setThreadServers(
    threadId: string,
    serverIds: string[],
    userId: string
  ): Promise<void> {
    Logger.info(`McpContextManager: Setting servers for thread ${threadId}: ${serverIds.join(', ')}`);

    // Validate that all servers exist
    for (const serverId of serverIds) {
      const config = await this.findServerConfig(serverId, userId);
      if (!config) {
        throw new ARTError(`Server "${serverId}" not found`, ErrorCode.SERVER_NOT_FOUND);
      }
    }

    // Create thread config
    const threadConfig: McpThreadConfig = {
      threadId,
      activeServerIds: serverIds,
      updatedAt: Date.now()
    };

    // Save to storage
    await this.storage.setThreadConfig(threadId, threadConfig);

    // Load tools from these servers if not deferred
    for (const serverId of serverIds) {
      const config = await this.findServerConfig(serverId, userId);
      if (config && !config.defer_loading) {
        await this.loadServerTools(serverId, userId);
      }
    }

    Logger.info(`McpContextManager: Thread ${threadId} configured with ${serverIds.length} servers`);
  }

  /**
   * Get active servers for a thread
   * @param threadId Thread identifier
   * @returns Array of active server IDs
   */
  async getThreadActiveServers(threadId: string): Promise<string[]> {
    const config = await this.storage.getThreadConfig(threadId);
    return config?.activeServerIds || [];
  }

  /**
   * Get all tools available for a specific thread
   * @param threadId Thread identifier
   * @param userId User identifier
   * @returns Array of available tool definitions
   */
  async getThreadTools(threadId: string, userId: string): Promise<McpToolDefinition[]> {
    const activeServerIds = await this.getThreadActiveServers(threadId);
    const allTools: McpToolDefinition[] = [];

    for (const serverId of activeServerIds) {
      const tools = await this.registry.getServerTools(serverId);
      allTools.push(...tools);
    }

    Logger.debug(`McpContextManager: Thread ${threadId} has ${allTools.length} available tools`);
    return allTools;
  }

  /**
   * Add a server to a thread's active servers
   * @param threadId Thread identifier
   * @param serverId Server identifier to add
   * @param userId User identifier
   */
  async addServerToThread(
    threadId: string,
    serverId: string,
    userId: string
  ): Promise<void> {
    const currentServers = await this.getThreadActiveServers(threadId);

    if (!currentServers.includes(serverId)) {
      const updatedServers = [...currentServers, serverId];
      await this.setThreadServers(threadId, updatedServers, userId);
      Logger.info(`McpContextManager: Added server ${serverId} to thread ${threadId}`);
    }
  }

  /**
   * Remove a server from a thread's active servers
   * @param threadId Thread identifier
   * @param serverId Server identifier to remove
   */
  async removeServerFromThread(threadId: string, serverId: string): Promise<void> {
    const currentServers = await this.getThreadActiveServers(threadId);
    const updatedServers = currentServers.filter(id => id !== serverId);

    const config = await this.storage.getThreadConfig(threadId);
    if (config) {
      config.activeServerIds = updatedServers;
      config.updatedAt = Date.now();
      await this.storage.setThreadConfig(threadId, config);
      Logger.info(`McpContextManager: Removed server ${serverId} from thread ${threadId}`);
    }
  }

  /**
   * Disable a server for a specific thread (temporary)
   * Keeps the server in config but marks it as disabled
   * @param threadId Thread identifier
   * @param serverId Server identifier to disable
   */
  async disableServerForThread(threadId: string, serverId: string): Promise<void> {
    await this.removeServerFromThread(threadId, serverId);
    Logger.info(`McpContextManager: Server ${serverId} disabled for thread ${threadId}`);
  }

  /**
   * Enable a previously disabled server for a thread
   * @param threadId Thread identifier
   * @param serverId Server identifier to enable
   * @param userId User identifier
   */
  async enableServerForThread(
    threadId: string,
    serverId: string,
    userId: string
  ): Promise<void> {
    await this.addServerToThread(threadId, serverId, userId);
    Logger.info(`McpContextManager: Server ${serverId} enabled for thread ${threadId}`);
  }

  /**
   * Set thread-specific overrides
   * @param threadId Thread identifier
   * @param overrides Override settings
   */
  async setThreadOverrides(
    threadId: string,
    overrides: {
      disableToolSearch?: boolean;
      disableProgrammaticCalling?: boolean;
      timeout?: number;
    }
  ): Promise<void> {
    const config = await this.storage.getThreadConfig(threadId);

    if (config) {
      config.overrides = { ...config.overrides, ...overrides };
      config.updatedAt = Date.now();
      await this.storage.setThreadConfig(threadId, config);
      Logger.info(`McpContextManager: Overrides set for thread ${threadId}`);
    }
  }

  /**
   * Get thread-specific overrides
   * @param threadId Thread identifier
   * @returns Override settings or null
   */
  async getThreadOverrides(threadId: string): Promise<{
    disableToolSearch?: boolean;
    disableProgrammaticCalling?: boolean;
    timeout?: number;
  } | null> {
    const config = await this.storage.getThreadConfig(threadId);
    return config?.overrides || null;
  }

  /**
   * Clear all thread configuration (reset to default)
   * @param threadId Thread identifier
   */
  async clearThreadConfig(threadId: string): Promise<void> {
    await this.storage.deleteThreadConfig(threadId);
    Logger.info(`McpContextManager: Thread config cleared for ${threadId}`);
  }

  // ===== Call-Level Tool Resolution (Tool Search Integration) =====

  /**
   * Automatically resolve tools for a specific prompt
   * Uses Tool Search to find relevant tools on-demand
   * @param prompt The user's prompt/query
   * @param threadId Thread identifier
   * @param userId User identifier
   * @param context Additional context for resolution
   * @returns Array of relevant tool definitions
   */
  async resolveToolsForPrompt(
    prompt: string,
    threadId: string,
    userId: string,
    context?: ToolResolutionContext
  ): Promise<McpToolDefinition[]> {
    Logger.info(`McpContextManager: Resolving tools for prompt in thread ${threadId}`);

    // Get thread config
    const threadConfig = await this.storage.getThreadConfig(threadId);
    const activeServerIds = threadConfig?.activeServerIds || [];

    if (activeServerIds.length === 0) {
      Logger.warn(`McpContextManager: No active servers for thread ${threadId}`);
      return [];
    }

    // Check if Tool Search is disabled for this thread
    const overrides = await this.getThreadOverrides(threadId);
    if (overrides?.disableToolSearch) {
      // Load all tools from active servers
      return await this.getThreadTools(threadId, userId);
    }

    // Get all deferred tools from active servers
    const deferredTools = await this.getDeferredToolsForServers(activeServerIds);

    if (deferredTools.length === 0) {
      // No deferred tools, return all loaded tools
      return await this.getThreadTools(threadId, userId);
    }

    // Use Tool Search Service to find relevant tools
    // For now, use simple keyword matching (Phase 4 will add sophisticated search)
    const relevantTools = await this.searchTools(
      prompt,
      deferredTools,
      context?.maxTools || 10,
      context?.searchStrategy || 'regex'
    );

    // Load the discovered tools
    for (const tool of relevantTools) {
      if (tool.serverId) {
        await this.registry.loadTool(tool.serverId, tool.name, userId);
      }
    }

    Logger.info(`McpContextManager: Resolved ${relevantTools.length} tools for prompt`);
    return relevantTools;
  }

  /**
   * Get tool statistics for a thread
   * @param threadId Thread identifier
   * @returns Statistics about tool usage
   */
  async getThreadToolStats(threadId: string): Promise<{
    totalAvailable: number;
    totalLoaded: number;
    serverBreakdown: Map<string, number>;
  }> {
    const activeServerIds = await this.getThreadActiveServers(threadId);
    const loadedTools = this.registry.getLoadedTools();

    const serverBreakdown = new Map<string, number>();
    let totalAvailable = 0;

    for (const serverId of activeServerIds) {
      const tools = await this.registry.getServerTools(serverId);
      totalAvailable += tools.length;
      serverBreakdown.set(serverId, tools.length);
    }

    const totalLoaded = loadedTools.filter(tool =>
      activeServerIds.includes(tool.serverId)
    ).length;

    return {
      totalAvailable,
      totalLoaded,
      serverBreakdown
    };
  }

  // ===== Helper Methods =====

  /**
   * Find server config (checks both user and app scopes)
   * @private
   */
  private async findServerConfig(serverId: string, userId: string): Promise<any> {
    // Check user config first
    const userConfig = await this.storage.getUserConfig(userId);
    const userServer = userConfig.servers.find(s => s.id === serverId);
    if (userServer) return userServer;

    // Check app config
    const appConfig = await this.storage.getAppConfig();
    const appServer = appConfig.servers.find(s => s.id === serverId);
    return appServer || null;
  }

  /**
   * Load all tools from a server
   * @private
   */
  private async loadServerTools(serverId: string, userId: string): Promise<void> {
    const tools = await this.registry.getServerTools(serverId);

    for (const tool of tools) {
      try {
        await this.registry.loadTool(serverId, tool.name, userId);
      } catch (error: any) {
        Logger.warn(`McpContextManager: Failed to load tool ${tool.name}: ${error.message}`);
      }
    }
  }

  /**
   * Get deferred tools for specific servers
   * @private
   */
  private async getDeferredToolsForServers(serverIds: string[]): Promise<McpToolDefinition[]> {
    const allDeferredTools: McpToolDefinition[] = [];

    for (const serverId of serverIds) {
      const deferredTools = await this.storage.getDeferredToolsForServer(serverId);
      const toolDefs = deferredTools.map(entry => entry.definition as McpToolDefinition);
      allDeferredTools.push(...toolDefs);
    }

    return allDeferredTools;
  }

  /**
   * Simple tool search (will be replaced by ToolSearchService in Phase 4)
   * @private
   */
  private async searchTools(
    query: string,
    tools: McpToolDefinition[],
    maxResults: number,
    strategy: 'regex' | 'bm25' | 'semantic'
  ): Promise<McpToolDefinition[]> {
    // Simple keyword-based search for now
    const keywords = query.toLowerCase().split(/\s+/);

    const scored = tools.map(tool => {
      const searchText = `${tool.name} ${tool.description || ''} ${tool.whenToUse || ''}`.toLowerCase();
      const score = keywords.reduce((s, keyword) => {
        return s + (searchText.includes(keyword) ? 1 : 0);
      }, 0);
      return { tool, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(s => s.tool);
  }

  // ===== Utility Methods =====

  /**
   * Get all threads with active MCP configurations
   * @returns Array of thread IDs
   */
  async listActiveThreads(): Promise<string[]> {
    return await this.storage.listThreadIds();
  }

  /**
   * Clone thread configuration to another thread
   * @param sourceThreadId Source thread ID
   * @param targetThreadId Target thread ID
   */
  async cloneThreadConfig(sourceThreadId: string, targetThreadId: string): Promise<void> {
    const sourceConfig = await this.storage.getThreadConfig(sourceThreadId);

    if (sourceConfig) {
      const targetConfig: McpThreadConfig = {
        ...sourceConfig,
        threadId: targetThreadId,
        updatedAt: Date.now()
      };
      await this.storage.setThreadConfig(targetThreadId, targetConfig);
      Logger.info(`McpContextManager: Cloned config from ${sourceThreadId} to ${targetThreadId}`);
    }
  }

  /**
   * Export thread configuration as JSON
   * @param threadId Thread identifier
   * @returns JSON string of thread config
   */
  async exportThreadConfig(threadId: string): Promise<string> {
    const config = await this.storage.getThreadConfig(threadId);
    return JSON.stringify(config, null, 2);
  }

  /**
   * Import thread configuration from JSON
   * @param threadId Thread identifier
   * @param json JSON string of thread config
   */
  async importThreadConfig(threadId: string, json: string): Promise<void> {
    try {
      const config = JSON.parse(json);
      config.threadId = threadId;
      config.updatedAt = Date.now();
      await this.storage.setThreadConfig(threadId, config);
      Logger.info(`McpContextManager: Imported config for thread ${threadId}`);
    } catch (error: any) {
      throw new ARTError(`Failed to import thread config: ${error.message}`, ErrorCode.INVALID_CONFIG);
    }
  }
}
