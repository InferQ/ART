import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Settings2, 
  MessageSquare, 
  Zap, 
  Database, 
  Activity, 
  Cpu, 
  ArrowRight,
  ShieldCheck,
  Code2,
  Share2
} from 'lucide-react';

const techFeatures = [
  {
    title: 'Agent Personas',
    icon: Users,
    color: 'from-indigo-500 to-blue-600',
    desc: 'Define unique identities with tailored behaviors. Personas resolve via a hierarchy: Instance > Thread > Individual Call.',
    code: `persona: { 
  name: 'Zoi', 
  prompts: { 
    planning: 'You are a precise planner...',
    synthesis: 'Respond in a friendly tone...'
  } 
}`
  },
  {
    title: 'Dual-Layer Memory',
    icon: Database,
    color: 'from-purple-500 to-pink-600',
    desc: 'Distinguish between temporary session state (AgentState) and durable permanent memory (Durable Storage).',
    code: `// Temporary Memory
const state = art.stateManager.getAgentState(id);

// Permanent Persistence
storage: { type: 'supabase' | 'indexedDB' }`
  },
  {
    title: 'Socket Observations',
    icon: Activity,
    color: 'from-emerald-500 to-teal-600',
    desc: 'Deep observability via typed sockets. Subscribe to thoughts, tool calls, and plan updates in real-time.',
    code: `art.uiSystem.getObservationSocket()
  .subscribe(obs => {
    if (obs.type === 'THOUGHTS') {
      updateUI(obs.content.thought);
    }
  });`
  },
  {
    title: 'Reactive Streaming',
    icon: Share2,
    color: 'from-orange-500 to-red-600',
    desc: 'Standardized LLM stream events. Differentiate between reasoning tokens and final answer tokens automatically.',
    code: `art.uiSystem.getLLMStreamSocket()
  .subscribe(event => {
    if (event.type === 'TOKEN') {
      renderToken(event.data);
    }
  });`
  }
];

function HighlightedCode({ code }: { code: string }) {
  // Basic but vibrant highlighting for the technical cards
  const lines = code.split('\n').map((line, i) => {
    const highlighted = line
      .replace(/(\/\/.*)/g, '<span class="text-slate-400 italic">$1</span>')
      .replace(/('.*?')/g, '<span class="text-emerald-400">$1</span>')
      .replace(/\b(const|storage|persona|name|prompts|planning|synthesis|type|if)\b/g, '<span class="text-purple-400">$1</span>')
      .replace(/\b(art|id|state|threadId|obs|event|event\.type)\b/g, '<span class="text-blue-300">$1</span>')
      .replace(/\b(getAgentState|subscribe|updateUI|renderToken)\b/g, '<span class="text-yellow-200">$1</span>');

    return `<div key=${i}>${highlighted}</div>`;
  }).join('');

  return (
    <div 
      className="font-mono text-[11px] leading-relaxed text-slate-300"
      dangerouslySetInnerHTML={{ __html: lines }}
    />
  );
}

export default function TechnicalControl() {
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
            <Settings2 className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Granular Control</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Engineered for <br />
            <span className="text-indigo-500">Customization.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            ART gives you the knobs and dials to control every aspect of your agent's 
            identity, memory, and communication.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {techFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-8 rounded-[2.5rem] bg-slate-900/40 border border-slate-800/50 hover:border-indigo-500/30 transition-all flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{f.title}</h3>
                </div>
              </div>
              
              <p className="text-slate-400 mb-8 leading-relaxed">
                {f.desc}
              </p>

              <div className="mt-auto bg-[#0a0f1d] rounded-2xl border border-slate-800 p-6 font-mono leading-relaxed relative overflow-hidden group-hover:border-indigo-500/30 transition-colors">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                </div>
                <HighlightedCode code={f.code} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Prompt Blueprint Bridge */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-8 md:p-12 rounded-[2.5rem] bg-indigo-600/5 border border-indigo-500/10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left"
        >
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-8 h-8 text-indigo-400" />
          </div>

          <div className="flex-1">
            <h4 className="text-xl font-bold text-white mb-2">Advanced Prompt Templates</h4>
            <p className="text-slate-400 text-sm">
              Use "Prompt Blueprints" to dynamically inject context, custom guidance, 
              and thread-specific instructions into any stage of the agent's reasoning.
            </p>
          </div>
          <Link 
            to="/concepts/pes-agent"
            className="flex items-center gap-2 text-indigo-400 text-sm font-bold group whitespace-nowrap"
          >
            View Prompt SDK
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
