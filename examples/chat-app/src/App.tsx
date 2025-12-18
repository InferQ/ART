import React, { useState, useEffect, useRef } from 'react';
import { createArtInstance, GeminiAdapter, TodoItemStatus } from 'art-framework';
import type { AgentProps, ArtInstanceConfig, ThreadConfig } from 'art-framework';

import { v4 as uuidv4 } from 'uuid';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Loader2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

// Define the type for the ART instance
type ArtInstanceType = Awaited<ReturnType<typeof createArtInstance>>;

const App = () => {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [artInstance, setArtInstance] = useState<ArtInstanceType | null>(null);
  const [threadId] = useState(uuidv4());
  const [todoList, setTodoList] = useState<any[]>([]);
  const [currentThought, setCurrentThought] = useState<string>('');
  const [intent, setIntent] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentThought]);

  const initAgent = async () => {
    if (!apiKey) return;

    try {
      const config: ArtInstanceConfig = {
        storage: {
          type: 'indexedDB',
          dbName: 'ART_Example_Chat',
          objectStores: ['conversations', 'observations', 'state', 'a2a_tasks']
        },
        providers: {
          availableProviders: [
            {
              name: 'gemini',
              adapter: GeminiAdapter,
              baseOptions: { apiKey }
            }
          ]
        }
      };

      const art = await createArtInstance(config);
      setArtInstance(art);

      // Initialize thread config for this conversation
      const threadConfig: ThreadConfig = {
        providerConfig: {
          providerName: 'gemini',
          modelId: 'gemini-2.5-flash',
          adapterOptions: { apiKey }
        },
        enabledTools: [],
        historyLimit: 20
      };
      await art.stateManager.setThreadConfig(threadId, threadConfig);

      // Subscribe to observations (Plan, Intent, etc.)
      // Note: subscribe takes (callback, filter?, options?) - callback is a direct function
      art.uiSystem.getObservationSocket().subscribe(
        (obs) => {
          console.log("Observation:", obs);
          if (obs.type === 'PLAN' || obs.type === 'PLAN_UPDATE') {
            if (obs.content.todoList) {
              setTodoList(obs.content.todoList);
            }
            if (obs.content.intent) {
              setIntent(obs.content.intent);
            }
          } else if (obs.type === 'ITEM_STATUS_CHANGE') {
            // Update specific item status in the list
            setTodoList(prev => prev.map(item => {
              if (item.id === obs.content.itemId) {
                return { ...item, status: obs.content.status };
              }
              return item;
            }));
          } else if (obs.type === 'INTENT') {
            setIntent(obs.content.intent);
          }
        },
        undefined, // no filter
        { threadId }
      );

      // Subscribe to LLM Stream (Thoughts and Responses)
      art.uiSystem.getLLMStreamSocket().subscribe(
        (event) => {
          if (event.type === 'TOKEN') {
            // Log all tokens for debugging
            console.log('LLM Token:', { tokenType: event.tokenType, dataLength: event.data?.length });

            // Accumulate tokens based on type
            const tokenType = String(event.tokenType || '');
            if (tokenType.includes('THINKING')) {
              // Thinking/reasoning tokens
              setCurrentThought(prev => prev + event.data);
            } else if (tokenType.includes('RESPONSE') || tokenType.includes('LLM_RESPONSE')) {
              // Regular response tokens - also show in thoughts panel for now to verify streaming
              setCurrentThought(prev => prev + event.data);
            }
          }
        },
        undefined, // no filter
        { threadId }
      );

      setIsConfigured(true);

    } catch (error) {
      console.error("Failed to init agent:", error);
      alert("Failed to initialize agent. Check console.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !artInstance) return;

    const userMsg = { role: 'user', content: input, id: uuidv4() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setTodoList([]);
    setCurrentThought('');
    setIntent('');

    const props: AgentProps = {
      threadId,
      query: input,
      userId: 'test-user',
      sessionId: 'test-session',
      options: {
        providerConfig: {
          providerName: 'gemini',
          modelId: 'gemini-2.5-flash',
          adapterOptions: {}
        },
        // Enable Gemini thinking/reasoning output
        llmParams: {
          gemini: {
            thinking: {
              includeThoughts: true,
              thinkingBudget: 8096
            }
          }
        }
      }
    };

    try {
      const result = await artInstance.process(props);
      setMessages(prev => [...prev, { role: 'ai', content: result.response.content, id: uuidv4() }]);
    } catch (e: any) {
      console.error("Agent execution failed:", e);
      setMessages(prev => [...prev, { role: 'system', content: `Error: ${e.message}`, id: uuidv4() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      {/* Sidebar for Config and Plan */}
      <div className="w-1/3 border-r bg-muted/20 p-4 flex flex-col gap-4 overflow-hidden">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConfigured ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gemini API Key</label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="Paste your API Key"
                  />
                </div>
                <Button onClick={initAgent} className="w-full">
                  Initialize Agent
                </Button>
              </>
            ) : (
              <div className="text-green-600 flex items-center gap-2">
                <CheckCircle2 size={20} />
                <span>Agent Ready</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle>Agent State</CardTitle>
            {intent && <p className="text-xs text-muted-foreground">Intent: {intent}</p>}
          </CardHeader>
          <CardContent className="flex-1 overflow-auto space-y-2">
            {todoList.length === 0 && <p className="text-sm text-muted-foreground italic">No active plan.</p>}
            {todoList.map((item) => (
              <div key={item.id} className="flex items-start gap-2 text-sm border p-2 rounded-md bg-card/50">
                {item.status === TodoItemStatus.COMPLETED && <CheckCircle2 size={16} className="text-green-500 mt-0.5" />}
                {item.status === TodoItemStatus.IN_PROGRESS && <Loader2 size={16} className="text-blue-500 animate-spin mt-0.5" />}
                {item.status === TodoItemStatus.PENDING && <Circle size={16} className="text-muted-foreground mt-0.5" />}
                {item.status === TodoItemStatus.FAILED && <AlertCircle size={16} className="text-red-500 mt-0.5" />}
                <div className="flex-1">
                  <p className={clsx(item.status === TodoItemStatus.COMPLETED && "line-through text-muted-foreground")}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="h-1/3 flex flex-col overflow-hidden">
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Live Thoughts</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto bg-black/90 text-green-400 font-mono text-xs p-2">
            {currentThought || "Waiting for thoughts..."}
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={clsx("flex gap-3 max-w-[80%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
              <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={clsx("p-3 rounded-lg", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-background">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={!isConfigured || isLoading}
            />
            <Button type="submit" disabled={!isConfigured || isLoading}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
