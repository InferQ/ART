/**
 * @module systems/mcp/storage/types
 * Storage-specific types for the MCP system's multi-tenant architecture
 */

import { McpServerConfig } from '../types';

/**
 * OAuth 2.1 tokens for MCP server authentication
 */
export interface OAuth2Tokens {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
}

/**
 * App-level MCP configuration
 * Defined by the application developer and shared across all users
 */
export interface McpAppConfig {
  /**
   * MCP servers bundled with the application
   * These are available to all users by default
   */
  servers: McpServerConfig[];

  /**
   * Discovery service configuration
   */
  discovery?: {
    /** Whether discovery is enabled */
    enabled: boolean;
    /** Discovery service endpoint URL */
    endpoint?: string;
    /** Automatically add discovered servers to user config */
    autoDiscover?: boolean;
    /** Trusted discovery endpoints (prevent malicious servers) */
    trustedEndpoints?: string[];
  };

  /**
   * Default settings for all MCP servers
   */
  defaults?: {
    /** Use Tool Search Tool pattern by default (defer loading) */
    deferLoading?: boolean;
    /** Enable programmatic tool calling by default */
    enableProgrammaticCalling?: boolean;
    /** Default timeout for MCP connections (ms) */
    timeout?: number;
    /** Maximum number of concurrent connections */
    maxConnections?: number;
  };

  /**
   * Global rate limiting and cost controls
   */
  limits?: {
    /** Maximum MCP tool calls per hour globally */
    maxCallsPerHour?: number;
    /** Maximum tokens consumed per day */
    maxTokensPerDay?: number;
  };
}

/**
 * User-level MCP configuration
 * Specific to each user, allowing personalization
 */
export interface McpUserConfig {
  /** User ID this configuration belongs to */
  userId: string;

  /**
   * MCP servers added by this specific user
   * Isolated from other users for privacy
   */
  servers: McpServerConfig[];

  /**
   * User preferences for MCP behavior
   */
  preferences?: {
    /** Automatically load tools on-demand */
    autoLoadTools?: boolean;
    /** Maximum number of servers active per thread */
    maxServersPerThread?: number;
    /** Preferred tool search strategy */
    toolSearchStrategy?: 'regex' | 'bm25' | 'semantic';
    /** Enable cost tracking and warnings */
    enableCostTracking?: boolean;
  };

  /**
   * User-specific cost limits and quotas
   */
  costLimits?: {
    /** Maximum tool calls per hour for this user */
    maxCallsPerHour?: number;
    /** Maximum tokens per day for this user */
    maxTokensPerDay?: number;
    /** Alert threshold (percentage of limit) */
    alertThreshold?: number;
  };

  /**
   * Usage statistics (tracked per user)
   */
  usage?: {
    /** Total tool calls made */
    totalCalls?: number;
    /** Total tokens consumed */
    totalTokens?: number;
    /** Last reset timestamp */
    lastReset?: number;
  };
}

/**
 * Thread-level active server configuration
 * Determines which MCP servers are active for a specific conversation thread
 */
export interface McpThreadConfig {
  /** Thread ID this configuration applies to */
  threadId: string;

  /**
   * Active server IDs for this thread
   * Only tools from these servers are available in this conversation
   */
  activeServerIds: string[];

  /**
   * Thread-specific overrides
   */
  overrides?: {
    /** Disable Tool Search for this thread (load all tools upfront) */
    disableToolSearch?: boolean;
    /** Disable programmatic calling for this thread */
    disableProgrammaticCalling?: boolean;
    /** Custom timeout for this thread */
    timeout?: number;
  };

  /**
   * When this thread config was created/updated
   */
  updatedAt?: number;
}

/**
 * Credential storage entry
 * Stores OAuth tokens per user per server
 */
export interface McpCredentialEntry {
  /** Unique key: userId:serverId */
  key: string;
  /** User ID */
  userId: string;
  /** Server ID */
  serverId: string;
  /** OAuth tokens (should be encrypted in storage) */
  tokens: OAuth2Tokens;
  /** When these credentials were last updated */
  updatedAt: number;
  /** When these credentials expire (if applicable) */
  expiresAt?: number;
}

/**
 * Deferred tool entry for Tool Search Tool pattern
 */
export interface DeferredToolEntry {
  /** Unique tool key: mcp_serverId_toolName */
  toolKey: string;
  /** Server ID this tool belongs to */
  serverId: string;
  /** Tool name */
  toolName: string;
  /** Tool description (for search) */
  description?: string;
  /** Full tool definition (loaded on-demand) */
  definition: any;
  /** Search keywords (extracted from name + description) */
  searchKeywords?: string[];
  /** When this entry was created */
  createdAt: number;
}

/**
 * Storage adapter interface
 * Implements multi-tenant, hierarchical storage for MCP configuration
 */
export interface McpStorageAdapter {
  /**
   * Initialize the storage adapter
   * Sets up databases, object stores, indexes, etc.
   */
  init(): Promise<void>;

  // ===== App-Level Configuration =====

  /**
   * Get the application-level MCP configuration
   * @returns App config or default empty config
   */
  getAppConfig(): Promise<McpAppConfig>;

  /**
   * Set the application-level MCP configuration
   * @param config App-level configuration
   */
  setAppConfig(config: McpAppConfig): Promise<void>;

  // ===== User-Level Configuration =====

  /**
   * Get a user's MCP configuration
   * @param userId User identifier
   * @returns User config or default empty config
   */
  getUserConfig(userId: string): Promise<McpUserConfig>;

  /**
   * Set a user's MCP configuration
   * @param userId User identifier
   * @param config User-level configuration
   */
  setUserConfig(userId: string, config: McpUserConfig): Promise<void>;

  /**
   * Delete a user's entire MCP configuration
   * @param userId User identifier
   */
  deleteUserConfig(userId: string): Promise<void>;

  /**
   * List all user IDs with MCP configurations
   * @returns Array of user IDs
   */
  listUserIds(): Promise<string[]>;

  // ===== Thread-Level Configuration =====

  /**
   * Get active servers for a specific thread
   * @param threadId Thread identifier
   * @returns Thread config or null if not set
   */
  getThreadConfig(threadId: string): Promise<McpThreadConfig | null>;

  /**
   * Set active servers for a specific thread
   * @param threadId Thread identifier
   * @param config Thread configuration
   */
  setThreadConfig(threadId: string, config: McpThreadConfig): Promise<void>;

  /**
   * Delete thread configuration
   * @param threadId Thread identifier
   */
  deleteThreadConfig(threadId: string): Promise<void>;

  /**
   * List all thread IDs with configurations
   * @returns Array of thread IDs
   */
  listThreadIds(): Promise<string[]>;

  // ===== Credentials Management =====

  /**
   * Get OAuth credentials for a user+server combination
   * @param userId User identifier
   * @param serverId Server identifier
   * @returns OAuth tokens or null if not found
   */
  getUserCredentials(userId: string, serverId: string): Promise<OAuth2Tokens | null>;

  /**
   * Set OAuth credentials for a user+server combination
   * @param userId User identifier
   * @param serverId Server identifier
   * @param tokens OAuth tokens to store
   */
  setUserCredentials(userId: string, serverId: string, tokens: OAuth2Tokens): Promise<void>;

  /**
   * Delete OAuth credentials for a user+server combination
   * @param userId User identifier
   * @param serverId Server identifier
   */
  deleteUserCredentials(userId: string, serverId: string): Promise<void>;

  /**
   * Delete all credentials for a user
   * @param userId User identifier
   */
  deleteAllUserCredentials(userId: string): Promise<void>;

  // ===== Deferred Tools (Tool Search Tool Pattern) =====

  /**
   * Get all deferred tools
   * @returns Map of toolKey -> tool entry
   */
  getDeferredTools(): Promise<Map<string, DeferredToolEntry>>;

  /**
   * Set deferred tools (bulk update)
   * @param tools Map of toolKey -> tool entry
   */
  setDeferredTools(tools: Map<string, DeferredToolEntry>): Promise<void>;

  /**
   * Add a single deferred tool
   * @param entry Deferred tool entry
   */
  addDeferredTool(entry: DeferredToolEntry): Promise<void>;

  /**
   * Remove a deferred tool
   * @param toolKey Tool key (mcp_serverId_toolName)
   */
  removeDeferredTool(toolKey: string): Promise<void>;

  /**
   * Get deferred tools for a specific server
   * @param serverId Server identifier
   * @returns Array of deferred tools for this server
   */
  getDeferredToolsForServer(serverId: string): Promise<DeferredToolEntry[]>;

  /**
   * Search deferred tools by query
   * @param query Search query
   * @param limit Maximum results
   * @returns Array of matching tool entries
   */
  searchDeferredTools(query: string, limit?: number): Promise<DeferredToolEntry[]>;

  // ===== Utility Methods =====

  /**
   * Clear all MCP storage (for testing or reset)
   */
  clear(): Promise<void>;

  /**
   * Export all configuration as JSON (for backup)
   * @returns JSON string of all configuration
   */
  export(): Promise<string>;

  /**
   * Import configuration from JSON (for restore)
   * @param json JSON string from export()
   */
  import(json: string): Promise<void>;
}
