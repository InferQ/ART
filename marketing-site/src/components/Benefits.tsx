import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Zap,
  Shield,
  Database,
  Activity,
  GitBranch,
  Globe,
  Cpu,
  Lock,
  TrendingUp,
} from 'lucide-react';

const benefits = [
  {
    icon: Globe,
    color: 'from-purple-500 to-pink-500',
    title: 'Browser-First AI',
    description: 'Run AI agents entirely in browser for instant responses and zero server costs',
    stat: '0ms',
    statLabel: 'Server latency',
    statDescription: 'Zero cold starts',
  },
  {
    icon: Database,
    color: 'from-blue-500 to-cyan-500',
    title: 'Stateful Memory',
    description: 'Maintain context and state across conversations for coherent interactions',
    stat: '100%',
    statLabel: 'Context retention',
    statDescription: 'Cross-session memory',
  },
  {
    icon: Activity,
    color: 'from-green-500 to-emerald-500',
    title: 'Deep Observability',
    description: 'Complete visibility into agent decisions, plans, and execution steps',
    stat: 'Full',
    statLabel: 'Execution trace',
    statDescription: 'Every step tracked',
  },
  {
    icon: GitBranch,
    color: 'from-indigo-500 to-purple-500',
    title: 'Dynamic Planning',
    description: 'Adapt and refine plans in real-time based on execution results',
    stat: 'Live',
    statLabel: 'Plan adaptation',
    statDescription: 'Real-time replanning',
  },
  {
    icon: Shield,
    color: 'from-orange-500 to-red-500',
    title: 'Multi-Agent Scale',
    description: 'Coordinate multiple agents to solve complex tasks through delegation',
    stat: '∞',
    statLabel: 'Agent coordination',
    statDescription: 'Unlimited scale',
  },
  {
    icon: Lock,
    color: 'from-yellow-500 to-orange-500',
    title: 'Enhanced Privacy',
    description: 'Process sensitive data client-side with optional server components',
    stat: 'Client',
    statLabel: 'Side processing',
    statDescription: 'Data stays local',
  },
  {
    icon: Cpu,
    color: 'from-rose-500 to-pink-500',
    title: 'Provider Flexibility',
    description: 'Switch between LLM providers to optimize for cost or performance',
    stat: 'Any',
    statLabel: 'LLM provider',
    statDescription: 'Easy switching',
  },
  {
    icon: TrendingUp,
    color: 'from-teal-500 to-green-500',
    title: 'Streaming Architecture',
    description: 'Real-time streaming of responses including reasoning and tool use',
    stat: 'Real-time',
    statLabel: 'Response flow',
    statDescription: 'Instant feedback',
  },
];

export default function Benefits() {
  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9]);

  return (
    <section
      ref={containerRef}
      id="benefits"
      className="py-32 px-6 bg-gradient-to-b from-slate-950/50 to-slate-900/50 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[200px]" />
      </div>

      <motion.div style={{ opacity, scale }} className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-8 tracking-tight"
          >
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Why Choose ART?
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            Innovations that transform how you build AI applications
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="group relative"
            >
              <motion.div
                className="relative h-full bg-slate-900/80 border border-slate-800/50 rounded-3xl p-6 overflow-hidden"
                whileHover={{ scale: 1.03, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />

                <motion.div
                  whileHover={{ rotate: 360, scale: 1.15 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-5 shadow-xl`}
                >
                  <benefit.icon className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold mb-3 tracking-tight text-white">
                  {benefit.title}
                </h3>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">{benefit.description}</p>

                <div className="space-y-3">
                  <div className="pt-4 border-t border-slate-800/50">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                    >
                      <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        {benefit.stat}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
                        {benefit.statLabel}
                      </div>
                    </motion.div>
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="text-xs text-slate-500"
                  >
                    {benefit.statDescription}
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute top-4 right-4 opacity-0 transition-opacity duration-300"
                >
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <motion.p className="text-slate-400 text-lg">
            Each benefit is designed to give you production-ready AI capabilities
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
}
