import { motion } from 'framer-motion';
import { Layers, Cpu, Database, Activity, GitBranch, ArrowRight, MousePointer2 } from 'lucide-react';
import { useState } from 'react';

const layers = [
  {
    id: 'app',
    name: 'Application Layer',
    icon: MousePointer2,
    color: 'from-pink-500 to-rose-500',
    desc: 'Your React/TS Frontend',
    details: 'Connect via UISystem sockets to react to agent events in real-time.'
  },
  {
    id: 'state',
    name: 'Context & Persistence',
    icon: Database,
    color: 'from-purple-500 to-indigo-500',
    desc: 'The Memory Manager',
    details: 'Handles ThreadConfig, Step Output Tables, and Durable Storage (IndexedDB/Supabase).'
  },
  {
    id: 'reasoning',
    name: 'Reasoning Engine',
    icon: Brain,
    color: 'from-indigo-500 to-blue-500',
    desc: 'The Orchestrator',
    details: 'Flagship PESAgent logic, Output Parsing, and TAEF Step Classification.'
  },
  {
    id: 'execution',
    name: 'Execution Layer',
    icon: Activity,
    color: 'from-blue-500 to-cyan-500',
    desc: 'The Action Node',
    details: 'Tool Registry, MCP Protocol support, HITL Pausing, and A2A Delegation.'
  }
];

export default function Architecture() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const activeLayerData = layers.find(l => l.id === activeLayer);
  const ActiveIcon = activeLayerData?.icon;

  return (
    <section className="relative py-32 px-6 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Modular Stack</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            The <span className="text-indigo-500">Visual</span> Stack
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            ART is designed as a layered runtime. Each node is independent, 
            allowing you to swap components without rewriting your core logic.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Stack Visualization */}
          <div className="relative space-y-4">
            {layers.map((layer, i) => (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onMouseEnter={() => setActiveLayer(layer.id)}
                className={`relative cursor-pointer group transition-all duration-500 ${activeLayer === layer.id ? 'scale-105 z-10' : 'scale-100 opacity-60 grayscale hover:opacity-100'}`}
              >
                <div className={`p-6 rounded-2xl border bg-slate-900 shadow-2xl transition-colors ${activeLayer === layer.id ? 'border-indigo-500 bg-slate-800' : 'border-slate-800'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${layer.color} flex items-center justify-center shadow-lg`}>
                        <layer.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold tracking-tight">{layer.name}</h3>
                        <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mt-1">{layer.desc}</p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${activeLayer === layer.id ? 'bg-indigo-500 animate-pulse' : 'bg-slate-800'}`} />
                  </div>
                </div>
                {/* Visual Connector */}
                {i < layers.length - 1 && (
                  <div className="absolute left-12 -bottom-4 w-px h-4 bg-slate-800" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Details Panel */}
          <div className="relative min-h-[300px] flex items-center">
            <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full" />
            <motion.div
              key={activeLayer || 'none'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative glass-card bg-slate-900/40 border-slate-800/50 p-10 rounded-[2.5rem] w-full"
            >
              {activeLayer && activeLayerData ? (
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    {ActiveIcon && <ActiveIcon className="w-8 h-8 text-indigo-400" />}
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight">
                    {activeLayerData.name}
                  </h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    {activeLayerData.details}
                  </p>
                  <div className="pt-6 border-t border-slate-800/50">
                    <button className="flex items-center gap-2 text-indigo-400 text-sm font-bold group">
                      Read Technical Docs
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 space-y-4">
                  <Layers className="w-12 h-12 mx-auto opacity-20" />
                  <p className="text-xl">Hover over a layer to see its components</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Brain(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.105 3.001 3.001 0 0 0 5.527.997 3.001 3.001 0 0 0 5.527-.997 3.001 3.001 0 0 0 .52-8.105 4 4 0 0 0-2.526-5.77A3 3 0 1 0 12 5Z" />
      <path d="M9 13a4.5 4.5 0 0 0 3-4" />
      <path d="M12 13a4.5 4.5 0 0 1-3-4" />
      <path d="M12 13a4.5 4.5 0 0 0 3-4" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4" />
    </svg>
  );
}