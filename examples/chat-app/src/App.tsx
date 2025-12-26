import React, { useState, useEffect, useRef } from 'react';
import { createArtInstance, GeminiAdapter, TodoItemStatus, ObservationType } from 'art-framework';
import type { AgentProps, ArtInstanceConfig, ThreadConfig } from 'art-framework';

import { v4 as uuidv4 } from 'uuid';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Loader2, CheckCircle2, Circle, AlertCircle, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';
import { ConfirmationTool } from './ConfirmationTool';

// Define the type for the ART instance
type ArtInstanceType = Awaited<ReturnType<typeof createArtInstance>>;

interface SuspensionData {
  suspensionId: string;
  itemId?: string;
  toolName: string;
  toolInput: any;
  toolOutput: any;
}

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
  
  // Suspension State
  const [suspensionData, setSuspensionData] = useState<SuspensionData | null>(null);

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
        },
        tools: [new ConfirmationTool()]
      };

      const art = await createArtInstance(config);
      setArtInstance(art);

      const threadConfig: ThreadConfig = {
        providerConfig: {
          providerName: 'gemini',
          modelId: 'gemini-2.5-flash',
          adapterOptions: { apiKey }
        },
        enabledTools: ['displayConfirmation'],
        historyLimit: 20
      };
      await art.stateManager.setThreadConfig(threadId, threadConfig);

      art.uiSystem.getObservationSocket().subscribe(
        (obs) => {
          if (obs.type === ObservationType.AGENT_SUSPENDED) {
              setSuspensionData({
                  suspensionId: obs.content.suspensionId,
                  itemId: obs.parentId,
                  toolName: obs.content.toolName,
                  toolInput: obs.content.toolInput,
                  toolOutput: obs.content.toolOutput
              });
              setIsLoading(false); 
          } else if (obs.type === ObservationType.AGENT_RESUMED) {
              setSuspensionData(null);
              setIsLoading(true); 
          } else if (obs.type === 'PLAN' || obs.type === 'PLAN_UPDATE') {
            if (obs.content.todoList) {
              setTodoList(obs.content.todoList);
            }
            if (obs.content.intent) {
              setIntent(obs.content.intent);
            }
          } else if (obs.type === 'ITEM_STATUS_CHANGE') {
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
        undefined,
        { threadId }
      );

      art.uiSystem.getLLMStreamSocket().subscribe(
        (event) => {
          if (event.type === 'TOKEN') {
            const tokenType = String(event.tokenType || '');
            if (tokenType.includes('THINKING')) {
              setCurrentThought(prev => prev + event.data);
            } else if (tokenType.includes('RESPONSE') || tokenType.includes('LLM_RESPONSE')) {
              setCurrentThought(prev => prev + event.data);
            }
          }
        },
        undefined,
        { threadId }
      );

      setIsConfigured(true);

    } catch (error) {
      console.error("Failed to init agent:", error);
      alert("Failed to initialize agent. Check console.");
    }
  };

  const handleResume = async (approved: boolean) => {
      if (!artInstance || !suspensionData) return;
      
      try {
          setIsLoading(true);
          const decision = approved 
            ? { approved: true, comment: "User approved via UI" }
            : { approved: false, comment: "User rejected via UI" };
            
          const result = await artInstance.resumeExecution(threadId, suspensionData.suspensionId, decision);
          setSuspensionData(null);
          setMessages(prev => [...prev, { role: 'ai', content: result.response.content, id: uuidv4() }]);
      } catch (e: any) {
          console.error("Resume failed:", e);
          setMessages(prev => [...prev, { role: 'system', content: `Resume Error: ${e.message}`, id: uuidv4() }]);
          setIsLoading(false);
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
        if (!suspensionData) {
            setIsLoading(false);
        }
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans relative">
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

        <Card className="flex-1 flex flex-col overflow-hidden relative"> 
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Agent State</CardTitle>
                {intent && <p className="text-xs text-muted-foreground">Intent: {intent}</p>}
            </div>
            {suspensionData && (
                <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-bold animate-pulse border border-amber-300">
                    WAITING FOR APPROVAL
                </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-auto space-y-2">
            {todoList.length === 0 && <p className="text-sm text-muted-foreground italic">No active plan.</p>}
            {todoList.map((item) => {
               const isSuspendedItem = suspensionData?.itemId === item.id;
               return (
              <div key={item.id} className={clsx(
                  "flex items-start gap-2 text-sm border p-2 rounded-md",
                  isSuspendedItem ? "bg-amber-50 border-amber-300 ring-1 ring-amber-300" : "bg-card/50"
              )}>
                {item.status === TodoItemStatus.COMPLETED && <CheckCircle2 size={16} className="text-green-500 mt-0.5" />}
                {isSuspendedItem ? (
                     <ShieldAlert size={16} className="text-amber-500 animate-pulse mt-0.5" />
                ) : (
                    <>
                        {item.status === TodoItemStatus.IN_PROGRESS && <Loader2 size={16} className="text-blue-500 animate-spin mt-0.5" />}
                        {item.status === TodoItemStatus.PENDING && <Circle size={16} className="text-muted-foreground mt-0.5" />}
                        {item.status === TodoItemStatus.FAILED && <AlertCircle size={16} className="text-red-500 mt-0.5" />}
                    </>
                )}
                <div className="flex-1">
                  <p className={clsx(item.status === TodoItemStatus.COMPLETED && "line-through text-muted-foreground", isSuspendedItem && "font-medium text-amber-900")}>
                    {item.description}
                  </p>
                  {isSuspendedItem && (
                      <p className="text-xs text-amber-600 mt-1 font-semibold">
                          Action Required: {suspensionData?.toolName}
                      </p>
                  )}
                </div>
              </div>
            );
            })}
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

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((msg) => {
            let content = msg.content;
            if (typeof content === 'string') {
                const mainContentMatch = content.match(/<mainContent>([\s\S]*?)<\/mainContent>/);
                if (mainContentMatch) {
                    content = mainContentMatch[1].trim();
                } else {
                    content = content.replace(/<\/?mainContent>/g, '').replace(/<uiMetadata>[\s\S]*?<\/uiMetadata>/g, '').trim();
                }
            }
            
            return (
            <div key={msg.id} className={clsx("flex gap-3 max-w-[80%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
              <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={clsx("p-3 rounded-lg", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                {content}
              </div>
            </div>
            );
          })}
          {isLoading && !suspensionData && (
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
              disabled={!isConfigured || isLoading || !!suspensionData}
            />
            <Button type="submit" disabled={!isConfigured || isLoading || !!suspensionData}>
              Send
            </Button>
          </form>
        </div>
      </div>
      
      {suspensionData && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-96 shadow-xl border-orange-500 border-2">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600">
                          <ShieldAlert />
                          Approval Required
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <p className="font-semibold">{suspensionData.toolOutput?.message || "The agent needs your confirmation."}</p>
                      <div className="bg-muted p-2 rounded text-sm font-mono whitespace-pre-wrap">
                          {JSON.stringify(suspensionData.toolInput, null, 2)}
                      </div>
                      {suspensionData.toolOutput?.details && (
                          <p className="text-sm text-muted-foreground">{suspensionData.toolOutput.details}</p>
                      )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => handleResume(false)} className="border-red-500 text-red-500 hover:bg-red-50">
                          Reject
                      </Button>
                      <Button onClick={() => handleResume(true)} className="bg-green-600 hover:bg-green-700">
                          Approve
                      </Button>
                  </CardFooter>
              </Card>
          </div>
      )}
    </div>
  );
};

export default App;