// src/integrations/reasoning/groq.ts
import Groq from 'groq-sdk';
import type {
    ChatCompletionCreateParamsNonStreaming,
    ChatCompletionCreateParamsStreaming,
    ChatCompletionMessageParam,
    ChatCompletionTool,
    ChatCompletionMessageToolCall,
    ChatCompletionChunk,
} from 'groq-sdk/resources/chat/completions';
import { ProviderAdapter, ToolSchema } from '@/core/interfaces';
import {
    ArtStandardPrompt,
    ArtStandardMessage,
    CallOptions,
    StreamEvent,
    LLMMetadata,
} from '@/types';
import { Logger } from '@/utils/logger';
import { ARTError, ErrorCode } from '@/errors';

// Default model configuration
const GROQ_DEFAULT_MODEL_ID = 'llama-3.3-70b-versatile';
const GROQ_DEFAULT_MAX_TOKENS = 4096;
const GROQ_DEFAULT_TEMPERATURE = 0.7;

/**
 * Helper to determine tokenType and phase based on callContext.
 * @since 0.4.11
 */
function getTokenContext(callContext: string | undefined, isThinking: boolean): {
    tokenType: string;
    phase: 'planning' | 'execution' | 'synthesis' | undefined;
} {
    switch (callContext) {
        case 'PLANNING_THOUGHTS':
            return {
                phase: 'planning',
                tokenType: isThinking ? 'PLANNING_LLM_THINKING' : 'PLANNING_LLM_RESPONSE'
            };
        case 'EXECUTION_THOUGHTS':
            return {
                phase: 'execution',
                tokenType: isThinking ? 'EXECUTION_LLM_THINKING' : 'EXECUTION_LLM_RESPONSE'
            };
        case 'SYNTHESIS_THOUGHTS':
            return {
                phase: 'synthesis',
                tokenType: isThinking ? 'SYNTHESIS_LLM_THINKING' : 'SYNTHESIS_LLM_RESPONSE'
            };
        default:
            return {
                phase: undefined,
                tokenType: isThinking ? 'LLM_THINKING' : 'LLM_RESPONSE'
            };
    }
}

/**
 * Configuration options required for the `GroqAdapter`.
 */
export interface GroqAdapterOptions {
    /** Your Groq API key. Handle securely. */
    apiKey: string;
    /** The default Groq model ID to use (e.g., 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768'). */
    model?: string;
    /** Optional: Override the base URL for the Groq API. */
    apiBaseUrl?: string;
    /** Optional: Default maximum tokens for responses. */
    defaultMaxTokens?: number;
    /** Optional: Default temperature for responses. */
    defaultTemperature?: number;
}

/**
 * Implements the `ProviderAdapter` interface for interacting with Groq's
 * ultra-fast inference API using the official Groq SDK.
 *
 * Groq provides an OpenAI-compatible API, making this adapter similar in structure
 * to the OpenAI adapter but optimized for Groq's specific features and models.
 *
 * Handles formatting requests, parsing responses, streaming, and tool use.
 *
 * @see {@link ProviderAdapter} for the interface definition.
 * @see {@link GroqAdapterOptions} for configuration options.
 */
export class GroqAdapter implements ProviderAdapter {
    readonly providerName = 'groq';
    private client: Groq;
    private defaultModel: string;
    private defaultMaxTokens: number;
    private defaultTemperature: number;

    /**
     * Creates an instance of the GroqAdapter.
     * @param options - Configuration options including the API key and optional model/baseURL/defaults.
     * @throws {ARTError} If the API key is missing.
     */
    constructor(options: GroqAdapterOptions) {
        if (!options.apiKey) {
            throw new ARTError('GroqAdapter requires an apiKey in options.', ErrorCode.INVALID_CONFIG);
        }

        this.client = new Groq({
            apiKey: options.apiKey,
            baseURL: options.apiBaseUrl || undefined,
        });

        this.defaultModel = options.model || GROQ_DEFAULT_MODEL_ID;
        this.defaultMaxTokens = options.defaultMaxTokens || GROQ_DEFAULT_MAX_TOKENS;
        this.defaultTemperature = options.defaultTemperature || GROQ_DEFAULT_TEMPERATURE;

        Logger.debug(`GroqAdapter initialized with model: ${this.defaultModel}`);
    }

    /**
     * Sends a request to the Groq Chat Completions API.
     * Translates `ArtStandardPrompt` to the Groq/OpenAI format and handles streaming and tool use.
     *
     * @param {ArtStandardPrompt} prompt - The standardized prompt messages.
     * @param {CallOptions} options - Call options, including streaming, model parameters, and tools.
     * @returns {Promise<AsyncIterable<StreamEvent>>} A promise resolving to an AsyncIterable of StreamEvent objects.
     */
    async call(prompt: ArtStandardPrompt, options: CallOptions): Promise<AsyncIterable<StreamEvent>> {
        const {
            threadId,
            traceId = `groq-trace-${Date.now()}`,
            sessionId,
            stream = false,
            callContext,
            model: modelOverride,
            tools: availableArtTools,
            providerConfig,
        } = options;
        const stepContext = (options as any).stepContext;

        const modelToUse = providerConfig?.modelId || modelOverride || this.defaultModel;

        // Extract Groq specific parameters
        const groqApiParams = providerConfig?.adapterOptions || {};
        const maxTokens = groqApiParams.max_tokens || groqApiParams.maxTokens || options.max_tokens || options.maxOutputTokens || this.defaultMaxTokens;
        const temperature = groqApiParams.temperature ?? options.temperature ?? this.defaultTemperature;
        const topP = groqApiParams.top_p || groqApiParams.topP || options.top_p || options.topP;
        const stopSequences = groqApiParams.stop || options.stop || options.stop_sequences || options.stopSequences;

        let groqMessages: ChatCompletionMessageParam[];
        try {
            groqMessages = this.translateToGroq(prompt);
        } catch (error: any) {
            Logger.error(`Error translating ArtStandardPrompt to Groq format: ${error.message}`, { error, threadId, traceId });
            const artError = error instanceof ARTError ? error : new ARTError(`Prompt translation failed: ${error.message}`, ErrorCode.PROMPT_TRANSLATION_FAILED, error);
            const errorGenerator = async function* (): AsyncIterable<StreamEvent> {
                yield { type: 'ERROR', data: artError, threadId, traceId, sessionId };
                yield { type: 'END', data: null, threadId, traceId, sessionId };
            };
            return errorGenerator();
        }

        const groqTools: ChatCompletionTool[] | undefined = availableArtTools
            ? this.translateArtToolsToGroq(availableArtTools)
            : undefined;

        Logger.debug(`Calling Groq API with model ${modelToUse}`, { stream, tools: !!groqTools, threadId, traceId });

        // Use an async generator function
        const generator = async function* (this: GroqAdapter): AsyncIterable<StreamEvent> {
            try {
                const startTime = Date.now();
                let timeToFirstTokenMs: number | undefined;

                if (stream) {
                    // Build streaming request
                    const streamingRequest: ChatCompletionCreateParamsStreaming = {
                        model: modelToUse,
                        messages: groqMessages,
                        max_tokens: maxTokens,
                        temperature: temperature,
                        top_p: topP,
                        stop: stopSequences,
                        stream: true,
                        tools: groqTools,
                    };

                    // Remove undefined keys
                    Object.keys(streamingRequest).forEach(key => {
                        if ((streamingRequest as any)[key] === undefined) {
                            delete (streamingRequest as any)[key];
                        }
                    });

                    // Streaming response
                    const streamInstance = await this.client.chat.completions.create(streamingRequest);

                    let accumulatedText = '';
                    let finalStopReason: string | undefined;
                    const accumulatedToolCalls: Map<number, { id: string; name: string; arguments: string }> = new Map();

                    for await (const chunk of streamInstance as AsyncIterable<ChatCompletionChunk>) {
                        if (timeToFirstTokenMs === undefined) {
                            timeToFirstTokenMs = Date.now() - startTime;
                        }

                        const choice = chunk.choices?.[0];
                        if (!choice) continue;

                        const delta = choice.delta;

                        // Handle text content
                        if (delta?.content) {
                            accumulatedText += delta.content;
                            const { tokenType, phase } = getTokenContext(callContext, false);
                            yield { type: 'TOKEN', data: delta.content, tokenType: tokenType as any, phase, timestamp: Date.now(), ...(stepContext && { stepId: stepContext.stepId, stepDescription: stepContext.stepDescription }), threadId, traceId, sessionId };
                        }

                        // Handle tool calls (streaming)
                        if (delta?.tool_calls) {
                            for (const toolCallDelta of delta.tool_calls) {
                                const index = toolCallDelta.index;
                                if (!accumulatedToolCalls.has(index)) {
                                    accumulatedToolCalls.set(index, {
                                        id: toolCallDelta.id || '',
                                        name: toolCallDelta.function?.name || '',
                                        arguments: '',
                                    });
                                }
                                const accumulated = accumulatedToolCalls.get(index)!;
                                if (toolCallDelta.id) accumulated.id = toolCallDelta.id;
                                if (toolCallDelta.function?.name) accumulated.name = toolCallDelta.function.name;
                                if (toolCallDelta.function?.arguments) {
                                    accumulated.arguments += toolCallDelta.function.arguments;
                                }
                            }
                        }

                        // Capture finish reason
                        if (choice.finish_reason) {
                            finalStopReason = choice.finish_reason;
                        }
                    }

                    // Handle accumulated tool calls at the end of stream
                    if (accumulatedToolCalls.size > 0) {
                        const { tokenType, phase } = getTokenContext(callContext, false);
                        const toolData = Array.from(accumulatedToolCalls.values()).map(tc => ({
                            type: 'tool_use',
                            id: tc.id,
                            name: tc.name,
                            input: tc.arguments ? JSON.parse(tc.arguments) : {},
                        }));

                        if (accumulatedText.trim()) {
                            yield { type: 'TOKEN', data: [{ type: 'text', text: accumulatedText.trim() }, ...toolData], tokenType: tokenType as any, phase, timestamp: Date.now(), ...(stepContext && { stepId: stepContext.stepId, stepDescription: stepContext.stepDescription }), threadId, traceId, sessionId };
                        } else {
                            yield { type: 'TOKEN', data: toolData, tokenType: tokenType as any, phase, timestamp: Date.now(), ...(stepContext && { stepId: stepContext.stepId, stepDescription: stepContext.stepDescription }), threadId, traceId, sessionId };
                        }
                    }

                    // Yield final METADATA for streaming
                    const totalGenerationTimeMs = Date.now() - startTime;
                    const metadata: LLMMetadata = {
                        stopReason: finalStopReason,
                        timeToFirstTokenMs,
                        totalGenerationTimeMs,
                        traceId: traceId,
                    };
                    yield { type: 'METADATA', data: metadata, threadId, traceId, sessionId };

                } else {
                    // Build non-streaming request
                    const nonStreamingRequest: ChatCompletionCreateParamsNonStreaming = {
                        model: modelToUse,
                        messages: groqMessages,
                        max_tokens: maxTokens,
                        temperature: temperature,
                        top_p: topP,
                        stop: stopSequences,
                        stream: false,
                        tools: groqTools,
                    };

                    // Remove undefined keys
                    Object.keys(nonStreamingRequest).forEach(key => {
                        if ((nonStreamingRequest as any)[key] === undefined) {
                            delete (nonStreamingRequest as any)[key];
                        }
                    });

                    // Non-streaming response
                    const response = await this.client.chat.completions.create(nonStreamingRequest);

                    Logger.debug(`Groq API call successful (non-streaming). Finish Reason: ${response.choices?.[0]?.finish_reason}`, { threadId, traceId });

                    const firstChoice = response.choices?.[0];
                    const responseMessage = firstChoice?.message;
                    const finishReason = firstChoice?.finish_reason;

                    const responseText = responseMessage?.content || '';
                    const toolCalls = responseMessage?.tool_calls;

                    const { tokenType, phase } = getTokenContext(callContext, false);

                    if (toolCalls && toolCalls.length > 0) {
                        const toolData = toolCalls.map((tc: ChatCompletionMessageToolCall) => ({
                            type: 'tool_use',
                            id: tc.id,
                            name: tc.function.name,
                            input: tc.function.arguments ? JSON.parse(tc.function.arguments) : {},
                        }));

                        if (responseText.trim()) {
                            yield { type: 'TOKEN', data: [{ type: 'text', text: responseText.trim() }, ...toolData], tokenType: tokenType as any, phase, timestamp: Date.now(), ...(stepContext && { stepId: stepContext.stepId, stepDescription: stepContext.stepDescription }), threadId, traceId, sessionId };
                        } else {
                            yield { type: 'TOKEN', data: toolData, tokenType: tokenType as any, phase, timestamp: Date.now(), ...(stepContext && { stepId: stepContext.stepId, stepDescription: stepContext.stepDescription }), threadId, traceId, sessionId };
                        }
                    } else if (responseText.trim()) {
                        yield { type: 'TOKEN', data: responseText.trim(), tokenType: tokenType as any, phase, timestamp: Date.now(), ...(stepContext && { stepId: stepContext.stepId, stepDescription: stepContext.stepDescription }), threadId, traceId, sessionId };
                    }

                    // Yield METADATA for non-streaming
                    if (response.usage) {
                        const totalGenerationTimeMs = Date.now() - startTime;
                        const metadata: LLMMetadata = {
                            inputTokens: response.usage.prompt_tokens,
                            outputTokens: response.usage.completion_tokens,
                            stopReason: finishReason ?? undefined,
                            totalGenerationTimeMs,
                            providerRawUsage: { usage: response.usage, finish_reason: finishReason },
                            traceId: traceId,
                        };
                        yield { type: 'METADATA', data: metadata, threadId, traceId, sessionId };
                    }
                }

                // Yield END signal for both streaming and non-streaming
                yield { type: 'END', data: null, threadId, traceId, sessionId };

            } catch (error: any) {
                Logger.error(`Error during Groq API call: ${error.message}`, { error, threadId, traceId });
                const artError = error instanceof ARTError ? error :
                    (error instanceof Groq.APIError ?
                        new ARTError(`Groq API Error (${error.status}): ${error.message}`, ErrorCode.LLM_PROVIDER_ERROR, error) :
                        new ARTError(error.message || 'Unknown Groq adapter error', ErrorCode.LLM_PROVIDER_ERROR, error));
                yield { type: 'ERROR', data: artError, threadId, traceId, sessionId };
                yield { type: 'END', data: null, threadId, traceId, sessionId };
            }
        }.bind(this);

        return generator();
    }

    /**
     * Optional: Method for graceful shutdown
     */
    async shutdown(): Promise<void> {
        Logger.debug(`GroqAdapter shutdown called.`);
        // Clean up any resources if needed
    }

    /**
     * Translates the provider-agnostic `ArtStandardPrompt` into the Groq/OpenAI message format.
     *
     * @private
     * @param {ArtStandardPrompt} artPrompt - The input `ArtStandardPrompt` array.
     * @returns {ChatCompletionMessageParam[]} Array of Groq-formatted messages.
     * @throws {ARTError} If translation encounters an issue.
     */
    private translateToGroq(artPrompt: ArtStandardPrompt): ChatCompletionMessageParam[] {
        const messages: ChatCompletionMessageParam[] = [];

        for (const artMsg of artPrompt) {
            const translated = this.mapArtMessageToGroq(artMsg);
            if (translated) {
                messages.push(translated);
            }
        }

        return messages;
    }

    /**
     * Maps a single `ArtStandardMessage` to Groq/OpenAI message format.
     *
     * @private
     * @param {ArtStandardMessage} artMsg - The ART standard message to map.
     * @returns {ChatCompletionMessageParam | null} The translated message, or null if should be skipped.
     * @throws {ARTError} If tool call arguments are not valid JSON.
     */
    private mapArtMessageToGroq(artMsg: ArtStandardMessage): ChatCompletionMessageParam | null {
        switch (artMsg.role) {
            case 'system': {
                const content = typeof artMsg.content === 'string' ? artMsg.content : JSON.stringify(artMsg.content);
                return { role: 'system', content };
            }

            case 'user': {
                const content = typeof artMsg.content === 'string' ? artMsg.content : JSON.stringify(artMsg.content);
                return { role: 'user', content };
            }

            case 'assistant': {
                const content = typeof artMsg.content === 'string' ? artMsg.content : (artMsg.content ? JSON.stringify(artMsg.content) : null);

                // Handle tool calls
                if (artMsg.tool_calls && artMsg.tool_calls.length > 0) {
                    const toolCalls: ChatCompletionMessageToolCall[] = artMsg.tool_calls.map(tc => {
                        if (tc.type !== 'function' || !tc.function?.name || typeof tc.function?.arguments !== 'string') {
                            throw new ARTError(
                                `GroqAdapter: Invalid tool_call structure in assistant message. ID: ${tc.id}`,
                                ErrorCode.PROMPT_TRANSLATION_FAILED
                            );
                        }
                        return {
                            id: tc.id,
                            type: 'function' as const,
                            function: {
                                name: tc.function.name,
                                arguments: tc.function.arguments,
                            },
                        };
                    });
                    return { role: 'assistant', content, tool_calls: toolCalls };
                }

                return { role: 'assistant', content };
            }

            case 'tool_result': {
                if (!artMsg.tool_call_id) {
                    throw new ARTError(
                        `GroqAdapter: 'tool_result' message missing required 'tool_call_id'.`,
                        ErrorCode.PROMPT_TRANSLATION_FAILED
                    );
                }
                const content = typeof artMsg.content === 'string' ? artMsg.content : JSON.stringify(artMsg.content);
                return {
                    role: 'tool',
                    tool_call_id: artMsg.tool_call_id,
                    content,
                };
            }

            case 'tool_request': {
                // Skip tool_request - handled by assistant's tool_calls
                Logger.debug(`GroqAdapter: Skipping 'tool_request' role message as it's handled by assistant's tool_calls.`);
                return null;
            }

            default: {
                Logger.warn(`GroqAdapter: Skipping message with unhandled role: ${artMsg.role}`);
                return null;
            }
        }
    }

    /**
     * Translates an array of `ToolSchema` from the ART framework format to Groq's tool format.
     *
     * @private
     * @param {ToolSchema[]} artTools - An array of ART tool schemas.
     * @returns {ChatCompletionTool[]} An array of tools formatted for the Groq API.
     * @throws {ARTError} If a tool's `inputSchema` is invalid.
     */
    private translateArtToolsToGroq(artTools: ToolSchema[]): ChatCompletionTool[] {
        return artTools.map(artTool => {
            if (!artTool.inputSchema || typeof artTool.inputSchema !== 'object') {
                throw new ARTError(`Invalid inputSchema definition for tool '${artTool.name}'. Expected a JSON schema object.`, ErrorCode.INVALID_CONFIG);
            }
            return {
                type: 'function' as const,
                function: {
                    name: artTool.name,
                    description: artTool.description,
                    parameters: artTool.inputSchema as Record<string, unknown>,
                },
            };
        });
    }
}
