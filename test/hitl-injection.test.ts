
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PESAgent } from '../src/core/agents/pes-agent';
import { 
    StateManager, 
    ConversationManager, 
    ToolRegistry, 
    ReasoningEngine, 
    OutputParser, 
    ObservationManager, 
    ToolSystem, 
    UISystem 
} from '../src/core/interfaces';
import { PESAgentStateData, TodoItemStatus, MessageRole, AgentProps } from '../src/types';

// Mocks
const mockStateManager = {
    loadThreadContext: vi.fn(),
    setAgentState: vi.fn(),
    setThreadConfig: vi.fn(),
    saveStateIfModified: vi.fn(),
    getThreadConfigValue: vi.fn(),
} as unknown as StateManager;

const mockConversationManager = {
    getMessages: vi.fn().mockResolvedValue([]),
    addMessages: vi.fn(),
} as unknown as ConversationManager;

const mockToolRegistry = {
    getAvailableTools: vi.fn().mockResolvedValue([]),
} as unknown as ToolRegistry;

const mockReasoningEngine = {
    call: vi.fn(),
} as unknown as ReasoningEngine;

const mockOutputParser = {
    parsePlanningOutput: vi.fn(),
    parseExecutionOutput: vi.fn(),
} as unknown as OutputParser;

const mockObservationManager = {
    record: vi.fn(),
} as unknown as ObservationManager;

const mockToolSystem = {
    executeTools: vi.fn(),
} as unknown as ToolSystem;

const mockUISystem = {
    getLLMStreamSocket: vi.fn().mockReturnValue({ notify: vi.fn() }),
} as unknown as UISystem;

const mockSystemPromptResolver = {
    resolve: vi.fn().mockResolvedValue('sys prompt'),
} as unknown as any;

const mockA2ATaskRepository = {} as any;

describe('PESAgent HITL Injection', () => {
    let agent: PESAgent;

    beforeEach(() => {
        vi.clearAllMocks();
        agent = new PESAgent({
            stateManager: mockStateManager,
            conversationManager: mockConversationManager,
            toolRegistry: mockToolRegistry,
            reasoningEngine: mockReasoningEngine,
            outputParser: mockOutputParser,
            observationManager: mockObservationManager,
            toolSystem: mockToolSystem,
            uiSystem: mockUISystem,
            systemPromptResolver: mockSystemPromptResolver,
            a2aTaskRepository: mockA2ATaskRepository
        });
    });

    it('should inject tool_result into LLM prompt when resuming with decision', async () => {
        const threadId = 'thread_inj';
        const traceId = 'trace_inj';
        const suspensionId = 'sus_1';

        // 1. Setup Suspended State
        const suspendedState: PESAgentStateData = {
            threadId,
            intent: 'test',
            title: 'test',
            plan: 'test plan',
            todoList: [
                { id: '1', description: 'step 1', status: TodoItemStatus.IN_PROGRESS, createdTimestamp: 0, updatedTimestamp: 0 }
            ],
            currentStepId: '1',
            isPaused: true,
            suspension: {
                suspensionId,
                itemId: '1',
                toolCall: { callId: 'call_1', toolName: 'blocking_tool', arguments: {} },
                iterationState: [
                    { role: MessageRole.SYSTEM, content: 'sys' },
                    { role: MessageRole.USER, content: 'do it' }
                ]
            }
        };

        // Mock State Loading
        (mockStateManager.loadThreadContext as any).mockResolvedValue({
            config: {
                providerConfig: { provider: 'openai', model: 'gpt-4' },
                enabledTools: [],
                historyLimit: 10
            },
            state: { data: suspendedState }
        });

        // Mock Reasoning Engine to return a valid stream (to prevent crash)
        const asyncIterable = {
            async *[Symbol.asyncIterator]() {
                yield { type: 'TOKEN', data: 'Done', tokenType: 'response' };
                yield { type: 'METADATA', data: {} };
            }
        };
        (mockReasoningEngine.call as any).mockResolvedValue(asyncIterable);

        // Mock Output Parser
        (mockOutputParser.parseExecutionOutput as any).mockResolvedValue({
            content: 'Task completed.',
            toolCalls: undefined
        });

        // 2. Call Process with Resume Decision
        const props: AgentProps = {
            threadId,
            query: '',
            isResume: true,
            resumeDecision: { approved: true, reason: 'ok' },
            traceId
        };

        await agent.process(props);

        // 3. Verify Reasoning Engine was called with the injected message
        expect(mockReasoningEngine.call).toHaveBeenCalled();
        const callArgs = (mockReasoningEngine.call as any).mock.calls[0];
        const prompt = callArgs[0]; // ArtStandardPrompt

        // Expected Prompt Structure:
        // 0: System (sys)
        // 1: User (do it)
        // 2: Tool Result (Injected!)
        // 3: Assistant (Execution output from the mocked call, accumulated in the loop) -> Wait, no.
        
        // The prompt passed to `call` is `messages`.
        // The loop in `_executeTodoList` pushes the response *after* the call.
        // So the first call should have the injected message.

        const injectedMsg = prompt.find((m: any) => m.role === 'tool_result');
        expect(injectedMsg).toBeDefined();
        expect(injectedMsg.name).toBe('blocking_tool');
        expect(injectedMsg.tool_call_id).toBe('call_1');
        
        const content = JSON.parse(injectedMsg.content);
        expect(content.approved).toBe(true);
    });
});
