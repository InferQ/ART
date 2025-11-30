/**
 * @module systems/mcp/context
 * MCP Context Management
 *
 * Manages thread-level and call-level tool activation:
 * - Thread-specific server activation
 * - Automatic tool resolution via Tool Search
 * - Override settings per thread
 * - Call-specific tool filtering
 */

export * from './McpContextManager';
