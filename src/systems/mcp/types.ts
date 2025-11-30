/**
 * @module systems/mcp/types
 * This module defines the public and internal types used for configuring
 * and managing the state of the MCP (Multi-Capability Provider) system.
 */

/**
 * Defines the connection details for a streamable HTTP-based MCP server.
 * This is the primary transport mechanism for browser-based MCP communication.
 *
 * @interface StreamableHttpConnection
 */
export interface StreamableHttpConnection {
  /**
   * The base URL of the MCP server.
   * @property {string} url
   */
  url: string;
  /**
   * Optional headers to include in every request to the server.
   * @property {Record<string, string>} [headers]
   */
  headers?: Record<string, string>;
  /**
   * The ID of an authentication strategy to use for this connection.
   * @property {string} [authStrategyId]
   */
  authStrategyId?: string;
  /**
   * Optional OAuth configuration for automatic PKCE setup per server.
   * This enables secure, per-server authentication without manual token handling.
   * @property {object} [oauth]
   */
  oauth?: {
    /**
     * The type of OAuth flow, currently supporting 'pkce'.
     * @property {'pkce'} type
     */
    type: 'pkce';
    /**
     * The OAuth 2.1 Authorization Endpoint URL.
     * @property {string} authorizationEndpoint
     */
    authorizationEndpoint: string;
    /**
     * The OAuth 2.1 Token Endpoint URL.
     * @property {string} tokenEndpoint
     */
    tokenEndpoint: string;
    /**
     * The public client ID for the OAuth application.
     * @property {string} clientId
     */
    clientId: string;
    /**
     * A space-delimited string of OAuth scopes to request.
     * @property {string} scopes
     */
    scopes: string;
    /**
     * The redirect URI that will handle the OAuth callback.
     * @property {string} redirectUri
     */
    redirectUri: string;
    /**
     * Optional 'resource' parameter for OAuth 2.1, often used as an audience identifier.
     * @property {string} [resource]
     */
    resource?: string;
    /**
     * Determines whether to open the login page in a new tab.
     * Defaults to true if omitted.
     * @property {boolean} [openInNewTab]
     */
    openInNewTab?: boolean;
    /**
     * An optional BroadcastChannel name for delivering tokens, useful in multi-window scenarios.
     * @property {string} [channelName]
     */
    channelName?: string;
  };
}

/**
 * Defines the schema for a tool provided by an MCP server.
 * Enhanced with Anthropic's advanced tool use patterns.
 *
 * @interface McpToolDefinition
 */
export interface McpToolDefinition {
  /**
   * The name of the tool.
   * @property {string} name
   */
  name: string;
  /**
   * A description of what the tool does.
   * @property {string} [description]
   */
  description?: string;
  /**
   * The JSON schema for the tool's input.
   * @property {any} inputSchema
   */
  inputSchema: any;
  /**
   * The JSON schema for the tool's output.
   * @property {any} [outputSchema]
   */
  outputSchema?: any;

  // ===== Anthropic Advanced Tool Use Patterns =====

  /**
   * Whether to defer loading this tool until explicitly needed.
   * Part of Anthropic's Tool Search Tool pattern.
   * When true, tool definition is not loaded into context upfront.
   * Instead, it's discovered on-demand via tool search.
   *
   * @see https://www.anthropic.com/engineering/advanced-tool-use
   * @property {boolean} [defer_loading]
   */
  defer_loading?: boolean;

  /**
   * List of callers allowed to invoke this tool programmatically.
   * Part of Anthropic's Programmatic Tool Calling pattern.
   * Tools can be called from code execution environment instead of
   * individual API round-trips, enabling efficient orchestration.
   *
   * Example: ['code_execution_20250825']
   *
   * @see https://www.anthropic.com/engineering/advanced-tool-use
   * @property {string[]} [allowed_callers]
   */
  allowed_callers?: string[];

  /**
   * Example tool invocations demonstrating correct usage.
   * Part of Anthropic's Tool Use Examples pattern.
   * Shows format conventions, nested structures, optional parameters,
   * and domain-specific patterns not captured in JSON Schema.
   *
   * Improves accuracy from 72% to 90% on complex parameter handling.
   *
   * @see https://www.anthropic.com/engineering/advanced-tool-use
   * @property {any[]} [input_examples]
   */
  input_examples?: any[];

  /**
   * When to use this tool (guidance for the model).
   * Helps with tool selection accuracy, especially when multiple
   * similar tools are available.
   *
   * @property {string} [whenToUse]
   */
  whenToUse?: string;

  /**
   * Server ID this tool belongs to (internal use).
   * Added automatically when tool is registered.
   *
   * @property {string} [serverId]
   */
  serverId?: string;

  /**
   * Cost estimate for this tool (for user display/tracking).
   *
   * @property {number} [estimatedCost]
   */
  estimatedCost?: number;

  /**
   * Tags for categorizing and searching tools.
   *
   * @property {string[]} [tags]
   */
  tags?: string[];
}

/**
 * Defines a static resource provided by an MCP server.
 *
 * @interface McpResource
 */
export interface McpResource {
  /**
   * The URI of the resource.
   * @property {string} uri
   */
  uri: string;
  /**
   * The name of the resource.
   * @property {string} name
   */
  name: string;
  /**
   * The MIME type of the resource.
   * @property {string} [mimeType]
   */
  mimeType?: string;
  /**
   * A description of the resource.
   * @property {string} [description]
   */
  description?: string;
}

/**
 * Defines a template for a resource provided by an MCP server.
 *
 * @interface McpResourceTemplate
 */
export interface McpResourceTemplate {
  /**
   * The URI template for the resource.
   * @property {string} uriTemplate
   */
  uriTemplate: string;
  /**
   * The name of the resource template.
   * @property {string} name
   */
  name: string;
  /**
   * A description of the resource template.
   * @property {string} [description]
   */
  description?: string;
  /**
   * The MIME type of the resource.
   * @property {string} [mimeType]
   */
  mimeType?: string;
}

/**
 * Represents the configuration for a single MCP server.
 *
 * @remarks
 * This is the format for each server entry in the MCP configuration.
 * It contains all the necessary information for discovering, installing, and connecting to an MCP server.
 * Enhanced with support for Anthropic's advanced tool use patterns and multi-tenant architecture.
 *
 * @typedef {object} McpServerConfig
 */
export type McpServerConfig = {
    /**
     * A unique identifier for the server.
     * @property {string} id
     */
    id: string;
    /**
     * The transport type for the server.
     * Browser-compatible transports only.
     * @property {'streamable-http' | 'websocket'} type
     */
    type: 'streamable-http' | 'websocket';
    /**
     * Whether the server is enabled and should be connected to.
     * @property {boolean} enabled
     */
    enabled: boolean;
    /**
     * A user-friendly name for the server.
     * @property {string} [displayName]
     */
    displayName?: string;
    /**
     * A description of the server and its capabilities.
     * @property {string} [description]
     */
    description?: string;
    /**
     * The connection details for the server.
     * @see module:systems/mcp/types.StreamableHttpConnection
     */
    connection: StreamableHttpConnection;
    /**
     * Information about how the server was installed (e.g., 'git', 'npm', 'manual').
     * @property {object} [installation]
     */
    installation?: { source: 'git' | 'npm' | 'manual'; [key: string]: any; };
    /**
     * The timeout in milliseconds for requests to the server.
     * @property {number} [timeout]
     */
    timeout?: number;
    /**
     * The tools provided by the server.
     * @property {McpToolDefinition[]} tools
     */
    tools: McpToolDefinition[];
    /**
     * The static resources provided by the server.
     * @property {McpResource[]} resources
     */
    resources: McpResource[];
    /**
     * The resource templates provided by the server.
     * @property {McpResourceTemplate[]} resourceTemplates
     */
    resourceTemplates: McpResourceTemplate[];

    // ===== Advanced Patterns and Multi-Tenancy Support =====

    /**
     * Defer loading ALL tools from this server (Tool Search Tool pattern).
     * When true, tools are only loaded on-demand via search.
     * Can be overridden per-tool with tool.defer_loading.
     *
     * @property {boolean} [defer_loading]
     */
    defer_loading?: boolean;

    /**
     * Scope of this server configuration.
     * - 'app': Provided by the application developer, available to all users
     * - 'user': Added by a specific user, isolated per-user
     *
     * @property {'app' | 'user'} [scope]
     */
    scope?: 'app' | 'user';

    /**
     * User ID this server belongs to (if scope is 'user').
     *
     * @property {string} [userId]
     */
    userId?: string;

    /**
     * Trust level for this server.
     * - 'verified': Official or verified by registry
     * - 'community': Community-provided
     * - 'user': User-added (default)
     *
     * @property {'verified' | 'community' | 'user'} [trustLevel]
     */
    trustLevel?: 'verified' | 'community' | 'user';

    /**
     * Cost/pricing information for this server.
     *
     * @property {object} [pricing]
     */
    pricing?: {
      /** Pricing model */
      model?: 'free' | 'freemium' | 'paid' | 'enterprise';
      /** Cost per tool call (for display) */
      costPerCall?: number;
      /** Free tier limits */
      freeTier?: {
        callsPerDay?: number;
        callsPerMonth?: number;
      };
    };

    /**
     * Rate limits for this server.
     *
     * @property {object} [rateLimits]
     */
    rateLimits?: {
      /** Maximum calls per minute */
      callsPerMinute?: number;
      /** Maximum calls per hour */
      callsPerHour?: number;
      /** Maximum calls per day */
      callsPerDay?: number;
    };

    /**
     * Tags for categorizing and discovering servers.
     *
     * @property {string[]} [tags]
     */
    tags?: string[];

    /**
     * Icon URL for UI display.
     *
     * @property {string} [icon]
     */
    icon?: string;

    /**
     * Provider/vendor information.
     *
     * @property {object} [provider]
     */
    provider?: {
      /** Provider name */
      name?: string;
      /** Provider website */
      website?: string;
      /** Documentation URL */
      documentation?: string;
      /** Support URL */
      support?: string;
    };

    /**
     * When this server configuration was created.
     *
     * @property {number} [createdAt]
     */
    createdAt?: number;

    /**
     * When this server configuration was last updated.
     *
     * @property {number} [updatedAt]
     */
    updatedAt?: number;
};

/**
 * Defines the root structure of the `art_mcp_config.json` file.
 *
 * @interface ArtMcpConfig
 */
export interface ArtMcpConfig {
    /**
     * A record of MCP server configurations, where the key is the server ID.
     * @property {Record<string, McpServerConfig>} mcpServers
     */
    mcpServers: Record<string, McpServerConfig>;
}

/**
 * Represents the internal status of an MCP server connection.
 * This is not part of the public configuration.
 *
 * @interface McpServerStatus
 */
export interface McpServerStatus {
    /**
     * The unique identifier for the server.
     * @property {string} id
     */
    id: string;
    /**
     * The current connection status of the server.
     * @property {'connected' | 'disconnected' | 'error' | 'connecting'} status
     */
    status: 'connected' | 'disconnected' | 'error' | 'connecting';
    /**
     * The timestamp of the last successful connection.
     * @property {Date} [lastConnected]
     */
    lastConnected?: Date;
    /**
     * The last error message received from the server.
     * @property {string} [lastError]
     */
    lastError?: string;
    /**
     * The number of tools registered from this server.
     * @property {number} toolCount
     */
    toolCount: number;
}

/**
 * Defines the configuration for the McpManager.
 *
 * @interface McpManagerConfig
 */
export interface McpManagerConfig {
  /**
   * Whether to enable MCP functionality. Defaults to false.
   * @property {boolean} enabled
   */
  enabled: boolean;
  /**
   * An optional endpoint URL for discovering MCP servers.
   * Defaults to the Zyntopia API if not provided.
   * @property {string} [discoveryEndpoint]
   */
  discoveryEndpoint?: string;
}

// McpClientConfig is no longer needed as the new McpClient takes a simpler config.