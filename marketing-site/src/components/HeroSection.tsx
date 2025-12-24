import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Shield, Copy, Check, Network, Brain } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const [copied, setCopied] = useState(false);

  const copyInstallCommand = () => {
    navigator.clipboard.writeText('npm install art-framework');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="space-y-8 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-indigo-300">Browser-First AI Framework</span>
          <span className="px-2 py-0.5 bg-indigo-500/20 rounded text-xs font-bold text-indigo-300">v0.4.4</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight"
        >
          <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
            Build Sophisticated
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Agents
          </span>
          <br />
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
            in the Browser
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
        >
          ART is a TypeScript framework for creating production-ready, browser-based AI agents with
          <span className="text-indigo-400"> full observability</span>,{' '}
          <span className="text-purple-400">state management</span>, and{' '}
          <span className="text-pink-400">multi-agent coordination</span>.
        </motion.p>

        {/* Install Command */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="flex justify-center pt-4"
        >
          <motion.button
            onClick={copyInstallCommand}
            className="group flex items-center gap-3 px-6 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl font-mono text-sm hover:border-indigo-500/50 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-slate-500">$</span>
            <span className="text-slate-300">npm install art-framework</span>
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            )}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
        >
          <Link
            to="/concepts"
            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold overflow-hidden shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105 hover:-translate-y-0.5"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              Read the Concepts Guide
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <motion.a
            href="https://github.com/inferq/art"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-slate-800/50 text-white rounded-2xl font-semibold border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            View on GitHub
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-8 pt-12"
        >
          {[
            { icon: Zap, label: 'Lightning Fast', color: 'from-yellow-500 to-orange-500' },
            { icon: Shield, label: 'Production Ready', color: 'from-blue-500 to-cyan-500' },
            { icon: Network, label: 'MCP & A2A', color: 'from-green-500 to-emerald-500' },
            { icon: Brain, label: 'Multi-Provider', color: 'from-purple-500 to-pink-500' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center gap-3 px-6 py-3 bg-slate-900/50 rounded-xl border border-slate-800/50 backdrop-blur-sm"
              whileHover={{ y: -5, borderColor: 'rgba(99, 102, 241, 0.3)' }}
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}
              >
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-300">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-slate-500"
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <ArrowRight className="w-5 h-5 rotate-90" />
        </motion.div>
      </motion.div>
    </div>
  );
}
