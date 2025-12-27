import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Shield, Copy, Check, Network, Brain, Play, Terminal, Database, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const pesStages = [
  { id: 'plan', label: 'THINK', icon: Brain, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { id: 'execute', label: 'ACT', icon: Zap, icon2: Cpu, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { id: 'synthesize', label: 'ANSWER', icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' }
];

export default function HeroSection() {
  const [copied, setCopied] = useState(false);
  const [activePesStage, setActivePesStage] = useState(0);

  const copyInstallCommand = () => {
    navigator.clipboard.writeText('npm install art-framework');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePesStage((prev) => (prev + 1) % pesStages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-7xl mx-auto px-6">
      <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* Left Content */}
        <div className="flex-1 text-left space-y-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
                          <span className="text-sm font-medium text-indigo-300">The Framework for Reliable AI</span>
                          <span className="px-2 py-0.5 bg-indigo-500/20 rounded text-xs font-bold text-indigo-300">v0.4.13</span>
                        </motion.div>
          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]"
            >
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Build AI Agents
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                That Actually Work.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl md:text-2xl text-slate-400 max-w-2xl leading-relaxed"
            >
              ART provides the missing runtime for sophisticated AI applications. 
              Turn brittle LLM calls into reliable, <span className="text-white font-medium">stateful</span>, and <span className="text-white font-medium">observable</span> business tools.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Link
              to="/concepts"
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold overflow-hidden shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105 hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <motion.a
              href="https://github.com/inferq/art"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-slate-800/50 text-white rounded-2xl font-semibold border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Network className="w-5 h-5" />
              GitHub
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-6 pt-8 border-t border-slate-800/50"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                   <div className={`w-full h-full bg-gradient-to-br ${i === 1 ? 'from-indigo-500 to-purple-500' : i === 2 ? 'from-purple-500 to-pink-500' : i === 3 ? 'from-blue-500 to-cyan-500' : 'from-emerald-500 to-teal-500'} opacity-50`} />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500">
              Trusted by developers building <span className="text-slate-300">Next-Gen Agentic UIs</span>
            </p>
          </motion.div>
        </div>

        {/* Right Content - PES Agent Visualization */}
        <div className="flex-1 relative w-full max-w-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative"
          >
            {/* Main Agent Card */}
            <div className="relative glass-card bg-slate-900/40 border-slate-800/50 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_0_50px_-12px_rgba(99,102,241,0.25)] border overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
              
              <div className="relative space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg tracking-tight">PESAgent</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-slate-500 font-mono">READY_FOR_TASK</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-700/50">
                      <Terminal className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-700/50">
                      <Settings className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Workflow Loop */}
                <div className="relative py-12 flex justify-center items-center">
                   <div className="relative w-[280px] h-[280px]">
                     {/* Circle Path */}
                     <svg className="absolute inset-0 w-full h-full -rotate-90">
                       <circle
                         cx="140"
                         cy="140"
                         r="120"
                         fill="none"
                         stroke="currentColor"
                         className="text-slate-800/50"
                         strokeWidth="2"
                         strokeDasharray="8 8"
                       />
                       <motion.circle
                         cx="140"
                         cy="140"
                         r="120"
                         fill="none"
                         stroke="url(#gradient)"
                         strokeWidth="3"
                         strokeDasharray="100 300"
                         animate={{ strokeDashoffset: [0, -400] }}
                         transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                       />
                       <defs>
                         <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                           <stop offset="0%" stopColor="#6366f1" />
                           <stop offset="100%" stopColor="#d946ef" />
                         </linearGradient>
                       </defs>
                     </svg>

                     {/* Center Status */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-center p-4 shadow-inner z-10">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activePesStage}
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -10 }}
                            className="space-y-2"
                          >
                            <div className={`mx-auto w-12 h-12 rounded-xl ${pesStages[activePesStage].bg} ${pesStages[activePesStage].color} flex items-center justify-center mb-1`}>
                              {activePesStage === 0 && <Brain className="w-6 h-6" />}
                              {activePesStage === 1 && <Zap className="w-6 h-6" />}
                              {activePesStage === 2 && <Sparkles className="w-6 h-6" />}
                            </div>
                            <div className={`text-xs font-black tracking-[0.2em] ${pesStages[activePesStage].color}`}>
                              {pesStages[activePesStage].label}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              STAGE {activePesStage === 0 ? '3' : activePesStage === 1 ? '4' : '5'} OF 6
                            </div>
                          </motion.div>
                        </AnimatePresence>
                     </div>

                     {/* Stage Nodes */}
                     {pesStages.map((stage, i) => {
                       // Distribute 120 deg apart, starting from -30 deg for i=0 to put Execute at 90 deg (bottom)
                       const angle = (i * 120 - 30) * (Math.PI / 180);
                       const x = 140 + 120 * Math.cos(angle);
                       const y = 140 + 120 * Math.sin(angle);
                       const isActive = activePesStage === i;

                       return (
                         <motion.div
                           key={stage.id}
                           className={`absolute w-12 h-12 rounded-xl bg-slate-900 border transition-all duration-500 z-20 flex items-center justify-center ${
                             isActive 
                               ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] bg-slate-800' 
                               : 'border-slate-800 opacity-40'
                           }`}
                           style={{ left: x - 24, top: y - 24 }}
                           animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                         >
                           <stage.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                         </motion.div>
                       );
                     })}
                   </div>
                </div>

                {/* State Preview */}
                <div className="bg-slate-950/50 rounded-2xl border border-slate-800/50 p-4 font-mono text-[10px] space-y-2 overflow-hidden">
                                <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2 mb-2">
                                  <span>THREAD_STATE</span>
                                  <span className="text-indigo-400">pes-agent-v0.4.13</span>
                                </div>                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <span className="text-purple-400">intent:</span>
                      <span className="text-slate-300">"Research and synthesize..."</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-purple-400">todoList:</span>
                      <span className="text-slate-500">[</span>
                    </div>
                    <div className="pl-4 space-y-1 border-l border-slate-800 ml-1">
                      <div className="flex gap-2">
                        <span className="text-indigo-400">0:</span>
                        <span className="text-green-400">"completed"</span>
                        <span className="text-slate-600">// Planning done</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-indigo-400">1:</span>
                        <motion.span 
                          animate={{ opacity: [1, 0.5, 1] }} 
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-amber-400"
                        >
                          "in_progress"
                        </motion.span>
                        <span className="text-slate-300">"Fetch data..."</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-indigo-400">2:</span>
                        <span className="text-slate-600">"pending"</span>
                      </div>
                    </div>
                    <div className="text-slate-500">]</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -right-6 glass-card bg-indigo-500/10 border-indigo-500/20 px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-300">TAEF Validated</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-6 -left-6 glass-card bg-purple-500/10 border-purple-500/20 px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-300">Supabase Persistent</span>
            </motion.div>
          </motion.div>

          {/* Background Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
            <div className="w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
            <div className="w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] -translate-y-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Settings(props: any) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}