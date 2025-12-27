import { motion } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  Brain, 
  Cpu, 
  Database, 
  Network, 
  Layout, 
  Settings, 
  Eye, 
  History,
  Lock,
  MessageSquare,
  CheckCircle2,
  Activity
} from 'lucide-react';

const categories = [
  {
    title: 'Core Runtime',
    icon: Cpu,
    color: 'text-indigo-400',
    features: [
      'PES Orchestration Pattern',
      'Modular Storage Adapters',
      'Pluggable Reasoning Engines',
      'Browser-First Architecture',
      'Standardized Data Pipeline'
    ]
  },
  {
    title: 'Robustness',
    icon: Shield,
    color: 'text-emerald-400',
    features: [
      'HITL V2 Suspension',
      'Crash-Proof State Hydration',
      'TAEF Tool Validation',
      'Partial Result Persistence',
      'Resumable Execution Loops'
    ]
  },
  {
    title: 'Intelligence',
    icon: Brain,
    color: 'text-purple-400',
    features: [
      'Dynamic Plan Refinement',
      'A2A Task Discovery',
      'MCP Protocol Support',
      'Step Output Analytics',
      'Prompt Hierarchy System'
    ]
  },
  {
    title: 'Observability',
    icon: Eye,
    color: 'text-blue-400',
    features: [
      'Reactive Thought Streams',
      'Granular Event Sockets',
      'Standardized Audit Logs',
      'Trace ID Propogation',
      'Stream Metadata Insights'
    ]
  }
];

export default function Features() {
  return (
    <section id="features" className="py-32 px-6 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6"
          >
            <Activity className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Feature Matrix</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Everything you need <br />
            <span className="text-indigo-500">in one place.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-8 rounded-[2.5rem] bg-slate-900/40 border border-slate-800/50 hover:border-indigo-500/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <cat.icon className={`w-6 h-6 ${cat.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-6 tracking-tight">{cat.title}</h3>
              <ul className="space-y-4">
                {cat.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-xs text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-slate-700 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}