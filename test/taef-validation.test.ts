
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OutputParser } from '../src/systems/reasoning/OutputParser';
import { TodoItemStatus } from '../src/types';

describe('TAEF - Tool-Aware Execution Framework', () => {
    let parser: OutputParser;

    beforeEach(() => {
        parser = new OutputParser();
    });

    describe('OutputParser - TAEF Fields Parsing', () => {
        it('should parse stepType and requiredTools from planning output', async () => {
            const output = `
---JSON_OUTPUT_START---
{
  "title": "Weather Query",
  "intent": "Get weather data",
  "plan": "Fetch and analyze weather",
  "todoList": [
    {
      "id": "step_1",
      "description": "Search for weather data",
      "stepType": "tool",
      "requiredTools": ["webSearch"],
      "expectedOutcome": "Retrieved weather data",
      "dependencies": []
    },
    {
      "id": "step_2",
      "description": "Analyze the weather data",
      "stepType": "reasoning",
      "expectedOutcome": "Weather summary",
      "dependencies": ["step_1"]
    }
  ]
}
---JSON_OUTPUT_END---
`;
            const result = await parser.parsePlanningOutput(output);

            expect(result.todoList).toBeDefined();
            expect(result.todoList).toHaveLength(2);

            // First item is a tool step
            expect(result.todoList![0].stepType).toBe('tool');
            expect(result.todoList![0].requiredTools).toEqual(['webSearch']);
            expect(result.todoList![0].expectedOutcome).toBe('Retrieved weather data');

            // Second item is a reasoning step
            expect(result.todoList![1].stepType).toBe('reasoning');
            expect(result.todoList![1].requiredTools).toBeUndefined();
        });

        it('should parse toolValidationMode when specified', async () => {
            const output = `
---JSON_OUTPUT_START---
{
  "title": "Test",
  "intent": "Test validation mode",
  "todoList": [
    {
      "id": "step_1",
      "description": "Strict validation step",
      "stepType": "tool",
      "requiredTools": ["calculator"],
      "toolValidationMode": "strict"
    }
  ]
}
---JSON_OUTPUT_END---
`;
            const result = await parser.parsePlanningOutput(output);

            expect(result.todoList![0].toolValidationMode).toBe('strict');
        });

        it('should handle missing TAEF fields for backward compatibility', async () => {
            const output = `
---JSON_OUTPUT_START---
{
  "title": "Legacy Plan",
  "intent": "No TAEF fields",
  "todoList": [
    {
      "id": "step_1",
      "description": "A step without stepType",
      "dependencies": []
    }
  ]
}
---JSON_OUTPUT_END---
`;
            const result = await parser.parsePlanningOutput(output);

            expect(result.todoList).toBeDefined();
            expect(result.todoList![0].stepType).toBeUndefined();
            expect(result.todoList![0].requiredTools).toBeUndefined();
            expect(result.todoList![0].status).toBe(TodoItemStatus.PENDING);
        });
    });

    describe('Step Type Classification Logic', () => {
        it('should identify tool steps when stepType is "tool"', () => {
            const item = {
                id: 'step_1',
                description: 'Search',
                stepType: 'tool' as const,
                requiredTools: ['webSearch'],
                status: TodoItemStatus.PENDING,
                createdTimestamp: Date.now(),
                updatedTimestamp: Date.now()
            };

            const isToolStep = item.stepType === 'tool' ||
                (item.requiredTools && item.requiredTools.length > 0);

            expect(isToolStep).toBe(true);
        });

        it('should identify tool steps when requiredTools exist (even without stepType)', () => {
            const item = {
                id: 'step_1',
                description: 'Search',
                requiredTools: ['webSearch'],
                status: TodoItemStatus.PENDING,
                createdTimestamp: Date.now(),
                updatedTimestamp: Date.now()
            };

            const isToolStep = (item as any).stepType === 'tool' ||
                (item.requiredTools && item.requiredTools.length > 0);

            expect(isToolStep).toBe(true);
        });

        it('should identify reasoning steps when stepType is "reasoning"', () => {
            const item = {
                id: 'step_1',
                description: 'Analyze data',
                stepType: 'reasoning' as const,
                status: TodoItemStatus.PENDING,
                createdTimestamp: Date.now(),
                updatedTimestamp: Date.now()
            };

            const isToolStep = item.stepType === 'tool' ||
                ((item as any).requiredTools && (item as any).requiredTools.length > 0);

            expect(isToolStep).toBeFalsy();
        });

        it('should default to reasoning-like behavior when no stepType', () => {
            const item = {
                id: 'step_1',
                description: 'Legacy step',
                status: TodoItemStatus.PENDING,
                createdTimestamp: Date.now(),
                updatedTimestamp: Date.now()
            };

            const isToolStep = (item as any).stepType === 'tool' ||
                ((item as any).requiredTools && (item as any).requiredTools.length > 0);

            // Without stepType or requiredTools, it should not be treated as tool step
            expect(isToolStep).toBeFalsy();
        });
    });

    describe('Validation Status Assignment', () => {
        it('should set validationStatus to "passed" when required tools are invoked', () => {
            const item = {
                id: 'step_1',
                stepType: 'tool' as const,
                requiredTools: ['webSearch'],
                validationStatus: undefined as 'passed' | 'failed' | 'skipped' | undefined
            };

            const parsed = {
                toolCalls: [
                    { callId: 'call_1', toolName: 'webSearch', arguments: {} }
                ]
            };

            const calledToolNames = new Set(parsed.toolCalls.map(tc => tc.toolName));
            const missingTools = item.requiredTools.filter(t => !calledToolNames.has(t));

            if (missingTools.length === 0) {
                item.validationStatus = 'passed';
            }

            expect(item.validationStatus).toBe('passed');
        });

        it('should set validationStatus to "failed" when required tools are NOT invoked', () => {
            const item = {
                id: 'step_1',
                stepType: 'tool' as const,
                requiredTools: ['webSearch'],
                validationStatus: undefined as 'passed' | 'failed' | 'skipped' | undefined
            };

            const parsed = {
                toolCalls: [] // No tools called
            };

            const calledToolNames = new Set(parsed.toolCalls.map(tc => tc.toolName));
            const missingTools = item.requiredTools.filter(t => !calledToolNames.has(t));

            if (missingTools.length > 0) {
                item.validationStatus = 'failed';
            }

            expect(item.validationStatus).toBe('failed');
            expect(missingTools).toEqual(['webSearch']);
        });

        it('should set validationStatus to "skipped" for reasoning steps', () => {
            const item = {
                id: 'step_1',
                stepType: 'reasoning' as const,
                validationStatus: undefined as 'passed' | 'failed' | 'skipped' | undefined
            };

            const isToolStep = item.stepType === 'tool';

            if (!isToolStep) {
                item.validationStatus = 'skipped';
            }

            expect(item.validationStatus).toBe('skipped');
        });
    });
});
