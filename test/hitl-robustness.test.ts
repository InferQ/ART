
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createArtInstance } from '../src/core/agent-factory';
import { PESAgent } from '../src/core/agents/pes-agent';
import { ArtInstanceConfig, PESAgentStateData, TodoItemStatus, AgentProps } from '../src/types';
import { InMemoryStorageAdapter } from '../src/integrations/storage/inMemory';
import { StateManager, ConversationManager, ToolRegistry, ReasoningEngine, OutputParser, ObservationManager, ToolSystem, UISystem } from '../src/core/interfaces';

// --- Mocks for Unit Tests ---
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

describe('HITL Robustness', () => {
    
    describe('Race Condition Protection (Integration Level)', () => {
        let artConfig: ArtInstanceConfig;

        beforeEach(() => {
            artConfig = {
                storage: new InMemoryStorageAdapter(),
                providers: {
                    availableProviders: [
                        { name: 'openai', adapter: 'openai', apiKey: 'mock' }
                    ]
                },
                tools: []
            };
        });

        it('should throw if resumeExecution is called on a thread that is not paused', async () => {
            const art = await createArtInstance(artConfig);
            const stateManager = art.stateManager;
            const threadId = 'thread_race';
            const suspensionId = 'sus_race';

            const mockState: PESAgentStateData = {
                threadId,
                intent: 'test',
                title: 'test',
                plan: 'test plan',
                todoList: [],
                currentStepId: null,
                isPaused: false, // Critical: Not paused
                suspension: {
                    suspensionId,
                    itemId: '1',
                    toolCall: { callId: 'c1', toolName: 't1', arguments: {} },
                    iterationState: []
                }
            };

            await stateManager.setThreadConfig(threadId, {
                providerConfig: { provider: 'openai', model: 'gpt-4' },
                enabledTools: [],
                historyLimit: 10
            } as any);

            await stateManager.setAgentState(threadId, {
                data: mockState,
                version: 1,
                modified: Date.now()
            });

            await expect(art.resumeExecution(threadId, suspensionId, { approved: true }))
                .rejects
                .toThrow(/not currently paused/);
        });
    });

    describe('Circular Reference Safety (Unit Level)', () => {
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

        it('should NOT crash when resumeDecision contains circular references', async () => {
            const threadId = 'thread_circ';
            const traceId = 'trace_circ';
            const suspensionId = 'sus_circ';

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
                    toolCall: { callId: 'call_1', toolName: 'test_tool', arguments: {} },
                    iterationState: []
                }
            };

            (mockStateManager.loadThreadContext as any).mockResolvedValue({
                config: {
                    providerConfig: { provider: 'openai', model: 'gpt-4' },
                    enabledTools: [],
                    historyLimit: 10
                },
                state: { data: suspendedState }
            });

            const asyncIterable = {
                async *[Symbol.asyncIterator]() {
                    yield { type: 'TOKEN', data: 'Done', tokenType: 'response' };
                    yield { type: 'METADATA', data: {} };
                }
            };
            (mockReasoningEngine.call as any).mockResolvedValue(asyncIterable);
            (mockOutputParser.parseExecutionOutput as any).mockResolvedValue({ content: 'Done' });

            const circular: any = { approved: true };
            circular.self = circular;

            const props: AgentProps = {
                threadId,
                query: '',
                isResume: true,
                resumeDecision: circular,
                traceId
            };

            await agent.process(props);

            expect(mockReasoningEngine.call).toHaveBeenCalled();
            const callArgs = (mockReasoningEngine.call as any).mock.calls[0];
            const prompt = callArgs[0];
            
            const toolResultMsg = prompt.find((m: any) => m.role === 'tool_result');
            expect(toolResultMsg).toBeDefined();
            expect(toolResultMsg.content).toContain('[circular reference]'); // Our safeStringify handles it
        });
    });
});
