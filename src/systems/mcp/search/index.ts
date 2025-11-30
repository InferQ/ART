/**
 * @module systems/mcp/search
 * Tool Search Service
 *
 * Implements Anthropic's Tool Search Tool pattern with multiple strategies:
 * - Regex: Fast keyword matching
 * - BM25: Sophisticated ranking algorithm
 * - Semantic: Embedding-based search (future)
 *
 * Reduces context usage by 85% (55K → 8.7K tokens)
 */

export * from './ToolSearchService';
