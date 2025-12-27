
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

// Mocks (Simplified for this test)
const mockStateManager = { 
    loadThreadContext: vi.fn(), 
    setAgentState: vi.fn(), 
    saveStateIfModified: vi.fn(),
    getThreadConfigValue: vi.fn().mockResolvedValue(undefined)
} as unknown as StateManager;
const mockConversationManager = { 
    getMessages: vi.fn().mockResolvedValue([]),
    addMessages: vi.fn() 
} as unknown as ConversationManager;
const mockToolRegistry = { getAvailableTools: vi.fn().mockResolvedValue([]) } as unknown as ToolRegistry;
const mockReasoningEngine = { call: vi.fn() } as unknown as ReasoningEngine;
const mockOutputParser = { parseExecutionOutput: vi.fn() } as unknown as OutputParser;
const mockObservationManager = { record: vi.fn() } as unknown as ObservationManager;
const mockToolSystem = { executeTools: vi.fn() } as unknown as ToolSystem;
const mockUISystem = { getLLMStreamSocket: vi.fn().mockReturnValue({ notify: vi.fn() }) } as unknown as UISystem;
const mockSystemPromptResolver = { resolve: vi.fn().mockResolvedValue('sys prompt') } as unknown as any;
const mockA2ATaskRepository = {} as any;

describe('PESAgent HITL Rejection', () => {
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

    it('should inject SYSTEM prompt when user REJECTS a tool call', async () => {
        const threadId = 'thread_rej';
        const traceId = 'trace_rej';
        const suspensionId = 'sus_rej';

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
                toolCall: { callId: 'call_rej', toolName: 'deploy_prod', arguments: {} },
                iterationState: [
                    { role: 'system', content: 'sys' },
                    { role: 'user', content: 'deploy it' },
                    { role: 'assistant', content: 'calling tool', tool_calls: [{id: 'call_rej', type: 'function', function: {name: 'deploy_prod', arguments: '{}'}}] }
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

        // Mock Reasoning Engine
        const asyncIterable = {
            async *[Symbol.asyncIterator]() {
                yield { type: 'TOKEN', data: 'Acknowledged rejection.', tokenType: 'response' };
                yield { type: 'METADATA', data: {} };
            }
        };
        (mockReasoningEngine.call as any).mockResolvedValue(asyncIterable);
        (mockOutputParser.parseExecutionOutput as any).mockResolvedValue({ content: 'Acknowledged.' });

        // 2. Call Process with REJECTION
        const props: AgentProps = {
            threadId,
            query: '',
            isResume: true,
            resumeDecision: { approved: false, reason: 'Too risky' },
            traceId
        };

        await agent.process(props);

        // 3. Verify Reasoning Engine was called with both tool_result and SYSTEM rejection prompt
        expect(mockReasoningEngine.call).toHaveBeenCalled();
        const callArgs = (mockReasoningEngine.call as any).mock.calls[0];
        const prompt = callArgs[0];

        // 0: System
        // 1: User
        // 2: Assistant (Mock previous)
        // 3: Tool Result (Injected)
        // 4: System (Injected Rejection)
        // 5: Assistant (New response - present because callArgs holds reference to mutated array)
        
        expect(prompt).toHaveLength(6);
        
        const toolResultMsg = prompt[3];
        expect(toolResultMsg.role).toBe('tool_result');
        expect(JSON.parse(toolResultMsg.content).approved).toBe(false);

        const systemRejMsg = prompt[4];
        expect(systemRejMsg.role).toBe('system');
        expect(systemRejMsg.content).toContain('IMPORTANT: The user has REJECTED');
        expect(systemRejMsg.content).toContain('deploy_prod');
    });
});
