/**
 * @module systems/mcp/executor/ProgrammaticToolExecutor
 * Implements Anthropic's Programmatic Tool Calling pattern
 *
 * Key Features:
 * - Execute tools from code execution environment
 * - Validate allowed_callers permissions
 * - Intermediate results don't pollute context
 * - Parallel tool execution support
 *
 * Benefits:
 * - 37% token reduction (intermediate results stay in code)
 * - Reduced latency (fewer inference passes)
 * - Better control flow (loops, conditionals in code)
 *
 * @see https://www.anthropic.com/engineering/advanced-tool-use
 */

import { Logger } from '@/utils/logger';
import { McpRegistry } from '../registry/McpRegistry';
import { ARTError, ErrorCode } from '@/errors';

/**
 * Caller context for code execution
 */
export interface CodeExecutionCaller {
  /** Caller type (e.g., 'code_execution_20250825') */
  type: string;
  /** Tool ID of the code execution tool */
  tool_id: string;
}

/**
 * Execution context for programmatic tool calls
 */
export interface ProgrammaticExecutionContext {
  /** Caller information */
  caller: CodeExecutionCaller;
  /** User ID */
  userId: string;
  /** Thread ID */
  threadId: string;
  /** Execution timeout (ms) */
  timeout?: number;
}

/**
 * Result of programmatic tool execution
 */
export interface ProgrammaticExecutionResult {
  /** Tool that was executed */
  toolName: string;
  /** Execution result */
  result: any;
  /** Execution duration (ms) */
  duration: number;
  /** Whether execution succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Programmatic Tool Executor
 * Handles tool calls from code execution environment
 */
export class ProgrammaticToolExecutor {
  private registry: McpRegistry;

  // Track execution metrics
  private executionMetrics: Map<string, {
    count: number;
    totalDuration: number;
    errors: number;
  }> = new Map();

  constructor(registry: McpRegistry) {
    this.registry = registry;
  }

  /**
   * Execute a tool from code execution environment
   *
   * @param toolName Tool name (format: mcp_serverId_toolName)
   * @param args Tool arguments
   * @param context Execution context
   * @returns Promise resolving to execution result
   *
   * @example
   * ```typescript
   * // In code execution environment:
   * const result = await executor.executeFromCode(
   *   'mcp_github_createPullRequest',
   *   { title: 'Fix bug', base: 'main', head: 'fix-123' },
   *   {
   *     caller: { type: 'code_execution_20250825', tool_id: 'exec_123' },
   *     userId: 'user_456',
   *     threadId: 'thread_789'
   *   }
   * );
   * ```
   */
  async executeFromCode(
    toolName: string,
    args: any,
    context: ProgrammaticExecutionContext
  ): Promise<ProgrammaticExecutionResult> {
    const startTime = Date.now();

    try {
      Logger.info(`ProgrammaticToolExecutor: Executing ${toolName} from code`);

      // Parse tool name (format: mcp_serverId_toolName)
      const { serverId, actualToolName } = this.parseToolName(toolName);

      // Verify tool is allowed for programmatic calling
      await this.verifyAllowedCaller(serverId, actualToolName, context.caller.type);

      // Get connection to MCP server
      const connection = await this.registry.getConnection(serverId, context.userId);

      // Execute tool with timeout
      const result = await this.executeWithTimeout(
        async () => connection.callTool(actualToolName, args),
        context.timeout || 30000
      );

      const duration = Date.now() - startTime;

      // Update metrics
      this.updateMetrics(toolName, duration, true);

      // Result does NOT go to Claude's context
      // It's processed by the code execution environment
      Logger.info(`ProgrammaticToolExecutor: ${toolName} executed successfully in ${duration}ms`);

      return {
        toolName,
        result,
        duration,
        success: true
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Update metrics
      this.updateMetrics(toolName, duration, false);

      Logger.error(`ProgrammaticToolExecutor: ${toolName} failed: ${error.message}`);

      return {
        toolName,
        result: null,
        duration,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute multiple tools in parallel
   * Enables efficient batch operations in code execution
   *
   * @param calls Array of tool calls to execute
   * @param context Execution context
   * @returns Promise resolving to array of results
   *
   * @example
   * ```typescript
   * // In code execution environment:
   * const results = await executor.executeParallel([
   *   { toolName: 'mcp_github_getIssue', args: { number: 123 } },
   *   { toolName: 'mcp_github_getIssue', args: { number: 456 } },
   *   { toolName: 'mcp_github_getIssue', args: { number: 789 } }
   * ], context);
   * ```
   */
  async executeParallel(
    calls: Array<{ toolName: string; args: any }>,
    context: ProgrammaticExecutionContext
  ): Promise<ProgrammaticExecutionResult[]> {
    Logger.info(`ProgrammaticToolExecutor: Executing ${calls.length} tools in parallel`);

    const promises = calls.map(call =>
      this.executeFromCode(call.toolName, call.args, context)
    );

    return await Promise.all(promises);
  }

  /**
   * Execute tools sequentially with dependency handling
   * Allows each call to use results from previous calls
   *
   * @param calls Array of tool calls (may include result transformers)
   * @param context Execution context
   * @returns Promise resolving to final result
   *
   * @example
   * ```typescript
   * const result = await executor.executeSequential([
   *   {
   *     toolName: 'mcp_linear_listIssues',
   *     args: { state: 'Todo' }
   *   },
   *   {
   *     // Use result from previous call
   *     toolName: 'mcp_linear_updateIssue',
   *     args: (prev) => ({ id: prev[0].id, state: 'In Progress' })
   *   }
   * ], context);
   * ```
   */
  async executeSequential(
    calls: Array<{
      toolName: string;
      args: any | ((prevResult: any) => any);
    }>,
    context: ProgrammaticExecutionContext
  ): Promise<any> {
    Logger.info(`ProgrammaticToolExecutor: Executing ${calls.length} tools sequentially`);

    let prevResult: any = null;

    for (const call of calls) {
      // Resolve args (may be a function using previous result)
      const args = typeof call.args === 'function'
        ? call.args(prevResult)
        : call.args;

      const result = await this.executeFromCode(call.toolName, args, context);

      if (!result.success) {
        throw new Error(`Tool ${call.toolName} failed: ${result.error}`);
      }

      prevResult = result.result;
    }

    return prevResult;
  }

  /**
   * Get execution metrics for analysis
   * @returns Map of tool name to metrics
   */
  getExecutionMetrics(): Map<string, {
    count: number;
    totalDuration: number;
    averageDuration: number;
    errors: number;
    errorRate: number;
  }> {
    const metrics = new Map();

    for (const [toolName, data] of this.executionMetrics) {
      metrics.set(toolName, {
        count: data.count,
        totalDuration: data.totalDuration,
        averageDuration: data.count > 0 ? data.totalDuration / data.count : 0,
        errors: data.errors,
        errorRate: data.count > 0 ? data.errors / data.count : 0
      });
    }

    return metrics;
  }

  /**
   * Reset execution metrics
   */
  resetMetrics(): void {
    this.executionMetrics.clear();
    Logger.info('ProgrammaticToolExecutor: Metrics reset');
  }

  // ===== Helper Methods =====

  /**
   * Parse tool name into server ID and tool name
   * @private
   */
  private parseToolName(toolName: string): { serverId: string; actualToolName: string } {
    const match = toolName.match(/^mcp_([^_]+)_(.+)$/);

    if (!match) {
      throw new ARTError(
        `Invalid MCP tool name format: ${toolName}. Expected: mcp_serverId_toolName`,
        ErrorCode.INVALID_CONFIG
      );
    }

    return {
      serverId: match[1],
      actualToolName: match[2]
    };
  }

  /**
   * Verify that the caller is allowed to invoke this tool
   * @private
   */
  private async verifyAllowedCaller(
    serverId: string,
    toolName: string,
    callerType: string
  ): Promise<void> {
    // Get tool definition
    const tools = await this.registry.getServerTools(serverId);
    const tool = tools.find(t => t.name === toolName);

    if (!tool) {
      throw new ARTError(
        `Tool "${toolName}" not found on server "${serverId}"`,
        ErrorCode.TOOL_NOT_FOUND
      );
    }

    // Check allowed_callers
    if (tool.allowed_callers && tool.allowed_callers.length > 0) {
      if (!tool.allowed_callers.includes(callerType)) {
        throw new ARTError(
          `Tool "${toolName}" is not allowed for caller type "${callerType}". ` +
          `Allowed callers: ${tool.allowed_callers.join(', ')}`,
          ErrorCode.PERMISSION_DENIED
        );
      }
    }
    // If allowed_callers is not set, allow all callers (default behavior)
  }

  /**
   * Execute a function with timeout
   * @private
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new ARTError(
          `Tool execution timed out after ${timeoutMs}ms`,
          ErrorCode.TIMEOUT
        ));
      }, timeoutMs);

      fn()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Update execution metrics
   * @private
   */
  private updateMetrics(toolName: string, duration: number, success: boolean): void {
    const current = this.executionMetrics.get(toolName) || {
      count: 0,
      totalDuration: 0,
      errors: 0
    };

    this.executionMetrics.set(toolName, {
      count: current.count + 1,
      totalDuration: current.totalDuration + duration,
      errors: current.errors + (success ? 0 : 1)
    });
  }
}
