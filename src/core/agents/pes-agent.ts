// src/core/agents/pes-agent.ts
import {
    IAgentCore,
    StateManager,
    ConversationManager,
    ToolRegistry,
    ReasoningEngine,
    OutputParser,
    ObservationManager,
    ToolSystem,
    UISystem,
    IA2ATaskRepository
} from '@/core/interfaces';
import {
    AgentProps,
    AgentFinalResponse,
    ConversationMessage,
    ParsedToolCall,
    ToolResult,
    ObservationType,
    ExecutionMetadata,
    MessageRole,
    CallOptions,
    ModelCapability,
    LLMMetadata,
    ArtStandardPrompt,
    ArtStandardMessageRole,
    A2ATask,
    A2ATaskStatus,
    A2ATaskPriority,
    A2AAgentInfo,
    AgentPersona,
    TodoItem,
    TodoItemStatus,
    PESAgentStateData,
    ExecutionOutput
} from '@/types';
import { RuntimeProviderConfig } from '@/types/providers';
import { generateUUID } from '@/utils/uuid';
import { ARTError, ErrorCode } from '@/errors';
import { Logger } from '@/utils/logger';

import { AgentDiscoveryService } from '@/systems/a2a/AgentDiscoveryService';
import { TaskDelegationService } from '@/systems/a2a/TaskDelegationService';

export interface PESAgentDependencies {
    /** Manages thread configuration and state. */
    stateManager: StateManager;
    /** Manages conversation history. */
    conversationManager: ConversationManager;
    /** Registry for available tools. */
    toolRegistry: ToolRegistry;
    /** Handles interaction with the LLM provider. */
    reasoningEngine: ReasoningEngine;
    /** Parses LLM responses. */
    outputParser: OutputParser;
    /** Records agent execution observations. */
    observationManager: ObservationManager;
    /** Orchestrates tool execution. */
    toolSystem: ToolSystem;
    /** Provides access to UI communication sockets. */
    uiSystem: UISystem;
    /** Repository for A2A tasks. */
    a2aTaskRepository: IA2ATaskRepository;
    /** Service for discovering A2A agents. */
    agentDiscoveryService?: AgentDiscoveryService | null;
    /** Service for delegating A2A tasks. */
    taskDelegationService?: TaskDelegationService | null;
    /** Resolver for standardized system prompt composition. */
    systemPromptResolver: import('@/core/interfaces').SystemPromptResolver;
    /** Optional: Defines the default identity and high-level guidance for the agent. */
    persona?: AgentPersona;
}

const DEFAULT_PERSONA: AgentPersona = {
    name: 'Zoi',
    prompts: {
        planning: 'You are a helpful AI assistant. Your primary goal is to understand a user\'s query, determine the intent, and create a clear plan to provide an accurate and helpful response. You can use tools to gather information if necessary.',
        synthesis: 'You are a helpful AI assistant named Art. Your primary goal is to synthesize the information gathered from tools, outcomes of each todo list task and planning into a final, user-friendly response. Be clear, concise, and helpful. If any ui components are defined, you should use those to display your outputs.'
    }
};

/**
 * Implements the Plan-Execute-Synthesize (PES) agent orchestration logic.
 * Refactored to support persistent TodoList execution and iterative refinement.
 */
export class PESAgent implements IAgentCore {
    private readonly deps: PESAgentDependencies;
    private readonly persona: AgentPersona;

    constructor(dependencies: PESAgentDependencies) {
        this.deps = dependencies;
        this.persona = {
            ...DEFAULT_PERSONA,
            ...dependencies.persona,
            prompts: {
                ...DEFAULT_PERSONA.prompts,
                ...dependencies.persona?.prompts,
            },
        };
    }

    /**
     * Processes a user query through the PES (Plan-Execute-Synthesize) reasoning loop.
     * This is the main entry point for the agent's execution logic.
     *
     * The process involves:
     * 1. **Configuration**: Loading thread context, resolving system prompts, and determining the active persona.
     * 2. **Context Gathering**: Retrieving conversation history and available tools.
     * 3. **Planning**: Generating a new plan (Todo List) or refining an existing one based on the new query.
     * 4. **Execution**: Iterating through the Todo List, executing tasks, calling tools, and managing dependencies.
     * 5. **Synthesis**: Aggregating results to generate a final, coherent response for the user.
     * 6. **Finalization**: Saving the response and updating the conversation history.
     *
     * @param props - The input properties for the agent execution, including the user query, thread ID, and optional configuration overrides.
     * @returns A promise that resolves with the final agent response and detailed execution metadata.
     */
    async process(props: AgentProps): Promise<AgentFinalResponse> {
        const startTime = Date.now();
        const traceId = props.traceId ?? generateUUID();
        let status: ExecutionMetadata['status'] = 'success';
        let errorMessage: string | undefined;
        let llmCalls = 0;
        let toolCallsCount = 0;
        let finalAiMessage: ConversationMessage | undefined;
        let aggregatedLlmMetadata: LLMMetadata | undefined = undefined;

        let phase = 'initialization';
        try {
            // Stage 1: Load configuration and resolve system prompt
            phase = 'configuration';
            const { threadContext, planningSystemPrompt, synthesisSystemPrompt, runtimeProviderConfig, finalPersona } = await this._loadConfiguration(props, traceId);

            // Stage 2: Gather context data
            phase = 'context_gathering';
            const history = await this._gatherHistory(props.threadId, threadContext);
            const availableTools = await this._gatherTools(props.threadId);

            // Stage 3: State Loading & Plan Determination
            phase = 'state_loading';

            // Cast the opaque state data to our specific type
            let pesState = (threadContext.state?.data) as PESAgentStateData | undefined;
            const isFollowUp = !!pesState && pesState.todoList && pesState.todoList.length > 0;

            if (!isFollowUp) {
                // Initial Planning Phase
                Logger.debug(`[${traceId}] No existing plan found. Initiating Planning Phase.`);
                phase = 'planning';
                const planningResult = await this._performPlanning(
                    props, planningSystemPrompt, history, availableTools, runtimeProviderConfig, traceId
                );
                llmCalls++;
                if (planningResult.metadata) aggregatedLlmMetadata = { ...(aggregatedLlmMetadata ?? {}), ...planningResult.metadata };

                // Initialize State
                pesState = {
                    threadId: props.threadId,
                    intent: planningResult.output.intent || 'Unknown Intent',
                    title: planningResult.output.title || 'New Conversation',
                    plan: planningResult.output.plan || '',
                    todoList: planningResult.output.todoList || [],
                    currentStepId: null,
                    isPaused: false
                };

                // Persist Initial State
                await this._saveState(props.threadId, pesState);
                await this._recordPlanObservations(props.threadId, traceId, planningResult.output, planningResult.rawText);

            } else {
                // Follow-up / Refinement Phase
                Logger.debug(`[${traceId}] Existing plan found. Processing follow-up/refinement.`);
                phase = 'planning_refinement';

                if (props.query && props.query.trim().length > 0) {
                    // We know pesState is defined here because isFollowUp is true
                    const refinementResult = await this._performPlanRefinement(
                        props, planningSystemPrompt, history, pesState!, availableTools, runtimeProviderConfig, traceId
                    );
                    llmCalls++;
                    if (refinementResult.metadata) aggregatedLlmMetadata = { ...(aggregatedLlmMetadata ?? {}), ...refinementResult.metadata };

                    if (refinementResult.output.todoList) {
                        pesState!.intent = refinementResult.output.intent || pesState!.intent;
                        pesState!.plan = refinementResult.output.plan || pesState!.plan;
                        pesState!.todoList = refinementResult.output.todoList;

                        await this._saveState(props.threadId, pesState!);
                        await this._recordPlanObservations(props.threadId, traceId, refinementResult.output, refinementResult.rawText);
                    }
                }
            }

            // Stage 4: Execution Loop
            phase = 'execution_loop';
            const executionResult = await this._executeTodoList(
                props, pesState!, availableTools, runtimeProviderConfig, traceId
            );

            llmCalls += executionResult.llmCalls;
            toolCallsCount += executionResult.toolCalls;
            if (executionResult.llmMetadata) aggregatedLlmMetadata = { ...(aggregatedLlmMetadata ?? {}), ...executionResult.llmMetadata };

            // Stage 5: Synthesis
            phase = 'synthesis';
            // Only synthesize if we have completed items or if we paused/stopped
            const { finalResponseContent, synthesisMetadata, uiMetadata } = await this._performSynthesis(
                props, synthesisSystemPrompt, history, pesState!, runtimeProviderConfig, traceId, finalPersona
            );
            llmCalls++;
            if (synthesisMetadata) aggregatedLlmMetadata = { ...(aggregatedLlmMetadata ?? {}), ...synthesisMetadata };

            // Stage 6: Finalization
            phase = 'finalization';
            finalAiMessage = await this._finalize(props, finalResponseContent, traceId, uiMetadata);

        } catch (error: any) {
            const artError = (error instanceof ARTError)
                ? error
                : new ARTError(`An unexpected error occurred during agent processing: ${error.message}`, ErrorCode.UNKNOWN_ERROR, error);

            artError.details = artError.details || {};
            artError.details.phase = phase;
            Logger.error(`[${traceId}] PESAgent process error in phase '${phase}':`, artError);

            status = 'error';
            errorMessage = artError.message;

            await this.deps.observationManager.record({
                threadId: props.threadId, traceId, type: ObservationType.ERROR,
                content: { phase, error: artError.message, stack: artError.stack },
                metadata: { timestamp: Date.now() }
            });
        } finally {
            try {
                await this.deps.stateManager.saveStateIfModified(props.threadId);
            } catch (saveError: any) {
                Logger.error(`[${traceId}] Failed to save state during finalization:`, saveError);
            }
        }

        const endTime = Date.now();
        const metadata: ExecutionMetadata = {
            threadId: props.threadId,
            traceId: traceId,
            userId: props.userId,
            status: status,
            totalDurationMs: endTime - startTime,
            llmCalls: llmCalls,
            toolCalls: toolCallsCount,
            error: errorMessage,
            llmMetadata: aggregatedLlmMetadata,
        };

        if (!finalAiMessage && status !== 'success') {
            finalAiMessage = {
                messageId: generateUUID(),
                threadId: props.threadId,
                role: MessageRole.AI,
                content: errorMessage ?? "Agent execution failed.",
                timestamp: Date.now(),
                metadata: { traceId, error: true }
            };
        }

        return {
            response: finalAiMessage!,
            metadata: metadata,
        };
    }

    // --- Helper Methods ---

    /**
     * Persists the current agent state to the StateManager.
     * @param threadId - The unique identifier of the thread.
     * @param pesState - The current state of the PES agent.
     */
    private async _saveState(threadId: string, pesState: PESAgentStateData) {
        await this.deps.stateManager.setAgentState(threadId, {
            data: pesState,
            version: 1,
            modified: Date.now()
        });
    }

    /**
     * Records observations related to the planning phase.
     * Emits events for INTENT, TITLE (if new), and PLAN.
     * @param threadId - The thread ID.
     * @param traceId - The trace ID for correlation.
     * @param planningOutput - The structured output from the planning LLM.
     * @param rawText - The raw text output from the LLM (for debugging/audit).
     */
    private async _recordPlanObservations(threadId: string, traceId: string, planningOutput: any, rawText: string) {
        await this.deps.observationManager.record({
            threadId, traceId, type: ObservationType.INTENT,
            content: { intent: planningOutput.intent }, metadata: { timestamp: Date.now() }
        });
        if (planningOutput.title) {
            await this.deps.observationManager.record({
                threadId, traceId, type: ObservationType.TITLE,
                content: { title: planningOutput.title }, metadata: { timestamp: Date.now() }
            });
        }
        await this.deps.observationManager.record({
            threadId, traceId, type: ObservationType.PLAN,
            content: {
                plan: planningOutput.plan,
                todoList: planningOutput.todoList,
                rawOutput: rawText
            },
            metadata: { timestamp: Date.now() }
        });
        // Also emit initial plan update
        await this.deps.observationManager.record({
            threadId, traceId, type: ObservationType.PLAN_UPDATE,
            content: { todoList: planningOutput.todoList },
            metadata: { timestamp: Date.now() }
        });
    }

    /**
     * Executes the initial planning phase using the LLM.
     * Generates the initial Todo List based on the user's query and available tools.
     * @param props - Agent execution properties.
     * @param systemPrompt - The resolved system prompt for planning.
     * @param formattedHistory - The conversation history formatted for the LLM.
     * @param availableTools - List of tools available for the plan.
     * @param runtimeProviderConfig - Configuration for the LLM provider.
     * @param traceId - Trace ID for logging and observations.
     * @returns The structured planning output and metadata.
     */
    private async _performPlanning(
        props: AgentProps,
        systemPrompt: string,
        formattedHistory: ArtStandardPrompt,
        availableTools: any[],
        runtimeProviderConfig: RuntimeProviderConfig,
        traceId: string
    ) {
        Logger.debug(`[${traceId}] Stage 3: Planning`);

        const toolsJson = availableTools.map(t => ({
            name: t.name, description: t.description, inputSchema: t.inputSchema
        }));

        const wrappedSystemPrompt = `You are a planning assistant.
[BEGIN_CUSTOM_GUIDANCE]
${systemPrompt}
[END_CUSTOM_GUIDANCE]

Your goal is to understand the user's query and create a structured plan (Todo List) to answer it.
The todo list should be a logical, methodical, sensible list of steps that the agent should take to answer the user's query. Each step should progress gradually towards delivering a cmoprehensive, accurate, evidence driven, validated response.
You MUST output a JSON object with the following structure:
{
  "title": "Short title",
  "intent": "User intent summary",
  "plan": "High level description of the plan with and overview and bullet points",
  "todoList": [
    { "id": "step_1", "description": "Description of step 1", "dependencies": [] },
    { "id": "step_2", "description": "Description of step 2", "dependencies": ["step_1"] }
  ]
}
`;
        const planningPrompt: ArtStandardPrompt = [
            { role: 'system', content: wrappedSystemPrompt },
            ...formattedHistory,
            { role: 'user', content: `User Query: ${props.query}\n\nAvailable Tools:\n${JSON.stringify(toolsJson, null, 2)}` }
        ];

        return this._callPlanningLLM(planningPrompt, props, runtimeProviderConfig, traceId);
    }

    /**
     * Refines an existing plan based on new user input (follow-up).
     * Updates the Todo List to accommodate the new request while preserving context.
     * @param props - Agent execution properties.
     * @param systemPrompt - The resolved system prompt.
     * @param formattedHistory - Conversation history.
     * @param currentState - The current agent state (including the existing plan).
     * @param availableTools - Available tools.
     * @param runtimeProviderConfig - LLM provider config.
     * @param traceId - Trace ID.
     * @returns The updated planning output.
     */
    private async _performPlanRefinement(
        props: AgentProps,
        systemPrompt: string,
        formattedHistory: ArtStandardPrompt,
        currentState: PESAgentStateData,
        availableTools: any[],
        runtimeProviderConfig: RuntimeProviderConfig,
        traceId: string
    ) {
        Logger.debug(`[${traceId}] Stage 3: Plan Refinement`);

        const toolsJson = availableTools.map(t => ({
            name: t.name, description: t.description, inputSchema: t.inputSchema
        }));

        const wrappedSystemPrompt = `You are a planning assistant.
[BEGIN_CUSTOM_GUIDANCE]
${systemPrompt}
[END_CUSTOM_GUIDANCE]

The user has provided a follow-up query. You must update the existing plan and todo list to accommodate this request.
Current Plan:
Intent: ${currentState.intent}
Todo List:
${JSON.stringify(currentState.todoList, null, 2)}

Output the updated JSON object (title, intent, plan, todoList). Ensure you preserve completed items and logically append or insert new items.
`;
        const planningPrompt: ArtStandardPrompt = [
            { role: 'system', content: wrappedSystemPrompt },
            ...formattedHistory,
            { role: 'user', content: `User Query: ${props.query}\n\nAvailable Tools:\n${JSON.stringify(toolsJson, null, 2)}` }
        ];

        return this._callPlanningLLM(planningPrompt, props, runtimeProviderConfig, traceId);
    }

    /**
     * Common internal method to call the LLM for planning or refinement.
     * Handles streaming, observation recording, and output parsing.
     * @param prompt - The constructed prompt.
     * @param props - Agent properties.
     * @param runtimeProviderConfig - Provider config.
     * @param traceId - Trace ID.
     * @returns Parsed output and metadata.
     */
    private async _callPlanningLLM(
        prompt: ArtStandardPrompt,
        props: AgentProps,
        runtimeProviderConfig: RuntimeProviderConfig,
        traceId: string
    ) {
        const planningOptions: CallOptions = {
            threadId: props.threadId, traceId, userId: props.userId, sessionId: props.sessionId,
            stream: true, callContext: 'AGENT_THOUGHT',
            requiredCapabilities: [ModelCapability.REASONING],
            providerConfig: runtimeProviderConfig,
            ...(props.options?.llmParams ?? {}),
        };

        let outputText = '';
        let metadata: LLMMetadata | undefined;
        let streamError: Error | null = null;

        try {
            await this.deps.observationManager.record({
                threadId: props.threadId, traceId, type: ObservationType.PLAN,
                content: { message: "Generating/Refining Plan..." }, metadata: { timestamp: Date.now() }
            });

            const stream = await this.deps.reasoningEngine.call(prompt, planningOptions);

            await this.deps.observationManager.record({
                threadId: props.threadId, traceId, type: ObservationType.LLM_STREAM_START,
                content: { phase: 'planning' }, metadata: { timestamp: Date.now() }
            });

            for await (const event of stream) {
                this.deps.uiSystem.getLLMStreamSocket().notify(event, {
                    targetThreadId: event.threadId, targetSessionId: event.sessionId
                });

                if (event.type === 'TOKEN') {
                    outputText += event.data;
                } else if (event.type === 'METADATA') {
                    metadata = event.data;
                } else if (event.type === 'ERROR') {
                    streamError = event.data;
                }
            }

            if (streamError) throw streamError;

            const parsed = await this.deps.outputParser.parsePlanningOutput(outputText);
            return { output: parsed, metadata, rawText: outputText };

        } catch (err: any) {
            throw new ARTError(`Planning failed: ${err.message}`, ErrorCode.PLANNING_FAILED, err);
        }
    }

    /**
     * Orchestrates the execution of the Todo List.
     * Loops through pending items, checks dependencies, and executes them.
     * @param props - Agent properties.
     * @param pesState - The current state containing the Todo List.
     * @param availableTools - Tools available for execution.
     * @param runtimeProviderConfig - Provider config.
     * @param traceId - Trace ID.
     * @returns Execution statistics (LLM calls, tool calls) and metadata.
     */
    private async _executeTodoList(
        props: AgentProps,
        pesState: PESAgentStateData,
        availableTools: any[],
        runtimeProviderConfig: RuntimeProviderConfig,
        traceId: string
    ) {
        Logger.debug(`[${traceId}] Starting Execution Loop`);

        let llmCalls = 0;
        let toolCalls = 0;
        let accumulatedMetadata: LLMMetadata = {};

        // Loop until all items are completed or we hit a break condition
        let loopContinue = true;
        const MAX_LOOPS = 20;
        let loopCount = 0;

        while (loopContinue && loopCount < MAX_LOOPS) {
            loopCount++;

            // Find next pending item whose dependencies are met
            const pendingItem = pesState.todoList.find(item => {
                if (item.status !== TodoItemStatus.PENDING) return false;
                if (!item.dependencies || item.dependencies.length === 0) return true;
                return item.dependencies.every(depId => {
                    const depItem = pesState.todoList.find(i => i.id === depId);
                    return depItem && depItem.status === TodoItemStatus.COMPLETED;
                });
            });

            if (!pendingItem) {
                Logger.debug(`[${traceId}] No runnable pending items found.`);
                loopContinue = false;
                break;
            }

            Logger.debug(`[${traceId}] Executing Item: ${pendingItem.id}`);
            pesState.currentStepId = pendingItem.id;
            pendingItem.status = TodoItemStatus.IN_PROGRESS;
            pendingItem.updatedTimestamp = Date.now();

            // Persist status change
            await this._saveState(props.threadId, pesState);
            await this.deps.observationManager.record({
                threadId: props.threadId, traceId, type: ObservationType.ITEM_STATUS_CHANGE,
                content: { itemId: pendingItem.id, status: TodoItemStatus.IN_PROGRESS },
                parentId: pendingItem.id,
                metadata: { timestamp: Date.now() }
            });

            // Execute the item
            try {
                const itemResult = await this._processTodoItem(
                    props, pendingItem, pesState, availableTools, runtimeProviderConfig, traceId
                );

                llmCalls += itemResult.llmCalls;
                toolCalls += itemResult.toolCalls;
                if (itemResult.metadata) {
                    accumulatedMetadata = { ...accumulatedMetadata, ...itemResult.metadata };
                }

                if (itemResult.status === 'success') {
                    pendingItem.status = TodoItemStatus.COMPLETED;
                    pendingItem.result = itemResult.output;
                } else if (itemResult.status === 'wait') {
                    pendingItem.status = TodoItemStatus.WAITING;
                } else {
                    pendingItem.status = TodoItemStatus.FAILED;
                    loopContinue = false;
                }

            } catch (err: any) {
                Logger.error(`[${traceId}] Error executing item ${pendingItem.id}:`, err);
                pendingItem.status = TodoItemStatus.FAILED;
                loopContinue = false;
            }

            pendingItem.updatedTimestamp = Date.now();
            await this._saveState(props.threadId, pesState);
            await this.deps.observationManager.record({
                threadId: props.threadId, traceId, type: ObservationType.ITEM_STATUS_CHANGE,
                content: { itemId: pendingItem.id, status: pendingItem.status },
                parentId: pendingItem.id,
                metadata: { timestamp: Date.now() }
            });
        }

        return { llmCalls, toolCalls, llmMetadata: accumulatedMetadata };
    }

    /**
     * Processes a single Todo Item.
     * This involves calling the LLM to execute the step, potentially using tools, and updating the plan if necessary.
     * @param props - Agent properties.
     * @param item - The Todo Item to execute.
     * @param state - Current agent state.
     * @param availableTools - Available tools.
     * @param runtimeProviderConfig - Provider config.
     * @param traceId - Trace ID.
     * @returns Result of the item execution (status, output, usage metrics).
     */
    private async _processTodoItem(
        props: AgentProps,
        item: TodoItem,
        state: PESAgentStateData,
        availableTools: any[],
        runtimeProviderConfig: RuntimeProviderConfig,
        traceId: string
    ): Promise<{ status: 'success' | 'fail' | 'wait', output?: any, llmCalls: number, toolCalls: number, metadata?: LLMMetadata }> {

        let llmCalls = 0;
        let toolCallsCount = 0;
        let accumulatedMetadata: LLMMetadata = {};

        const toolsJson = availableTools.map(t => ({
            name: t.name, description: t.description, inputSchema: t.inputSchema
        }));

        // Add A2A delegation tool to execution context
        const delegationToolSchema = {
            name: 'delegate_to_agent',
            description: 'Delegates a specific task to another agent.',
            inputSchema: {
                type: 'object',
                properties: {
                    agentId: { type: 'string' },
                    taskType: { type: 'string' },
                    input: { type: 'object' },
                    instructions: { type: 'string' }
                },
                required: ['agentId', 'taskType', 'input', 'instructions']
            }
        };
        const executionTools = [...toolsJson, delegationToolSchema];

        const completedItemsContext = state.todoList
            .filter(i => i.status === TodoItemStatus.COMPLETED)
            .map(i => `Item ${i.id}: ${i.description}\nResult: ${JSON.stringify(i.result)}`)
            .join('\n\n');

        const systemPromptText = `You are executing a step in a larger plan.
Current Task: ${item.description}
Context: ${props.query}
Previous Steps Results:
${completedItemsContext}
Instructions:
1. Use tools if necessary.
2. If you need to delegate to another agent, use 'delegate_to_agent'.
3. If you learn new information that changes the plan, include 'updatedPlan' in your JSON output.
4. Output Format: JSON response with 'content', 'toolCalls', 'updatedPlan', 'nextStepDecision'.
`;

        const messages: ArtStandardPrompt = [
            { role: 'system', content: systemPromptText },
            { role: 'user', content: `Execute the task: ${item.description}\n\nAvailable Tools:\n${JSON.stringify(executionTools)}` }
        ];

        const MAX_ITEM_ITERATIONS = 5;
        let iteration = 0;
        let itemDone = false;
        let finalOutput: string | undefined;
        let finalStatus: 'success' | 'fail' | 'wait' = 'success';

        while (!itemDone && iteration < MAX_ITEM_ITERATIONS) {
            iteration++;

            const options: CallOptions = {
                threadId: props.threadId, traceId, userId: props.userId, sessionId: props.sessionId,
                stream: true, callContext: 'AGENT_THOUGHT',
                requiredCapabilities: [ModelCapability.REASONING],
                providerConfig: runtimeProviderConfig,
                ...(props.options?.llmParams ?? {}),
            };

            let outputText = '';
            let streamError: Error | null = null;
            let currentMetadata: LLMMetadata | undefined;

            await this.deps.observationManager.record({
                threadId: props.threadId, traceId, type: ObservationType.LLM_STREAM_START,
                content: { phase: `execution_item_${item.id}_iter_${iteration}` },
                parentId: item.id,
                metadata: { timestamp: Date.now() }
            });

            const stream = await this.deps.reasoningEngine.call(messages, options);
            llmCalls++;

            for await (const event of stream) {
                this.deps.uiSystem.getLLMStreamSocket().notify(event, {
                    targetThreadId: event.threadId, targetSessionId: event.sessionId
                });

                if (event.type === 'TOKEN') {
                    outputText += event.data;
                    if (event.tokenType && String(event.tokenType).includes('THINKING')) {
                        await this.deps.observationManager.record({
                            threadId: props.threadId,
                            traceId,
                            type: ObservationType.THOUGHTS,
                            content: { text: event.data },
                            parentId: item.id,
                            metadata: { phase: 'execution', tokenType: event.tokenType, timestamp: Date.now() }
                        }).catch(err => Logger.error(`[${traceId}] Failed to record THOUGHTS observation:`, err));
                    }
                } else if (event.type === 'METADATA') {
                    currentMetadata = event.data;
                } else if (event.type === 'ERROR') {
                    streamError = event.data;
                }
            }

            if (streamError) throw streamError;
            if (currentMetadata) accumulatedMetadata = { ...accumulatedMetadata, ...currentMetadata };

            const parsed = await this.deps.outputParser.parseExecutionOutput(outputText);
            messages.push({ role: 'assistant', content: outputText });

            // Check for Plan Updates
            if (parsed.updatedPlan && parsed.updatedPlan.todoList) {
                Logger.info(`[${traceId}] Plan update received from execution step.`);
                state.todoList = parsed.updatedPlan.todoList;
                if (parsed.updatedPlan.intent) state.intent = parsed.updatedPlan.intent;
                if (parsed.updatedPlan.plan) state.plan = parsed.updatedPlan.plan;

                await this._saveState(props.threadId, state);
                await this.deps.observationManager.record({
                    threadId: props.threadId, traceId, type: ObservationType.PLAN_UPDATE,
                    content: { todoList: state.todoList },
                    metadata: { timestamp: Date.now() }
                });
            }

            if (parsed.toolCalls && parsed.toolCalls.length > 0) {
                // Check for A2A delegation
                const a2aCalls = parsed.toolCalls.filter(tc => tc.toolName === 'delegate_to_agent');
                const localCalls = parsed.toolCalls.filter(tc => tc.toolName !== 'delegate_to_agent');

                let a2aTasks: A2ATask[] = [];

                if (a2aCalls.length > 0) {
                    a2aTasks = await this._delegateA2ATasks({ toolCalls: a2aCalls }, props.threadId, traceId);
                    // Wait for completion (blocking this item step)
                    const completedTasks = await this._waitForA2ACompletion(a2aTasks, props.threadId, traceId);

                    // Add results to messages
                    completedTasks.forEach(task => {
                        messages.push({
                            role: 'tool_result',
                            content: JSON.stringify(task.result || { error: 'Task failed' }),
                            name: 'delegate_to_agent',
                            tool_call_id: task.taskId // Assuming task ID maps to call ID
                        });
                    });
                }

                if (localCalls.length > 0) {
                    const toolResults = await this.deps.toolSystem.executeTools(localCalls, props.threadId, traceId);
                    toolCallsCount += toolResults.length;

                    await this.deps.observationManager.record({
                        threadId: props.threadId, traceId, type: ObservationType.TOOL_EXECUTION,
                        content: { toolResults },
                        parentId: item.id,
                        metadata: { timestamp: Date.now() }
                    });

                    toolResults.forEach(res => {
                        messages.push({
                            role: 'tool_result',
                            content: JSON.stringify(res.output || res.error),
                            name: res.toolName,
                            tool_call_id: res.callId
                        });
                    });
                }
            } else {
                itemDone = true;
                finalOutput = parsed.content;
            }
        }

        return {
            status: finalStatus,
            output: finalOutput,
            llmCalls,
            toolCalls: toolCallsCount,
            metadata: accumulatedMetadata
        };
    }

    /**
     * Synthesizes the final response based on the completed tasks and the user's original query.
     * @param props - Agent properties.
     * @param systemPrompt - Synthesis system prompt.
     * @param formattedHistory - Conversation history.
     * @param state - Final agent state.
     * @param runtimeProviderConfig - Provider config.
     * @param traceId - Trace ID.
     * @param finalPersona - The persona to use for synthesis.
     * @returns The final response content and metadata.
     */
    private async _performSynthesis(
        props: AgentProps,
        systemPrompt: string,
        formattedHistory: ArtStandardPrompt,
        state: PESAgentStateData,
        runtimeProviderConfig: RuntimeProviderConfig,
        traceId: string,
        finalPersona: AgentPersona
    ) {
        Logger.debug(`[${traceId}] Stage 6: Synthesis`);

        const completedItems = state.todoList.filter(i => i.status === TodoItemStatus.COMPLETED);
        const failedItems = state.todoList.filter(i => i.status === TodoItemStatus.FAILED);

        const summary = `
Completed Tasks:
${completedItems.map(i => `- ${i.description}: ${(JSON.stringify(i.result) ?? 'null').substring(0, 200)}...`).join('\n')}

Failed Tasks:
${failedItems.map(i => `- ${i.description}`).join('\n')}
`;

        const wrappedSynthesisSystemPrompt = `You are ${finalPersona.name}.
[BEGIN_CUSTOM_GUIDANCE]
${systemPrompt}
[END_CUSTOM_GUIDANCE]

Synthesize the final answer based on the completed tasks.
Format your response with <mainContent>...</mainContent> for the user message and <uiMetadata>...</uiMetadata> for metadata (JSON).
`;
        const synthesisPrompt: ArtStandardPrompt = [
            { role: 'system', content: wrappedSynthesisSystemPrompt },
            ...formattedHistory,
            { role: 'user', content: `User Query: ${props.query}\n\nWork Summary:\n${summary}` }
        ];

        const synthesisOptions: CallOptions = {
            threadId: props.threadId,
            traceId: traceId,
            userId: props.userId,
            sessionId: props.sessionId,
            stream: true,
            callContext: 'FINAL_SYNTHESIS',
            requiredCapabilities: [ModelCapability.TEXT],
            providerConfig: runtimeProviderConfig,
            ...(props.options?.llmParams ?? {}),
        };

        let finalResponseContent: string = '';
        let synthesisMetadata: LLMMetadata | undefined = undefined;

        // ... Stream handling same as before ...
        // Re-using stream logic for synthesis
        const stream = await this.deps.reasoningEngine.call(synthesisPrompt, synthesisOptions);

        await this.deps.observationManager.record({
            threadId: props.threadId, traceId, type: ObservationType.LLM_STREAM_START,
            content: { phase: 'synthesis' }, metadata: { timestamp: Date.now() }
        });

        for await (const event of stream) {
            this.deps.uiSystem.getLLMStreamSocket().notify(event, {
                targetThreadId: event.threadId, targetSessionId: event.sessionId
            });
            if (event.type === 'TOKEN') {
                if (event.tokenType === 'FINAL_SYNTHESIS_LLM_RESPONSE' || event.tokenType === 'LLM_RESPONSE') {
                    finalResponseContent += event.data;
                }
            } else if (event.type === 'METADATA') {
                synthesisMetadata = event.data;
            }
        }

        // Parse metadata block (same as before)
        let mainContent = finalResponseContent;
        let uiMetadata: object | undefined = undefined;
        const metadataBlockRegex = /```json\s*([\s\S]*?)\s*```$/;
        const match = finalResponseContent.match(metadataBlockRegex);
        if (match && match[1]) {
            mainContent = finalResponseContent.replace(metadataBlockRegex, '').trim();
            try { uiMetadata = JSON.parse(match[1]); } catch { }
        }

        return { finalResponseContent: mainContent, synthesisMetadata, uiMetadata };
    }

    /**
     * Loads the initial configuration, thread context, and resolves prompts.
     * @param props - Agent properties.
     * @param traceId - Trace ID.
     * @returns Loaded configuration and context.
     * @throws {ARTError} If context or config is missing.
     */
    private async _loadConfiguration(props: AgentProps, traceId: string) {
        // ... (Same as original implementation) ...
        // To save tokens/lines in this overwite, assuming I keep the exact same logic.
        // For brevity in this tool call, I'll copy-paste the logic from the original file I read.
        Logger.debug(`[${traceId}] Stage 1: Initiation & Config`);

        const threadContext = await this.deps.stateManager.loadThreadContext(props.threadId, props.userId);
        if (!threadContext) {
            throw new ARTError(`Thread context not found for threadId: ${props.threadId}`, ErrorCode.THREAD_NOT_FOUND);
        }

        const callPersona = props.options?.persona;
        const threadPersona = await this.deps.stateManager.getThreadConfigValue<Partial<AgentPersona>>(props.threadId, 'persona');
        const instancePersona = this.persona;

        const finalPersona: AgentPersona = {
            name: callPersona?.name || threadPersona?.name || instancePersona.name,
            prompts: {
                planning: callPersona?.prompts?.planning || threadPersona?.prompts?.planning || instancePersona.prompts.planning,
                synthesis: callPersona?.prompts?.synthesis || threadPersona?.prompts?.synthesis || instancePersona.prompts.synthesis,
            },
        };

        const planningSystemPrompt = await this.deps.systemPromptResolver.resolve({
            base: finalPersona.prompts.planning || '',
            thread: await this.deps.stateManager.getThreadConfigValue<any>(props.threadId, 'systemPrompt'),
            call: props.options?.systemPrompt
        }, traceId);

        const synthesisSystemPrompt = await this.deps.systemPromptResolver.resolve({
            base: finalPersona.prompts.synthesis || '',
            thread: await this.deps.stateManager.getThreadConfigValue<any>(props.threadId, 'systemPrompt'),
            call: props.options?.systemPrompt
        }, traceId);

        const runtimeProviderConfig: RuntimeProviderConfig | undefined =
            props.options?.providerConfig || threadContext.config.providerConfig;

        if (!runtimeProviderConfig) {
            throw new ARTError(`RuntimeProviderConfig is missing in AgentProps.options or ThreadConfig for threadId: ${props.threadId}`, ErrorCode.INVALID_CONFIG);
        }

        return {
            threadContext,
            planningSystemPrompt,
            synthesisSystemPrompt,
            runtimeProviderConfig,
            finalPersona
        };
    }

    /**
     * Retrieves the conversation history for the thread.
     * @param threadId - The thread ID.
     * @param threadContext - The loaded thread context.
     * @returns Formatted conversation history.
     */
    private async _gatherHistory(threadId: string, threadContext: any) {
        // Same as original
        Logger.debug(`[${threadContext.threadId || threadId}] Stage 2: Gathering History`);
        const historyOptions = { limit: threadContext.config.historyLimit };
        const rawHistory = await this.deps.conversationManager.getMessages(threadId, historyOptions);
        return this.formatHistoryForPrompt(rawHistory);
    }

    /**
     * Retrieves available tools for the thread.
     * @param threadId - The thread ID.
     * @returns Array of available tool schemas.
     */
    private async _gatherTools(threadId: string) {
        // Same as original
        Logger.debug(`[${threadId}] Stage 2: Gathering Tools`);
        return await this.deps.toolRegistry.getAvailableTools({ enabledForThreadId: threadId });
    }

    // --- Restored A2A Logic ---

    /**
     * Delegates tasks to other agents (Agent-to-Agent).
     * Discovers agents and sends task requests.
     * @param planningOutput - Output from the planning phase containing potential delegation calls.
     * @param threadId - Current thread ID.
     * @param traceId - Trace ID.
     * @returns Array of created A2A tasks.
     */
    private async _delegateA2ATasks(
        planningOutput: { toolCalls?: ParsedToolCall[] },
        threadId: string,
        traceId: string
    ): Promise<A2ATask[]> {
        Logger.debug(`[${traceId}] Stage 4: A2A Task Delegation`);

        const delegationCalls = planningOutput.toolCalls?.filter(
            call => call.toolName === 'delegate_to_agent'
        ) ?? [];

        if (delegationCalls.length === 0) {
            Logger.debug(`[${traceId}] No A2A delegation calls in the plan.`);
            return [];
        }

        if (!this.deps.taskDelegationService || !this.deps.agentDiscoveryService) {
            Logger.warn(`[${traceId}] A2A services not available. Skipping delegation.`);
            return [];
        }

        const delegatedTasks: A2ATask[] = [];
        for (const call of delegationCalls) {
            try {
                const args = call.arguments;
                const { agentId, taskType, input, instructions } = args;

                const allAgents = await this.deps.agentDiscoveryService.discoverAgents(traceId);
                const targetAgent = allAgents.find(a => a.agentId === agentId);

                if (!targetAgent) {
                    throw new Error(`Agent with ID "${agentId}" not found during delegation.`);
                }

                const now = Date.now();
                const a2aTask: A2ATask = {
                    taskId: call.callId,
                    threadId: threadId,
                    status: A2ATaskStatus.PENDING,
                    payload: { taskType, input, instructions, parameters: { threadId, traceId } },
                    sourceAgent: { agentId: 'pes-agent', agentName: 'PES Agent', agentType: 'orchestrator' },
                    targetAgent: targetAgent,
                    priority: A2ATaskPriority.MEDIUM,
                    metadata: {
                        createdAt: now, updatedAt: now, initiatedBy: threadId, correlationId: traceId,
                        retryCount: 0, maxRetries: 3, timeoutMs: 60000, tags: ['delegated', taskType]
                    }
                };

                await this.deps.a2aTaskRepository.createTask(a2aTask);

                const delegatedTask = await this.deps.taskDelegationService.delegateTask(a2aTask, traceId);
                if (delegatedTask) {
                    delegatedTasks.push(delegatedTask);
                }
            } catch (err: any) {
                Logger.error(`[${traceId}] Failed to process and delegate A2A task for call ${call.callId}:`, err);
                await this.deps.observationManager.record({
                    threadId, traceId, type: ObservationType.ERROR,
                    content: { phase: 'a2a_delegation', error: `Delegation for call ${call.callId} failed: ${err.message}` },
                    metadata: { timestamp: Date.now() }
                });
            }
        }

        Logger.info(`[${traceId}] Successfully initiated delegation for ${delegatedTasks.length}/${delegationCalls.length} A2A task(s).`);
        return delegatedTasks;
    }

    /**
     * Waits for delegated A2A tasks to complete.
     * Polls the repository until all tasks are in a terminal state or timeout is reached.
     * @param a2aTasks - The tasks to wait for.
     * @param threadId - Thread ID.
     * @param traceId - Trace ID.
     * @param maxWaitTimeMs - Maximum time to wait in milliseconds.
     * @param pollIntervalMs - Polling interval.
     * @returns The updated list of tasks.
     */
    private async _waitForA2ACompletion(
        a2aTasks: A2ATask[],
        threadId: string,
        traceId: string,
        maxWaitTimeMs: number = 30000,
        pollIntervalMs: number = 2000
    ): Promise<A2ATask[]> {
        if (a2aTasks.length === 0) {
            return a2aTasks;
        }

        Logger.debug(`[${traceId}] Waiting for ${a2aTasks.length} A2A task(s) to complete (timeout: ${maxWaitTimeMs}ms)`);

        const startTime = Date.now();
        const updatedTasks: A2ATask[] = [...a2aTasks];

        try {
            while ((Date.now() - startTime) < maxWaitTimeMs) {
                const incompleteTasks = updatedTasks.filter(task =>
                    task.status !== A2ATaskStatus.COMPLETED &&
                    task.status !== A2ATaskStatus.FAILED &&
                    task.status !== A2ATaskStatus.CANCELLED
                );

                if (incompleteTasks.length === 0) {
                    Logger.info(`[${traceId}] All A2A tasks completed successfully`);
                    break;
                }

                Logger.debug(`[${traceId}] Waiting for ${incompleteTasks.length} A2A task(s) to complete...`);

                for (let i = 0; i < updatedTasks.length; i++) {
                    const task = updatedTasks[i];

                    if (task.status === A2ATaskStatus.COMPLETED ||
                        task.status === A2ATaskStatus.FAILED ||
                        task.status === A2ATaskStatus.CANCELLED) {
                        continue;
                    }

                    try {
                        const latestTask = await this.deps.a2aTaskRepository.getTask(task.taskId);
                        if (latestTask) {
                            updatedTasks[i] = latestTask;
                        }
                    } catch (error: any) {
                        Logger.warn(`[${traceId}] Failed to get updated status for task ${task.taskId}:`, error);
                    }
                }

                await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
            }

            return updatedTasks;

        } catch (error: any) {
            Logger.error(`[${traceId}] Error during A2A task waiting:`, error);
            return updatedTasks;
        }
    }


    /**
     * Finalizes the agent execution by saving the AI response and recording the final observation.
     * @param props - Agent properties.
     * @param finalResponseContent - The content of the final AI message.
     * @param traceId - Trace ID.
     * @param uiMetadata - Optional UI metadata extracted from the response.
     * @returns The created ConversationMessage object.
     */
    private async _finalize(props: AgentProps, finalResponseContent: string, traceId: string, uiMetadata?: object): Promise<ConversationMessage> {
        // Same as original
        Logger.debug(`[${traceId}] Stage 7: Finalization`);
        const finalTimestamp = Date.now();
        const finalAiMessage: ConversationMessage = {
            messageId: generateUUID(),
            threadId: props.threadId,
            role: MessageRole.AI,
            content: finalResponseContent,
            timestamp: finalTimestamp,
            metadata: { traceId },
        };
        await this.deps.conversationManager.addMessages(props.threadId, [finalAiMessage]);
        await this.deps.observationManager.record({
            threadId: props.threadId,
            traceId,
            type: ObservationType.FINAL_RESPONSE,
            content: { message: finalAiMessage, uiMetadata: uiMetadata },
            metadata: { timestamp: finalTimestamp }
        });
        return finalAiMessage;
    }

    /**
     * Helper to format internal conversation messages into the standard prompt format required by the LLM.
     * @param history - Array of ConversationMessages.
     * @returns Array of formatted prompt messages.
     */
    private formatHistoryForPrompt(history: ConversationMessage[]): ArtStandardPrompt {
        // Same as original
        return history.map((msg) => {
            let role: ArtStandardMessageRole;
            switch (msg.role) {
                case MessageRole.USER: role = 'user'; break;
                case MessageRole.AI: role = 'assistant'; break;
                case MessageRole.SYSTEM: role = 'system'; break;
                case MessageRole.TOOL: role = 'tool'; break;
                default: role = 'user';
            }
            return { role: role, content: msg.content };
        }).filter(msg => msg.content);
    }
}
