// src/systems/reasoning/OutputParser.ts
import * as z from 'zod'; // Import Zod
import { OutputParser as IOutputParser } from '@/core/interfaces';
import { ParsedToolCall, TodoItem, TodoItemStatus, ExecutionOutput } from '@/types';
import { Logger } from '@/utils/logger'; // Import the Logger class
import { XmlMatcher } from '@/utils/xml-matcher'; // Import XmlMatcher

// Define Zod schema for a single tool call
const parsedToolCallSchema = z.object({
  callId: z.string().optional(), // Make optional for input validation, will default later
  toolName: z.string().min(1),
  arguments: z.unknown(),
});

// Define Zod schema for an array of tool calls
const toolCallsSchema = z.array(parsedToolCallSchema);

const todoItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  status: z.nativeEnum(TodoItemStatus).optional().default(TodoItemStatus.PENDING),
  dependencies: z.array(z.string()).optional(),
  // TAEF fields
  stepType: z.enum(['tool', 'reasoning']).optional(),
  requiredTools: z.array(z.string()).optional(),
  expectedOutcome: z.string().optional(),
  toolValidationMode: z.enum(['strict', 'advisory']).optional()
});
const todoListSchema = z.array(todoItemSchema);

// Helper to normalize tool calls
const normalizeToolCalls = (rawCalls: any[]) => {
  return rawCalls.map((tc: any) => ({
    ...tc,
    // Map 'parameters' to 'arguments' if needed
    arguments: tc.arguments ?? tc.parameters,
    // Generate callId if missing
    callId: tc.callId ?? `call_${Math.random().toString(36).slice(2, 11)}`
  }));
};

// ... (imports remain the same)

/**
 * Default implementation of the `OutputParser` interface.
 */
export class OutputParser implements IOutputParser {

  /**
   * Helper for JSON parsing with marker and markdown support.
   */
  private tryParseJson(raw: string): any | null {
    if (!raw) return null;
    let s = raw.trim();

    // Priority 1: Look for explicit JSON markers (most reliable)
    const markerMatch = s.match(/---JSON_OUTPUT_START---([\s\S]*?)---JSON_OUTPUT_END---/);
    if (markerMatch && markerMatch[1]) {
      const markerContent = markerMatch[1].trim();
      try {
        return JSON.parse(markerContent);
      } catch {
        Logger.debug('OutputParser: Found JSON markers but content is not valid JSON');
      }
    }

    // Priority 2: Look for markdown code blocks
    // This regex handles ```json, ```JSON, or just ```
    const markdownMatch = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (markdownMatch && markdownMatch[1]) {
      try {
        return JSON.parse(markdownMatch[1]);
      } catch {
        // Not valid JSON in block
      }
    }

    // Priority 3: Strip markdown fences if regex didn't catch them (e.g. malformed)
    s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Priority 4: Find JSON object by brace matching (fallback for mixed content)
    if (!s.startsWith('{') && s.includes('{') && s.includes('}')) {
      const first = s.indexOf('{');
      const last = s.lastIndexOf('}');
      if (first >= 0 && last > first) {
        s = s.slice(first, last + 1);
      }
    }
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }

  /**
   * Parses the raw string output from the planning LLM call.
   * Expects JSON output with `title`, `intent`, `plan` (description), and `todoList`.
   */
  async parsePlanningOutput(output: string): Promise<{
    title?: string;
    intent?: string;
    plan?: string;
    toolCalls?: ParsedToolCall[];
    thoughts?: string;
    todoList?: TodoItem[];
  }> {
    const result: {
      title?: string;
      intent?: string;
      plan?: string;
      toolCalls?: ParsedToolCall[];
      thoughts?: string;
      todoList?: TodoItem[];
    } = {};

    let processedOutput = output;
    const thoughtsList: string[] = [];

    // Extract thoughts using XmlMatcher
    const xmlMatcher = new XmlMatcher('think');
    const chunks = xmlMatcher.final(output);

    let nonThinkingContent = "";
    chunks.forEach(chunk => {
      if (chunk.matched) {
        thoughtsList.push(chunk.data.trim());
      } else {
        nonThinkingContent += chunk.data;
      }
    });

    if (thoughtsList.length > 0) {
      result.thoughts = thoughtsList.join("\n\n---\n\n");
    }

    processedOutput = nonThinkingContent;

    const obj = this.tryParseJson(processedOutput);

    if (obj && typeof obj === 'object') {
      if (typeof obj.title === 'string') result.title = obj.title;
      if (typeof obj.intent === 'string') result.intent = obj.intent;
      // Handle plan as string or array
      if (Array.isArray(obj.plan)) result.plan = obj.plan.map((p: any) => typeof p === 'string' ? p : JSON.stringify(p)).join('\n');
      else if (typeof obj.plan === 'string') result.plan = obj.plan;

      if (Array.isArray(obj.toolCalls)) {
        const normalized = normalizeToolCalls(obj.toolCalls);
        const validation = toolCallsSchema.safeParse(normalized);
        if (validation.success) {
          // Ensure callId is string (Zod allowed optional, but ParsedToolCall type needs it)
          result.toolCalls = validation.data.map(tc => ({ ...tc, callId: tc.callId! })) as ParsedToolCall[];
        }
        else result.toolCalls = [];
      }

      if (Array.isArray(obj.todoList)) {
        const validation = todoListSchema.safeParse(obj.todoList);
        if (validation.success) {
          result.todoList = (validation.data as any[]).map((item: any) => ({
            ...item,
            createdTimestamp: Date.now(),
            updatedTimestamp: Date.now()
          })) as TodoItem[];
        } else {
          Logger.warn(`OutputParser: TodoList validation failed: ${validation.error}`);
        }
      }
    } else {
      // Fallback for legacy section parsing or non-JSON output (Best effort)
      const titleMatch = processedOutput.match(/Title:\s*([\s\S]*?)(Intent:|Plan:|Tool Calls:|Todo List:|$)/i);
      if (titleMatch) result.title = titleMatch[1].trim();

      const intentMatch = processedOutput.match(/Intent:\s*([\s\S]*?)(Plan:|Tool Calls:|Todo List:|$)/i);
      if (intentMatch) result.intent = intentMatch[1].trim();

      const planMatch = processedOutput.match(/Plan:\s*([\s\S]*?)(Tool Calls:|Todo List:|$)/i);
      if (planMatch) result.plan = planMatch[1].trim();
    }

    return result;
  }

  /**
   * Parses the execution output (per todo item).
   */
  async parseExecutionOutput(output: string): Promise<ExecutionOutput> {
    const result: ExecutionOutput = {};
    let processedOutput = output;
    const thoughtsList: string[] = [];

    // Extract thoughts
    const xmlMatcher = new XmlMatcher('think');
    const chunks = xmlMatcher.final(output);

    let nonThinkingContent = "";
    chunks.forEach(chunk => {
      if (chunk.matched) {
        thoughtsList.push(chunk.data.trim());
      } else {
        nonThinkingContent += chunk.data;
      }
    });

    if (thoughtsList.length > 0) {
      result.thoughts = thoughtsList.join("\n\n---\n\n");
    }
    processedOutput = nonThinkingContent.trim();

    // Try to parse as JSON first
    const jsonContent = this.tryParseJson(processedOutput);

    if (jsonContent && typeof jsonContent === 'object') {
      // Check for toolCalls
      let rawToolCalls = [];
      if (Array.isArray(jsonContent.toolCalls)) {
        rawToolCalls = jsonContent.toolCalls;
      } else if (Array.isArray(jsonContent)) {
        rawToolCalls = jsonContent;
      }

      if (rawToolCalls.length > 0) {
        const normalized = normalizeToolCalls(rawToolCalls);
        const validation = toolCallsSchema.safeParse(normalized);
        if (validation.success) {
          result.toolCalls = validation.data.map(tc => ({ ...tc, callId: tc.callId! })) as ParsedToolCall[];
        }
      }
      // Check for nextStepDecision or updatedPlan in JSON
      if (jsonContent.nextStepDecision) result.nextStepDecision = jsonContent.nextStepDecision;
      if (jsonContent.updatedPlan) result.updatedPlan = jsonContent.updatedPlan;

      if (jsonContent.content) {
        result.content = jsonContent.content;
      } else {
        // If we successfully parsed a JSON object but it doesn't have 'content',
        // and the input was *mostly* this JSON, then content is likely empty or implicit.
        // However, if the JSON was extracted from a larger text, we might want the text.
        // tryParseJson logic handles extraction.
        // If the extracted JSON covers the whole string, content is null.
        // But if there was surrounding text, tryParseJson might have discarded it.

        // For now, if we got valid JSON structure for tools, we assume content is handled or empty.
        // But let's fallback to stringifying if needed or just empty.
        result.content = "";
      }
    } else {
      // No JSON found, treat everything as content
      result.content = processedOutput;
    }

    return result;
  }

  async parseSynthesisOutput(output: string): Promise<string> {
    return output.trim();
  }
}
