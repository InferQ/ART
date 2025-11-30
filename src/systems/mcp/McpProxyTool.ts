import { IToolExecutor } from '@/core/interfaces';
import { ToolSchema, ToolResult, ExecutionContext } from '@/types';
import { Logger } from '@/utils/logger';
import { McpManager } from './McpManager';
import { McpServerConfig, McpToolDefinition } from './types';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';

/**
 * A proxy tool that wraps an MCP server tool and implements the {@link IToolExecutor} interface.
 *
 * @remarks
 * This allows MCP server tools to be used seamlessly within the ART Framework.
 *
 * Supports Anthropic's Advanced Tool Use Patterns:
 * - **defer_loading**: Tool registered but execution deferred until first use
 * - **allowed_callers**: Permissions for programmatic tool calling
 * - **input_examples**: Example inputs for better accuracy
 *
 * @see {@link McpManager} for the system that manages these proxy tools.
 * @see {@link IToolExecutor} for the interface it implements.
 *
 * @class McpProxyTool
 */
export class McpProxyTool implements IToolExecutor {
  public readonly schema: ToolSchema;

  private card: McpServerConfig;
  private toolDefinition: McpToolDefinition;
  private mcpManager: McpManager;
  private isLoaded: boolean = false;

  /**
   * Creates an instance of McpProxyTool.
   *
   * @param card Configuration for the MCP server hosting this tool.
   * @param toolDefinition The tool definition from the MCP server.
   * @param mcpManager The MCP manager for managing connections.
   */
  constructor(card: McpServerConfig, toolDefinition: McpToolDefinition, mcpManager: McpManager) {
    this.card = card;
    this.toolDefinition = toolDefinition;
    this.mcpManager = mcpManager;

    // Convert MCP tool definition to ART ToolSchema with Anthropic patterns
    this.schema = {
      name: `mcp_${card.id}_${toolDefinition.name}`,
      description: toolDefinition.description || `Tool ${toolDefinition.name} from ${card.displayName || card.id}`,
      inputSchema: toolDefinition.inputSchema,
      outputSchema: toolDefinition.outputSchema
    };

    // Add Anthropic pattern metadata to schema if available
    if (toolDefinition.whenToUse) {
      (this.schema as any).whenToUse = toolDefinition.whenToUse;
    }
    if (toolDefinition.input_examples) {
      (this.schema as any).input_examples = toolDefinition.input_examples;
    }
    if (toolDefinition.tags) {
      (this.schema as any).tags = toolDefinition.tags;
    }
    if (toolDefinition.estimatedCost) {
      (this.schema as any).estimatedCost = toolDefinition.estimatedCost;
    }

    // Mark as not loaded if defer_loading is enabled
    this.isLoaded = !toolDefinition.defer_loading;

    Logger.debug(`McpProxyTool: Created proxy for tool "${toolDefinition.name}" from server "${card.displayName}" (defer_loading: ${toolDefinition.defer_loading || false})`);
  }

  /**
   * Executes the tool by making a request to the MCP server.
   *
   * Supports Anthropic's Advanced Patterns:
   * - Lazy loading: If defer_loading is true, loads tool on first execution
   * - Permission checks: Validates allowed_callers for programmatic execution
   *
   * @param input Validated input arguments for the tool.
   * @param context Execution context containing threadId, traceId, caller info, etc.
   * @returns A promise resolving to the tool result.
   */
  async execute(input: any, context: ExecutionContext): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      // Check allowed_callers for programmatic execution
      if ((context as any).caller && this.toolDefinition.allowed_callers) {
        const callerType = (context as any).caller.type;
        if (!this.toolDefinition.allowed_callers.includes(callerType)) {
          throw new Error(
            `Tool "${this.toolDefinition.name}" is not allowed for caller type "${callerType}". ` +
            `Allowed callers: ${this.toolDefinition.allowed_callers.join(', ')}`
          );
        }
      }

      // Lazy load tool if defer_loading was enabled
      if (!this.isLoaded && this.toolDefinition.defer_loading) {
        Logger.info(`McpProxyTool: Lazy loading deferred tool "${this.schema.name}"`);
        this.isLoaded = true;
      }

      Logger.debug(`McpProxyTool: Execution requested for "${this.schema.name}". Getting or creating connection...`);
      const client = await this.mcpManager.getOrCreateConnection(this.card.id);

      Logger.debug(`McpProxyTool: Connection ready. Executing tool "${this.toolDefinition.name}" on server "${this.card.displayName}"`);
      const response = await client.callTool(this.toolDefinition.name, input);
      
      const duration = Date.now() - startTime;
      
      // Validate the raw response against the SDK's schema for robustness.
      // If validation fails, it will throw an error that is caught below.
      const validatedResponse = CallToolResultSchema.parse(response);
      
      // Adapt the response to the ToolResult format
      // This is a generic adaptation, specific tools might require more tailored logic
      // based on the shape of their response.
      const output = typeof validatedResponse === 'object' && validatedResponse !== null ? validatedResponse : { value: validatedResponse };

      return {
        callId: context.traceId || 'unknown',
        toolName: this.schema.name,
        status: 'success',
        output: [output], // Assuming the output should be wrapped in an array
        metadata: { 
          executionTime: duration, 
          mcpServer: { id: this.card.id, name: this.card.displayName },
          rawResponse: response 
        }
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      Logger.error(`McpProxyTool: Failed to execute tool "${this.toolDefinition.name}": ${error.message}`);
      return {
        callId: context.traceId || 'unknown',
        toolName: this.schema.name,
        status: 'error',
        error: `MCP execution failed: ${error.message}`,
        metadata: { executionTime: duration, mcpServer: { id: this.card.id, name: this.card.displayName }, originalError: error instanceof Error ? error.stack : String(error) }
      };
    }
  }

  /**
   * Gets the original tool name from the MCP server.
   *
   * @returns The original tool name.
   */
  getOriginalToolName(): string {
    return this.toolDefinition.name;
  }

  /**
   * Gets the MCP server configuration.
   *
   * @returns The server configuration.
   */
  getServerConfig(): McpServerConfig {
    return { ...this.card };
  }

  /**
   * Gets the MCP tool definition.
   *
   * @returns The tool definition.
   */
  getToolDefinition(): McpToolDefinition {
    return { ...this.toolDefinition };
  }
} 