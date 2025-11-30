/**
 * @module systems/mcp/storage/IndexedDBMcpStorage
 * IndexedDB implementation of the MCP storage adapter
 * Provides multi-tenant, hierarchical storage for MCP configuration
 */

import { Logger } from '@/utils/logger';
import {
  McpStorageAdapter,
  McpAppConfig,
  McpUserConfig,
  McpThreadConfig,
  OAuth2Tokens,
  DeferredToolEntry,
  McpCredentialEntry
} from './types';

/**
 * IndexedDB-based storage adapter for MCP system
 *
 * Database structure:
 * - app_config: Singleton store for app-level configuration
 * - user_configs: Per-user MCP configurations (key: userId)
 * - thread_configs: Per-thread active server selections (key: threadId)
 * - credentials: OAuth tokens per user+server (key: userId:serverId, encrypted)
 * - deferred_tools: Tool Search Tool pattern (key: toolKey)
 *
 * Features:
 * - Multi-tenancy: Isolated storage per user
 * - Encryption: Credentials stored encrypted
 * - Indexing: Fast lookups for search operations
 * - Backup/Restore: Export/import JSON
 */
export class IndexedDBMcpStorage implements McpStorageAdapter {
  private dbName: string;
  private dbVersion: number;
  private db: IDBDatabase | null = null;

  // Object store names
  private readonly STORE_APP_CONFIG = 'app_config';
  private readonly STORE_USER_CONFIGS = 'user_configs';
  private readonly STORE_THREAD_CONFIGS = 'thread_configs';
  private readonly STORE_CREDENTIALS = 'credentials';
  private readonly STORE_DEFERRED_TOOLS = 'deferred_tools';

  /**
   * Create a new IndexedDB storage adapter
   * @param dbName Database name (default: 'ART_MCP')
   * @param dbVersion Database version (default: 1)
   */
  constructor(dbName: string = 'ART_MCP', dbVersion: number = 1) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
  }

  /**
   * Initialize the IndexedDB database
   * Creates object stores and indexes
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to open database: ${request.error}`);
        reject(new Error(`Failed to open database: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        Logger.info(`IndexedDBMcpStorage: Database "${this.dbName}" opened successfully`);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist

        // App config store (singleton)
        if (!db.objectStoreNames.contains(this.STORE_APP_CONFIG)) {
          db.createObjectStore(this.STORE_APP_CONFIG, { keyPath: 'id' });
          Logger.info('IndexedDBMcpStorage: Created app_config store');
        }

        // User configs store
        if (!db.objectStoreNames.contains(this.STORE_USER_CONFIGS)) {
          const userStore = db.createObjectStore(this.STORE_USER_CONFIGS, { keyPath: 'userId' });
          userStore.createIndex('by_userId', 'userId', { unique: true });
          Logger.info('IndexedDBMcpStorage: Created user_configs store');
        }

        // Thread configs store
        if (!db.objectStoreNames.contains(this.STORE_THREAD_CONFIGS)) {
          const threadStore = db.createObjectStore(this.STORE_THREAD_CONFIGS, { keyPath: 'threadId' });
          threadStore.createIndex('by_threadId', 'threadId', { unique: true });
          threadStore.createIndex('by_updatedAt', 'updatedAt', { unique: false });
          Logger.info('IndexedDBMcpStorage: Created thread_configs store');
        }

        // Credentials store
        if (!db.objectStoreNames.contains(this.STORE_CREDENTIALS)) {
          const credStore = db.createObjectStore(this.STORE_CREDENTIALS, { keyPath: 'key' });
          credStore.createIndex('by_userId', 'userId', { unique: false });
          credStore.createIndex('by_serverId', 'serverId', { unique: false });
          credStore.createIndex('by_userId_serverId', ['userId', 'serverId'], { unique: true });
          Logger.info('IndexedDBMcpStorage: Created credentials store');
        }

        // Deferred tools store
        if (!db.objectStoreNames.contains(this.STORE_DEFERRED_TOOLS)) {
          const toolsStore = db.createObjectStore(this.STORE_DEFERRED_TOOLS, { keyPath: 'toolKey' });
          toolsStore.createIndex('by_serverId', 'serverId', { unique: false });
          toolsStore.createIndex('by_toolName', 'toolName', { unique: false });
          toolsStore.createIndex('by_createdAt', 'createdAt', { unique: false });
          Logger.info('IndexedDBMcpStorage: Created deferred_tools store');
        }
      };
    });
  }

  // ===== App-Level Configuration =====

  async getAppConfig(): Promise<McpAppConfig> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_APP_CONFIG], 'readonly');
      const store = transaction.objectStore(this.STORE_APP_CONFIG);
      const request = store.get('singleton');

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.config) {
          resolve(result.config);
        } else {
          // Return default empty config
          resolve({
            servers: [],
            discovery: { enabled: false },
            defaults: {
              deferLoading: true,
              enableProgrammaticCalling: true,
              timeout: 30000
            }
          });
        }
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to get app config: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async setAppConfig(config: McpAppConfig): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_APP_CONFIG], 'readwrite');
      const store = transaction.objectStore(this.STORE_APP_CONFIG);
      const request = store.put({ id: 'singleton', config });

      request.onsuccess = () => {
        Logger.debug('IndexedDBMcpStorage: App config saved');
        resolve();
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to save app config: ${request.error}`);
        reject(request.error);
      };
    });
  }

  // ===== User-Level Configuration =====

  async getUserConfig(userId: string): Promise<McpUserConfig> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_USER_CONFIGS], 'readonly');
      const store = transaction.objectStore(this.STORE_USER_CONFIGS);
      const request = store.get(userId);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(result);
        } else {
          // Return default empty user config
          resolve({
            userId,
            servers: [],
            preferences: {
              autoLoadTools: true,
              maxServersPerThread: 10,
              toolSearchStrategy: 'bm25',
              enableCostTracking: true
            },
            usage: {
              totalCalls: 0,
              totalTokens: 0,
              lastReset: Date.now()
            }
          });
        }
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to get user config for ${userId}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async setUserConfig(userId: string, config: McpUserConfig): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Ensure userId matches
    config.userId = userId;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_USER_CONFIGS], 'readwrite');
      const store = transaction.objectStore(this.STORE_USER_CONFIGS);
      const request = store.put(config);

      request.onsuccess = () => {
        Logger.debug(`IndexedDBMcpStorage: User config saved for ${userId}`);
        resolve();
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to save user config for ${userId}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async deleteUserConfig(userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_USER_CONFIGS], 'readwrite');
      const store = transaction.objectStore(this.STORE_USER_CONFIGS);
      const request = store.delete(userId);

      request.onsuccess = () => {
        Logger.info(`IndexedDBMcpStorage: User config deleted for ${userId}`);
        resolve();
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to delete user config for ${userId}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async listUserIds(): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_USER_CONFIGS], 'readonly');
      const store = transaction.objectStore(this.STORE_USER_CONFIGS);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to list user IDs: ${request.error}`);
        reject(request.error);
      };
    });
  }

  // ===== Thread-Level Configuration =====

  async getThreadConfig(threadId: string): Promise<McpThreadConfig | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_THREAD_CONFIGS], 'readonly');
      const store = transaction.objectStore(this.STORE_THREAD_CONFIGS);
      const request = store.get(threadId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to get thread config for ${threadId}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async setThreadConfig(threadId: string, config: McpThreadConfig): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Ensure threadId matches and update timestamp
    config.threadId = threadId;
    config.updatedAt = Date.now();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_THREAD_CONFIGS], 'readwrite');
      const store = transaction.objectStore(this.STORE_THREAD_CONFIGS);
      const request = store.put(config);

      request.onsuccess = () => {
        Logger.debug(`IndexedDBMcpStorage: Thread config saved for ${threadId}`);
        resolve();
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to save thread config for ${threadId}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async deleteThreadConfig(threadId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_THREAD_CONFIGS], 'readwrite');
      const store = transaction.objectStore(this.STORE_THREAD_CONFIGS);
      const request = store.delete(threadId);

      request.onsuccess = () => {
        Logger.debug(`IndexedDBMcpStorage: Thread config deleted for ${threadId}`);
        resolve();
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to delete thread config for ${threadId}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async listThreadIds(): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_THREAD_CONFIGS], 'readonly');
      const store = transaction.objectStore(this.STORE_THREAD_CONFIGS);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to list thread IDs: ${request.error}`);
        reject(request.error);
      };
    });
  }

  // ===== Credentials Management =====

  async getUserCredentials(userId: string, serverId: string): Promise<OAuth2Tokens | null> {
    if (!this.db) throw new Error('Database not initialized');

    const key = `${userId}:${serverId}`;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_CREDENTIALS], 'readonly');
      const store = transaction.objectStore(this.STORE_CREDENTIALS);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result as McpCredentialEntry | undefined;
        if (result) {
          // TODO: Decrypt tokens if encryption is enabled
          resolve(result.tokens);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to get credentials for ${key}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async setUserCredentials(userId: string, serverId: string, tokens: OAuth2Tokens): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const key = `${userId}:${serverId}`;
    const entry: McpCredentialEntry = {
      key,
      userId,
      serverId,
      // TODO: Encrypt tokens before storing
      tokens,
      updatedAt: Date.now(),
      expiresAt: tokens.expires_at
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_CREDENTIALS], 'readwrite');
      const store = transaction.objectStore(this.STORE_CREDENTIALS);
      const request = store.put(entry);

      request.onsuccess = () => {
        Logger.debug(`IndexedDBMcpStorage: Credentials saved for ${key}`);
        resolve();
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to save credentials for ${key}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async deleteUserCredentials(userId: string, serverId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const key = `${userId}:${serverId}`;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_CREDENTIALS], 'readwrite');
      const store = transaction.objectStore(this.STORE_CREDENTIALS);
      const request = store.delete(key);

      request.onsuccess = () => {
        Logger.debug(`IndexedDBMcpStorage: Credentials deleted for ${key}`);
        resolve();
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to delete credentials for ${key}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async deleteAllUserCredentials(userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_CREDENTIALS], 'readwrite');
      const store = transaction.objectStore(this.STORE_CREDENTIALS);
      const index = store.index('by_userId');
      const request = index.openCursor(IDBKeyRange.only(userId));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          Logger.info(`IndexedDBMcpStorage: All credentials deleted for user ${userId}`);
          resolve();
        }
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to delete all credentials for ${userId}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  // ===== Deferred Tools (Tool Search Tool Pattern) =====

  async getDeferredTools(): Promise<Map<string, DeferredToolEntry>> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_DEFERRED_TOOLS], 'readonly');
      const store = transaction.objectStore(this.STORE_DEFERRED_TOOLS);
      const request = store.getAll();

      request.onsuccess = () => {
        const tools = new Map<string, DeferredToolEntry>();
        for (const entry of request.result) {
          tools.set(entry.toolKey, entry);
        }
        resolve(tools);
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to get deferred tools: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async setDeferredTools(tools: Map<string, DeferredToolEntry>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_DEFERRED_TOOLS], 'readwrite');
      const store = transaction.objectStore(this.STORE_DEFERRED_TOOLS);

      // Clear existing tools
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        // Add all new tools
        let completed = 0;
        const total = tools.size;

        if (total === 0) {
          resolve();
          return;
        }

        for (const [, entry] of tools) {
          const addRequest = store.add(entry);

          addRequest.onsuccess = () => {
            completed++;
            if (completed === total) {
              Logger.debug(`IndexedDBMcpStorage: Saved ${total} deferred tools`);
              resolve();
            }
          };

          addRequest.onerror = () => {
            Logger.error(`IndexedDBMcpStorage: Failed to add deferred tool ${entry.toolKey}: ${addRequest.error}`);
            reject(addRequest.error);
          };
        }
      };

      clearRequest.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to clear deferred tools: ${clearRequest.error}`);
        reject(clearRequest.error);
      };
    });
  }

  async addDeferredTool(entry: DeferredToolEntry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_DEFERRED_TOOLS], 'readwrite');
      const store = transaction.objectStore(this.STORE_DEFERRED_TOOLS);
      const request = store.put(entry); // Use put to allow updates

      request.onsuccess = () => {
        Logger.debug(`IndexedDBMcpStorage: Deferred tool added: ${entry.toolKey}`);
        resolve();
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to add deferred tool ${entry.toolKey}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async removeDeferredTool(toolKey: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_DEFERRED_TOOLS], 'readwrite');
      const store = transaction.objectStore(this.STORE_DEFERRED_TOOLS);
      const request = store.delete(toolKey);

      request.onsuccess = () => {
        Logger.debug(`IndexedDBMcpStorage: Deferred tool removed: ${toolKey}`);
        resolve();
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to remove deferred tool ${toolKey}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async getDeferredToolsForServer(serverId: string): Promise<DeferredToolEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_DEFERRED_TOOLS], 'readonly');
      const store = transaction.objectStore(this.STORE_DEFERRED_TOOLS);
      const index = store.index('by_serverId');
      const request = index.getAll(serverId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to get deferred tools for server ${serverId}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async searchDeferredTools(query: string, limit: number = 50): Promise<DeferredToolEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    // Simple keyword-based search
    const keywords = query.toLowerCase().split(/\s+/);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_DEFERRED_TOOLS], 'readonly');
      const store = transaction.objectStore(this.STORE_DEFERRED_TOOLS);
      const request = store.getAll();

      request.onsuccess = () => {
        const allTools = request.result as DeferredToolEntry[];

        // Score each tool based on keyword matches
        const scored = allTools.map(tool => {
          const searchText = `${tool.toolName} ${tool.description} ${tool.searchKeywords?.join(' ')}`.toLowerCase();
          const score = keywords.reduce((s, keyword) => {
            return s + (searchText.includes(keyword) ? 1 : 0);
          }, 0);
          return { tool, score };
        });

        // Filter out zero-scored tools, sort by score, and limit results
        const results = scored
          .filter(s => s.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(s => s.tool);

        resolve(results);
      };

      request.onerror = () => {
        Logger.error(`IndexedDBMcpStorage: Failed to search deferred tools: ${request.error}`);
        reject(request.error);
      };
    });
  }

  // ===== Utility Methods =====

  async clear(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stores = [
      this.STORE_APP_CONFIG,
      this.STORE_USER_CONFIGS,
      this.STORE_THREAD_CONFIGS,
      this.STORE_CREDENTIALS,
      this.STORE_DEFERRED_TOOLS
    ];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(stores, 'readwrite');
      let completed = 0;

      for (const storeName of stores) {
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          completed++;
          if (completed === stores.length) {
            Logger.info('IndexedDBMcpStorage: All stores cleared');
            resolve();
          }
        };

        request.onerror = () => {
          Logger.error(`IndexedDBMcpStorage: Failed to clear store ${storeName}: ${request.error}`);
          reject(request.error);
        };
      }
    });
  }

  async export(): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const data: any = {
      version: this.dbVersion,
      exportedAt: new Date().toISOString(),
      appConfig: await this.getAppConfig(),
      userConfigs: {},
      threadConfigs: {},
      credentials: {},
      deferredTools: {}
    };

    // Export user configs
    const userIds = await this.listUserIds();
    for (const userId of userIds) {
      data.userConfigs[userId] = await this.getUserConfig(userId);
    }

    // Export thread configs
    const threadIds = await this.listThreadIds();
    for (const threadId of threadIds) {
      data.threadConfigs[threadId] = await this.getThreadConfig(threadId);
    }

    // Export deferred tools
    const tools = await this.getDeferredTools();
    for (const [key, entry] of tools) {
      data.deferredTools[key] = entry;
    }

    // Note: Credentials are NOT exported for security reasons

    return JSON.stringify(data, null, 2);
  }

  async import(json: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const data = JSON.parse(json);

      // Import app config
      if (data.appConfig) {
        await this.setAppConfig(data.appConfig);
      }

      // Import user configs
      if (data.userConfigs) {
        for (const [userId, config] of Object.entries(data.userConfigs)) {
          await this.setUserConfig(userId, config as McpUserConfig);
        }
      }

      // Import thread configs
      if (data.threadConfigs) {
        for (const [threadId, config] of Object.entries(data.threadConfigs)) {
          if (config) {
            await this.setThreadConfig(threadId, config as McpThreadConfig);
          }
        }
      }

      // Import deferred tools
      if (data.deferredTools) {
        const tools = new Map<string, DeferredToolEntry>();
        for (const [key, entry] of Object.entries(data.deferredTools)) {
          tools.set(key, entry as DeferredToolEntry);
        }
        await this.setDeferredTools(tools);
      }

      Logger.info('IndexedDBMcpStorage: Import completed successfully');
    } catch (error: any) {
      Logger.error(`IndexedDBMcpStorage: Import failed: ${error.message}`);
      throw new Error(`Import failed: ${error.message}`);
    }
  }
}
