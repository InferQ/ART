/**
 * ART Framework Configuration for Documentation Chatbot
 * 
 * This module provides the configuration and context for the ART-powered
 * documentation chatbot with default Groq configuration.
 */

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { DocSearchTool, type ToolResult, type ExecutionContext } from './DocSearchTool';

// Simplified types for the chatbot context
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    sources?: Array<{
        title: string;
        link: string;
        category: string;
    }>;
}

export type Provider = 'groq' | 'openai' | 'gemini' | 'anthropic';

export interface ModelOption {
    id: string;
    name: string;
    description: string;
}

export interface ChatConfig {
    provider: Provider;
    apiKey: string;
    model: string;
}

// Budget SOTA models for each provider
export const PROVIDER_MODELS: Record<Provider, ModelOption[]> = {
    groq: [
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Meta latest versatile model' },
        { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Ultra-fast, lightweight' },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Mistral MoE model' },
        { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Google open model' },
    ],
    openai: [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Best budget GPT - Fast & cheap' },
        { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable GPT model' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High capability, lower cost' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Legacy, very cheap' },
    ],
    gemini: [
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Latest flash model - Best value' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and efficient' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable Gemini' },
    ],
    anthropic: [
        { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fastest Claude - Best value' },
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Balanced performance' },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most capable Claude' },
    ],
};

// Default configuration using Groq with environment variable
const DEFAULT_PROVIDER: Provider = 'groq';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

// Get Groq API key from environment
function getDefaultApiKey(): string {
    // Vite exposes env vars on import.meta.env
    return (import.meta.env.VITE_GROQ_API_KEY as string) || '';
}

// System prompt for the documentation chatbot
const DOCS_CHATBOT_SYSTEM_PROMPT = `You are the ART Framework Documentation Assistant, an AI helper specifically designed to answer questions about the ART (Agentic Runtime) Framework.

## Your Role
- You help developers understand and use the ART Framework
- You ONLY answer questions related to the ART Framework documentation
- You ALWAYS use the search_art_docs tool to find accurate information before answering
- You cite your sources with links to the relevant documentation pages

## Guidelines
1. **Always search first**: Before answering any question, use the search_art_docs tool to find relevant documentation.
2. **Be accurate**: Only provide information that comes from the documentation. Don't make up features or APIs.
3. **Cite sources**: When you provide information, include links to the relevant documentation pages.
4. **Stay focused**: If a user asks about something unrelated to ART Framework, politely explain that you can only help with ART Framework questions and suggest they browse the documentation.
5. **Be helpful**: Provide clear, concise explanations with code examples when appropriate.

## Off-Topic Handling
If a user asks about something not related to ART Framework (like weather, general coding questions, etc.), respond with:
"I'm the ART Framework documentation assistant, so I can only help with questions about the ART Framework. Here are some topics I can help with:
- PES Agent architecture and workflow
- State management and persistence
- Creating and using tools
- UI integration with sockets
- MCP (Model Context Protocol)
- A2A (Agent-to-Agent) communication

What would you like to know about ART Framework?"`;

// Tool instance
const docSearchTool = new DocSearchTool();

// Generate UUID
function generateId(): string {
    return 'msg_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// API endpoints for different providers
const API_ENDPOINTS: Record<Provider, string> = {
    openai: 'https://api.openai.com/v1/chat/completions',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
    anthropic: 'https://api.anthropic.com/v1/messages',
    groq: 'https://api.groq.com/openai/v1/chat/completions',
};

// Call LLM API with tool use
async function callLLM(
    config: ChatConfig,
    messages: Array<{ role: string; content: string }>,
    onStream?: (token: string) => void
): Promise<{ content: string; toolCalls?: Array<{ name: string; arguments: Record<string, unknown> }> }> {
    const model = config.model;

    // Build tool definition for the API
    const tools = [{
        type: 'function',
        function: {
            name: docSearchTool.schema.name,
            description: docSearchTool.schema.description,
            parameters: docSearchTool.schema.inputSchema
        }
    }];

    if (config.provider === 'openai' || config.provider === 'groq') {
        const response = await fetch(API_ENDPOINTS[config.provider], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: DOCS_CHATBOT_SYSTEM_PROMPT },
                    ...messages
                ],
                tools,
                tool_choice: 'auto',
                stream: !!onStream,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API error: ${error}`);
        }

        if (onStream && response.body) {
            // Handle streaming
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';
            let toolCalls: Array<{ name: string; arguments: Record<string, unknown> }> = [];
            let toolCallArgs: Record<number, string> = {};

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

                for (const line of lines) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices?.[0]?.delta;

                        if (delta?.content) {
                            fullContent += delta.content;
                            onStream(delta.content);
                        }

                        if (delta?.tool_calls) {
                            for (const tc of delta.tool_calls) {
                                const idx = tc.index ?? 0;
                                if (tc.function?.name) {
                                    toolCalls[idx] = {
                                        name: tc.function.name,
                                        arguments: {}
                                    };
                                    toolCallArgs[idx] = '';
                                }
                                if (tc.function?.arguments) {
                                    toolCallArgs[idx] = (toolCallArgs[idx] || '') + tc.function.arguments;
                                }
                            }
                        }
                    } catch {
                        // Skip malformed JSON
                    }
                }
            }

            // Parse accumulated tool call arguments
            for (const idx in toolCallArgs) {
                if (toolCalls[idx] && toolCallArgs[idx]) {
                    try {
                        toolCalls[idx].arguments = JSON.parse(toolCallArgs[idx]);
                    } catch {
                        // Ignore parse errors
                    }
                }
            }

            return { content: fullContent, toolCalls: toolCalls.length > 0 ? toolCalls : undefined };
        } else {
            const data = await response.json();
            const message = data.choices?.[0]?.message;

            if (message?.tool_calls) {
                const toolCalls = message.tool_calls.map((tc: { function: { name: string; arguments: string } }) => ({
                    name: tc.function.name,
                    arguments: JSON.parse(tc.function.arguments)
                }));
                return { content: message.content || '', toolCalls };
            }

            return { content: message?.content || '' };
        }
    } else if (config.provider === 'anthropic') {
        const response = await fetch(API_ENDPOINTS.anthropic, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model,
                max_tokens: 4096,
                system: DOCS_CHATBOT_SYSTEM_PROMPT,
                messages: messages.map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content
                })),
                tools: tools.map(t => ({
                    name: t.function.name,
                    description: t.function.description,
                    input_schema: t.function.parameters
                })),
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API error: ${error}`);
        }

        const data = await response.json();
        let content = '';
        const toolCalls: Array<{ name: string; arguments: Record<string, unknown> }> = [];

        for (const block of data.content || []) {
            if (block.type === 'text') {
                content += block.text;
                if (onStream) onStream(block.text);
            } else if (block.type === 'tool_use') {
                toolCalls.push({
                    name: block.name,
                    arguments: block.input
                });
            }
        }

        return { content, toolCalls: toolCalls.length > 0 ? toolCalls : undefined };
    } else if (config.provider === 'gemini') {
        // Gemini API with function calling
        const url = `${API_ENDPOINTS.gemini}/${model}:generateContent?key=${config.apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: DOCS_CHATBOT_SYSTEM_PROMPT }]
                    },
                    ...messages.map(m => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    }))
                ],
                tools: [{
                    functionDeclarations: [{
                        name: docSearchTool.schema.name,
                        description: docSearchTool.schema.description,
                        parameters: docSearchTool.schema.inputSchema
                    }]
                }]
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API error: ${error}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        let content = '';
        const toolCalls: Array<{ name: string; arguments: Record<string, unknown> }> = [];

        for (const part of candidate?.content?.parts || []) {
            if (part.text) {
                content += part.text;
                if (onStream) onStream(part.text);
            }
            if (part.functionCall) {
                toolCalls.push({
                    name: part.functionCall.name,
                    arguments: part.functionCall.args
                });
            }
        }

        return { content, toolCalls: toolCalls.length > 0 ? toolCalls : undefined };
    }

    throw new Error(`Unsupported provider: ${config.provider}`);
}

// Simple LLM call without tools - for follow-up responses
async function callLLMSimple(
    config: ChatConfig,
    messages: Array<{ role: string; content: string }>,
    onStream?: (token: string) => void
): Promise<{ content: string }> {
    const model = config.model;

    if (config.provider === 'openai' || config.provider === 'groq') {
        const response = await fetch(API_ENDPOINTS[config.provider], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: DOCS_CHATBOT_SYSTEM_PROMPT },
                    ...messages
                ],
                stream: !!onStream,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API error: ${error}`);
        }

        if (onStream && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

                for (const line of lines) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices?.[0]?.delta;

                        if (delta?.content) {
                            fullContent += delta.content;
                            onStream(delta.content);
                        }
                    } catch {
                        // Skip malformed JSON
                    }
                }
            }

            return { content: fullContent };
        } else {
            const data = await response.json();
            return { content: data.choices?.[0]?.message?.content || '' };
        }
    } else if (config.provider === 'anthropic') {
        const response = await fetch(API_ENDPOINTS.anthropic, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model,
                max_tokens: 4096,
                system: DOCS_CHATBOT_SYSTEM_PROMPT,
                messages: messages.map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content
                })),
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API error: ${error}`);
        }

        const data = await response.json();
        let content = '';
        for (const block of data.content || []) {
            if (block.type === 'text') {
                content += block.text;
                if (onStream) onStream(block.text);
            }
        }
        return { content };
    } else if (config.provider === 'gemini') {
        const url = `${API_ENDPOINTS.gemini}/${model}:generateContent?key=${config.apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: 'user', parts: [{ text: DOCS_CHATBOT_SYSTEM_PROMPT }] },
                    ...messages.map(m => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    }))
                ]
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API error: ${error}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        let content = '';
        for (const part of candidate?.content?.parts || []) {
            if (part.text) {
                content += part.text;
                if (onStream) onStream(part.text);
            }
        }
        return { content };
    }

    throw new Error(`Unsupported provider: ${config.provider}`);
}

// Execute tool and get result
async function executeTool(
    toolName: string,
    args: Record<string, unknown>,
    threadId: string
): Promise<ToolResult> {
    if (toolName === docSearchTool.schema.name) {
        const context: ExecutionContext = {
            threadId,
            traceId: generateId(),
        };
        return docSearchTool.execute(args, context);
    }

    return {
        callId: generateId(),
        toolName,
        status: 'error',
        error: `Unknown tool: ${toolName}`
    };
}

// Chat context
interface ChatContextType {
    messages: ChatMessage[];
    isConfigured: boolean;
    isLoading: boolean;
    error: string | null;
    currentConfig: ChatConfig;
    hasDefaultApiKey: boolean;
    configure: (config: Partial<ChatConfig>) => void;
    sendMessage: (content: string) => Promise<void>;
    clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [threadId] = useState(() => generateId());

    // Check for default API key
    const defaultApiKey = useMemo(() => getDefaultApiKey(), []);
    const hasDefaultApiKey = !!defaultApiKey;

    // Config state with defaults
    const [config, setConfig] = useState<ChatConfig>({
        provider: DEFAULT_PROVIDER,
        model: DEFAULT_MODEL,
        apiKey: defaultApiKey,
    });

    const isConfigured = !!config.apiKey;

    const configure = useCallback((newConfig: Partial<ChatConfig>) => {
        setConfig(prev => {
            const updated = { ...prev, ...newConfig };
            // If changing provider, set default model for that provider
            if (newConfig.provider && newConfig.provider !== prev.provider && !newConfig.model) {
                updated.model = PROVIDER_MODELS[newConfig.provider][0].id;
            }
            return updated;
        });
        setError(null);
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!config.apiKey) {
            setError('Please configure an API key first');
            return;
        }

        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            content,
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            // Build message history for API
            const apiMessages = messages.map(m => ({
                role: m.role,
                content: m.content
            }));
            apiMessages.push({ role: 'user', content });

            // First call - may trigger tool use
            let streamedContent = '';
            const response = await callLLM(config, apiMessages, (token) => {
                streamedContent += token;
                // Update streaming message
                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.role === 'assistant' && last.id.startsWith('stream_')) {
                        return [
                            ...prev.slice(0, -1),
                            { ...last, content: streamedContent }
                        ];
                    } else {
                        return [
                            ...prev,
                            {
                                id: 'stream_' + generateId(),
                                role: 'assistant' as const,
                                content: streamedContent,
                                timestamp: Date.now()
                            }
                        ];
                    }
                });
            });

            // Check if tool was called
            if (response.toolCalls && response.toolCalls.length > 0) {
                // Execute tools
                const toolResults: ToolResult[] = [];
                const allSources: ChatMessage['sources'] = [];

                for (const tc of response.toolCalls) {
                    const result = await executeTool(tc.name, tc.arguments, threadId);
                    toolResults.push(result);

                    // Extract sources from tool results
                    if (result.status === 'success' && result.output) {
                        const output = result.output as { results?: Array<{ title: string; link: string; category: string; excerpt: string }> };
                        if (output.results) {
                            allSources.push(...output.results.map(r => ({
                                title: r.title,
                                link: r.link,
                                category: r.category
                            })));
                        }
                    }
                }

                // Build context from tool results for the follow-up call
                // Instead of trying to use OpenAI's tool response format (which needs tool_call_id),
                // we'll provide the documentation context as a user message
                const docContext = toolResults.map(tr => {
                    if (tr.status === 'success' && tr.output) {
                        const output = tr.output as {
                            results?: Array<{ title: string; excerpt: string; link: string }>;
                            message?: string;
                        };
                        if (output.results && output.results.length > 0) {
                            return output.results.map(r =>
                                `## ${r.title}\n${r.excerpt}\nSource: ${r.link}`
                            ).join('\n\n');
                        }
                        return output.message || '';
                    }
                    return tr.error || 'No results found';
                }).join('\n\n---\n\n');

                // Second call without tools - just generate response based on doc context
                const followUpMessages = [
                    ...apiMessages,
                    {
                        role: 'user',
                        content: `Based on the following documentation sections, please answer my question:\n\n${docContext}\n\nMy original question was: ${content}`
                    }
                ];

                let finalContent = '';
                // Make follow-up call without streaming to ensure we get full response
                const followUpResponse = await callLLMSimple(config, followUpMessages, (token) => {
                    finalContent += token;
                    setMessages(prev => {
                        const last = prev[prev.length - 1];
                        if (last?.role === 'assistant') {
                            return [
                                ...prev.slice(0, -1),
                                { ...last, content: finalContent, sources: allSources }
                            ];
                        } else {
                            return [
                                ...prev,
                                {
                                    id: 'stream_' + generateId(),
                                    role: 'assistant' as const,
                                    content: finalContent,
                                    timestamp: Date.now(),
                                    sources: allSources
                                }
                            ];
                        }
                    });
                });

                // Use the response content
                finalContent = finalContent || followUpResponse.content;

                // Final message update
                setMessages(prev => {
                    const newMessages = prev.filter(m => !m.id.startsWith('stream_'));
                    return [
                        ...newMessages,
                        {
                            id: generateId(),
                            role: 'assistant' as const,
                            content: finalContent,
                            timestamp: Date.now(),
                            sources: allSources.length > 0 ? allSources : undefined
                        }
                    ];
                });
            } else {
                // No tool calls, just use response
                setMessages(prev => {
                    const newMessages = prev.filter(m => !m.id.startsWith('stream_'));
                    return [
                        ...newMessages,
                        {
                            id: generateId(),
                            role: 'assistant' as const,
                            content: streamedContent || response.content,
                            timestamp: Date.now()
                        }
                    ];
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            // Remove any streaming messages
            setMessages(prev => prev.filter(m => !m.id.startsWith('stream_')));
        } finally {
            setIsLoading(false);
        }
    }, [config, messages, threadId]);

    const clearChat = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return (
        <ChatContext.Provider value={{
            messages,
            isConfigured,
            isLoading,
            error,
            currentConfig: config,
            hasDefaultApiKey,
            configure,
            sendMessage,
            clearChat
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
