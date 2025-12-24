/**
 * DocSearchTool - ART Framework Documentation Search Tool
 * 
 * This tool implements the IToolExecutor interface to provide
 * RAG-like documentation search capabilities for the chatbot.
 */

import type { DocContent } from '../docs-content';
import { conceptsDocs, howToDocs } from '../docs-content';

// Define types inline to avoid importing from art-framework at build time
// These match the IToolExecutor interface from art-framework
export interface ToolSchema {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, unknown>;
        required?: string[];
    };
}

export interface ToolResult {
    callId: string;
    toolName: string;
    status: 'success' | 'error';
    output?: unknown;
    error?: string;
}

export interface ExecutionContext {
    threadId: string;
    traceId?: string;
    userId?: string;
}

export interface IToolExecutor {
    schema: ToolSchema;
    execute(input: unknown, context: ExecutionContext): Promise<ToolResult>;
}

// Search result interface
interface DocSearchResult {
    title: string;
    slug: string;
    category: 'concepts' | 'how-to' | 'api';
    excerpt: string;
    relevanceScore: number;
    link: string;
    fullContent: string;
}

// Tool input interface
interface DocSearchInput {
    query: string;
    category?: 'concepts' | 'how-to' | 'api' | 'all';
    limit?: number;
}

/**
 * Tokenizes a string into lowercase words for matching
 */
function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
}

/**
 * Calculates a relevance score based on query term matches
 */
function calculateRelevance(query: string, doc: DocContent): number {
    const queryTokens = tokenize(query);
    const titleTokens = tokenize(doc.title);
    const descriptionTokens = tokenize(doc.description);
    const contentTokens = tokenize(doc.content);

    let score = 0;

    for (const queryToken of queryTokens) {
        // Title matches are weighted heavily (x10)
        if (titleTokens.some(t => t.includes(queryToken) || queryToken.includes(t))) {
            score += 10;
        }

        // Description matches are weighted moderately (x5)
        if (descriptionTokens.some(t => t.includes(queryToken) || queryToken.includes(t))) {
            score += 5;
        }

        // Content matches (count occurrences, capped at 5)
        const contentMatches = contentTokens.filter(
            t => t.includes(queryToken) || queryToken.includes(t)
        ).length;
        score += Math.min(contentMatches, 5);
    }

    // Bonus for exact phrase match in title
    if (doc.title.toLowerCase().includes(query.toLowerCase())) {
        score += 20;
    }

    // Bonus for exact phrase match in description
    if (doc.description.toLowerCase().includes(query.toLowerCase())) {
        score += 10;
    }

    return score;
}

/**
 * Extracts the most relevant excerpt from the content based on query
 */
function extractRelevantExcerpt(content: string, query: string, maxLength: number = 500): string {
    const queryTokens = tokenize(query);
    const lines = content.split('\n');

    // Find paragraphs containing query terms
    const scoredParagraphs: { text: string; score: number }[] = [];
    let currentParagraph = '';

    for (const line of lines) {
        if (line.trim() === '') {
            if (currentParagraph.trim()) {
                const paragraphTokens = tokenize(currentParagraph);
                const matchCount = queryTokens.filter(qt =>
                    paragraphTokens.some(pt => pt.includes(qt) || qt.includes(pt))
                ).length;
                scoredParagraphs.push({
                    text: currentParagraph.trim(),
                    score: matchCount
                });
            }
            currentParagraph = '';
        } else {
            currentParagraph += ' ' + line;
        }
    }

    // Add last paragraph
    if (currentParagraph.trim()) {
        const paragraphTokens = tokenize(currentParagraph);
        const matchCount = queryTokens.filter(qt =>
            paragraphTokens.some(pt => pt.includes(qt) || qt.includes(pt))
        ).length;
        scoredParagraphs.push({
            text: currentParagraph.trim(),
            score: matchCount
        });
    }

    // Sort by score and take the best
    scoredParagraphs.sort((a, b) => b.score - a.score);

    // Take the top paragraph(s) up to maxLength
    let excerpt = '';
    for (const para of scoredParagraphs) {
        if (excerpt.length + para.text.length <= maxLength) {
            excerpt += (excerpt ? '\n\n' : '') + para.text;
        } else if (!excerpt) {
            // If first paragraph is too long, truncate it
            excerpt = para.text.substring(0, maxLength) + '...';
        } else {
            break;
        }
    }

    return excerpt || content.substring(0, maxLength) + '...';
}

/**
 * Documentation Search Tool
 * 
 * Searches through ART Framework documentation and returns
 * relevant sections with source links.
 */
export class DocSearchTool implements IToolExecutor {
    public readonly schema: ToolSchema = {
        name: 'search_art_docs',
        description: 'Search the ART Framework documentation for information about concepts, APIs, how-to guides, and framework features. Use this tool to find accurate, up-to-date information about the ART Framework. Always use this tool before answering questions about ART.',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The search query or question about ART Framework (e.g., "PES Agent", "state management", "how to create a tool")'
                },
                category: {
                    type: 'string',
                    enum: ['concepts', 'how-to', 'api', 'all'],
                    description: 'Category to search in. "concepts" for core architecture, "how-to" for guides, "api" for API reference, "all" for everything. Default: all'
                },
                limit: {
                    type: 'number',
                    description: 'Maximum number of results to return (1-5). Default: 3'
                }
            },
            required: ['query']
        }
    };

    // Base URL for documentation links
    private baseUrl: string = '/ART';

    async execute(input: unknown, context: ExecutionContext): Promise<ToolResult> {
        try {
            const { query, category = 'all', limit = 3 } = input as DocSearchInput;

            if (!query || typeof query !== 'string') {
                return {
                    callId: context.traceId || 'doc-search',
                    toolName: this.schema.name,
                    status: 'error',
                    error: 'Query parameter is required and must be a string'
                };
            }

            // Collect all docs to search based on category
            const docsToSearch: { doc: DocContent; category: 'concepts' | 'how-to' }[] = [];

            if (category === 'all' || category === 'concepts') {
                conceptsDocs.forEach(doc => docsToSearch.push({ doc, category: 'concepts' }));
            }

            if (category === 'all' || category === 'how-to') {
                howToDocs.forEach(doc => docsToSearch.push({ doc, category: 'how-to' }));
            }

            // Score and rank all documents
            const results: DocSearchResult[] = docsToSearch
                .map(({ doc, category }) => {
                    const relevanceScore = calculateRelevance(query, doc);
                    const link = `${this.baseUrl}/${category}/${doc.slug}`;

                    return {
                        title: doc.title,
                        slug: doc.slug,
                        category,
                        excerpt: extractRelevantExcerpt(doc.content, query),
                        relevanceScore,
                        link,
                        fullContent: doc.content
                    };
                })
                .filter(result => result.relevanceScore > 0)
                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                .slice(0, Math.min(limit, 5));

            // If no results found, return a helpful message
            if (results.length === 0) {
                return {
                    callId: context.traceId || 'doc-search',
                    toolName: this.schema.name,
                    status: 'success',
                    output: {
                        query,
                        results: [],
                        message: 'No matching documentation found for this query. Try different keywords or browse the documentation at /ART/concepts or /ART/how-to.',
                        suggestedTopics: [
                            { title: 'PES Agent', link: `${this.baseUrl}/concepts/pes-agent` },
                            { title: 'Getting Started', link: `${this.baseUrl}/how-to/connecting-your-ui` },
                            { title: 'State Management', link: `${this.baseUrl}/concepts/state-management` }
                        ]
                    }
                };
            }

            // Format results for the LLM
            const formattedResults = results.map(r => ({
                title: r.title,
                category: r.category,
                link: r.link,
                excerpt: r.excerpt,
                relevance: r.relevanceScore
            }));

            return {
                callId: context.traceId || 'doc-search',
                toolName: this.schema.name,
                status: 'success',
                output: {
                    query,
                    resultCount: results.length,
                    results: formattedResults,
                    message: `Found ${results.length} relevant documentation section(s). Use the excerpts and links to answer the user's question accurately.`
                }
            };

        } catch (error) {
            return {
                callId: context.traceId || 'doc-search',
                toolName: this.schema.name,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error during documentation search'
            };
        }
    }
}

export default DocSearchTool;
