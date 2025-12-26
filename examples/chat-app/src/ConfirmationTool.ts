
import { IToolExecutor, ToolSchema, ToolResult, ExecutionContext } from 'art-framework';

export class ConfirmationTool implements IToolExecutor {
  schema: ToolSchema = {
    name: 'displayConfirmation',
    description: 'Blocking Tool. YOU MUST EXECUTE THIS TOOL to get user approval. Do not just describe it. Call it with the action and details.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', description: 'The action being confirmed (e.g. "delete 5 files")' },
        details: { type: 'string', description: 'Additional details about the action' }
      },
      required: ['action']
    },
    executionMode: 'blocking' // Declare as blocking
  };

  async execute(input: any, context: ExecutionContext): Promise<ToolResult> {
    // In a real blocking tool, we might prepare some UI data here.
    // The framework will capture this result and suspend the agent.
    // The "output" here is what the UI receives in the AGENT_SUSPENDED observation (if we forwarded it, 
    // but typically the UI gets the tool call details. 
    // Actually, the framework returns this result to the loop, and the loop suspends.
    // The OBSERVATION contains { toolName, suspensionId }.
    // The UI might need the 'input' args to show the message. 
    // The observation AGENT_SUSPENDED currently only has toolName and suspensionId in my implementation.
    // I should probably enhance the AGENT_SUSPENDED observation to include the input arguments or the tool result output?
    
    // My implementation in PESAgent.ts:
    // content: { toolName: suspendedResult.toolName, suspensionId: suspendedResult.metadata?.suspensionId }
    
    // This isn't enough for the UI to show "Confirm: Delete 5 files".
    // The UI needs the arguments.
    // However, the `suspendedResult` DOES contain the tool call inputs IF the executor puts them in the output or metadata.
    // But the observation content is restricted.
    
    // Let's look at PESAgent.ts again.
    // const triggeringCall = localCalls.find(c => c.callId === suspendedResult.callId);
    // state.suspension = { ..., toolCall: triggeringCall!, ... }
    
    // The UI needs to know WHAT to confirm.
    // I should probably update PESAgent.ts to include the tool arguments in the observation content.
    
    // For now, let's include the inputs in the 'output' of this tool, and see if I can access it.
    // The `suspendedResult` is `ToolResult`. 
    // My PESAgent implementation:
    // content: { toolName: suspendedResult.toolName, suspensionId: ... }
    
    // I missed passing the payload to the UI! 
    // The UI needs to render the confirmation dialog based on the tool inputs.
    
    // Refinement on the fly: I will modify PESAgent.ts to include `toolArgs` in the AGENT_SUSPENDED observation.
    
    return {
      callId: 'placeholder', // Overwritten by system
      toolName: 'displayConfirmation',
      status: 'suspended',
      output: { message: `Please confirm: ${input.action}`, details: input.details },
      metadata: { 
          // We can put data here
      }
    };
  }
}
