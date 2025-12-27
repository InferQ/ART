import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Cpu, 
  Zap, 
  Shield, 
  Layers, 
  RefreshCw, 
  MessageSquare, 
  ArrowRight, 
  Brain, 
  Eye,
  Lock,
  Globe,
  Infinity,
  Puzzle,
  Network
} from 'lucide-react';

interface WhatIsARTProps {
  scrollY: any;
}

const uniqueValue = [
  {
    icon: Globe,
    title: 'The Browser is the Hub',
    description: 'Run complex agent logic locally to drastically reduce server overhead. Scale to millions of users without the infrastructure bills of traditional backend-heavy agent frameworks.',
    outcome: 'Infrastructure Efficiency'
  },
  {
    icon: Puzzle,
    title: 'Modular yet Complete',
    description: 'A pluggable architecture that gives you total flexibility. Use ART out-of-the-box for instant prototyping, or swap any component—storage, provider, or tools—as you grow.',
    outcome: 'Rapid Prototyping'
  },
  {
    icon: Network,
    title: 'Intelligent Orchestration',
    description: 'Built-in support for MCP, A2A agents, and custom tools. ART agents don\'t just chat; they understand and adapt to real-world data and user environments natively.',
    outcome: 'Real-World Integration'
  }
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
    <section ref={containerRef} className="relative py-32 px-6 overflow-hidden bg-slate-950">
      <motion.div style={{ opacity, y }} className="max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300 uppercase tracking-widest">The Paradigm Shift</span>
          </motion.div>
          
          <h2 className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-8">
            Why building with <br />
            <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">ART is Different.</span>
          </h2>
          <p className="text-slate-400 text-xl md:text-2xl leading-relaxed">
            Standard frameworks give you a library of functions. <br className="hidden md:block" />
            ART gives you a <strong>standardized runtime</strong> that lives where your users are.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {uniqueValue.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group flex flex-col"
            >
              <div className="mb-8 relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]">
                  <item.icon className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="absolute -inset-2 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-indigo-400 transition-colors">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed mb-8 text-lg">
                {item.description}
              </p>
              
              <div className="mt-auto pt-6 border-t border-slate-800/50">
                <div className="text-[10px] text-slate-600 uppercase font-black tracking-[0.2em] mb-1">Impact</div>
                <div className="text-emerald-400 font-mono font-bold tracking-tight">{item.outcome}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function Sparkles(props: any) {
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
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
