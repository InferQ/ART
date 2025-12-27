import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Layout, 
  History,
  Settings,
  Database,
  Cpu,
  ArrowRight
} from 'lucide-react';

const stages = [
  {
    title: 'Setup & Context',
    icon: Settings,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    description: 'Every execution begins by resolving the Agent Persona and hydrating the Conversation Thread state.',
    steps: [
      { name: 'Configuration', desc: 'Resolve Persona & Call Instructions' },
      { name: 'Context Gathering', desc: 'Load History & Step Output Table' }
    ]
  },
  {
    title: 'Active Reasoning',
    icon: Brain,
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10',
    description: 'The core PES loop breaks down complex tasks into atomic steps with strict validation.',
    steps: [
      { name: 'Planning', desc: 'Dynamic TodoList with TAEF mapping' },
      { name: 'Execution', desc: 'ReAct loops with HITL suspension' },
      { name: 'Synthesis', desc: 'Insight extraction & metadata injection' }
    ],
    isCore: true
  },
  {
    title: 'Durable Finalization',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    description: 'The agent persists its new state and broadcasts observations to all connected UI sockets.',
    steps: [
      { name: 'State Persistence', desc: 'Save changes to durable storage' },
      { name: 'Observation Emission', desc: 'Stream events to the UISystem' }
    ]
  }
];

export default function PESAgentDeepDive() {
  return (
    <section className="py-32 px-6 bg-slate-950 relative overflow-hidden border-t border-slate-900">
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6"
          >
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">The Runtime Architecture</span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8">
            The <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">PES Runtime</span>
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
            A precise 6-stage lifecycle that ensures every agent action is observable, resumable, and robust.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {stages.map((stage, i) => (
            <motion.div
              key={stage.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className={`relative group p-1 border rounded-[2.5rem] transition-all duration-500 ${stage.isCore ? 'border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_40px_-12px_rgba(99,102,241,0.2)]' : 'border-slate-800 bg-slate-900/40'}`}
            >
              <div className="relative p-10 h-full flex flex-col">
                <div className={`w-16 h-16 rounded-2xl ${stage.bg} flex items-center justify-center mb-8 border border-white/5 shadow-lg`}>
                  <stage.icon className={`w-8 h-8 ${stage.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{stage.title}</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  {stage.description}
                </p>
                <div className="mt-auto space-y-4">
                  {stage.steps.map((step) => (
                    <div key={step.name} className="relative pl-6 group/step">
                      <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover/step:scale-150 transition-transform" />
                      <div className="text-white font-bold text-xs mb-0.5 uppercase tracking-wider">{step.name}</div>
                      <div className="text-[10px] text-slate-500">{step.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}