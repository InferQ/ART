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

    // Execution history for this item
    result?: any;
    thoughts?: string[];
    toolCalls?: ParsedToolCall[];
    toolResults?: ToolResult[];

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
    // Keep track of iterations for the overall process or per item?
    // The legacy executionHistory was per process call.
    // We might want to persist some history.
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
