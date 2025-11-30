/**
 * @module systems/mcp/search/ToolSearchService
 * Implements Anthropic's Tool Search Tool pattern
 *
 * Provides multiple search strategies:
 * - Regex: Simple keyword matching (fast)
 * - BM25: Better ranking algorithm (balanced)
 * - Semantic: Embedding-based search (most accurate, requires API)
 *
 * Benefits:
 * - 85% token reduction (55K → 8.7K tokens)
 * - Improved tool selection accuracy
 * - On-demand tool loading
 *
 * @see https://www.anthropic.com/engineering/advanced-tool-use
 */

import { Logger } from '@/utils/logger';
import { McpToolDefinition } from '../types';
import { DeferredToolEntry } from '../storage';

/**
 * Search options for tool discovery
 */
export interface ToolSearchOptions {
  /** Search query (user prompt or keywords) */
  query: string;
  /** Available tools to search through */
  availableTools: McpToolDefinition[] | DeferredToolEntry[];
  /** Conversation history for context */
  context?: any[];
  /** Maximum number of results to return */
  maxResults?: number;
  /** Search strategy to use */
  strategy?: 'regex' | 'bm25' | 'semantic';
  /** Minimum relevance score (0-1) */
  minScore?: number;
}

/**
 * Scored search result
 */
export interface ScoredTool {
  tool: McpToolDefinition;
  score: number;
  matchedKeywords?: string[];
}

/**
 * Tool Search Service
 * Implements multiple strategies for discovering relevant tools
 */
export class ToolSearchService {
  /**
   * Search for relevant tools using the specified strategy
   * @param options Search options
   * @returns Array of relevant tools, sorted by relevance
   */
  async search(options: ToolSearchOptions): Promise<McpToolDefinition[]> {
    const {
      query,
      availableTools,
      maxResults = 10,
      strategy = 'bm25',
      minScore = 0.1
    } = options;

    Logger.debug(`ToolSearchService: Searching with ${strategy} strategy for "${query}"`);

    // Convert DeferredToolEntry to McpToolDefinition if needed
    const tools: McpToolDefinition[] = availableTools.map(tool =>
      'definition' in tool ? tool.definition as McpToolDefinition : tool
    );

    // Execute search strategy
    let scoredResults: ScoredTool[];

    switch (strategy) {
      case 'regex':
        scoredResults = this.regexSearch(query, tools);
        break;
      case 'bm25':
        scoredResults = this.bm25Search(query, tools);
        break;
      case 'semantic':
        scoredResults = await this.semanticSearch(query, tools);
        break;
      default:
        scoredResults = this.bm25Search(query, tools);
    }

    // Filter by minimum score and limit results
    const results = scoredResults
      .filter(r => r.score >= minScore)
      .slice(0, maxResults)
      .map(r => r.tool);

    Logger.info(`ToolSearchService: Found ${results.length} relevant tools using ${strategy}`);
    return results;
  }

  // ===== Search Strategies =====

  /**
   * Regex-based keyword search
   * Fast but simple - good for exact matches
   * @private
   */
  private regexSearch(query: string, tools: McpToolDefinition[]): ScoredTool[] {
    const keywords = this.extractKeywords(query);

    const scored = tools.map(tool => {
      const searchText = this.getSearchableText(tool);
      let score = 0;
      const matchedKeywords: string[] = [];

      for (const keyword of keywords) {
        if (searchText.includes(keyword)) {
          score += 1;
          matchedKeywords.push(keyword);

          // Boost score for name matches
          if (tool.name.toLowerCase().includes(keyword)) {
            score += 0.5;
          }
        }
      }

      // Normalize score
      score = keywords.length > 0 ? score / keywords.length : 0;

      return { tool, score, matchedKeywords };
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * BM25 ranking algorithm
   * Better than regex for ranking relevance
   * @private
   */
  private bm25Search(query: string, tools: McpToolDefinition[]): ScoredTool[] {
    const keywords = this.extractKeywords(query);

    // Calculate document frequencies
    const docFreq = new Map<string, number>();
    const totalDocs = tools.length;

    for (const tool of tools) {
      const text = this.getSearchableText(tool);
      const uniqueWords = new Set(text.split(/\s+/));
      for (const word of uniqueWords) {
        docFreq.set(word, (docFreq.get(word) || 0) + 1);
      }
    }

    // BM25 parameters
    const k1 = 1.5; // Term frequency saturation
    const b = 0.75; // Length normalization

    // Calculate average document length
    const avgDocLength = tools.reduce((sum, tool) => {
      return sum + this.getSearchableText(tool).split(/\s+/).length;
    }, 0) / totalDocs;

    // Score each tool
    const scored = tools.map(tool => {
      const text = this.getSearchableText(tool);
      const docLength = text.split(/\s+/).length;
      const words = text.split(/\s+/);

      // Calculate term frequencies
      const termFreq = new Map<string, number>();
      for (const word of words) {
        termFreq.set(word, (termFreq.get(word) || 0) + 1);
      }

      // Calculate BM25 score
      let score = 0;
      const matchedKeywords: string[] = [];

      for (const keyword of keywords) {
        const tf = termFreq.get(keyword) || 0;
        if (tf === 0) continue;

        matchedKeywords.push(keyword);

        const df = docFreq.get(keyword) || 0;
        const idf = Math.log((totalDocs - df + 0.5) / (df + 0.5) + 1);

        const numerator = tf * (k1 + 1);
        const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));

        score += idf * (numerator / denominator);
      }

      // Normalize score to 0-1 range
      score = score / (keywords.length || 1);

      return { tool, score, matchedKeywords };
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Semantic search using embeddings
   * Most accurate but requires embedding API
   * @private
   */
  private async semanticSearch(
    query: string,
    tools: McpToolDefinition[]
  ): Promise<ScoredTool[]> {
    // TODO: Implement semantic search with embedding API
    // For now, fall back to BM25
    Logger.warn('ToolSearchService: Semantic search not yet implemented, falling back to BM25');
    return this.bm25Search(query, tools);

    /*
    // Future implementation:
    // 1. Get embedding for query
    const queryEmbedding = await this.getEmbedding(query);

    // 2. Get embeddings for all tools (cache these)
    const toolEmbeddings = await Promise.all(
      tools.map(tool => this.getToolEmbedding(tool))
    );

    // 3. Calculate cosine similarity
    const scored = tools.map((tool, index) => {
      const similarity = this.cosineSimilarity(
        queryEmbedding,
        toolEmbeddings[index]
      );
      return { tool, score: similarity };
    });

    return scored.sort((a, b) => b.score - a.score);
    */
  }

  // ===== Helper Methods =====

  /**
   * Extract keywords from query
   * @private
   */
  private extractKeywords(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2) // Filter out very short words
      .filter(word => !this.isStopWord(word)); // Filter out stop words
  }

  /**
   * Get searchable text from tool
   * @private
   */
  private getSearchableText(tool: McpToolDefinition): string {
    const parts = [
      tool.name,
      tool.description || '',
      tool.whenToUse || '',
      ...(tool.tags || [])
    ];

    return parts.join(' ').toLowerCase();
  }

  /**
   * Check if a word is a stop word (common words to filter out)
   * @private
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'can',
      'could', 'should', 'may', 'might', 'must', 'this', 'that', 'these',
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
      'who', 'when', 'where', 'why', 'how'
    ]);

    return stopWords.has(word);
  }

  /**
   * Calculate cosine similarity between two vectors
   * @private
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  // ===== Future: Embedding API Integration =====

  /**
   * Get embedding for text (placeholder for future implementation)
   * @private
   */
  private async getEmbedding(text: string): Promise<number[]> {
    // TODO: Integrate with embedding API (OpenAI, Voyage, Cohere, etc.)
    // Example with OpenAI:
    /*
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text
      })
    });
    const data = await response.json();
    return data.data[0].embedding;
    */

    throw new Error('Embedding API not configured');
  }

  /**
   * Get cached embedding for a tool
   * @private
   */
  private async getToolEmbedding(tool: McpToolDefinition): Promise<number[]> {
    // TODO: Implement with caching
    const searchText = this.getSearchableText(tool);
    return await this.getEmbedding(searchText);
  }
}
