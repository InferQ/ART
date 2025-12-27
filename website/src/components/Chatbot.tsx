/**
 * Chatbot Component
 * 
 * A floating chatbot interface for the ART Framework documentation assistant.
 * Features:
 * - Floating action button launcher
 * - Expandable chat panel with glassmorphism styling
 * - Real-time streaming responses
 * - Source citation links
 * - Provider/model configuration (optional - works with default Groq)
 */

import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Settings, Loader2, ExternalLink, Trash2, ChevronDown, Bot, User, Check } from 'lucide-react';
import { ChatProvider, useChat, PROVIDER_MODELS, type ChatMessage, type Provider } from '../utils/chat-context';
import MarkdownRenderer from './MarkdownRenderer';

// Provider display names and colors
const PROVIDER_INFO: Record<Provider, { name: string; color: string }> = {
    groq: { name: 'Groq', color: 'from-orange-500 to-amber-500' },
    openai: { name: 'OpenAI', color: 'from-emerald-500 to-green-500' },
    gemini: { name: 'Gemini', color: 'from-blue-500 to-cyan-500' },
    anthropic: { name: 'Anthropic', color: 'from-orange-600 to-red-500' },
};

// Configuration modal component
function ConfigModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { currentConfig, hasDefaultApiKey, configure } = useChat();
    const [provider, setProvider] = useState<Provider>(currentConfig.provider);
    const [model, setModel] = useState(currentConfig.model);
    const [apiKey, setApiKey] = useState(currentConfig.apiKey);
    const [useCustomKey, setUseCustomKey] = useState(!hasDefaultApiKey || currentConfig.provider !== 'groq');

    // Update model when provider changes
    useEffect(() => {
        if (provider !== currentConfig.provider) {
            setModel(PROVIDER_MODELS[provider][0].id);
            // Need custom key for non-groq providers (unless they set one)
            if (provider !== 'groq') {
                setUseCustomKey(true);
                setApiKey('');
            } else if (hasDefaultApiKey) {
                setUseCustomKey(false);
            }
        }
    }, [provider, currentConfig.provider, hasDefaultApiKey]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Determine API key to use
        let finalApiKey = apiKey;
        if (provider === 'groq' && !useCustomKey && hasDefaultApiKey) {
            // Use default key from environment
            finalApiKey = (import.meta.env.VITE_GROQ_API_KEY as string) || '';
        }

        if (!finalApiKey && (useCustomKey || provider !== 'groq')) {
            return; // Don't submit without key
        }

        configure({ provider, model, apiKey: finalApiKey });
        onClose();
    };

    if (!isOpen) return null;

    const models = PROVIDER_MODELS[provider];
    const needsApiKey = useCustomKey || provider !== 'groq' || !hasDefaultApiKey;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-gray-700 rounded-xl p-5 w-full max-w-sm max-h-[90%] overflow-y-auto"
            >
                <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Provider Selection */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Provider</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(Object.keys(PROVIDER_INFO) as Provider[]).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setProvider(p)}
                                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${provider === p
                                            ? `bg-gradient-to-r ${PROVIDER_INFO[p].color} text-white border-transparent`
                                            : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600'
                                        }`}
                                >
                                    {PROVIDER_INFO[p].name}
                                    {p === 'groq' && hasDefaultApiKey && (
                                        <span className="ml-1 text-xs opacity-75">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Model Selection */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Model</label>
                        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                            {models.map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setModel(m.id)}
                                    className={`w-full px-3 py-2 rounded-lg border text-left transition-all ${model === m.id
                                            ? 'bg-violet-600/20 border-violet-500 text-white'
                                            : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">{m.name}</span>
                                        {model === m.id && <Check size={14} className="text-violet-400" />}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* API Key (optional for Groq if default exists) */}
                    {provider === 'groq' && hasDefaultApiKey && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="useCustomKey"
                                checked={useCustomKey}
                                onChange={(e) => setUseCustomKey(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-600 focus:ring-violet-500"
                            />
                            <label htmlFor="useCustomKey" className="text-sm text-gray-400">
                                Use custom API key
                            </label>
                        </div>
                    )}

                    {needsApiKey && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                {provider === 'groq' ? 'Groq' : PROVIDER_INFO[provider].name} API Key
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={`Enter your ${PROVIDER_INFO[provider].name} API key`}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-sm"
                            />
                        </div>
                    )}

                    <p className="text-xs text-gray-500">
                        {needsApiKey
                            ? "Your API key is stored only in memory and never sent to our servers."
                            : "Using the default Groq API key configured for this site."}
                    </p>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={needsApiKey && !apiKey}
                            className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:hover:bg-violet-600 text-sm"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// Message component
function Message({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
        >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-violet-600' : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                }`}>
                {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
            </div>
            <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
                <div className={`inline-block max-w-[85%] px-4 py-2 rounded-2xl ${isUser
                        ? 'bg-violet-600 text-white rounded-br-md'
                        : 'bg-gray-800 text-gray-100 rounded-bl-md'
                    }`}>
                    {isUser ? (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="text-sm prose prose-invert prose-sm max-w-none">
                            <MarkdownRenderer content={message.content} />
                        </div>
                    )}
                </div>

                {/* Source citations */}
                {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {message.sources.map((source, idx) => (
                            <a
                                key={idx}
                                href={source.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-full text-xs text-violet-400 transition-colors"
                            >
                                <span>{source.title}</span>
                                <ExternalLink size={10} />
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Typing indicator
function TypingIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
        >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Bot size={16} className="text-white" />
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                    <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                </div>
            </div>
        </motion.div>
    );
}

// Chat panel content
function ChatPanelContent({ onClose }: { onClose: () => void }) {
    const { messages, isConfigured, isLoading, error, currentConfig, sendMessage, clearChat } = useChat();
    const [input, setInput] = useState('');
    const [showConfig, setShowConfig] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const message = input.trim();
        setInput('');
        await sendMessage(message);
    };

    // Get current model name
    const currentModel = PROVIDER_MODELS[currentConfig.provider].find(m => m.id === currentConfig.model);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-20 right-0 w-[380px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-10rem)] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50 bg-gray-800/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <Bot size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">ART Docs Assistant</h3>
                        <p className="text-xs text-gray-400">
                            {PROVIDER_INFO[currentConfig.provider].name} • {currentModel?.name || currentConfig.model}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowConfig(true)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                        title="Settings"
                    >
                        <Settings size={18} />
                    </button>
                    <button
                        onClick={clearChat}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                        title="Clear chat"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4">
                            <MessageSquare size={28} className="text-violet-400" />
                        </div>
                        <h4 className="text-white font-medium mb-2">Welcome!</h4>
                        <p className="text-gray-400 text-sm mb-4">
                            I'm your ART Framework documentation assistant. Ask me anything about PES Agents, state management, tools, UI integration, and more.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {['What is PES Agent?', 'How do I create a tool?', 'State management'].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => {
                                        setInput(suggestion);
                                        inputRef.current?.focus();
                                    }}
                                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-xs text-gray-300 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <Message key={msg.id} message={msg} />
                        ))}
                        {isLoading && <TypingIndicator />}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Error display */}
            {error && (
                <div className="px-4 py-2 bg-red-900/30 border-t border-red-800/50">
                    <p className="text-red-400 text-xs">{error}</p>
                </div>
            )}

            {/* Input area */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700/50 bg-gray-800/30">
                {!isConfigured ? (
                    <button
                        type="button"
                        onClick={() => setShowConfig(true)}
                        className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <Settings size={18} />
                        Configure API Key to Start
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about ART Framework..."
                            disabled={isLoading}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 disabled:opacity-50 text-sm"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:hover:bg-violet-600 text-white rounded-xl transition-colors"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>
                )}
            </form>

            {/* Config modal */}
            <AnimatePresence>
                {showConfig && (
                    <ConfigModal
                        isOpen={showConfig}
                        onClose={() => setShowConfig(false)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Main Chatbot component
function ChatbotInner() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && <ChatPanelContent onClose={() => setIsOpen(false)} />}
            </AnimatePresence>

            {/* Floating action button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${isOpen
                        ? 'bg-gray-800 text-white'
                        : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500'
                    }`}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={24} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageSquare size={24} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}

// Export with provider wrapper
export default function Chatbot() {
    return (
        <ChatProvider>
            <ChatbotInner />
        </ChatProvider>
    );
}
