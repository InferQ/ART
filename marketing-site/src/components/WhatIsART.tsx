import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Cpu, Zap, Shield, Layers, ArrowRight } from 'lucide-react';

interface WhatIsARTProps {
  scrollY: any;
}

const highlights = [
  {
    icon: Cpu,
    color: 'from-indigo-500 to-purple-500',
    title: 'Browser-First',
    description:
      'Run entirely in the browser for enhanced privacy, offline capability, and zero server costs',
    features: ['Zero server latency', 'Client-side processing', 'Offline capable'],
  },
  {
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
    title: 'PESAgent System',
    description: 'Plan-Execute-Synthesize workflow with persistent TodoLists and state recovery',
    features: ['Structured planning', 'Resumable execution', 'Result synthesis'],
  },
  {
    icon: Layers,
    color: 'from-blue-500 to-cyan-500',
    title: 'Modular Architecture',
    description: 'Swap providers, storage, and tools with standardized interfaces',
    features: ['Multi-provider support', 'Pluggable storage', 'MCP integration'],
  },
  {
    icon: Shield,
    color: 'from-green-500 to-emerald-500',
    title: 'Production Ready',
    description: 'Built with TypeScript, full observability, and A2A delegation support',
    features: ['Type safety', 'Deep observability', 'Agent-to-Agent (A2A)'],
  },
];

export default function WhatIsART({ scrollY }: WhatIsARTProps) {
  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]);

  return (
    <section ref={containerRef} className="py-32 px-6 relative">
      <motion.div style={{ opacity, y }} className="max-w-7xl mx-auto">
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
              What is ART?
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            ART is a TypeScript framework for building sophisticated LLM-powered agents in the
            browser.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="group relative"
            >
              <motion.div
                className="relative h-full bg-slate-900/50 border border-slate-800/50 rounded-3xl p-8 lg:p-10 overflow-hidden"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />
                <motion.div
                  className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${item.color} opacity-10 blur-[100px] -translate-y-32 translate-x-32`}
                />

                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.1, type: 'spring', stiffness: 200 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-2xl shadow-${item.color.split('-')[0]}-500/25`}
                  >
                    <item.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3 className="text-2xl lg:text-3xl font-bold mb-4 tracking-tight text-white">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 mb-6 leading-relaxed">{item.description}</p>

                  <ul className="space-y-3">
                    {item.features.map((feature) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <motion.div
                          className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0"
                          whileHover={{ scale: 1.2 }}
                        >
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        </motion.div>
                        <span className="text-slate-300">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
