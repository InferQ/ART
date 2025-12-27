/**
 * @module systems/reasoning/SystemPromptResolver
 *
 * This module provides implementation for resolving and merging layered system prompts
 * across different precedence levels (base, instance, thread, call) in the ART framework.
 *
 * Key features:
 * - Multi-level prompt resolution with precedence hierarchy
 * - Tag-based prompt preset system with variable interpolation
 * - Append/prepend merge strategies for combining prompts
 * - Template variable substitution with fragment support
 *
 * @see ISystemPromptResolver for interface definition
 * @see SystemPromptOverride for override structure
 * @see SystemPromptsRegistry for preset management
 */

import { SystemPromptResolver as ISystemPromptResolver } from '@/core/interfaces';
import { SystemPromptsRegistry, SystemPromptOverride, SystemPromptMergeStrategy } from '@/types';
import { Logger } from '@/utils/logger';

/**
 * Helper function to apply merge strategy when combining system prompt strings.
 *
 * @param base - The base system prompt string to modify.
 * @param addition - The new content to add to base prompt.
 * @param strategy - The merge strategy to apply ('append' or 'prepend').
 * @returns The combined system prompt string.
 *
 * @private
 */
function applyStrategy(
  base: string,
  addition: string,
  strategy: SystemPromptMergeStrategy | undefined
): string {
  const s = strategy || 'append';
  switch (s) {
    case 'prepend':
      return `${addition}\n\n${base}`;
    case 'append':
    default:
      return `${base}\n\n${addition}`;
  }
}

/**
 * Normalizes various input types into a standard SystemPromptOverride object.
 *
 * @param input - Either a string (freeform content) or a SystemPromptOverride object.
 * @returns A normalized SystemPromptOverride object, or undefined if input is falsy.
 *
 * @private
 */
function normalizeOverride(
  input?: string | SystemPromptOverride
): SystemPromptOverride | undefined {
  if (!input) return undefined;
  if (typeof input === 'string') {
    return { content: input, strategy: 'append' };
  }
  return input;
}

/**
 * Default implementation of ISystemPromptResolver interface.
 *
 * @remarks
 * This class manages the resolution and merging of system prompts across multiple levels:
 * 1. Base prompt - The fundamental system instruction from agent persona or framework defaults
 * 2. Instance-level override - Global configuration applied to all threads in an ART instance
 * 3. Thread-level override - Configuration specific to a single conversation thread
 * 4. Call-level override - Configuration for a specific LLM call
 *
 * Each level can provide either:
 * - A preset tag that references a template from SystemPromptsRegistry
 * - Freeform content that is directly used
 *
 * The resolution process:
 * 1. Starts with the base prompt
 * 2. Applies instance-level override (if provided)
 * 3. Applies thread-level override (if provided)
 * 4. Applies call-level override (if provided)
 *
 * At each level, the override is:
 * - Rendered from a template if a tag is specified (with variable substitution)
 * - Used directly if freeform content is provided
 * - Applied using the specified merge strategy (append or prepend)
 *
 * Template rendering supports:
 * - Simple variable interpolation: {{variableName}}
 * - Prompt fragment references: {{fragment:name}}
 *
 * @example
 * ```typescript
 * const resolver = new SystemPromptResolver({
 *   specs: {
 *     'default': {
 *       template: 'You are {{name}}. Be {{tone}}.',
 *       defaultVariables: { name: 'AI Assistant', tone: 'helpful' }
 *     },
 *     'expert': {
 *       template: 'You are an expert in {{topic}}.',
 *       mergeStrategy: 'prepend'
 *     }
 *   },
 *   defaultTag: 'default'
 * });
 *
 * const result = await resolver.resolve({
 *   base: 'System: You are helpful.',
 *   instance: { tag: 'expert', variables: { topic: 'physics' } },
 *   thread: { tag: 'default', strategy: 'append' }
 * }, 'trace-123');
 * // Result combines: base + expert (prepended) + default (appended)
 * ```
 *
 * @class SystemPromptResolver
 * @implements ISystemPromptResolver
 */
export class SystemPromptResolver implements ISystemPromptResolver {
  /**
   * Optional registry of system prompt presets (templates) that can be referenced by tag.
   * @private
   * @type {SystemPromptsRegistry | undefined}
   */
  private readonly registry?: SystemPromptsRegistry;

  /**
   * Creates a new SystemPromptResolver instance.
   *
   * @param registry - Optional registry of prompt preset templates indexed by tag name.
   *                    If provided, overrides can reference templates by tag name.
   */
  constructor(registry?: SystemPromptsRegistry) {
    this.registry = registry;
  }

  /**
   * Resolves the final system prompt by applying overrides in precedence order.
   *
   * @remarks
   * The resolution process follows this precedence hierarchy (highest to lowest):
   * 1. Call-level override (immediate, most specific)
   * 2. Thread-level override (conversation-specific)
   * 3. Instance-level override (instance-wide)
   * 4. Base prompt (default)
   *
   * For each override level:
   * - If a tag is provided and exists in registry: Render the template
   * - If freeform content is provided: Use it directly
   * - Apply using the specified merge strategy (defaults to 'append')
   * - Variables for template rendering come from defaultVariables merged with provided variables
   *
   * Template variable substitution:
   * - Variables are wrapped in double braces: {{variableName}}
   * - Supports fragment references: {{fragment:name}} (for PromptManager integration)
   * - Missing variables render as empty strings
   *
   * Merge strategies:
   * - 'append': Adds content to the end of existing prompt (default)
   * - 'prepend': Adds content to the beginning of existing prompt
   *
   * Note: 'replace' strategy is intentionally unsupported to prevent custom prompts
   * from overriding framework-required structural contracts.
   *
   * @param input - Object containing the base prompt and optional overrides at each level.
   *                - base (string): The fundamental system prompt (required)
   *                - instance (string | SystemPromptOverride): Instance-level override
   *                - thread (string | SystemPromptOverride): Thread-level override
   *                - call (string | SystemPromptOverride): Call-level override
   * @param traceId - Optional trace identifier for logging and debugging purposes.
   *
   * @returns A promise resolving to the final, resolved system prompt string.
   *
   * @example
   * ```typescript
   * const result = await resolver.resolve({
   *   base: 'You are a helpful AI.',
   *   instance: {
   *     tag: 'technical',
   *     variables: { specialization: 'web development' }
   *   },
   *   thread: { content: 'Be concise in your responses.' }
   * }, 'trace-123');
   * ```
   */
  async resolve(
    input: {
      base: string;
      instance?: string | import('@/types').SystemPromptOverride;
      thread?: string | import('@/types').SystemPromptOverride;
      call?: string | import('@/types').SystemPromptOverride;
    },
    traceId?: string
  ): Promise<string> {
    let finalPrompt = input.base;

    // Process overrides in precedence order: instance -> thread -> call
    const levels: Array<{ src: string; ov?: import('@/types').SystemPromptOverride }> = [
      { src: 'instance', ov: normalizeOverride(input.instance) },
      { src: 'thread', ov: normalizeOverride(input.thread) },
      { src: 'call', ov: normalizeOverride(input.call) },
    ];

    for (const lvl of levels) {
      const ov = lvl.ov;
      if (!ov) continue;

      let rendered = '';

      // Tag-based preset rendering
      if (ov.tag && this.registry?.specs?.[ov.tag]) {
        const spec = this.registry.specs[ov.tag];
        // Merge default variables with provided variables (provided take precedence)
        const variables = { ...(spec.defaultVariables || {}), ...(ov.variables || {}) };
        rendered = this.renderTemplate(spec.template, variables);
        // Use override's strategy if specified, otherwise use spec's default, otherwise 'append'
        const strategy = ov.strategy || spec.mergeStrategy || 'append';
        finalPrompt = applyStrategy(finalPrompt, rendered, strategy);
        Logger.debug?.(
          `[${traceId || 'no-trace'}] Applied system prompt tag '${ov.tag}' with strategy '${strategy}'.`
        );
      }
      // Freeform content application
      else if (ov.content) {
        rendered = ov.content;
        const strategy = ov.strategy || 'append';
        finalPrompt = applyStrategy(finalPrompt, rendered, strategy);
        Logger.debug?.(
          `[${traceId || 'no-trace'}] Applied freeform system prompt with strategy '${strategy}'.`
        );
      }
      // No-op if neither tag nor content provided
    }

    return finalPrompt;
  }

  /**
   * Renders a template string by replacing variable placeholders with provided values.
   *
   * @remarks
   * Supported placeholder format: {{variableName}}
   * - Variable names are trimmed of whitespace
   * - Missing variables render as empty strings
   * - Values are converted to strings using String()
   *
   * This simple templating system supports basic variable interpolation.
   * It does not support complex features like loops, conditionals, or nested objects.
   *
   * @param template - The template string containing variable placeholders.
   * @param variables - Record of variable names to their string or string-convertible values.
   *
   * @returns The rendered string with all placeholders substituted.
   *
   * @private
   * @example
   * ```typescript
   * const rendered = renderTemplate(
   *   'Hello {{name}}, you are {{age}} years old.',
   *   { name: 'Alice', age: 30 }
   * );
   * // Result: 'Hello Alice, you are 30 years old.'
   * ```
   */
  private renderTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{\s*([^}:]+)\s*\}\}/g, (_m, key) => {
      const v = variables[String(key).trim()];
      return v !== undefined ? String(v) : '';
    });
  }
}
