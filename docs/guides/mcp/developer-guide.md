# MCP System Developer Guide

**Version**: 2.0
**Audience**: Developers building apps with ART Framework
**Last Updated**: 2025-01-30

## Table of Contents

- [Quick Start](#quick-start)
- [Basic Usage](#basic-usage)
- [Advanced Patterns](#advanced-patterns)
- [API Reference](#api-reference)
- [Common Recipes](#common-recipes)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Installation

McpManagerV2 is included in the ART Framework, no additional installation needed.

```typescript
import { McpManagerV2 } from '@/systems/mcp';
```

### 5-Minute Setup

```typescript
// 1. Create ART instance with MCP enabled
const artInstance = await createArtInstance({
  storage: { type: 'indexedDB', dbName: 'myapp' },
  providers: { /* ... */ },

  // Enable MCP system
  mcpConfig: {
    enabled: true,
    userId: 'user_123',  // Get from auth system
    corsProxyUrl: 'https://your-cors-proxy.vercel.app/api/cors-proxy'
  }
});

// 2. Register an MCP server
await artInstance.mcpManager.registerServer({
  id: 'github',
  type: 'streamable-http',
  displayName: 'GitHub',
  connection: {
    url: 'https://mcp.github.com',
    oauth: {
      authorizationUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      clientId: 'your_client_id',
      scopes: ['repo', 'user']
    }
  },
  defer_loading: true,  // Enable Tool Search pattern
  tools: [
    { name: 'createPullRequest', description: 'Create a new PR' },
    { name: 'listIssues', description: 'List repository issues' }
  ]
}, 'user');  // User-level scope

// 3. Use in a conversation
const response = await artInstance.process({
  query: 'Create a PR to fix the authentication bug',
  threadId: 'thread_123'
});
```

Done! The MCP system will automatically:
- Search for relevant tools ("createPullRequest")
- Load them on-demand
- Connect to GitHub with OAuth
- Execute the tool
- Return results

## Basic Usage

### Registering Servers

#### App-Level Server (All Users)

```typescript
await mcpManager.registerServer({
  id: 'tavily',
  type: 'streamable-http',
  displayName: 'Tavily Search',
  description: 'Web search and research tool',
  connection: {
    url: 'https://mcp.tavily.com'
  },
  defer_loading: true,
  scope: 'app',
  trustLevel: 'verified',
  tags: ['search', 'research', 'web']
}, 'app');
```

#### User-Level Server (Specific User)

```typescript
await mcpManager.registerServer({
  id: 'my-custom-mcp',
  type: 'streamable-http',
  displayName: 'My Custom Server',
  connection: {
    url: 'https://my-server.example.com'
  },
  defer_loading: true
}, 'user');
```

#### Server with OAuth

```typescript
await mcpManager.registerServer({
  id: 'linear',
  type: 'streamable-http',
  displayName: 'Linear',
  connection: {
    url: 'https://mcp.linear.app',
    oauth: {
      authorizationUrl: 'https://linear.app/oauth/authorize',
      tokenUrl: 'https://linear.app/oauth/token',
      clientId: process.env.LINEAR_CLIENT_ID,
      scopes: ['read', 'write']
    }
  },
  defer_loading: true,
  tags: ['project-management', 'tasks']
}, 'user');
```

### Unregistering Servers

```typescript
// Unregister user server
await mcpManager.unregisterServer('my-custom-mcp', 'user');

// Unregister app server (requires admin permissions)
await mcpManager.unregisterServer('tavily', 'app');
```

### Thread-Specific Tools

```typescript
// Activate only specific servers for a thread
await mcpManager.setThreadServers('support_thread_1', ['github', 'linear']);

// Get all tools available in this thread
const tools = await mcpManager.getThreadTools('support_thread_1');
console.log(`Thread has ${tools.length} tools`);

// In another thread, use different servers
await mcpManager.setThreadServers('research_thread_1', ['tavily', 'wikipedia']);
```

### Tool Search (On-Demand Loading)

```typescript
// Find relevant tools for a user prompt
const tools = await mcpManager.resolveToolsForPrompt(
  'Find open issues assigned to me and create a summary',
  'thread_123',
  {
    maxResults: 10,
    minScore: 0.3,
    strategy: 'bm25'  // or 'regex', 'semantic'
  }
);

console.log('Relevant tools:', tools.map(t => t.name));
// Output: ['github_listIssues', 'github_getIssue', 'linear_listIssues']
```

## Advanced Patterns

### Pattern 1: Deferred Loading (Tool Search)

**Problem**: Loading all 100 tools into context wastes tokens.

**Solution**: Register with minimal metadata, load on-demand.

```typescript
// 1. Register with defer_loading
await mcpManager.registerServer({
  id: 'large-toolset',
  defer_loading: true,  // Don't load all tools immediately
  tools: [
    // Minimal metadata for search
    {
      name: 'tool_1',
      description: 'Does something useful',
      whenToUse: 'When user needs X',
      tags: ['keyword1', 'keyword2']
    },
    // ... 99 more tools
  ]
}, 'app');

// 2. Search finds only relevant tools
const relevant = await mcpManager.resolveToolsForPrompt(
  'I need to do X',
  'thread_1'
);
// Returns only tools matching keywords (e.g., 5 tools instead of 100)

// 3. First execution loads full tool definition
const result = await tool.execute(args, context);
// Tool is now fully loaded and cached
```

**Benefits**:
- 85% token reduction
- Faster inference
- Better tool selection

### Pattern 2: Programmatic Tool Calling

**Problem**: Tool results in context pollute conversation.

**Solution**: Execute tools from code, keep results in code.

```typescript
// 1. Define tool with allowed_callers
const tool = {
  name: 'batchUpdateIssues',
  allowed_callers: ['code_execution_20250825'],  // Only code can call
  inputSchema: { /* ... */ }
};

// 2. Execute from code execution environment
const result = await mcpManager.executeFromCode(
  'mcp_linear_batchUpdateIssues',
  { issueIds: [1, 2, 3], state: 'Done' },
  {
    caller: {
      type: 'code_execution_20250825',
      tool_id: 'exec_abc123'
    },
    threadId: 'thread_123',
    timeout: 30000
  }
);

// 3. Process in code (not in context)
if (result.success) {
  const updated = result.result.updated;
  return `Successfully updated ${updated.length} issues`;
}
```

**Benefits**:
- 37% token savings
- Cleaner context
- Better error handling

### Pattern 3: Parallel Tool Execution

Execute multiple tools concurrently:

```typescript
const executor = new ProgrammaticToolExecutor(registry);

const results = await executor.executeParallel([
  { toolName: 'mcp_github_getIssue', args: { number: 123 } },
  { toolName: 'mcp_github_getIssue', args: { number: 456 } },
  { toolName: 'mcp_github_getIssue', args: { number: 789 } }
], context);

// Process all results
results.forEach(r => {
  if (r.success) {
    console.log(`Issue #${r.result.number}: ${r.result.title}`);
  }
});
```

### Pattern 4: Sequential Tool Execution with Dependencies

Chain tools where each depends on previous result:

```typescript
const result = await executor.executeSequential([
  {
    toolName: 'mcp_linear_listIssues',
    args: { state: 'Todo', limit: 10 }
  },
  {
    toolName: 'mcp_linear_updateIssue',
    args: (prevResult) => ({
      id: prevResult[0].id,  // Use first issue from previous call
      state: 'In Progress'
    })
  },
  {
    toolName: 'mcp_linear_addComment',
    args: (prevResult) => ({
      issueId: prevResult.id,
      comment: 'Started working on this'
    })
  }
], context);

console.log('Final result:', result);
```

### Pattern 5: Thread Isolation

Different conversations use different tools:

```typescript
// Support thread: only support-related tools
await mcpManager.setThreadServers('support_123', [
  'github',     // For checking issues
  'linear',     // For creating tasks
  'slack'       // For notifications
]);

// Research thread: only research tools
await mcpManager.setThreadServers('research_456', [
  'tavily',     // Web search
  'wikipedia',  // Encyclopedia
  'arxiv'       // Academic papers
]);

// Code review thread: only dev tools
await mcpManager.setThreadServers('codereview_789', [
  'github',     // PR management
  'sonarqube',  // Code quality
  'codecov'     // Coverage
]);
```

### Pattern 6: User-Specific Servers

Each user has their own servers:

```typescript
// User A registers their own Linear workspace
await mcpManagerUserA.registerServer({
  id: 'linear_userA',
  connection: {
    url: 'https://mcp.linear.app',
    oauth: { clientId: userA_clientId, /* ... */ }
  }
}, 'user');

// User B registers their own Linear workspace
await mcpManagerUserB.registerServer({
  id: 'linear_userB',
  connection: {
    url: 'https://mcp.linear.app',
    oauth: { clientId: userB_clientId, /* ... */ }
  }
}, 'user');

// Credentials are isolated per user
// User A cannot access User B's Linear data
```

## API Reference

### McpManagerV2

#### Constructor

```typescript
new McpManagerV2(
  toolRegistry: ToolRegistry,
  stateManager: StateManager,
  authManager?: AuthManager,
  config?: {
    userId: string;
    corsProxyUrl?: string;
    toolSearchStrategy?: 'regex' | 'bm25' | 'semantic';
    enableProgrammaticCalling?: boolean;
  }
)
```

#### Methods

##### `initialize(config)`

Initialize the MCP system.

```typescript
await mcpManager.initialize({
  enabled: true,
  userId: 'user_123',
  discoveryEndpoint: 'https://api.example.com/mcp/discover',
  corsProxyUrl: 'https://cors-proxy.example.com/api/cors-proxy',
  toolSearchStrategy: 'bm25'
});
```

**Parameters**:
- `config.enabled` (boolean): Enable MCP system
- `config.userId` (string): User ID for multi-tenant isolation
- `config.discoveryEndpoint` (string, optional): Remote server discovery
- `config.corsProxyUrl` (string, optional): CORS proxy URL
- `config.toolSearchStrategy` (string, optional): Search strategy

**Returns**: `Promise<void>`

##### `registerServer(server, scope)`

Register a new MCP server.

```typescript
await mcpManager.registerServer({
  id: 'github',
  type: 'streamable-http',
  displayName: 'GitHub',
  connection: { url: 'https://mcp.github.com' },
  defer_loading: true
}, 'user');
```

**Parameters**:
- `server` (McpServerConfig): Server configuration
- `scope` ('app' | 'user'): Server scope

**Returns**: `Promise<void>`

**Server Config**:
```typescript
interface McpServerConfig {
  id: string;
  type: 'streamable-http';
  displayName?: string;
  description?: string;
  connection: {
    url: string;
    oauth?: {
      authorizationUrl: string;
      tokenUrl: string;
      clientId: string;
      scopes: string[];
    };
  };
  defer_loading?: boolean;
  tags?: string[];
  tools?: McpToolDefinition[];
}
```

##### `unregisterServer(serverId, scope)`

Unregister an MCP server.

```typescript
await mcpManager.unregisterServer('github', 'user');
```

**Parameters**:
- `serverId` (string): Server ID
- `scope` ('app' | 'user'): Server scope

**Returns**: `Promise<void>`

##### `setThreadServers(threadId, serverIds)`

Activate specific servers for a thread.

```typescript
await mcpManager.setThreadServers('thread_123', ['github', 'linear']);
```

**Parameters**:
- `threadId` (string): Thread ID
- `serverIds` (string[]): Array of server IDs to activate

**Returns**: `Promise<void>`

##### `getThreadTools(threadId)`

Get all tools available in a thread.

```typescript
const tools = await mcpManager.getThreadTools('thread_123');
```

**Parameters**:
- `threadId` (string): Thread ID

**Returns**: `Promise<McpToolDefinition[]>`

##### `resolveToolsForPrompt(prompt, threadId, options)`

Search for relevant tools based on prompt.

```typescript
const tools = await mcpManager.resolveToolsForPrompt(
  'Create a PR to fix bug',
  'thread_123',
  { maxResults: 10, minScore: 0.3 }
);
```

**Parameters**:
- `prompt` (string): User prompt
- `threadId` (string): Thread ID
- `options` (object, optional):
  - `maxResults` (number): Max tools to return (default: 10)
  - `minScore` (number): Minimum relevance score (default: 0.1)
  - `strategy` ('regex' | 'bm25' | 'semantic'): Search strategy

**Returns**: `Promise<McpToolDefinition[]>`

##### `executeFromCode(toolName, args, context)`

Execute a tool programmatically from code.

```typescript
const result = await mcpManager.executeFromCode(
  'mcp_github_createPullRequest',
  { title: 'Fix bug', base: 'main', head: 'fix-branch' },
  {
    caller: { type: 'code_execution_20250825', tool_id: 'exec_123' },
    threadId: 'thread_123'
  }
);
```

**Parameters**:
- `toolName` (string): Tool name (format: `mcp_serverId_toolName`)
- `args` (any): Tool arguments
- `context` (object):
  - `caller` (object): Caller information
  - `threadId` (string): Thread ID
  - `timeout` (number, optional): Execution timeout (ms)

**Returns**: `Promise<ExecutionResult>`

**Execution Result**:
```typescript
interface ExecutionResult {
  toolName: string;
  result: any;
  duration: number;
  success: boolean;
  error?: string;
}
```

##### `getOrCreateConnection(serverId)`

Get or create a connection to an MCP server.

```typescript
const connection = await mcpManager.getOrCreateConnection('github');
const tools = await connection.listTools();
```

**Parameters**:
- `serverId` (string): Server ID

**Returns**: `Promise<McpClientController>`

##### `shutdown()`

Shutdown all connections and cleanup.

```typescript
await mcpManager.shutdown();
```

**Returns**: `Promise<void>`

## Common Recipes

### Recipe 1: GitHub Integration

```typescript
// 1. Register GitHub MCP server
await mcpManager.registerServer({
  id: 'github',
  type: 'streamable-http',
  displayName: 'GitHub',
  connection: {
    url: 'https://mcp.github.com',
    oauth: {
      authorizationUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      clientId: process.env.GITHUB_CLIENT_ID,
      scopes: ['repo', 'user', 'write:discussion']
    }
  },
  defer_loading: true,
  tools: [
    {
      name: 'createPullRequest',
      description: 'Create a new pull request',
      whenToUse: 'When user wants to create a PR',
      tags: ['pr', 'github', 'code-review']
    },
    {
      name: 'listIssues',
      description: 'List repository issues',
      whenToUse: 'When user wants to see issues',
      tags: ['issues', 'github', 'bugs']
    }
  ]
}, 'user');

// 2. Use in conversation
const response = await artInstance.process({
  query: 'List all open bugs in the repo',
  threadId: 'dev_thread_1'
});

// 3. Tool Search automatically finds and uses 'listIssues'
```

### Recipe 2: Multi-Service Workflow

```typescript
// Setup: Register multiple services
await Promise.all([
  mcpManager.registerServer(githubConfig, 'user'),
  mcpManager.registerServer(linearConfig, 'user'),
  mcpManager.registerServer(slackConfig, 'user')
]);

// Workflow: User asks to triage a bug
const response = await artInstance.process({
  query: `
    There's a critical bug in the login flow.
    Create a GitHub issue,
    create a Linear ticket,
    and notify the team on Slack
  `,
  threadId: 'triage_thread'
});

// Behind the scenes:
// 1. Tool Search finds: createIssue, createLinearTicket, sendSlackMessage
// 2. Agent executes in sequence:
//    a) github_createIssue(...)
//    b) linear_createTicket(..., githubIssueUrl)
//    c) slack_sendMessage(..., linearTicketUrl)
// 3. Returns: "Created issue #123, ticket LIN-456, notified #engineering"
```

### Recipe 3: Research Assistant

```typescript
// 1. Setup research tools
await mcpManager.setThreadServers('research_thread', [
  'tavily',      // Web search
  'wikipedia',   // Encyclopedia
  'arxiv',       // Academic papers
  'scholar'      // Google Scholar
]);

// 2. Run research query
const result = await artInstance.process({
  query: 'Research the latest advances in transformer architecture',
  threadId: 'research_thread'
});

// 3. Tool Search automatically uses:
//    - tavily for recent web results
//    - arxiv for academic papers
//    - wikipedia for background info
```

### Recipe 4: Dynamic Server Registration

```typescript
// User adds a server at runtime
async function addUserMcpServer(userId: string, serverUrl: string) {
  const config = {
    id: `user_server_${Date.now()}`,
    type: 'streamable-http' as const,
    displayName: `Custom Server`,
    connection: { url: serverUrl },
    defer_loading: true
  };

  await mcpManager.registerServer(config, 'user');

  return {
    success: true,
    serverId: config.id,
    message: 'Server registered successfully'
  };
}

// Usage in UI
const { serverId } = await addUserMcpServer('user_123', 'https://my-mcp.com');
console.log(`Server ${serverId} is now available`);
```

### Recipe 5: Execution Metrics

```typescript
const executor = new ProgrammaticToolExecutor(registry);

// Execute some tools
await executor.executeFromCode(/* ... */);
await executor.executeFromCode(/* ... */);

// Get metrics
const metrics = executor.getExecutionMetrics();

for (const [toolName, data] of metrics) {
  console.log(`${toolName}:
    Executions: ${data.count}
    Avg Duration: ${data.averageDuration}ms
    Error Rate: ${(data.errorRate * 100).toFixed(2)}%
  `);
}

// Output:
// mcp_github_createPullRequest:
//   Executions: 15
//   Avg Duration: 234ms
//   Error Rate: 6.67%
```

## Best Practices

### 1. Always Use defer_loading for Large Tool Sets

```typescript
// ❌ Bad: Loads all 100 tools into context
await mcpManager.registerServer({
  id: 'large-server',
  defer_loading: false,
  tools: [/* 100 tools */]
}, 'app');

// ✅ Good: Loads tools on-demand
await mcpManager.registerServer({
  id: 'large-server',
  defer_loading: true,
  tools: [/* 100 tools with metadata */]
}, 'app');
```

### 2. Use Thread-Specific Activation

```typescript
// ❌ Bad: All tools in all threads
// (no thread-specific configuration)

// ✅ Good: Only relevant tools per thread
await mcpManager.setThreadServers('support_thread', ['github', 'linear']);
await mcpManager.setThreadServers('research_thread', ['tavily', 'wikipedia']);
```

### 3. Add Metadata for Better Search

```typescript
// ❌ Bad: Minimal metadata
{
  name: 'createPR',
  inputSchema: { /* ... */ }
}

// ✅ Good: Rich metadata for search
{
  name: 'createPullRequest',
  description: 'Create a new pull request on GitHub',
  whenToUse: 'When user wants to create a PR after making code changes',
  tags: ['github', 'pr', 'code-review', 'git'],
  input_examples: [
    { title: 'Fix login bug', base: 'main', head: 'fix-login' }
  ],
  inputSchema: { /* ... */ }
}
```

### 4. Use allowed_callers for Security

```typescript
// ❌ Bad: Any code can call sensitive tools
{
  name: 'deleteRepository',
  inputSchema: { /* ... */ }
}

// ✅ Good: Restrict to authorized callers
{
  name: 'deleteRepository',
  allowed_callers: ['code_execution_20250825'],
  inputSchema: { /* ... */ }
}
```

### 5. Handle Errors Gracefully

```typescript
try {
  await mcpManager.registerServer(config, 'user');
} catch (error) {
  if (error.code === ErrorCode.SERVER_ALREADY_EXISTS) {
    // Update existing server
    await mcpManager.updateServer(config.id, config);
  } else if (error.code === ErrorCode.NETWORK_ERROR) {
    // Show retry option
    showRetryDialog();
  } else {
    // Log and show user-friendly message
    Logger.error('Server registration failed:', error);
    showErrorToast('Failed to register server');
  }
}
```

## Troubleshooting

### Issue: "userId is required"

**Cause**: McpManagerV2 needs userId for multi-tenant isolation

**Solution**:
```typescript
const userId = authManager?.getCurrentUser()?.id || 'anonymous';

new McpManagerV2(deps, { userId });
```

### Issue: Tools not appearing in thread

**Cause**: Server not activated for thread

**Solution**:
```typescript
// Check active servers
const threadConfig = await storage.getThreadConfig(threadId);
console.log('Active servers:', threadConfig?.activeServers);

// Activate servers
await mcpManager.setThreadServers(threadId, ['github', 'linear']);
```

### Issue: CORS errors despite edge function

**Cause**: Incorrect proxy URL or server URL

**Solution**:
```typescript
// Verify proxy URL
console.log('CORS Proxy:', mcpManager.config.corsProxyUrl);

// Test proxy manually
const testUrl = 'https://mcp.github.com';
const proxiedUrl = `${corsProxyUrl}?url=${encodeURIComponent(testUrl)}`;
const response = await fetch(proxiedUrl);
console.log('Proxy working:', response.ok);
```

### Issue: Tool search returns no results

**Cause**: Search strategy or keywords mismatch

**Solution**:
```typescript
// Try different strategy
const tools = await mcpManager.resolveToolsForPrompt(
  'create pull request',
  threadId,
  { strategy: 'regex' }  // More lenient than BM25
);

// Or lower minimum score
const tools2 = await mcpManager.resolveToolsForPrompt(
  'create pull request',
  threadId,
  { minScore: 0.1 }  // Default is 0.3
);

// Check deferred tools
const deferred = await storage.getDeferredTools();
console.log('Total deferred tools:', deferred.size);
```

### Issue: Performance slower than expected

**Cause**: Not using defer_loading or inefficient search

**Solution**:
```typescript
// Enable defer_loading
await mcpManager.registerServer({
  defer_loading: true,  // ✅ Enable
  // ...
}, 'user');

// Use BM25 strategy (fastest for large sets)
const tools = await mcpManager.resolveToolsForPrompt(
  prompt,
  threadId,
  { strategy: 'bm25', maxResults: 10 }
);

// Monitor performance
console.time('tool-search');
const tools = await mcpManager.resolveToolsForPrompt(/* ... */);
console.timeEnd('tool-search');  // Should be <50ms
```

### Issue: OAuth callback not working

**Cause**: Incorrect redirect URI or callback handling

**Solution**:
```typescript
// Ensure callback URL matches OAuth config
const redirectUri = `${window.location.origin}/oauth/callback`;

// Handle callback in your app
router.get('/oauth/callback', async (req, res) => {
  const { code, state } = req.query;

  // Let MCP client handle callback
  const client = await mcpManager.getOrCreateConnection(state);
  await client.maybeHandleCallback();

  res.redirect('/');
});
```

---

**Need more help?**
- 📖 [Architecture Guide](./architecture.md)
- 📖 [Migration Guide](./migration.md)
- 💬 GitHub Discussions
- 🐛 GitHub Issues
