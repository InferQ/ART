/**
 * @module systems/mcp/storage
 * MCP Storage System
 *
 * Provides multi-tenant, hierarchical storage for MCP configuration:
 * - App-level: Developer-defined servers (shared across all users)
 * - User-level: User-added servers (isolated per user)
 * - Thread-level: Active servers per conversation
 * - Credentials: OAuth tokens (encrypted, per user+server)
 * - Deferred Tools: Tool Search Tool pattern (on-demand loading)
 */

export * from './types';
export * from './IndexedDBMcpStorage';
