/**
 * @module systems/mcp
 * This module exports the core components of the MCP (Multi-Capability Provider) architecture,
 * including the `McpManager`, `McpProxyTool`, and `ConfigManager`. It also exports
 * various type definitions related to MCP configuration and state.
 */

// Core MCP Architecture
export { McpManager } from './McpManager';
export { McpManagerV2 } from './McpManagerV2'; // Next-gen multi-tenant manager
export { McpProxyTool } from './McpProxyTool';
export { ConfigManager } from './ConfigManager';
export { McpClientController } from './McpClient';

// New Architecture Components (Phase 1-5)
export * from './storage';
export * from './registry';
export * from './context';
export * from './search';
export * from './executor';

// Type Definitions
export type {
  // Public config types
  ArtMcpConfig,
  McpServerConfig,
  StreamableHttpConnection,
  McpToolDefinition,
  McpResource,
  McpResourceTemplate,
  
  // Internal state types
  McpServerStatus
} from './types';