// src/types/pes-types.ts

import { ParsedToolCall, ToolResult } from './index';

export enum TodoItemStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    WAITING = 'waiting' // For A2A tasks
}

export interface TodoItem {
    id: string;
    description: string;
    status: TodoItemStatus;
    dependencies?: string[]; // IDs of tasks that must be finished first

    // Step type classification (TAEF)
    stepType?: 'tool' | 'reasoning';

    // Tool execution requirements (only for tool steps)
    requiredTools?: string[];
    expectedOutcome?: string;
    toolValidationMode?: 'strict' | 'advisory';

    // Execution tracking
    result?: any;
    thoughts?: string[];
    toolCalls?: ParsedToolCall[];
    actualToolCalls?: ParsedToolCall[]; // What was actually called during execution
    toolResults?: ToolResult[];
    validationStatus?: 'passed' | 'failed' | 'skipped';

    // Metadata
    createdTimestamp: number;
    updatedTimestamp: number;
}

export interface PESAgentStateData {
    threadId: string;
    intent: string;
    title: string;
    plan: string; // High level description
    todoList: TodoItem[];
    currentStepId: string | null;
    isPaused: boolean;

    // NEW: Suspension Context for HITL
    suspension?: {
        suspensionId: string;
        itemId: string;           // The ID of the TodoItem currently being executed
        toolCall: import('./index').ParsedToolCall; // The specific call that triggered suspension
        iterationState: import('./index').ArtStandardPrompt; // Captured message history of the current iteration
    };

    // Step Output Table - persisted for resume and synthesis access
    stepOutputs?: Record<string, StepOutputEntry>;

    // Keep track of iterations for the overall process or per item?
    // The legacy executionHistory was per process call.
    // We might want to persist some history.
}

/**
 * Structured entry for step output table.
 * Persisted for resume capability and cross-step data access.
 */
export interface StepOutputEntry {
    stepId: string;
    description: string;
    stepType: 'tool' | 'reasoning';
    status: TodoItemStatus;
    completedAt?: number;

    // Raw outputs (no truncation - full data for downstream steps)
    rawResult?: any;
    toolResults?: ToolResult[];

    // Optional summary for quick reference
    summary?: string;
}

export interface ExecutionOutput {
    thoughts?: string;
    content?: string; // The response text
    toolCalls?: ParsedToolCall[];
    nextStepDecision?: 'continue' | 'wait' | 'complete_item' | 'update_plan';
    updatedPlan?: {
        intent?: string;
        plan?: string;
        todoList?: TodoItem[]; // If the agent decides to modify the list
    };
}
