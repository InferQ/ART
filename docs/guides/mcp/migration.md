# MCP System Migration Guide

**From**: McpManager (V1)
**To**: McpManagerV2 (V2)
**Version**: 2.0
**Last Updated**: 2025-01-30

## Table of Contents

- [Overview](#overview)
- [Should You Migrate?](#should-you-migrate)
- [Breaking Changes](#breaking-changes)
- [Migration Steps](#migration-steps)
- [API Mapping](#api-mapping)
- [Configuration Changes](#configuration-changes)
- [Data Migration](#data-migration)
- [Testing](#testing)
- [Rollback Plan](#rollback-plan)

## Overview

This guide helps you migrate from the legacy `McpManager` to the new `McpManagerV2` implementation. The new system provides significant improvements in functionality, performance, and developer experience.

### Why Migrate?

**Benefits**:
- ✅ 85% token reduction (Tool Search pattern)
- ✅ 37% token savings (Programmatic Calling)
- ✅ Multi-tenant user isolation
- ✅ Thread-specific tool activation
- ✅ Dynamic server registration
- ✅ Better CORS handling (edge function)
- ✅ Production-ready storage (IndexedDB)

**Compatibility**:
- ✅ Backward compatible API (where possible)
- ✅ Legacy methods marked deprecated (not removed)
- ✅ Can run both side-by-side during migration
- ✅ Data can be migrated programmatically

## Should You Migrate?

### Migrate If:

- ✅ You need per-user MCP server configurations
- ✅ You want different tools in different threads
- ✅ You have >50 tools and want token reduction
- ✅ You want browser-friendly CORS (no extension)
- ✅ You need programmatic tool execution
- ✅ You want to add/remove servers at runtime

### Stay on V1 If:

- ⚠️ You have a simple setup with <10 tools
- ⚠️ You only have one user
- ⚠️ You don't need thread-specific control
- ⚠️ Your current setup works fine

**Note**: V1 will continue to be supported but won't receive new features.

## Breaking Changes

### 1. Storage Format

**V1**: localStorage with single `mcp-config` key
**V2**: IndexedDB with multiple object stores

**Impact**: Configuration must be migrated (see [Data Migration](#data-migration))

### 2. Initialization Signature

**V1**:
```typescript
mcpManager = new McpManager(toolRegistry, stateManager, authManager);
await mcpManager.initialize({ enabled: true });
```

**V2**:
```typescript
mcpManager = new McpManagerV2(toolRegistry, stateManager, authManager, {
  userId: 'user_123',  // NOW REQUIRED
  corsProxyUrl: 'https://...',
  toolSearchStrategy: 'bm25'
});
await mcpManager.initialize({ enabled: true, userId: 'user_123' });
```

**Impact**: You must provide `userId` (get from AuthManager)

### 3. Tool Registration

**V1**: All tools registered at startup
**V2**: Tools registered on-demand (if `defer_loading: true`)

**Impact**: Tools may not be immediately available (lazy loading)

### 4. Server Configuration

**V1**: Servers configured in `src/config/mcp-config.json`
**V2**: Servers stored in IndexedDB (no file-based config)

**Impact**: Must use API to register servers

## Migration Steps

### Step 1: Update Dependencies

No new dependencies required. McpManagerV2 is already included in the MCP system.

### Step 2: Update Agent Factory

```typescript
// src/core/agent-factory.ts

// OLD (V1)
import { McpManager } from '@/systems/mcp';

if (this.config.mcpConfig) {
  this.mcpManager = new McpManager(
    this.toolRegistry,
    this.stateManager,
    this.authManager
  );
  await this.mcpManager.initialize(this.config.mcpConfig);
}

// NEW (V2)
import { McpManagerV2 } from '@/systems/mcp';

if (this.config.mcpConfig) {
  // Get user ID from auth system
  const userId = this.authManager?.getCurrentUser()?.id || 'anonymous';

  this.mcpManager = new McpManagerV2(
    this.toolRegistry,
    this.stateManager,
    this.authManager,
    {
      userId,
      corsProxyUrl: this.config.mcpConfig.corsProxyUrl,
      toolSearchStrategy: 'bm25',
      enableProgrammaticCalling: true
    }
  );

  await this.mcpManager.initialize({
    ...this.config.mcpConfig,
    userId
  });
}
```

### Step 3: Migrate Server Configuration

Create a migration script to move from file-based to IndexedDB:

```typescript
// scripts/migrate-mcp-config.ts

import { ConfigManager } from '@/systems/mcp/ConfigManager';
import { McpManagerV2 } from '@/systems/mcp';

async function migrateConfiguration() {
  // 1. Load V1 configuration
  const legacyConfig = new ConfigManager();
  const v1Servers = legacyConfig.getConfig().mcpServers;

  console.log(`Found ${Object.keys(v1Servers).length} servers in V1 config`);

  // 2. Initialize V2 manager
  const v2Manager = new McpManagerV2(
    /* dependencies */,
    { userId: 'system_migration' }
  );
  await v2Manager.initialize();

  // 3. Migrate each server
  for (const [serverId, serverConfig] of Object.entries(v1Servers)) {
    console.log(`Migrating server: ${serverId}`);

    // Add defer_loading for better performance
    const v2Config = {
      ...serverConfig,
      defer_loading: true,  // Enable Tool Search pattern
      scope: 'app',         // App-level by default
      trustLevel: 'verified'
    };

    await v2Manager.registerServer(v2Config, 'app');
    console.log(`✓ Migrated ${serverId}`);
  }

  console.log('Migration complete!');
}

// Run migration
migrateConfiguration().catch(console.error);
```

Run the migration:
```bash
tsx scripts/migrate-mcp-config.ts
```

### Step 4: Update Application Code

Replace V1 API calls with V2 equivalents:

**Server Installation**:
```typescript
// OLD (V1)
const server = await mcpManager.installServer({
  id: 'github',
  type: 'streamable-http',
  connection: { url: 'https://mcp.github.com' },
  tools: [/* tools */]
});

// NEW (V2)
await mcpManager.registerServer({
  id: 'github',
  type: 'streamable-http',
  connection: { url: 'https://mcp.github.com' },
  defer_loading: true,  // Enable Tool Search
  tools: [/* minimal metadata */]
}, 'user');  // User-level server
```

**Server Uninstallation**:
```typescript
// OLD (V1)
await mcpManager.uninstallServer('github');

// NEW (V2)
await mcpManager.unregisterServer('github', 'user');
```

**Getting Connection** (no change):
```typescript
// Same in both versions
const connection = await mcpManager.getOrCreateConnection('github');
```

### Step 5: Add Thread-Specific Features (Optional)

Take advantage of new V2 features:

```typescript
// Activate specific servers for a thread
await mcpManager.setThreadServers('thread_123', ['github', 'linear']);

// Resolve tools for a prompt (Tool Search)
const tools = await mcpManager.resolveToolsForPrompt(
  'Create a PR to fix the bug',
  'thread_123',
  { maxResults: 10, minScore: 0.3 }
);

// Get all tools for a thread
const threadTools = await mcpManager.getThreadTools('thread_123');
```

### Step 6: Enable CORS Edge Function (Optional)

If using CORS edge function instead of browser extension:

```typescript
// 1. Deploy edge function (see edge-functions/cors-proxy/README.md)
// Vercel: vercel deploy --prod
// Cloudflare: wrangler deploy

// 2. Configure in ART
const artInstance = await createArtInstance({
  // ... other config
  mcpConfig: {
    enabled: true,
    corsProxyUrl: 'https://your-proxy.vercel.app/api/cors-proxy'
  }
});

// 3. Remove CORS extension dependency
// MCP connections will automatically use the proxy
```

### Step 7: Update UI Components

Update any UI that manages MCP servers:

```typescript
// OLD (V1)
function McpServerList() {
  const config = configManager.getConfig();
  const servers = config.mcpServers;

  return servers.map(server => ...);
}

// NEW (V2)
function McpServerList({ userId, threadId }: Props) {
  const [tools, setTools] = useState([]);

  useEffect(() => {
    // Get thread-specific tools
    mcpManager.getThreadTools(threadId).then(setTools);
  }, [threadId]);

  return tools.map(tool => ...);
}
```

## API Mapping

### Constructor

| V1 | V2 |
|----|---|
| `new McpManager(registry, state, auth)` | `new McpManagerV2(registry, state, auth, config)` |

**Note**: V2 requires `userId` in config

### Initialization

| V1 | V2 |
|----|---|
| `initialize({ enabled, discoveryEndpoint })` | `initialize({ enabled, userId, discoveryEndpoint, corsProxyUrl })` |

### Server Management

| V1 | V2 | Notes |
|----|----|-------|
| `installServer(config)` | `registerServer(config, scope)` | V2 adds scope ('app' \| 'user') |
| `uninstallServer(serverId)` | `unregisterServer(serverId, scope)` | V2 adds scope |
| `getOrCreateConnection(id)` | `getOrCreateConnection(id)` | ✅ Same |
| ❌ Not available | `setThreadServers(threadId, serverIds)` | 🆕 New in V2 |

### Tool Discovery

| V1 | V2 | Notes |
|----|----|-------|
| ❌ Not available | `resolveToolsForPrompt(prompt, thread)` | 🆕 Tool Search |
| ❌ Not available | `getThreadTools(threadId)` | 🆕 Thread tools |

### Programmatic Execution

| V1 | V2 | Notes |
|----|----|-------|
| ❌ Not available | `executeFromCode(tool, args, context)` | 🆕 New pattern |

### Lifecycle

| V1 | V2 | Notes |
|----|----|-------|
| `shutdown()` | `shutdown()` | ✅ Same |

### Discovery

| V1 | V2 | Notes |
|----|----|-------|
| `discoverAvailableServers(url)` | Internal (automatic) | V2 auto-discovers |

## Configuration Changes

### V1 Config File

```json
// src/config/mcp-config.json
{
  "mcpServers": {
    "tavily": {
      "id": "tavily",
      "type": "streamable-http",
      "enabled": true,
      "connection": { "url": "https://mcp.tavily.com" },
      "tools": [/* all tools */]
    }
  }
}
```

### V2 Dynamic Registration

```typescript
// No config file needed

// App-level (all users)
await mcpManager.registerServer({
  id: 'tavily',
  type: 'streamable-http',
  enabled: true,
  connection: { url: 'https://mcp.tavily.com' },
  defer_loading: true,  // New: Tool Search
  tools: [/* minimal metadata */]
}, 'app');

// User-level (specific user)
await mcpManager.registerServer({
  id: 'my-custom-server',
  type: 'streamable-http',
  connection: { url: 'https://my-server.com' },
  defer_loading: true
}, 'user');
```

### Configuration Schema

```typescript
// V1
interface V1Config {
  mcpServers: Record<string, {
    id: string;
    type: string;
    enabled?: boolean;
    connection: object;
    tools?: any[];
  }>;
}

// V2 (enhanced)
interface V2ServerConfig {
  // V1 fields (compatible)
  id: string;
  type: string;
  enabled?: boolean;
  connection: object;
  tools?: any[];

  // V2 new fields
  defer_loading?: boolean;
  scope?: 'app' | 'user';
  trustLevel?: 'verified' | 'community' | 'user';
  tags?: string[];
  allowed_callers?: string[];
  pricing?: { model: string; costPerCall: number };
  rateLimits?: { callsPerMinute: number };
}
```

## Data Migration

### Option 1: Programmatic Migration (Recommended)

```typescript
import { ConfigManager } from '@/systems/mcp/ConfigManager';
import { IndexedDBMcpStorage } from '@/systems/mcp/storage';

async function migrateData() {
  // 1. Read V1 config
  const v1Config = new ConfigManager();
  const oldServers = v1Config.getConfig().mcpServers;

  // 2. Initialize V2 storage
  const v2Storage = new IndexedDBMcpStorage();
  await v2Storage.init();

  // 3. Migrate to app-level config
  const appConfig = {
    servers: {},
    defaultServers: Object.keys(oldServers)
  };

  for (const [id, server] of Object.entries(oldServers)) {
    appConfig.servers[id] = {
      ...server,
      defer_loading: true,
      scope: 'app',
      trustLevel: 'verified',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  await v2Storage.setAppConfig(appConfig);

  console.log(`Migrated ${Object.keys(oldServers).length} servers`);
}
```

### Option 2: Manual Re-registration

```typescript
// In your app initialization:
async function setupMcpServers() {
  // Manually register the servers you need
  await mcpManager.registerServer({
    id: 'tavily',
    type: 'streamable-http',
    displayName: 'Tavily Search',
    connection: {
      url: 'https://mcp.tavily.com',
      oauth: { /* ... */ }
    },
    defer_loading: true
  }, 'app');

  await mcpManager.registerServer({
    id: 'github',
    type: 'streamable-http',
    displayName: 'GitHub',
    connection: {
      url: 'https://mcp.github.com',
      oauth: { /* ... */ }
    },
    defer_loading: true
  }, 'user');
}
```

### Option 3: Export/Import

```typescript
// 1. Export from V1
const v1Config = new ConfigManager();
const exportData = JSON.stringify(v1Config.getConfig(), null, 2);
fs.writeFileSync('mcp-export.json', exportData);

// 2. Import to V2
const imported = JSON.parse(fs.readFileSync('mcp-export.json', 'utf-8'));

for (const [id, server] of Object.entries(imported.mcpServers)) {
  await mcpManager.registerServer({
    ...server,
    defer_loading: true
  }, 'app');
}
```

## Testing

### Test Plan

1. **Unit Tests**
```typescript
describe('McpManagerV2', () => {
  it('should register server at user scope', async () => {
    const manager = new McpManagerV2(/* deps */, { userId: 'test_user' });
    await manager.registerServer({ id: 'test', /* ... */ }, 'user');

    const connection = await manager.getOrCreateConnection('test');
    expect(connection).toBeDefined();
  });

  it('should resolve tools for prompt', async () => {
    const tools = await manager.resolveToolsForPrompt(
      'create a pull request',
      'thread_123'
    );

    expect(tools.some(t => t.name.includes('createPullRequest'))).toBe(true);
  });
});
```

2. **Integration Tests**
```typescript
describe('MCP System Integration', () => {
  it('should use thread-specific tools', async () => {
    // Set thread to only use GitHub
    await manager.setThreadServers('thread_1', ['github']);

    // Resolve tools for thread
    const tools = await manager.getThreadTools('thread_1');

    // Should only have GitHub tools
    expect(tools.every(t => t.serverId === 'github')).toBe(true);
  });
});
```

3. **Manual Testing Checklist**

- [ ] Register a new server (app scope)
- [ ] Register a new server (user scope)
- [ ] Unregister a server
- [ ] Set thread-specific servers
- [ ] Resolve tools for a prompt
- [ ] Execute a tool normally
- [ ] Execute a tool programmatically (if enabled)
- [ ] Test CORS proxy (if configured)
- [ ] Verify data persistence (reload page)
- [ ] Test with multiple users
- [ ] Test OAuth flow

## Rollback Plan

If you encounter issues, you can rollback to V1:

### Step 1: Switch Back to V1

```typescript
// agent-factory.ts
// import { McpManagerV2 } from '@/systems/mcp';  // Comment out
import { McpManager } from '@/systems/mcp';       // Use V1

this.mcpManager = new McpManager(
  this.toolRegistry,
  this.stateManager,
  this.authManager
);
```

### Step 2: Restore V1 Config

```typescript
// Restore from backup
const backup = JSON.parse(fs.readFileSync('mcp-config-backup.json'));
localStorage.setItem('mcp-config', JSON.stringify(backup));
```

### Step 3: Clear V2 Data (Optional)

```typescript
// Clear IndexedDB
const request = indexedDB.deleteDatabase('ART_MCP');
request.onsuccess = () => console.log('V2 data cleared');
```

## Common Issues

### Issue 1: "userId is required"

**Solution**: Pass userId in config
```typescript
const userId = authManager?.getCurrentUser()?.id || 'anonymous';
new McpManagerV2(deps, { userId });
```

### Issue 2: Tools not appearing

**Solution**: Check defer_loading
```typescript
// If defer_loading: true, tools load on first use
// Or disable it:
await manager.registerServer({ defer_loading: false }, 'user');
```

### Issue 3: CORS still failing

**Solution**: Check edge function config
```typescript
// Verify proxy URL is correct
console.log(manager.config.corsProxyUrl);

// Test proxy manually
fetch(corsProxyUrl + '?url=' + encodeURIComponent(mcpUrl));
```

### Issue 4: Performance slower than V1

**Solution**: Enable defer_loading
```typescript
// V2 with defer_loading should be faster
// If not, check:
- defer_loading is enabled
- Tool Search strategy is 'bm25' (not 'regex')
- maxResults is reasonable (10-20)
```

## Next Steps

After successful migration:

1. ✅ Enable Tool Search pattern (`defer_loading: true`)
2. ✅ Configure thread-specific servers for privacy
3. ✅ Deploy CORS edge function for better UX
4. ✅ Explore programmatic tool calling
5. ✅ Set up per-user server configurations
6. ✅ Monitor performance metrics
7. ✅ Update documentation for your team

## Support

For help with migration:

- 📖 [Architecture Guide](./architecture.md)
- 📖 [Developer Guide](./developer-guide.md)
- 💬 GitHub Discussions
- 🐛 GitHub Issues

Happy migrating! 🚀
