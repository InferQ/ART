import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Infinity, Lock, RefreshCw, Eye, Cpu, Database } from 'lucide-react';

const highlights = [
  {
    title: 'Zero Cold Starts',
    desc: 'Local execution eliminates server roundtrips and cloud-init latency.',
    icon: Zap,
    stat: '0ms',
    label: 'Overhead'
  },
  {
    title: 'A2A Discovery',
    desc: 'Native protocol for agents to coordinate across distributed task graphs.',
    icon: Infinity,
    stat: 'Dynamic',
    label: 'Scalability'
  },
  {
    title: 'Hallucination Guard',
    desc: 'TAEF strictly sandboxes tool calls, ensuring protocol adherence.',
    icon: ShieldCheck,
    stat: 'Strict',
    label: 'Reliability'
  },
  {
    title: 'State Hydration',
    desc: 'Automatic context restoration from crash or network interruption.',
    icon: RefreshCw,
    stat: 'Durable',
    label: 'Resilience'
  },
  {
    title: 'HITL V2 Safety',
    desc: 'Enterprise-grade approval flows for sensitive tool execution.',
    icon: Lock,
    stat: 'Secure',
    label: 'Control'
  },
  {
    title: 'Audit-Ready',
    desc: 'Every thought and action is logged with unique trace identifiers.',
    icon: Eye,
    stat: '100%',
    label: 'Traceability'
  }
];

export default function ProductionReady() {
  return (
    <section className="py-32 px-6 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card bg-indigo-600/5 border-indigo-500/10 rounded-[3rem] p-8 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative">
            <div className="mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6"
              >
                <Lock className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300">Enterprise Standards</span>
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Built for <span className="text-indigo-400">Production.</span>
              </h2>
              <p className="text-slate-400 text-xl max-w-2xl leading-relaxed">
                ART is engineered for the demands of real-world software. 
                Focus on your agent's logic while the framework handles the heavy lifting of state, safety, and scale.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {highlights.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-4 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <item.icon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="pt-4 border-t border-slate-800/50">
                    <div className="text-3xl font-bold text-white mb-1">{item.stat}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{item.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}