/**
 * @module systems/reasoning/OutputParser
 *
 * This module provides implementation for parsing structured output from LLM responses
 * in the ART framework. It handles planning, execution, and synthesis outputs.
 *
 * Key features:
 * - Multi-format parsing support (JSON with markers, markdown code blocks, brace matching)
 * - XML tag extraction for thoughts (e.g., <think> tags)
 * - Zod schema validation for structured data
 * - Robust error handling and fallback parsing
 *
 * @see IOutputParser for interface definition
 * @see ParsedToolCall for parsed tool call structure
 * @see TodoItem for parsed todo item structure
 * @see ExecutionOutput for execution output structure
 */

import * as z from 'zod';
import { OutputParser as IOutputParser } from '@/core/interfaces';
import { ParsedToolCall, TodoItem, TodoItemStatus, ExecutionOutput } from '@/types';
import { Logger } from '@/utils/logger';
import { XmlMatcher } from '@/utils/xml-matcher';

/**
 * Zod schema for validating a single parsed tool call.
 *
 * @private
 */
const parsedToolCallSchema = z.object({
  callId: z.string().optional(),
  toolName: z.string().min(1),
  arguments: z.unknown(),
});

/**
 * Zod schema for validating an array of parsed tool calls.
 *
 * @private
 */
const toolCallsSchema = z.array(parsedToolCallSchema);

/**
 * Zod schema for validating a single todo item.
 *
 * @private
 */
const todoItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  status: z.nativeEnum(TodoItemStatus).optional().default(TodoItemStatus.PENDING),
  dependencies: z.array(z.string()).optional(),
  // TAEF (Tool-Aware Execution Framework) fields
  stepType: z.enum(['tool', 'reasoning']).optional(),
  requiredTools: z.array(z.string()).optional(),
  expectedOutcome: z.string().optional(),
  toolValidationMode: z.enum(['strict', 'advisory']).optional(),
});

/**
 * Zod schema for validating an array of todo items.
 *
 * @private
 */
const todoListSchema = z.array(todoItemSchema);

/**
 * Normalizes raw tool calls from LLM output to ensure consistent structure.
 *
 * Handles differences in property naming conventions across providers and generates
 * call IDs if not present.
 *
 * @param rawCalls - Array of tool call objects from LLM output.
 * @returns Array of normalized ParsedToolCall objects.
 *
 * @private
 */
const normalizeToolCalls = (rawCalls: any[]) => {
  return rawCalls.map((tc: any) => ({
    ...tc,
    // Map 'parameters' to 'arguments' if needed (some providers use different field names)
    arguments: tc.arguments ?? tc.parameters,
    // Generate random callId if missing
    callId: tc.callId ?? `call_${Math.random().toString(36).slice(2, 11)}`,
  }));
};

/**
 * Default implementation of the IOutputParser interface.
 *
 * @remarks
 * This class provides robust parsing capabilities for structured output from LLMs.
 * It is designed to handle variations in LLM output formatting across different providers
 * and models. The parser uses a multi-tier strategy for extracting structured data:
 *
 * 1. XML Tag Extraction: Extracts content from XML-like tags (e.g., <think>)
 *    using the XmlMatcher utility. This separates "thoughts" or "reasoning" from
 *    the main structured output.
 *
 * 2. JSON Extraction: Attempts multiple strategies to find and parse JSON:
 *    - Priority 1: Explicit JSON markers (---JSON_OUTPUT_START--- ... ---JSON_OUTPUT_END---)
 *    - Priority 2: Markdown code blocks (```json ... ``` or ``` ... ```)
 *    - Priority 3: Strip markdown fences and attempt direct parsing
 *    - Priority 4: Find JSON object by brace matching for mixed content
 *
 * 3. Schema Validation: Uses Zod schemas to validate parsed structures:
 *    - ParsedToolCall validation ensures tool calls have required fields
 *    - TodoItem validation ensures todo items conform to expected structure
 *
 * 4. Fallback Parsing: If JSON extraction fails, attempts to extract information
 *    from labeled sections (e.g., "Title: ...", "Intent: ...", "Plan: ...")
 *
 * The parser is resilient to:
 * - Malformed or incomplete XML tags
 * - Missing or malformed JSON
 * - Mixed content (text + JSON)
 * - Provider-specific formatting differences
 *
 * @class OutputParser
 * @implements IOutputParser
 */
export class OutputParser implements IOutputParser {
  /**
   * Helper method for parsing JSON from a raw string with multiple fallback strategies.
   *
   * @remarks
   * This method implements a tiered approach to finding and parsing JSON:
   *
   * 1. **Explicit Markers**: Looks for ---JSON_OUTPUT_START--- and ---JSON_OUTPUT_END---
   *    markers. This is the most reliable method as markers are unambiguous.
   *
   * 2. **Markdown Code Blocks**: Looks for fenced code blocks with ```json, ```JSON,
   *    or just ``` delimiters. Handles case-insensitive matching.
   *
   * 3. **Fence Stripping**: If regex didn't catch markdown blocks (e.g., malformed),
   *    strips leading ``` and trailing ``` markers and attempts parsing.
   *
   * 4. **Brace Matching**: As a fallback for mixed content, finds the first
   *    { and last } characters and extracts the content between them.
   *
   * The method is resilient to:
   * - Non-JSON content outside of delimiters
   * - Malformed JSON (returns null)
   * - Circular references (though less likely in LLM output)
   * - Non-serializable values (functions, symbols)
   *
   * @param raw - The raw string that may contain JSON.
   * @returns The parsed JavaScript object if valid JSON is found, null otherwise.
   *
   * @private
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
    const markdownMatch = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (markdownMatch && markdownMatch[1]) {
      try {
        return JSON.parse(markdownMatch[1]);
      } catch {
        // Not valid JSON in block
      }
    }

    // Priority 3: Strip markdown fences if regex didn't catch them (e.g. malformed)
    s = s
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

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
   *
   * @remarks
   * The planning phase generates structured output including:
   * - title: A concise thread title (<= 10 words)
   * - intent: A summary of the user's goal
   * - plan: A human-readable description of the approach
   * - toolCalls: Structured tool call requests
   * - todoList: A list of TodoItem objects representing the execution plan
   * - thoughts: Content extracted from <think> XML tags
   *
   * This method:
   * 1. Extracts thoughts from <think> tags using XmlMatcher
   * 2. Attempts to parse the remaining content as JSON
   * 3. Validates toolCalls against Zod schema
   * 4. Validates todoList against Zod schema
   * 5. Falls back to section-based parsing if JSON fails
   *
   * The fallback section-based parsing looks for labeled sections like:
   * "Title: ...", "Intent: ...", "Plan: ..." using regex patterns.
   *
   * @param output - The raw string response from the planning LLM.
   *
   * @returns A promise resolving to an object containing:
   *          - title (string, optional): Concise thread title
   *          - intent (string, optional): User's goal summary
   *          - plan (string, optional): Human-readable plan description
   *          - toolCalls (ParsedToolCall[], optional): Parsed tool call requests
   *          - todoList (TodoItem[], optional): List of execution steps
   *          - thoughts (string, optional): Extracted from <think> tags
   *
   * @throws Never throws; errors are handled gracefully with empty results.
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

    let nonThinkingContent = '';

    // Issue #4 fix: Detect truncation - if we have matched content but no closing tag exists
    const hasOpenTag = output.includes('<think>');
    const hasCloseTag = output.includes('</think>');
    let hasTruncatedThinking = false;

    chunks.forEach((chunk) => {
      if (chunk.matched) {
        // Check for potential truncation: matched content at end without closing tag
        if (hasOpenTag && !hasCloseTag) {
          hasTruncatedThinking = true;
          // Treat as content, not thought - the response was truncated mid-reasoning
          nonThinkingContent += chunk.data;
        } else {
          thoughtsList.push(chunk.data.trim());
        }
      } else {
        nonThinkingContent += chunk.data;
      }
    });

    if (hasTruncatedThinking) {
      Logger.warn('OutputParser: Detected truncated thinking block in planning output, treating as content');
    }

    if (thoughtsList.length > 0) {
      result.thoughts = thoughtsList.join('\n\n---\n\n');
    }

    processedOutput = nonThinkingContent;

    const obj = this.tryParseJson(processedOutput);

    if (obj && typeof obj === 'object') {
      if (typeof obj.title === 'string') result.title = obj.title;
      if (typeof obj.intent === 'string') result.intent = obj.intent;
      // Handle plan as string or array
      if (Array.isArray(obj.plan))
        result.plan = obj.plan
          .map((p: any) => (typeof p === 'string' ? p : JSON.stringify(p)))
          .join('\n');
      else if (typeof obj.plan === 'string') result.plan = obj.plan;

      if (Array.isArray(obj.toolCalls)) {
        const normalized = normalizeToolCalls(obj.toolCalls);
        const validation = toolCallsSchema.safeParse(normalized);
        if (validation.success) {
          result.toolCalls = validation.data.map((tc) => ({
            ...tc,
            callId: tc.callId!,
          })) as ParsedToolCall[];
        } else result.toolCalls = [];
      }

      if (Array.isArray(obj.todoList)) {
        const validation = todoListSchema.safeParse(obj.todoList);
        if (validation.success) {
          result.todoList = (validation.data as any[]).map((item: any) => ({
            ...item,
            createdTimestamp: Date.now(),
            updatedTimestamp: Date.now(),
          })) as TodoItem[];
        } else {
          Logger.warn(`OutputParser: TodoList validation failed: ${validation.error}`);
        }
      }
    } else {
      // Fallback for legacy section parsing or non-JSON output (Best effort)
      const titleMatch = processedOutput.match(
        /Title:\s*([\s\S]*?)(Intent:|Plan:|Tool Calls:|Todo List:|$)/i
      );
      if (titleMatch) result.title = titleMatch[1].trim();

      const intentMatch = processedOutput.match(
        /Intent:\s*([\s\S]*?)(Plan:|Tool Calls:|Todo List:|$)/i
      );
      if (intentMatch) result.intent = intentMatch[1].trim();

      const planMatch = processedOutput.match(/Plan:\s*([\s\S]*?)(Tool Calls:|Todo List:|$)/i);
      if (planMatch) result.plan = planMatch[1].trim();
    }

    return result;
  }

  /**
   * Parses the raw string output from an execution LLM call (per todo item).
   *
   * @remarks
   * The execution phase generates output that may include:
   * - thoughts: Reasoning extracted from <think> tags
   * - toolCalls: Structured tool call requests for the current step
   * - nextStepDecision: Decision on how to proceed (continue, wait, complete_item, update_plan)
   * - updatedPlan: Modifications to the execution plan
   * - content: Freeform text response
   *
   * This method:
   * 1. Extracts thoughts from <think> tags using XmlMatcher
   * 2. Attempts to parse the remaining content as JSON
   * 3. Validates toolCalls against Zod schema
   * 4. Extracts structured fields if JSON parsing succeeds
   * 5. Falls back to treating everything as freeform content if JSON fails
   *
   * The nextStepDecision values guide the TAEF execution:
   * - 'continue': Proceed with next iteration
   * - 'wait': Pause execution (rare in execution phase)
   * - 'complete_item': Mark current todo item as complete
   * - 'update_plan': Modify the execution plan
   *
   * @param output - The raw string response from the execution LLM.
   *
   * @returns A promise resolving to an ExecutionOutput object containing:
   *          - thoughts (string, optional): Extracted from <think> tags
   *          - toolCalls (ParsedToolCall[], optional): Parsed tool call requests
   *          - nextStepDecision (string, optional): How to proceed
   *          - updatedPlan (object, optional): Plan modifications
   *          - content (string, optional): Freeform text response
   *
   * @throws Never throws; errors are handled gracefully with empty results.
   */
  async parseExecutionOutput(output: string): Promise<ExecutionOutput> {
    const result: ExecutionOutput = {};
    let processedOutput = output;
    const thoughtsList: string[] = [];

    // Extract thoughts
    const xmlMatcher = new XmlMatcher('think');
    const chunks = xmlMatcher.final(output);

    let nonThinkingContent = '';

    // Issue #4 fix: Detect truncation - if we have matched content but no closing tag exists
    const hasOpenTag = output.includes('<think>');
    const hasCloseTag = output.includes('</think>');
    let hasTruncatedThinking = false;

    chunks.forEach((chunk) => {
      if (chunk.matched) {
        // Check for potential truncation: matched content at end without closing tag
        if (hasOpenTag && !hasCloseTag) {
          hasTruncatedThinking = true;
          // Treat as content, not thought - the response was truncated mid-reasoning
          nonThinkingContent += chunk.data;
        } else {
          thoughtsList.push(chunk.data.trim());
        }
      } else {
        nonThinkingContent += chunk.data;
      }
    });

    if (hasTruncatedThinking) {
      Logger.warn('OutputParser: Detected truncated thinking block in execution output, treating as content');
    }

    if (thoughtsList.length > 0) {
      result.thoughts = thoughtsList.join('\n\n---\n\n');
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
        // If the entire object is an array, treat it as tool calls
        rawToolCalls = jsonContent;
      }

      if (rawToolCalls.length > 0) {
        const normalized = normalizeToolCalls(rawToolCalls);
        const validation = toolCallsSchema.safeParse(normalized);
        if (validation.success) {
          result.toolCalls = validation.data.map((tc) => ({
            ...tc,
            callId: tc.callId!,
          })) as ParsedToolCall[];
        }
      }

      // Check for nextStepDecision or updatedPlan in JSON
      if (jsonContent.nextStepDecision) result.nextStepDecision = jsonContent.nextStepDecision;
      if (jsonContent.updatedPlan) result.updatedPlan = jsonContent.updatedPlan;

      if (jsonContent.content) {
        result.content = jsonContent.content;
      } else {
        // If we successfully parsed a JSON object but it doesn't have 'content',
        // and input was *mostly* this JSON, then content is likely empty or implicit.
        result.content = '';
      }
    } else {
      // No JSON found, treat everything as content
      result.content = processedOutput;
    }

    return result;
  }

  /**
   * Parses the raw string output from the synthesis LLM call.
   *
   * @remarks
   * The synthesis phase generates the final, user-facing response.
   * This method typically just trims the output, as synthesis output
   * is usually freeform text without structured components.
   *
   * Future enhancements might include:
   * - Removing extraneous tags or markers
   * - Formatting cleanup
   * - Extracting specific sections if needed
   *
   * @param output - The raw string response from the synthesis LLM.
   *
   * @returns A promise resolving to the cleaned, final response string.
   *
   * @throws Never throws; always returns at least an empty string.
   */
  async parseSynthesisOutput(output: string): Promise<string> {
    return output.trim();
  }
}
