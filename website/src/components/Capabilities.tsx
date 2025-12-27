import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Brain, 
  Database, 
  Layout, 
  CheckCircle2, 
  Zap, 
  Network, 
  History, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

const triad = [
  {
    id: 'agent',
    title: '1. The Agent',
    icon: Brain,
    color: 'from-indigo-500 to-purple-600',
    description: 'The brain of the system. It doesn\'t just guess—it plans, refines, and acts with precision.',
    details: [
      'Multi-step TodoList creation',
      'Dynamic plan adjustment',
      'Tool-aware execution (TAEF)'
    ]
  },
  {
    id: 'state',
    title: '2. The State',
    icon: Database,
    color: 'from-purple-500 to-pink-600',
    description: 'The memory of the system. Every observation and result is saved for total resilience.',
    details: [
      'Full state persistence',
      'Crash-proof execution',
      'Cross-session context'
    ]
  },
  {
    id: 'ui',
    title: '3. The Interface',
    icon: Layout,
    color: 'from-pink-500 to-rose-600',
    description: 'The bridge to the user. Standardized sockets stream the agent\'s mind in real-time.',
    details: [
      'Reactive thought streaming',
      'Standardized observation IDs',
      'Real-time status updates'
    ]
  }
];

export default function Capabilities() {
  const [activeTriad, setActiveTriad] = useState(0);

  return (
    <section id="capabilities" className="py-32 px-6 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">The Architecture of Trust</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            The <span className="text-indigo-500">Reactive</span> Triad
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            ART is built on three pillars that work in perfect harmony to turn 
            unpredictable AI into reliable production agents.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {triad.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onMouseEnter={() => setActiveTriad(i)}
              className={`relative p-10 rounded-[2.5rem] border transition-all duration-500 cursor-default ${activeTriad === i ? 'bg-slate-900 border-indigo-500/50 shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)]' : 'bg-slate-950 border-slate-800'}`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-8 shadow-xl`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{item.title}</h3>
              <p className="text-slate-400 mb-8 leading-relaxed text-sm">
                {item.description}
              </p>
              <ul className="space-y-3">
                {item.details.map(detail => (
                  <li key={detail} className="flex items-center gap-3 text-xs text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    {detail}
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
