/**
 * @module systems/mcp/executor
 * Programmatic Tool Executor
 *
 * Implements Anthropic's Programmatic Tool Calling pattern:
 * - Execute tools from code execution environment
 * - Validate allowed_callers permissions
 * - Parallel and sequential execution
 * - Execution metrics tracking
 *
 * Benefits:
 * - 37% token savings (intermediate results in code)
 * - Reduced latency (fewer inference passes)
 * - Better control flow (explicit orchestration)
 */

export * from './ProgrammaticToolExecutor';
