import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Database, 
  Zap, 
  Code2, 
  ArrowRight, 
  Brain, 
  Search, 
  Settings,
  Terminal,
  Play
} from 'lucide-react';

const scenarios = [
  {
    id: 'support',
    icon: MessageSquare,
    color: 'from-purple-500 to-pink-500',
    title: 'Customer Support',
    subtitle: 'Agents that actually solve problems.',
    description: 'Move beyond basic chatbots. Build agents that access knowledge bases, check order status, and issue refunds—all with human-in-the-loop safety.',
    workflow: [
      { stage: 'PLAN', task: 'Analyze customer query & check database.' },
      { stage: 'EXECUTE', task: 'Call "get_order_status" and "refund_policy".' },
      { stage: 'ANSWER', task: 'Provide personalized resolution with citations.' }
    ],
    tags: ['E-commerce', 'SaaS', 'Fintech']
  },
  {
    id: 'data',
    icon: Database,
    color: 'from-blue-500 to-cyan-500',
    title: 'Data Research',
    description: 'Transform raw data into insights. Agents can browse docs, run statistical models, and synthesize complex reports autonomously.',
    workflow: [
      { stage: 'PLAN', task: 'Identify data sources & research goals.' },
      { stage: 'EXECUTE', task: 'Scrape web & run analysis tools.' },
      { stage: 'ANSWER', task: 'Generate executive summary & data viz.' }
    ],
    tags: ['Market Research', 'BI', 'Academic']
  },
  {
    id: 'automation',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    title: 'Workflow Ops',
    description: 'Orchestrate complex business processes. Break down high-level goals into multi-step execution chains across different platforms.',
    workflow: [
      { stage: 'PLAN', task: 'Map out integration steps & dependencies.' },
      { stage: 'EXECUTE', task: 'Sync CRM, Email, and Slack tools.' },
      { stage: 'ANSWER', task: 'Confirm completion & log audit trail.' }
    ],
    tags: ['DevOps', 'Sales', 'HR']
  },
  {
    id: 'dev',
    icon: Code2,
    color: 'from-green-500 to-emerald-500',
    title: 'Coding Assistant',
    description: 'Deep codebase understanding. Build assistants that don\'t just write code, but research existing patterns and debug complex logic.',
    workflow: [
      { stage: 'PLAN', task: 'Analyze file tree & dependency graph.' },
      { stage: 'EXECUTE', task: 'Read files & run test suite.' },
      { stage: 'ANSWER', task: 'Propose refactor with impact analysis.' }
    ],
    tags: ['Internal Tools', 'IDE Plugins', 'Code Review']
  }
];

export default function UseCases() {
  const [activeTab, setActiveTab] = useState(scenarios[0]);

  return (
    <section id="use-cases" className="py-32 px-6 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left: Navigation / Scenarios */}
          <div className="lg:w-1/2 space-y-12">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6"
              >
                <Play className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300">Discovery</span>
              </motion.div>
              <h2 className="text-5xl lg:text-7xl font-bold text-white tracking-tight mb-8">
                What can you <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Build with ART?</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(s)}
                  className={`group p-6 rounded-3xl border transition-all duration-300 text-left relative overflow-hidden ${ 
                    activeTab.id === s.id 
                    ? 'bg-slate-900 border-indigo-500/50 shadow-[0_0_30px_-12px_rgba(99,102,241,0.3)]' 
                    : 'bg-slate-950 border-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-lg`}>
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold mb-1 transition-colors ${activeTab.id === s.id ? 'text-white' : 'text-slate-400'}`}>
                    {s.title}
                  </h3>
                  <div className="flex gap-2">
                    {s.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-[10px] text-slate-600 uppercase tracking-widest">{t}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Interactive Narrative Card */}
          <div className="lg:w-1/2 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card bg-slate-900/40 border-slate-800/50 p-8 lg:p-12 rounded-[2.5rem] relative overflow-hidden"
              >
                <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${activeTab.color} opacity-10 blur-[100px]`} />
                
                <div className="relative space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-white tracking-tight">{activeTab.title}</h3>
                    <p className="text-slate-400 text-lg leading-relaxed">
                      {activeTab.description}
                    </p>
                  </div>

                  {/* Workflow Preview */}
                  <div className="space-y-4 pt-4">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">PES Loop in Action</div>
                    <div className="space-y-3">
                      {activeTab.workflow.map((w, i) => (
                        <motion.div
                          key={w.stage}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50 group hover:border-indigo-500/30 transition-all"
                        >
                          <div className={`w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold tracking-tighter ${ 
                            i === 0 ? 'text-indigo-400' : i === 1 ? 'text-purple-400' : 'text-pink-400'
                          }`}>
                            {w.stage}
                          </div>
                          <div className="text-sm text-slate-300">{w.task}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      {activeTab.tags.map(t => (
                        <span key={t} className="px-3 py-1 bg-slate-800/50 rounded-full text-[10px] text-slate-500 border border-slate-800/50">{t}</span>
                      ))}
                    </div>
                    <Link 
                      to="/concepts/pes-agent" 
                      className="flex items-center gap-2 text-indigo-400 text-sm font-bold group"
                    >
                      Explore this Case
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
