/**
 * @module types/hitl-types
 *
 * This module defines the types and contracts for Human-in-the-Loop (HITL) functionality
 * in the ART framework. It establishes a clear contract for blocking tools to declare
 * expected feedback types and for the framework to programmatically handle user responses.
 *
 * Key Design Principle:
 * User feedback IS the tool result. When a user provides feedback (approval, text input,
 * selection, etc.), the framework programmatically marks the tool call as SUCCESS with
 * the feedback as the output. The LLM never needs to re-invoke the tool.
 */

// ============================================================================
// TOOL EXECUTION MODES (Categories)
// ============================================================================

/**
 * Defines the three categories of tools in the ART framework.
 *
 * @remarks
 * Each category has different execution semantics and framework handling:
 *
 * - `functional`: Regular tools that execute synchronously and return results immediately.
 *   Examples: webSearch, calculator, fileRead, apiCall
 *
 * - `blocking`: Tools that require human input to complete. They return 'suspended' status
 *   initially, and the framework waits for user feedback. The user's feedback becomes
 *   the tool's result - no re-execution needed.
 *   Examples: confirmAction, getUserInput, selectOption, requestApproval
 *
 * - `display`: Tools for generative UI that render content without producing a traditional
 *   "result". They complete immediately but their output is visual/interactive.
 *   Examples: renderChart, showModal, displayProgress, generateUI
 */
export type ToolExecutionMode = 'functional' | 'blocking' | 'display';

// ============================================================================
// HITL FEEDBACK INPUT TYPES
// ============================================================================

/**
 * Defines the type of user input expected for HITL feedback.
 *
 * @remarks
 * This enables blocking tools to declare what kind of UI the application
 * should render to collect user feedback.
 */
export type HITLInputType =
  | 'boolean'       // Simple approve/reject toggle
  | 'text'          // Free-form text input
  | 'select'        // Single selection from options
  | 'multiselect'   // Multiple selections from options
  | 'number'        // Numeric input with optional min/max
  | 'date'          // Date picker
  | 'datetime'      // Date and time picker
  | 'file'          // File upload reference
  | 'confirm'       // Confirmation with optional message modification
  | 'custom';       // Application-defined schema (uses customSchema field)

// ============================================================================
// HITL FEEDBACK SCHEMA (Tool Declaration)
// ============================================================================

/**
 * Schema for what kind of feedback a blocking tool expects.
 *
 * @remarks
 * Tools declare this schema to inform the UI layer what input to collect.
 * The framework uses this to validate feedback and construct the tool result.
 *
 * @example
 * // Simple confirmation
 * {
 *   inputType: 'confirm',
 *   prompt: 'Are you sure you want to delete this file?',
 *   confirmLabel: 'Delete',
 *   cancelLabel: 'Keep'
 * }
 *
 * @example
 * // Selection from options
 * {
 *   inputType: 'select',
 *   prompt: 'Which deployment environment should we use?',
 *   options: [
 *     { value: 'staging', label: 'Staging', description: 'Test environment' },
 *     { value: 'production', label: 'Production', description: 'Live environment' }
 *   ],
 *   required: true
 * }
 *
 * @example
 * // Text input with validation
 * {
 *   inputType: 'text',
 *   prompt: 'Please provide the API key for the service:',
 *   placeholder: 'sk-...',
 *   validation: {
 *     required: true,
 *     pattern: '^sk-[a-zA-Z0-9]{32,}$',
 *     patternMessage: 'Must be a valid API key starting with sk-'
 *   }
 * }
 */
export interface HITLFeedbackSchema {
  /**
   * The type of input expected from the user.
   */
  inputType: HITLInputType;

  /**
   * Human-readable prompt shown to the user.
   * This should clearly explain what input is needed and why.
   */
  prompt: string;

  /**
   * Optional title for the feedback dialog/section.
   */
  title?: string;

  /**
   * For select/multiselect: available options to choose from.
   */
  options?: HITLSelectOption[];

  /**
   * Validation constraints for the input.
   */
  validation?: HITLInputValidation;

  /**
   * Optional default value to pre-fill.
   */
  defaultValue?: unknown;

  /**
   * Placeholder text for text/number inputs.
   */
  placeholder?: string;

  /**
   * For confirm type: custom label for the approve button.
   * @default 'Approve'
   */
  confirmLabel?: string;

  /**
   * For confirm type: custom label for the reject button.
   * @default 'Reject'
   */
  cancelLabel?: string;

  /**
   * If true, user can modify the original tool arguments before submitting.
   * The modified args are returned in the feedback.
   * @default false
   */
  allowModifyArgs?: boolean;

  /**
   * For custom inputType: application-defined JSON schema for the input.
   */
  customSchema?: Record<string, unknown>;

  /**
   * Optional hint text shown below the input.
   */
  hint?: string;

  /**
   * Whether this is a sensitive input (e.g., password, API key).
   * UI should mask the input if true.
   * @default false
   */
  sensitive?: boolean;
}

/**
 * An option for select/multiselect input types.
 */
export interface HITLSelectOption {
  /**
   * The value returned when this option is selected.
   */
  value: string | number | boolean;

  /**
   * Human-readable label displayed to the user.
   */
  label: string;

  /**
   * Optional description providing more context about this option.
   */
  description?: string;

  /**
   * Whether this option is disabled (shown but not selectable).
   * @default false
   */
  disabled?: boolean;

  /**
   * Optional icon identifier for UI rendering.
   */
  icon?: string;
}

/**
 * Validation constraints for HITL input.
 */
export interface HITLInputValidation {
  /**
   * Whether the input is required (non-empty).
   * @default false
   */
  required?: boolean;

  /**
   * For text: minimum character length.
   */
  minLength?: number;

  /**
   * For text: maximum character length.
   */
  maxLength?: number;

  /**
   * For number: minimum value.
   */
  min?: number;

  /**
   * For number: maximum value.
   */
  max?: number;

  /**
   * For text: regex pattern the input must match.
   */
  pattern?: string;

  /**
   * Custom error message when pattern validation fails.
   */
  patternMessage?: string;

  /**
   * For multiselect: minimum number of selections required.
   */
  minSelections?: number;

  /**
   * For multiselect: maximum number of selections allowed.
   */
  maxSelections?: number;
}

// ============================================================================
// HITL FEEDBACK (User Response)
// ============================================================================

/**
 * The standardized feedback structure returned by the user.
 *
 * @remarks
 * This is the canonical format for user feedback. The framework converts this
 * into a successful tool result when resuming execution. The LLM sees this
 * as a normal tool completion.
 */
export interface HITLFeedback {
  /**
   * Whether the action was approved/confirmed.
   * For non-boolean input types, this is true if the user submitted
   * (vs. cancelled/dismissed).
   */
  approved: boolean;

  /**
   * The user's input value, type depends on the inputType:
   * - boolean: true/false
   * - text: string
   * - number: number
   * - select: the selected option's value
   * - multiselect: array of selected values
   * - date/datetime: ISO string
   * - file: file reference object
   * - confirm: undefined (use approved field)
   * - custom: matches customSchema
   */
  value?: unknown;

  /**
   * For text input type, the raw text entered.
   * @deprecated Use `value` instead
   */
  textInput?: string;

  /**
   * For select/multiselect, the selected value(s).
   * @deprecated Use `value` instead
   */
  selectedValues?: (string | number | boolean)[];

  /**
   * Modified tool arguments if allowModifyArgs was true and user modified them.
   */
  modifiedArgs?: Record<string, unknown>;

  /**
   * Optional reason/comment provided by the user.
   * Particularly useful for rejections to explain why.
   */
  reason?: string;

  /**
   * Timestamp when feedback was provided.
   */
  timestamp: number;

  /**
   * Optional metadata about the feedback context.
   */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// BLOCKING TOOL CONFIGURATION
// ============================================================================

/**
 * Configuration for blocking tools in the ToolSchema.
 *
 * @remarks
 * This is added to ToolSchema when executionMode is 'blocking'.
 * It defines how the tool interacts with the HITL system.
 */
export interface BlockingToolConfig {
  /**
   * The schema for feedback this tool expects.
   * If not provided, defaults to a simple confirm schema.
   */
  feedbackSchema?: HITLFeedbackSchema;

  /**
   * Message to show in the approval dialog.
   * Can include {{variable}} placeholders that will be replaced
   * with values from the tool's input arguments.
   */
  approvalPrompt?: string;

  /**
   * Whether the tool auto-completes successfully when approved.
   * If true (default), approval = success with feedback as output.
   * If false, the tool's execute() is called again with hitlContext.
   * @default true
   */
  completesOnApproval?: boolean;

  /**
   * Whether rejection allows retry with modified arguments.
   * If true, rejection doesn't fail the step but allows re-planning.
   * @default true
   */
  allowRetryOnReject?: boolean;

  /**
   * Timeout in milliseconds for user response.
   * If exceeded, the tool fails with a timeout error.
   * @default undefined (no timeout)
   */
  timeoutMs?: number;

  /**
   * Category of the blocking action for UI grouping.
   * Examples: 'destructive', 'financial', 'external', 'sensitive'
   */
  category?: string;

  /**
   * Risk level for UI styling/warnings.
   */
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// DISPLAY TOOL CONFIGURATION (Future)
// ============================================================================

/**
 * Configuration for display tools in the ToolSchema.
 *
 * @remarks
 * This is added to ToolSchema when executionMode is 'display'.
 * Display tools render UI without producing traditional results.
 */
export interface DisplayToolConfig {
  /**
   * The type of UI component this tool renders.
   */
  componentType?: string;

  /**
   * Whether the display persists or is ephemeral.
   * @default 'persistent'
   */
  displayMode?: 'persistent' | 'ephemeral' | 'modal';

  /**
   * Whether this display supports user interaction.
   * If true, interactions may generate new messages.
   * @default false
   */
  interactive?: boolean;

  /**
   * Schema for the data this display component expects.
   */
  dataSchema?: Record<string, unknown>;
}

// ============================================================================
// HITL EXECUTION CONTEXT EXTENSION
// ============================================================================

/**
 * HITL-specific context passed to tools via ExecutionContext.
 *
 * @remarks
 * This enables blocking tools to know if they're being called
 * for initial suspension vs. post-approval execution.
 */
export interface HITLContext {
  /**
   * True if this execution is resuming from a previous suspension.
   */
  isResuming: boolean;

  /**
   * True if the user approved the action.
   * Only meaningful when isResuming is true.
   */
  wasApproved?: boolean;

  /**
   * The user's feedback if resuming from approval.
   */
  feedback?: HITLFeedback;

  /**
   * The original suspension ID being resumed.
   */
  suspensionId?: string;

  /**
   * The original tool arguments that were suspended.
   */
  originalArgs?: Record<string, unknown>;
}

// ============================================================================
// TOOL RESULT EXTENSIONS FOR BLOCKING TOOLS
// ============================================================================

/**
 * Extended ToolResult for blocking tools that return 'suspended' status.
 *
 * @remarks
 * When a blocking tool returns 'suspended', it should include the
 * feedbackSchema so the UI knows what to render.
 */
export interface BlockingToolSuspendedResult {
  status: 'suspended';
  callId: string;
  toolName: string;

  /**
   * The feedback schema for the UI to render.
   * If not provided, the framework uses the tool's schema config.
   */
  feedbackSchema?: HITLFeedbackSchema;

  /**
   * Display content to show in the suspension UI.
   */
  output?: {
    message: string;
    details?: Record<string, unknown>;
    previewData?: unknown;
  };

  /**
   * Metadata including the suspensionId.
   */
  metadata?: {
    suspensionId: string;
    [key: string]: unknown;
  };
}

/**
 * The successful result created by the framework when user provides feedback.
 *
 * @remarks
 * This is what the LLM sees after resumption - a normal successful tool result.
 * The content field contains a description, and output contains the feedback.
 */
export interface BlockingToolCompletedResult {
  status: 'success';
  callId: string;
  toolName: string;

  /**
   * The user's feedback structured as the tool output.
   */
  output: {
    /**
     * Human-readable summary of what happened.
     */
    message: string;

    /**
     * The feedback provided by the user.
     */
    feedback: HITLFeedback;

    /**
     * Whether the user approved the action.
     */
    approved: boolean;

    /**
     * The actual value provided (varies by input type).
     */
    value?: unknown;
  };

  /**
   * Metadata about the completion.
   */
  metadata?: {
    /**
     * The original suspension ID that was resumed.
     */
    suspensionId?: string;

    /**
     * Timestamp of when feedback was received.
     */
    completedAt: number;

    /**
     * Duration from suspension to completion in ms.
     */
    waitDurationMs?: number;

    [key: string]: unknown;
  };
}

// ============================================================================
// UTILITY TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a ToolResult is a suspended blocking tool result.
 */
export function isBlockingSuspendedResult(
  result: { status: string }
): result is BlockingToolSuspendedResult {
  return result.status === 'suspended';
}

/**
 * Type guard to check if feedback indicates approval.
 */
export function isFeedbackApproved(feedback: HITLFeedback): boolean {
  return feedback.approved === true;
}

/**
 * Creates a standardized successful result from HITL feedback.
 *
 * @param originalCall - The original tool call that was suspended
 * @param feedback - The user's feedback
 * @param suspensionId - The suspension ID being resolved
 * @returns A properly formatted successful ToolResult
 */
export function createHITLSuccessResult(
  originalCall: { callId: string; toolName: string; arguments?: unknown },
  feedback: HITLFeedback,
  suspensionId?: string
): BlockingToolCompletedResult {
  const approved = feedback.approved;
  const value = feedback.value ?? feedback.textInput ?? feedback.selectedValues;

  let message: string;
  if (approved) {
    if (value !== undefined) {
      message = `User approved with input: ${JSON.stringify(value)}`;
    } else {
      message = 'User approved the action.';
    }
  } else {
    message = feedback.reason
      ? `User rejected: ${feedback.reason}`
      : 'User rejected the action.';
  }

  return {
    status: 'success',
    callId: originalCall.callId,
    toolName: originalCall.toolName,
    output: {
      message,
      feedback,
      approved,
      value,
    },
    metadata: {
      suspensionId,
      completedAt: Date.now(),
      waitDurationMs: feedback.timestamp ? Date.now() - feedback.timestamp : undefined,
    },
  };
}
