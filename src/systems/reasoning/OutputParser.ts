// src/systems/reasoning/OutputParser.ts
import * as z from 'zod'; // Import Zod
import { OutputParser as IOutputParser } from '@/core/interfaces';
import { ParsedToolCall, TodoItem, TodoItemStatus, ExecutionOutput } from '@/types';
import { Logger } from '@/utils/logger'; // Import the Logger class
import { XmlMatcher } from '@/utils/xml-matcher'; // Import XmlMatcher

// Define Zod schema for a single tool call
const parsedToolCallSchema = z.object({
  callId: z.string().min(1), // Ensure callId is a non-empty string
  toolName: z.string().min(1), // Ensure toolName is a non-empty string
  arguments: z.unknown(), // Arguments must exist but can be any type; specific tools validate further
});

// Define Zod schema for an array of tool calls
const toolCallsSchema = z.array(parsedToolCallSchema);

const todoItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  status: z.nativeEnum(TodoItemStatus).optional().default(TodoItemStatus.PENDING),
  dependencies: z.array(z.string()).optional()
});
const todoListSchema = z.array(todoItemSchema);

/**
 * Default implementation of the `OutputParser` interface.
 */
export class OutputParser implements IOutputParser {

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

    // Helper for JSON parsing
    const tryParseJson = (raw: string) => {
        if (!raw) return null;
        let s = raw.trim();
        s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
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
    };

    const obj = tryParseJson(processedOutput);

    if (obj && typeof obj === 'object') {
        if (typeof obj.title === 'string') result.title = obj.title;
        if (typeof obj.intent === 'string') result.intent = obj.intent;
        // Handle plan as string or array
        if (Array.isArray(obj.plan)) result.plan = obj.plan.map((p:any) => typeof p === 'string' ? p : JSON.stringify(p)).join('\n');
        else if (typeof obj.plan === 'string') result.plan = obj.plan;

        if (Array.isArray(obj.toolCalls)) {
            const validation = toolCallsSchema.safeParse(obj.toolCalls);
            if (validation.success) result.toolCalls = validation.data as ParsedToolCall[];
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
        // For the new requirement, JSON is strongly preferred/enforced by prompt.
        // We can reuse the legacy regexes for title/intent/plan if JSON fails.
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

      // Try to parse as JSON first (if the prompt enforces JSON for execution)
      // If the prompt asks for "text response" + "tool calls" as JSON block, handle that.
      // Assuming a JSON structure for tool calls or updated plan.

      // Look for a JSON block for tool calls
      const jsonBlockMatch = processedOutput.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch) {
          try {
              const jsonContent = JSON.parse(jsonBlockMatch[1]);

              // Check for toolCalls
              if (Array.isArray(jsonContent.toolCalls)) {
                  const validation = toolCallsSchema.safeParse(jsonContent.toolCalls);
                  if (validation.success) result.toolCalls = validation.data as ParsedToolCall[];
              } else if (Array.isArray(jsonContent)) {
                  // Sometimes tool calls are just the array
                  const validation = toolCallsSchema.safeParse(jsonContent);
                  if (validation.success) result.toolCalls = validation.data as ParsedToolCall[];
              }

              // Check for nextStepDecision or updatedPlan in JSON
              if (jsonContent.nextStepDecision) result.nextStepDecision = jsonContent.nextStepDecision;
              if (jsonContent.updatedPlan) result.updatedPlan = jsonContent.updatedPlan;

              // Remove the JSON block from content if it was just metadata/tools
              // But if the whole output is JSON, content is empty?
              // Let's assume content is the text *outside* the JSON block, or a 'content' field in JSON.
              if (jsonContent.content) {
                  result.content = jsonContent.content;
              } else {
                  // If content was outside, we need to strip the JSON block
                  result.content = processedOutput.replace(jsonBlockMatch[0], '').trim();
              }
          } catch (e) {
              Logger.warn(`Failed to parse JSON block in execution output: ${e}`);
              result.content = processedOutput; // Fallback
          }
      } else {
          // No JSON block, treat everything as content
          result.content = processedOutput;
      }

      return result;
  }

  async parseSynthesisOutput(output: string): Promise<string> {
    return output.trim();
  }
}
