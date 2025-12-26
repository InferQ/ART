
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PESAgent } from '../src/core/agents/pes-agent';
import { 
    TodoItemStatus, 
    TodoItem, 
    ObservationType, 
    ToolResult,
    ModelCapability
} from '../src/types';

describe('PESAgent Result Handling', () => {
    let mockReasoningEngine: any;
    let mockToolSystem: any;
    let mockStateManager: any;
    let mockConversationManager: any;
    let mockObservationManager: any;
    let mockPromptManager: any;
    let mockOutputParser: any;
    let agent: PESAgent;

    beforeEach(() => {
        mockReasoningEngine = {
            _responses: [] as string[],
            call: vi.fn().mockImplementation(async (prompt, options) => {
                const responseText = mockReasoningEngine._responses.shift() || '';
                const events = [
                    { type: 'TOKEN', data: responseText, tokenType: 'LLM_RESPONSE', threadId: 'test-thread', traceId: 'test-trace' },
                    { type: 'END', data: null, threadId: 'test-thread', traceId: 'test-trace' }
                ];
                return (async function* () {
                    for (const event of events) {
                        yield event;
                    }
                })();
            })
        };
        mockToolSystem = {
            executeTools: vi.fn(),
            getToolSchema: vi.fn()
        };
        mockStateManager = {
            loadThreadContext: vi.fn(),
            saveStateIfModified: vi.fn(),
            getThreadConfig: vi.fn(),
            getThreadConfigValue: vi.fn().mockResolvedValue(null),
            setAgentState: vi.fn().mockImplementation((threadId, state) => {
                // Capture deep clones to avoid seeing final state in all call history
                if (!mockStateManager._calls) mockStateManager._responses = []; // Reuse field if needed or add new
                if (!mockStateManager._capturedStates) mockStateManager._capturedStates = [];
                mockStateManager._capturedStates.push(JSON.parse(JSON.stringify(state.data)));
            })
        };
        mockConversationManager = {
            getMessages: vi.fn().mockResolvedValue([]),
            addMessages: vi.fn().mockResolvedValue(null)
        };
        mockObservationManager = {
            record: vi.fn().mockResolvedValue(null),
            getObservations: vi.fn().mockResolvedValue([])
        };
        mockPromptManager = {
            assemblePrompt: vi.fn().mockResolvedValue([])
        };
        mockOutputParser = {
            parsePlanningOutput: vi.fn(),
            parseExecutionOutput: vi.fn()
        };
        const mockSystemPromptResolver = {
            resolve: vi.fn().mockImplementation(async (config) => config.base || '')
        };
        const mockUISystem = {
            getLLMStreamSocket: vi.fn().mockReturnValue({ notify: vi.fn() }),
            getObservationSocket: vi.fn().mockReturnValue({ notify: vi.fn() }),
            getA2ATaskSocket: vi.fn().mockReturnValue({ notify: vi.fn() })
        };

        agent = new PESAgent({
            reasoningEngine: mockReasoningEngine,
            toolSystem: mockToolSystem,
            stateManager: mockStateManager,
            conversationManager: mockConversationManager,
            observationManager: mockObservationManager,
            promptManager: mockPromptManager,
            outputParser: mockOutputParser,
            systemPromptResolver: mockSystemPromptResolver,
            uiSystem: mockUISystem,
            toolRegistry: { 
                getToolSchema: vi.fn(),
                getAvailableTools: vi.fn().mockResolvedValue([])
            },
            a2aTaskRepository: { save: vi.fn(), findById: vi.fn() }
        } as any);
    });

    it('should populate item.result with tool output if LLM content is missing', async () => {
        const threadId = 'test-thread';
        const traceId = 'test-trace';
        
        const todoItem: TodoItem = {
            id: 'item-1',
            description: 'Call a tool',
            status: TodoItemStatus.PENDING,
            createdTimestamp: Date.now(),
            updatedTimestamp: Date.now(),
            stepType: 'tool'
        };

        const state: any = {
            threadId,
            intent: 'test',
            title: 'test',
            plan: 'test plan',
            todoList: [todoItem],
            currentStepId: null
        };

        mockStateManager.loadThreadContext.mockResolvedValue({
            config: {
                providerConfig: { providerName: 'mock', modelId: 'mock' },
                enabledTools: ['test_tool']
            },
            state: { data: state }
        });

        // Mock Planning
        mockReasoningEngine._responses.push('Planning Response');
        mockOutputParser.parsePlanningOutput.mockResolvedValue({
            intent: 'test',
            plan: 'test plan',
            todoList: [todoItem]
        });

        // Mock Execution Iteration 1: LLM calls tool
        mockReasoningEngine._responses.push('Execution Response 1');
        mockOutputParser.parseExecutionOutput.mockResolvedValueOnce({
            thoughts: 'I need to call the tool',
            toolCalls: [{ callId: 'call-1', toolName: 'test_tool', arguments: {} }]
        });

        const toolResult: ToolResult = {
            callId: 'call-1',
            toolName: 'test_tool',
            status: 'success',
            output: { data: 'tool-output-content' }
        };
        mockToolSystem.executeTools.mockResolvedValueOnce([toolResult]);

        // Mock Execution Iteration 2: LLM provides NO content and NO tool calls
        mockReasoningEngine._responses.push('Execution Response 2');
        mockOutputParser.parseExecutionOutput.mockResolvedValueOnce({
            thoughts: 'I am done',
            content: '', // EMPTY CONTENT
            toolCalls: []
        });

        // Mock Synthesis
        mockReasoningEngine._responses.push('Synthesis Response');

        await agent.process({
            query: 'run',
            threadId,
            traceId
        });

        const setAgentStateCalls = mockStateManager.setAgentState.mock.calls;
        const finalStateUpdate = setAgentStateCalls.find((call: any) => 
            call[1].data.todoList[0].status === TodoItemStatus.COMPLETED
        );

        expect(finalStateUpdate).toBeDefined();
        const updatedItem = finalStateUpdate[1].data.todoList[0];
        
        expect(updatedItem.result).toEqual({ data: 'tool-output-content' });
        expect(updatedItem.toolResults).toContainEqual(toolResult);
    });

    it('should fallback to last content if loop exceeds max iterations', async () => {
        const threadId = 'test-thread';
        const traceId = 'test-trace';
        
        const todoItem: TodoItem = {
            id: 'item-1',
            description: 'Tool loop',
            status: TodoItemStatus.PENDING,
            createdTimestamp: Date.now(),
            updatedTimestamp: Date.now(),
            stepType: 'tool'
        };

        const state: any = {
            threadId,
            intent: 'test',
            plan: 'test plan',
            todoList: [todoItem],
            currentStepId: null
        };

        mockStateManager.loadThreadContext.mockResolvedValue({
            config: { providerConfig: { providerName: 'mock', modelId: 'mock' }, enabledTools: [] },
            state: { data: state }
        });

        // Mock Planning
        mockReasoningEngine._responses.push('Planning Response');
        mockOutputParser.parsePlanningOutput.mockResolvedValue({
            intent: 'test',
            plan: 'test plan',
            todoList: [todoItem]
        });

        // Mock MANY iterations of tool calls to reach limit
        const MAX_ITER = 5; // Matches PESAgent.ts
        for (let i = 0; i < MAX_ITER; i++) {
            mockReasoningEngine._responses.push(`Execution Response ${i}`);
            mockOutputParser.parseExecutionOutput.mockResolvedValueOnce({
                thoughts: `Thinking ${i}`,
                content: `Intermediary result ${i}`,
                toolCalls: [{ callId: `call-${i}`, toolName: 'test_tool', arguments: {} }]
            });
            mockToolSystem.executeTools.mockResolvedValueOnce([{
                callId: `call-${i}`,
                toolName: 'test_tool',
                status: 'success',
                output: `result ${i}`
            }]);
        }

        // Mock Synthesis
        mockReasoningEngine._responses.push('Synthesis Response');

        await agent.process({ query: 'run', threadId, traceId });

        const setAgentStateCalls = mockStateManager.setAgentState.mock.calls;
        const finalStateUpdate = setAgentStateCalls.find((call: any) => 
            call[1].data.todoList[0].status === TodoItemStatus.COMPLETED
        );

        expect(finalStateUpdate).toBeDefined();
        const updatedItem = finalStateUpdate[1].data.todoList[0];
        
        expect(updatedItem.result).toBe(`Intermediary result ${MAX_ITER - 1}`);
    });

    it('should populate item.result with A2A task output if LLM content is missing', async () => {
        const threadId = 'test-thread';
        const traceId = 'test-trace';
        
        const todoItem: TodoItem = {
            id: 'item-a2a',
            description: 'Delegate a task',
            status: TodoItemStatus.PENDING,
            createdTimestamp: Date.now(),
            updatedTimestamp: Date.now(),
            stepType: 'tool'
        };

        const state: any = {
            threadId,
            intent: 'test',
            title: 'test',
            plan: 'test plan',
            todoList: [todoItem],
            currentStepId: null
        };

        mockStateManager.loadThreadContext.mockResolvedValue({
            config: {
                providerConfig: { providerName: 'mock', modelId: 'mock' },
                enabledTools: ['delegate_to_agent']
            },
            state: { data: state }
        });

        // Mock Planning
        mockReasoningEngine._responses.push('Planning Response');
        mockOutputParser.parsePlanningOutput.mockResolvedValue({
            intent: 'test',
            plan: 'test plan',
            todoList: [todoItem]
        });

        // Mock Execution Iteration 1: LLM calls A2A tool
        mockReasoningEngine._responses.push('Execution Response 1');
        mockOutputParser.parseExecutionOutput.mockResolvedValueOnce({
            thoughts: 'I need to delegate',
            toolCalls: [{ callId: 'call-a2a', toolName: 'delegate_to_agent', arguments: { agentId: 'other', taskType: 'work', input: {}, instructions: 'do it' } }]
        });

        // Mock A2A Delegation
        (agent as any)._delegateA2ATasks = vi.fn().mockResolvedValue([{ taskId: 'task-1' }]);
        (agent as any)._waitForA2ACompletion = vi.fn().mockResolvedValue([{ 
            taskId: 'task-1', 
            result: { success: true, data: { info: 'a2a-result-data' } } 
        }]);

        // Mock Execution Iteration 2: LLM provides NO content and NO tool calls
        mockReasoningEngine._responses.push('Execution Response 2');
        mockOutputParser.parseExecutionOutput.mockResolvedValueOnce({
            thoughts: 'A2A done',
            content: '', // EMPTY CONTENT
            toolCalls: []
        });

        // Mock Synthesis
        mockReasoningEngine._responses.push('Synthesis Response');

        await agent.process({
            query: 'run',
            threadId,
            traceId
        });

        const setAgentStateCalls = mockStateManager.setAgentState.mock.calls;
        const finalStateUpdate = setAgentStateCalls.find((call: any) => 
            call[1].data.todoList[0].status === TodoItemStatus.COMPLETED
        );

        expect(finalStateUpdate).toBeDefined();
        const updatedItem = finalStateUpdate[1].data.todoList[0];
        
        expect(updatedItem.result).toEqual({ info: 'a2a-result-data' });
        expect(updatedItem.toolResults).toContainEqual(expect.objectContaining({
            toolName: 'delegate_to_agent',
            output: { info: 'a2a-result-data' }
        }));
    });

    it('should prepare state correctly when isResume is true', async () => {
        const threadId = 'resume-thread';
        
        const todoItem: TodoItem = {
            id: 'item-1',
            description: 'Suspended task',
            status: TodoItemStatus.IN_PROGRESS, // Was in progress when suspended
            createdTimestamp: Date.now(),
            updatedTimestamp: Date.now()
        };

        const state: any = {
            threadId,
            todoList: [todoItem],
            isPaused: true,
            suspension: {
                suspensionId: 'sus-123',
                itemId: 'item-1',
                toolCall: { callId: 'call-1', toolName: 'test_tool', arguments: {} },
                iterationState: [{ role: 'user', content: 'do it' }, { role: 'tool_result', content: '{"approved":true}' }]
            }
        };

        mockStateManager.loadThreadContext.mockResolvedValue({
            config: { providerConfig: { providerName: 'mock', modelId: 'mock' }, enabledTools: [] },
            state: { data: state }
        });

        // Mock Execution
        mockReasoningEngine._responses.push('{"content": "resumed and done", "nextStepDecision": "complete_item"}');
        mockOutputParser.parseExecutionOutput.mockResolvedValueOnce({
            content: 'resumed and done',
            nextStepDecision: 'complete_item'
        });

        // Mock Synthesis
        mockReasoningEngine._responses.push('Final synthesis');

        await agent.process({
            query: '',
            threadId,
            isResume: true // RESUME FLAG
        });

        // Verify that the state was reset correctly at some point
        const preparedState = mockStateManager._capturedStates.find((s: any) => 
            s.isPaused === false && s.todoList[0].status === TodoItemStatus.IN_PROGRESS
        );
        expect(preparedState).toBeDefined();
        
        // Finally it should be COMPLETED
        const lastCapturedState = mockStateManager._capturedStates[mockStateManager._capturedStates.length - 1];
        expect(lastCapturedState.todoList[0].status).toBe(TodoItemStatus.COMPLETED);
    });
});
