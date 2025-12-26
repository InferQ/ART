
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
    ToolSystem, 
    ToolRegistry, 
    StateManager, 
    ObservationManager 
} from '../src/core/interfaces';
import { 
    ToolSchema, 
    ParsedToolCall, 
    ToolResult, 
    ExecutionContext,
    ObservationType
} from '../src/types';
import { ToolSystem as ToolSystemImpl } from '../src/systems/tool/ToolSystem';

// Mock dependencies
const mockStateManager = {
    isToolEnabled: vi.fn().mockResolvedValue(true),
} as unknown as StateManager;

const mockObservationManager = {
    record: vi.fn().mockResolvedValue(undefined),
} as unknown as ObservationManager;

const mockToolRegistry = {
    getToolExecutor: vi.fn(),
} as unknown as ToolRegistry;

describe('HITL Blocking Tools - ToolSystem', () => {
    let toolSystem: ToolSystem;

    beforeEach(() => {
        vi.clearAllMocks();
        toolSystem = new ToolSystemImpl(mockToolRegistry, mockStateManager, mockObservationManager);
    });

    it('should handle a blocking tool by returning a suspended status', async () => {
        // Define a blocking tool schema
        const blockingToolSchema: ToolSchema = {
            name: 'askUserConfirmation',
            description: 'Ask user for confirmation',
            inputSchema: { type: 'object', properties: { message: { type: 'string' } } },
            executionMode: 'blocking' // New field
        } as any; // Type casting until we update the interface

        // Mock executor behavior
        const mockExecutor = {
            schema: blockingToolSchema,
            execute: vi.fn().mockResolvedValue({
                toolName: 'askUserConfirmation',
                status: 'suspended', // New status
                callId: 'call_123',
                metadata: { suspensionId: 'suspension_abc' }
            })
        };

        (mockToolRegistry.getToolExecutor as any).mockResolvedValue(mockExecutor);

        const toolCalls: ParsedToolCall[] = [{
            callId: 'call_123',
            toolName: 'askUserConfirmation',
            arguments: { message: 'Do you approve?' }
        }];

        const results = await toolSystem.executeTools(toolCalls, 'thread_1');

        expect(results).toHaveLength(1);
        expect(results[0].status).toBe('suspended');
        expect(results[0].metadata?.suspensionId).toBe('suspension_abc');
        
        // Ensure execute was called to generate the suspension signal
        expect(mockExecutor.execute).toHaveBeenCalled();
    });

    it('should halt execution of subsequent tools when a blocking tool is triggered', async () => {
        // First tool is blocking
        const blockingToolSchema: ToolSchema = {
            name: 'blockingTool',
            description: 'Blocks',
            inputSchema: {},
            executionMode: 'blocking'
        } as any;

        const blockingExecutor = {
            schema: blockingToolSchema,
            execute: vi.fn().mockResolvedValue({
                toolName: 'blockingTool',
                status: 'suspended',
                callId: 'call_1',
                metadata: { suspensionId: 'sus_1' }
            })
        };

        // Second tool is normal
        const normalToolSchema: ToolSchema = {
            name: 'normalTool',
            description: 'Normal',
            inputSchema: {},
            executionMode: 'immediate'
        } as any;

        const normalExecutor = {
            schema: normalToolSchema,
            execute: vi.fn().mockResolvedValue({
                toolName: 'normalTool',
                status: 'success',
                callId: 'call_2',
                output: 'done'
            })
        };

        (mockToolRegistry.getToolExecutor as any).mockImplementation(async (name: string) => {
            if (name === 'blockingTool') return blockingExecutor;
            if (name === 'normalTool') return normalExecutor;
            return undefined;
        });

        const toolCalls: ParsedToolCall[] = [
            { callId: 'call_1', toolName: 'blockingTool', arguments: {} },
            { callId: 'call_2', toolName: 'normalTool', arguments: {} }
        ];

        const results = await toolSystem.executeTools(toolCalls, 'thread_1');

        // Should return only the result of the blocking tool (or both if we decide to return pending status for others, 
        // but for now, let's assume it halts and returns what was executed)
        
        // NOTE: In our proposal, "The ToolSystem stops executing any further tools in the current batch and returns the results."
        // So we expect 1 result, or maybe 2 where the second is 'skipped'. 
        // Let's assume strict halting for this test: just 1 result.
        expect(results).toHaveLength(1);
        expect(results[0].toolName).toBe('blockingTool');
        expect(results[0].status).toBe('suspended');
        
        expect(blockingExecutor.execute).toHaveBeenCalled();
        expect(normalExecutor.execute).not.toHaveBeenCalled();
    });
});
