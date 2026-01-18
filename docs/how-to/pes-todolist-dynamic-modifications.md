# How To: Dynamic Todolist Modifications in PES Agent

This guide explains how to use the PES agent's dynamic todolist modification capabilities to add, modify, and remove tasks during execution based on gathered information and decisions.

## Overview

The PES (Prescient-Echo-Synapse) agent supports full dynamic todolist manipulation during execution. This means your agent can:

- **Add** new tasks based on discovered requirements
- **Modify** pending tasks with updated information
- **Remove** tasks that are no longer needed

## Quick Example

```typescript
// During execution, the agent returns an updated plan
const executionOutput = {
  nextStepDecision: 'update_plan',
  updatedPlan: {
    intent: 'Updated intent based on new information',
    plan: 'Revised plan reflecting discovered requirements',
    todoList: [
      // Items can be added, modified, or omitted (removed)
    ]
  }
};
```

## How It Works

### The ExecutionOutput Interface

The key is the `ExecutionOutput` interface which supports plan updates:

```typescript
// File: src/types/pes-types.ts
export interface ExecutionOutput {
  thoughts?: string;
  content?: string;
  toolCalls?: ParsedToolCall[];
  nextStepDecision?: 'continue' | 'wait' | 'complete_item' | 'update_plan';
  updatedPlan?: {
    intent?: string;      // Optional: Update the overall intent
    plan?: string;        // Optional: Update the plan description
    todoList?: TodoItem[]; // Optional: Updated todolist
  };
}
```

### The TodoItem Structure

Each item in the todolist has the following structure:

```typescript
export interface TodoItem {
  id: string;                              // Unique identifier
  description: string;                     // Human-readable task description
  status: TodoItemStatus;                  // PENDING, IN_PROGRESS, COMPLETED, FAILED, SKIPPED, CANCELLED, WAITING
  dependencies?: string[];                // IDs of items that must complete first
  stepType?: 'tool' | 'reasoning';         // Type of execution step
  requiredTools?: string[];                // Tools required for tool-type steps
  expectedOutcome?: string;               // Expected result description
  toolValidationMode?: 'strict' | 'advisory'; // Validation enforcement level
  result?: any;                           // Execution result
  thoughts?: string[];                    // Agent's thoughts for this item
  toolCalls?: ParsedToolCall[];           // Planned tool calls
  actualToolCalls?: ParsedToolCall[];     // Executed tool calls
  toolResults?: ToolResult[];             // Results from tool executions
  validationStatus?: 'passed' | 'failed' | 'skipped';
  createdTimestamp: number;
  updatedTimestamp: number;
}
```

## Usage Patterns

### 1. Adding New Items

When the agent discovers new requirements during execution, it can add items to the todolist:

```typescript
// Original todolist
const originalTodoList = [
  { id: '1', description: 'Fetch user data', status: 'PENDING' },
  { id: '2', description: 'Process data', status: 'PENDING' }
];

// During execution of item 1, agent discovers authentication is needed
const updatedTodoList = [
  { id: '1', description: 'Fetch user data', status: 'COMPLETED' },
  { id: '2', description: 'Authenticate user', status: 'PENDING' },  // NEW
  { id: '3', description: 'Process data', status: 'PENDING' }
];
```

**LLM Response Format:**
```json
{
  "thoughts": "Discovered that the API requires authentication before fetching data.",
  "nextStepDecision": "update_plan",
  "updatedPlan": {
    "plan": "Added authentication step before data processing",
    "todoList": [
      {
        "id": "1",
        "description": "Fetch user data",
        "status": "COMPLETED",
        "createdTimestamp": 1704067200000,
        "updatedTimestamp": 1704067200000
      },
      {
        "id": "auth-1",
        "description": "Authenticate user with API key",
        "status": "PENDING",
        "stepType": "tool",
        "requiredTools": ["http_request"],
        "createdTimestamp": 1704067260000,
        "updatedTimestamp": 1704067260000
      },
      {
        "id": "3",
        "description": "Process data",
        "status": "PENDING",
        "createdTimestamp": 1704067200000,
        "updatedTimestamp": 1704067200000
      }
    ]
  }
}
```

### 2. Modifying Existing Items

Update properties of pending tasks based on new information:

```typescript
// Agent discovers that processing requires specific tools
const modifiedItem = {
  id: '2',
  description: 'Process data with validation',  // Modified description
  status: 'PENDING',
  stepType: 'tool',                             // Added
  requiredTools: ['data_validator', 'transformer'], // Added
  toolValidationMode: 'strict',                 // Added
  createdTimestamp: 1704067200000,
  updatedTimestamp: 1704067300000  // Updated timestamp
};
```

**Example Scenario:**
```json
{
  "thoughts": "The data format is more complex than expected. Need to add validation and use specific tools.",
  "nextStepDecision": "update_plan",
  "updatedPlan": {
    "todoList": [
      {
        "id": "1",
        "description": "Fetch user data",
        "status": "COMPLETED",
        "result": { "raw": "..." }
      },
      {
        "id": "2",
        "description": "Process and validate JSON data",  // Modified
        "status": "PENDING",
        "stepType": "tool",
        "requiredTools": ["json_validate", "transform"],
        "expectedOutcome": "Validated and transformed data structure",
        "toolValidationMode": "strict",
        "createdTimestamp": 1704067200000,
        "updatedTimestamp": 1704067350000
      },
      {
        "id": "3",
        "description": "Generate report",
        "status": "PENDING",
        "createdTimestamp": 1704067200000,
        "updatedTimestamp": 1704067350000
      }
    ]
  }
}
```

### 3. Removing Items

Omit items from the updated todolist to remove them:

```typescript
// Original todolist has 5 items
const original = [
  { id: '1', description: 'Task 1', status: 'COMPLETED' },
  { id: '2', description: 'Task 2', status: 'PENDING' },
  { id: '3', description: 'Task 3', status: 'PENDING' },
  { id: '4', description: 'Optional task', status: 'PENDING' },
  { id: '5', description: 'Final task', status: 'PENDING' }
];

// Agent decides task 4 is unnecessary
const updated = [
  { id: '1', description: 'Task 1', status: 'COMPLETED' },
  { id: '2', description: 'Task 2', status: 'PENDING' },
  { id: '3', description: 'Task 3', status: 'PENDING' },
  // Task 4 is omitted - it will be removed
  { id: '5', description: 'Final task', status: 'PENDING' }
];
```

**Example Scenario:**
```json
{
  "thoughts": "After analyzing the data, I found that the optional export step is not needed since the data is already in the correct format.",
  "nextStepDecision": "update_plan",
  "updatedPlan": {
    "plan": "Removed unnecessary export step. Data is already in final format.",
    "todoList": [
      {
        "id": "1",
        "description": "Load configuration",
        "status": "COMPLETED",
        "createdTimestamp": 1704067200000,
        "updatedTimestamp": 1704067200000
      },
      {
        "id": "2",
        "description": "Process data",
        "status": "IN_PROGRESS",
        "createdTimestamp": 1704067200000,
        "updatedTimestamp": 1704067260000
      }
      // Export step omitted - removed from plan
    ]
  }
}
```

### 4. Reordering with Dependencies

You can also change execution order by modifying dependencies:

```typescript
const reorderedTodoList = [
  {
    id: '1',
    description: 'Base task',
    status: 'COMPLETED'
  },
  {
    id: '2',
    description: 'New critical task',
    status: 'PENDING',
    dependencies: [] // No dependencies - can run immediately
  },
  {
    id: '3',
    description: 'Dependent task',
    status: 'PENDING',
    dependencies: ['2'] // Now depends on new task
  }
];
```

## Important Constraints

### Protection of Completed Items

The agent protects already completed items from status changes:

```typescript
// From: src/core/agents/pes-agent.ts:1191-1219
const sanitizedList = parsed.updatedPlan.todoList.map(newItem => {
    const oldItem = state.todoList.find(i => i.id === newItem.id);
    if (oldItem && oldItem.status === TodoItemStatus.COMPLETED) {
        return { ...newItem, status: TodoItemStatus.COMPLETED };
    }
    // ... rest of sanitization
});
```

**What this means:**
- Items marked as `COMPLETED` will stay completed
- You can still update other properties (result, metadata)
- You cannot "un-complete" a task

### Current Item Handling

The currently executing item (`IN_PROGRESS`) is handled specially:
- If you include it in the updated plan, it stays `IN_PROGRESS`
- If it's completed, the agent moves to the next item

## Implementation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. AGENT EXECUTING TASK                                            │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. AGENT DISCOVERS NEW INFORMATION                                 │
│     - Missing requirements                                          │
│     - Better approach discovered                                    │
│     - Some tasks unnecessary                                        │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. LLM RETURNS EXECUTION OUTPUT                                    │
│     {                                                               │
│       nextStepDecision: "update_plan",                              │
│       updatedPlan: { todoList: [...] }                              │
│     }                                                               │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. OUTPUTPARSER EXTRACTS UPDATED PLAN                              │
│     File: src/systems/reasoning/OutputParser.ts:442-443            │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. PLAN UPDATE HANDLER SANITIZES                                    │
│     - Protects COMPLETED items                                      │
│     - Validates item statuses                                       │
│     File: src/core/agents/pes-agent.ts:1191-1219                    │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  6. STATE UPDATED                                                   │
│     - todoList replaced                                             │
│     - Observation recorded (PLAN_UPDATE)                            │
│     - State persisted via _saveState                                │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  7. EXECUTION CONTINUES WITH UPDATED PLAN                           │
└─────────────────────────────────────────────────────────────────────┘
```

## Best Practices

### 1. Use Meaningful IDs

```typescript
// Good - descriptive IDs
{
  id: 'auth-step-1',
  description: 'Authenticate with OAuth2'
}

// Avoid - generic IDs
{
  id: 'step-1',
  description: 'Authenticate'
}
```

### 2. Update Timestamps

Always update the `updatedTimestamp` when modifying items:

```typescript
{
  id: 'task-1',
  description: 'Updated description',
  status: 'PENDING',
  createdTimestamp: 1704067200000,
  updatedTimestamp: Date.now() // Current time
}
```

### 3. Preserve Dependencies

When adding new items that other tasks depend on, update dependencies:

```typescript
// Add new authentication step
const newAuthStep = {
  id: 'auth-1',
  description: 'Authenticate user',
  status: 'PENDING',
  dependencies: []
};

// Update dependent task
const dependentTask = {
  id: 'fetch-1',
  description: 'Fetch user data',
  status: 'PENDING',
  dependencies: ['auth-1'] // Now depends on auth
};
```

### 4. Document Reasoning

Use the `plan` field to explain why changes were made:

```typescript
{
  updatedPlan: {
    plan: "Added authentication step after discovering API requires OAuth2. Updated data fetch to depend on auth completion."
  }
}
```

## Testing

See the integration tests for examples:

```bash
# File: test/pes-agent-followup.integration.test.ts
# Demonstrates plan refinement through follow-up queries
```

## Related Files

| File | Purpose |
|------|---------|
| `src/types/pes-types.ts` | TodoItem and ExecutionOutput definitions |
| `src/core/agents/pes-agent.ts:1191-1219` | Plan update handler |
| `src/systems/reasoning/OutputParser.ts:442-443` | Output parser |
| `test/pes-agent-followup.integration.test.ts` | Integration tests |

## Summary

- **Add items**: Include new `TodoItem` objects in `updatedPlan.todoList`
- **Modify items**: Update properties of existing items (ID must match)
- **Remove items**: Omit items from `updatedPlan.todoList`
- **Protection**: COMPLETED items retain their status
- **Persistence**: Changes are automatically saved and recorded

This dynamic capability enables adaptive agent behavior where the plan evolves based on real-time discoveries during execution.
