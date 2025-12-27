import { motion } from 'framer-motion';
import { Check, Code2, Sparkles, Terminal } from 'lucide-react';

export default function SDKSimplicity() {
  return (
    <section className="py-32 px-6 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">Radical Simplicity</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              Complex Infrastructure, <br />
              <span className="text-emerald-400">One Simple SDK.</span>
            </h2>
            
            <p className="text-slate-400 text-xl leading-relaxed">
              Stop building state managers, observation sockets, and tool validators from scratch. 
              ART abstracts the "Agentic Infrastructure" so you can focus on the user experience.
            </p>

            <ul className="space-y-4">
              {[
                'Automatic State Management',
                'Built-in Observation Sockets',
                'Strict Tool Protocol (TAEF)',
                'Multi-Provider Support out of the box'
              ].map((text) => (
                <li key={text} className="flex items-center gap-3 text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full -z-10" />
            
            {/* Code Comparison Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card bg-slate-900 border-slate-800 rounded-3xl p-1 overflow-hidden"
            >
              <div className="bg-slate-950/50 p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                  <Terminal className="w-3 h-3" />
                  app.ts
                </div>
              </div>
              <div className="p-8 font-mono text-sm leading-relaxed overflow-x-auto bg-[#0a0f1d]">
                <div className="text-slate-400 italic mb-4 tracking-wide">// 1. Initialize with pluggable nodes</div>
                <div className="flex flex-col gap-1.5">
                  <div>
                    <span className="text-purple-400">const</span> <span className="text-blue-300">art</span> <span className="text-white">=</span> <span className="text-purple-400">await</span> <span className="text-yellow-200">createArtInstance</span><span className="text-white">({'{'}</span>
                  </div>
                  <div className="pl-4 text-slate-300">
                    storage: <span className="text-white">{'{'}</span> type: <span className="text-emerald-400">'indexedDB'</span>, dbName: <span className="text-emerald-400">'AgentDB'</span> <span className="text-white">{'}'}</span>,
                  </div>
                  <div className="pl-4 text-slate-300">
                    providers: <span className="text-white">{'{'}</span> availableProviders: <span className="text-white">[</span><span className="text-blue-300">OpenAIAdapter</span><span className="text-white">]</span> <span className="text-white">{'}'}</span>,
                  </div>
                  <div className="pl-4 text-slate-300">
                    tools: <span className="text-white">[</span><span className="text-purple-400">new</span> <span className="text-sky-300">CalculatorTool</span><span className="text-white">()]</span>
                  </div>
                  <div className="text-white">{'}'});</div>
                </div>
                
                <div className="text-slate-400 italic mb-4 mt-10 tracking-wide">// 2. Configure thread & key security</div>
                <div className="flex flex-col gap-1.5">
                  <div>
                    <span className="text-purple-400">await</span> <span className="text-blue-300">art</span>.<span className="text-blue-300">stateManager</span>.<span className="text-yellow-200">setThreadConfig</span><span className="text-white">(</span><span className="text-emerald-400">'session-1'</span><span className="text-white">, {'{'}</span>
                  </div>
                  <div className="pl-4 text-slate-300">
                    providerConfig: <span className="text-white">{'{'}</span> providerName: <span className="text-emerald-400">'openai'</span>, modelId: <span className="text-emerald-400">'gpt-4o'</span> <span className="text-white">{'}'}</span>,
                  </div>
                  <div className="pl-4 text-slate-300">
                    enabledTools: <span className="text-white">[</span><span className="text-emerald-400">'CalculatorTool'</span><span className="text-white">]</span>
                  </div>
                  <div className="text-white">{'}'});</div>
                </div>

                <div className="text-slate-400 italic mb-4 mt-10 tracking-wide">// 3. Process with full orchestration</div>
                <div className="flex flex-col gap-1.5">
                  <div>
                    <span className="text-purple-400">const</span> <span className="text-blue-300">result</span> <span className="text-white">=</span> <span className="text-purple-400">await</span> <span className="text-blue-300">art</span>.<span className="text-yellow-200">process</span><span className="text-white">({'{'}</span>
                  </div>
                  <div className="pl-4 text-slate-300">
                    query: <span className="text-emerald-400">"Research and calculate ROI"</span>,
                  </div>
                  <div className="pl-4 text-slate-300">
                    threadId: <span className="text-emerald-400">'session-1'</span>
                  </div>
                  <div className="text-white">{'}'});</div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-800/50">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">
                    <Check className="w-4 h-4" />
                    Infrastructure solved.
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Labels */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -right-6 glass-card bg-slate-900 border-slate-800 px-4 py-2 rounded-xl text-[10px] text-slate-400 font-mono shadow-xl"
            >
              Persistence: <span className="text-emerald-400">ENABLED</span>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-6 -left-6 glass-card bg-slate-900 border-slate-800 px-4 py-2 rounded-xl text-[10px] text-slate-400 font-mono shadow-xl"
            >
              Observability: <span className="text-indigo-400">STREAMING</span>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
