import { motion } from 'framer-motion';
import { 
  Cloud, 
  Database, 
  Cpu, 
  Layers, 
  Zap, 
  Shield, 
  Globe, 
  Box,
  Brain,
  MessageSquare,
  Infinity,
  Plug
} from 'lucide-react';

const providers = [
  { name: 'Google Gemini', desc: 'ThinkingLevel support', icon: Brain, color: 'from-blue-400 to-blue-600' },
  { name: 'Anthropic Claude', desc: 'Extended Thinking', icon: MessageSquare, color: 'from-orange-400 to-orange-600' },
  { name: 'OpenAI GPT', desc: 'Reasoning models', icon: Cpu, color: 'from-emerald-400 to-emerald-600' },
  { name: 'DeepSeek', desc: 'Deep reasoning', icon: Zap, color: 'from-indigo-400 to-indigo-600' },
  { name: 'Groq', desc: 'Ultra-fast LPU', icon: Cloud, color: 'from-amber-400 to-amber-600' },
  { name: 'OpenRouter', desc: '100+ Models', icon: Globe, color: 'from-purple-400 to-purple-600' },
  { name: 'Ollama', desc: 'Local models', icon: Box, color: 'from-slate-400 to-slate-600' },
];

const integrations = [
  { name: 'MCP', label: 'Model Context Protocol', icon: Plug, color: 'from-teal-400 to-teal-600' },
  { name: 'Supabase', label: 'Backend Persistence', icon: Database, color: 'from-emerald-500 to-emerald-700' },
  { name: 'IndexedDB', label: 'Local Persistence', icon: Layers, color: 'from-indigo-400 to-indigo-600' },
  { name: 'A2A', label: 'Agent Coordination', icon: Infinity, color: 'from-pink-400 to-pink-600' },
];

export default function Coverage() {
  return (
    <section className="py-24 px-6 relative overflow-hidden bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Providers */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
                Universal <span className="text-indigo-400">Provider</span> Support
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                ART abstracts away provider-specific complexities, giving you a unified interface 
                to the world's most powerful reasoning models.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {providers.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-indigo-500/30 transition-all flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg`}>
                    <p.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{p.name}</h3>
                    <p className="text-xs text-slate-500">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Integrations */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card bg-slate-900/40 border-slate-800/50 p-8 lg:p-12 rounded-[2.5rem] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Plug className="w-32 h-32 text-indigo-500 rotate-12" />
            </div>

            <div className="relative space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest">
                Integrations
              </div>
              
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Built for <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Production</span>
              </h2>

              <div className="space-y-4">
                {integrations.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 group hover:bg-slate-950 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.label}</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-md bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                      Natively Supported
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4">
                <p className="text-sm text-slate-500 italic">
                  + Custom adapters for any storage or reasoning provider
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
