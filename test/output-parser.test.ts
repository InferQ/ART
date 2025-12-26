import { describe, it, expect, beforeEach } from 'vitest';
import { OutputParser } from '../src/systems/reasoning/OutputParser';

describe('OutputParser', () => {
    let parser: OutputParser;

    beforeEach(() => {
        parser = new OutputParser();
    });

    describe('parseExecutionOutput', () => {
        it('should parse toolCalls with "arguments" correctly', async () => {
            // Using single quotes to avoid escaping hell
            const output = '\n```json\n{\n  "toolCalls": [\n    { "toolName": "testTool", "arguments": { "foo": "bar" }, "callId": "call_1" }\n  ]\n}\n```\n';
            const result = await parser.parseExecutionOutput(output);
            expect(result.toolCalls).toHaveLength(1);
            expect(result.toolCalls![0].toolName).toBe('testTool');
            expect(result.toolCalls![0].arguments).toEqual({ foo: 'bar' });
            expect(result.toolCalls![0].callId).toBe('call_1');
        });

        it('should normalize "parameters" to "arguments"', async () => {
            const output = '\n```json\n{\n  "toolCalls": [\n    { "toolName": "geminiTool", "parameters": { "baz": "qux" } }\n  ]\n}\n```\n';
            const result = await parser.parseExecutionOutput(output);
            expect(result.toolCalls).toHaveLength(1);
            expect(result.toolCalls![0].toolName).toBe('geminiTool');
            expect(result.toolCalls![0].arguments).toEqual({ baz: 'qux' });
            // It should also auto-generate a callId
            expect(result.toolCalls![0].callId).toBeDefined();
            expect(result.toolCalls![0].callId).toContain('call_');
        });

        it('should parse raw JSON without markdown fences', async () => {
            const output = '{ "toolCalls": [{ "toolName": "rawTool", "arguments": {} }] }';
            const result = await parser.parseExecutionOutput(output);
            expect(result.toolCalls).toHaveLength(1);
            expect(result.toolCalls![0].toolName).toBe('rawTool');
        });

        it('should parse content-only responses without toolCalls', async () => {
            const output = '```json\n{\n  "content": "The analysis shows growth trends.",\n  "nextStepDecision": "continue"\n}\n```';
            const result = await parser.parseExecutionOutput(output);
            expect(result.content).toBe('The analysis shows growth trends.');
            expect(result.nextStepDecision).toBe('continue');
            expect(result.toolCalls).toBeUndefined();
        });
    });

    describe('parsePlanningOutput - TAEF Fields', () => {
        it('should parse stepType field from planning output', async () => {
            const output = `---JSON_OUTPUT_START---
{
  "title": "Test Plan",
  "intent": "Test intent",
  "plan": "Test plan description",
  "todoList": [
    {
      "id": "step_1",
      "description": "Search for data",
      "stepType": "tool",
      "requiredTools": ["webSearch"],
      "expectedOutcome": "Data retrieved"
    }
  ]
}
---JSON_OUTPUT_END---`;
            const result = await parser.parsePlanningOutput(output);
            expect(result.todoList).toBeDefined();
            expect(result.todoList).toHaveLength(1);
            expect(result.todoList![0].stepType).toBe('tool');
        });

        it('should parse requiredTools array from planning output', async () => {
            const output = `---JSON_OUTPUT_START---
{
  "todoList": [
    {
      "id": "step_1",
      "description": "Search and confirm",
      "stepType": "tool",
      "requiredTools": ["webSearch", "displayConfirmation"]
    }
  ]
}
---JSON_OUTPUT_END---`;
            const result = await parser.parsePlanningOutput(output);
            expect(result.todoList![0].requiredTools).toEqual(['webSearch', 'displayConfirmation']);
        });

        it('should parse expectedOutcome from planning output', async () => {
            const output = `---JSON_OUTPUT_START---
{
  "todoList": [
    {
      "id": "step_1",
      "description": "Analyze data",
      "stepType": "reasoning",
      "expectedOutcome": "Identified key trends"
    }
  ]
}
---JSON_OUTPUT_END---`;
            const result = await parser.parsePlanningOutput(output);
            expect(result.todoList![0].expectedOutcome).toBe('Identified key trends');
        });

        it('should parse toolValidationMode from planning output', async () => {
            const output = `---JSON_OUTPUT_START---
{
  "todoList": [
    {
      "id": "step_1",
      "description": "Critical search",
      "stepType": "tool",
      "requiredTools": ["webSearch"],
      "toolValidationMode": "strict"
    }
  ]
}
---JSON_OUTPUT_END---`;
            const result = await parser.parsePlanningOutput(output);
            expect(result.todoList![0].toolValidationMode).toBe('strict');
        });

        it('should handle reasoning steps without requiredTools', async () => {
            const output = `---JSON_OUTPUT_START---
{
  "todoList": [
    {
      "id": "step_1",
      "description": "Synthesize findings",
      "stepType": "reasoning"
    }
  ]
}
---JSON_OUTPUT_END---`;
            const result = await parser.parsePlanningOutput(output);
            expect(result.todoList![0].stepType).toBe('reasoning');
            expect(result.todoList![0].requiredTools).toBeUndefined();
        });

        it('should add timestamps to parsed todoList items', async () => {
            const output = `---JSON_OUTPUT_START---
{
  "todoList": [
    {
      "id": "step_1",
      "description": "Test step"
    }
  ]
}
---JSON_OUTPUT_END---`;
            const result = await parser.parsePlanningOutput(output);
            expect(result.todoList![0].createdTimestamp).toBeDefined();
            expect(result.todoList![0].updatedTimestamp).toBeDefined();
            expect(typeof result.todoList![0].createdTimestamp).toBe('number');
        });

        it('should parse mixed tool and reasoning steps', async () => {
            const output = `---JSON_OUTPUT_START---
{
  "todoList": [
    {
      "id": "step_1",
      "description": "Search for data",
      "stepType": "tool",
      "requiredTools": ["webSearch"]
    },
    {
      "id": "step_2",
      "description": "Analyze results",
      "stepType": "reasoning"
    },
    {
      "id": "step_3",
      "description": "Get confirmation",
      "stepType": "tool",
      "requiredTools": ["displayConfirmation"]
    }
  ]
}
---JSON_OUTPUT_END---`;
            const result = await parser.parsePlanningOutput(output);
            expect(result.todoList).toHaveLength(3);
            expect(result.todoList![0].stepType).toBe('tool');
            expect(result.todoList![1].stepType).toBe('reasoning');
            expect(result.todoList![2].stepType).toBe('tool');
        });
    });
});