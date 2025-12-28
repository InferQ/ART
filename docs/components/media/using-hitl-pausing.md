# How-to Guide: Using Human-in-the-Loop (HITL) with the PES Agent

This guide explains how to implement Human-in-the-Loop (HITL) functionality using the PES (Plan-Execute-Synthesize) Agent in ART version 0.4.6+.

## Overview

HITL allows the agent to pause execution when a sensitive or "blocking" tool is called. The agent saves its entire execution state and waits for a user decision (Approval/Rejection) before resuming.

### Key Design Principle

**User feedback IS the tool result.** When a user provides feedback (approval, text input, selection, etc.), the framework programmatically marks the tool call as SUCCESS with the feedback as the output. The LLM never needs to re-invoke the tool.

---

## 1. Defining a Blocking Tool

To make a tool "blocking," you must set its `executionMode` to `'blocking'` in the schema and return a `status: 'suspended'` from its `execute` method.

### Basic Blocking Tool

```typescript
import { IToolExecutor, ToolSchema, ToolResult, ExecutionContext } from 'art-framework';

export class ConfirmationTool implements IToolExecutor {
  schema: ToolSchema = {
    name: 'confirm_action',
    description: 'Requests user approval for sensitive actions.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', description: 'The action to confirm' },
        cost: { type: 'number' },
      },
      required: ['action'],
    },
    executionMode: 'blocking', // CRITICAL: This enables HITL behavior
    blockingConfig: {
      feedbackSchema: {
        inputType: 'confirm',
        prompt: 'Do you approve this action?',
        confirmLabel: 'Approve',
        cancelLabel: 'Cancel',
      },
      approvalPrompt: 'Action: {{action}} (Cost: {{cost}})',
      completesOnApproval: true, // Default: User feedback becomes the tool result
    },
  };

  async execute(input: any, context: ExecutionContext): Promise<ToolResult> {
    // Return 'suspended' status to trigger the HITL flow
    return {
      toolName: 'confirm_action',
      status: 'suspended',
      output: {
        message: `Action requires approval: ${input.action}`,
        cost: input.cost,
      },
    };
  }
}
```

### Advanced Blocking Tool with Custom Input Types

The framework supports various input types for collecting user feedback:

```typescript
export class DeploymentTool implements IToolExecutor {
  schema: ToolSchema = {
    name: 'deploy_application',
    description: 'Deploys an application to a specified environment.',
    inputSchema: {
      type: 'object',
      properties: {
        application: { type: 'string' },
        version: { type: 'string' },
      },
      required: ['application', 'version'],
    },
    executionMode: 'blocking',
    blockingConfig: {
      feedbackSchema: {
        inputType: 'select', // Select from predefined options
        prompt: 'Select deployment environment:',
        options: [
          { value: 'staging', label: 'Staging', description: 'Test environment' },
          { value: 'production', label: 'Production', description: 'Live environment' },
        ],
        required: true,
        allowModifyArgs: true, // Allow user to modify original arguments
      },
      riskLevel: 'high', // UI can show warnings based on this
      category: 'external',
    },
  };

  async execute(input: any, context: ExecutionContext): Promise<ToolResult> {
    return {
      toolName: 'deploy_application',
      status: 'suspended',
      output: {
        message: `Ready to deploy ${input.application} v${input.version}`,
        application: input.application,
        version: input.version,
      },
    };
  }
}
```

---

## 2. Handling Suspension in the UI

When a blocking tool is executed, the agent's `process()` call will return a response with `status: 'suspended'`. Additionally, an observation of type `AGENT_SUSPENDED` is emitted.

### Detecting Suspension (via process response)

```typescript
const response = await art.process({ query: 'Delete my database' });

if (response.metadata.status === 'suspended') {
  const suspensionId = response.metadata.suspensionId;
  // Show your confirmation UI here
}
```

### Detecting Suspension (via Observations)

Subscribing to observations is the recommended way to handle suspension in streaming UIs.

```typescript
art.uiSystem.getObservationSocket().subscribe((observation) => {
  if (observation.type === 'AGENT_SUSPENDED') {
    const { suspensionId, toolName, toolInput, toolOutput } = observation.content;

    console.log(`Agent is waiting for approval for: ${toolName}`);
    // toolInput contains { action: "Delete my database", cost: 0 }
    // Render your dialog using these details and the suspensionId
  }
});
```

---

## 3. Resuming Execution

Once the user makes a decision, call `art.resumeExecution()`. This method takes the user's payload and feeds it back into the agent's execution loop.

### Resume Decision Payload

The decision object must follow this structure:

```typescript
{
  approved: boolean;
  reason?: string;
  modifiedArgs?: Record<string, unknown>; // Optional: Allow user to tweak parameters
}
```

### Resuming from UI

```typescript
async function handleUserApproval(suspensionId: string, approved: boolean) {
  try {
    const result = await art.resumeExecution(threadId, suspensionId, {
      approved,
      reason: approved ? 'User approved' : 'Too risky',
    });

    console.log('Execution resumed, final result:', result);
  } catch (error) {
    console.error('Failed to resume:', error);
  }
}
```

---

## 4. Handling Rejection

The PES Agent is designed to handle rejections gracefully. When `approved: false` is passed to `resumeExecution`:

1. The framework appends the rejection to the message history.
2. An internal system instruction is added, telling the agent: "The user has REJECTED this action. Do not retry. Find an alternative or proceed to the next step."
3. The agent continues its plan (or synthesizes a response explaining why it couldn't proceed).

---

## 5. Persistence & Page Refresh

Because the agent state is saved in the `StateManager`, HITL is resilient to page refreshes.

### Checking for Suspended State on Load

When your application starts, check if the current thread is already suspended so you can restore the confirmation UI.

```typescript
const suspendedState = await art.checkForSuspendedState(threadId);

if (suspendedState) {
  const { suspensionId, toolName, toolInput } = suspendedState;
  // Restore the confirmation dialog for the user
}
```

---

## Best Practices

1.  **Granular Tools:** Only use `blocking` mode for tools that _actually_ modify state or incur costs.
2.  **Informative Inputs:** Ensure your tool's `inputSchema` provides enough information for the UI to render a clear confirmation message.
3.  **Unique Suspension IDs:** The framework automatically generates unique UUIDs for `suspensionId`. Always use the ID provided in the observation/metadata.
4.  **UI Feedback:** Always show a clear "Waiting for Approval" state in your UI to prevent user confusion when the agent stops generating tokens.
