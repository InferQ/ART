import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  GitBranch,
  ArrowRight,
  Activity,
  Brain,
  Target,
  Zap,
  Shield,
  MessageSquare,
  GitPullRequest,
  Settings,
  Database,
  Clock,
  TrendingUp,
} from 'lucide-react';

const workflowStages = [
  {
    id: 1,
    name: 'Configuration',
    icon: Settings,
    color: 'from-purple-500 to-pink-500',
    description: 'Initialize agent with context, tools, and reasoning provider',
    details: [
      'Agent persona setup',
      'Tool registration',
      'Provider configuration',
      'Context initialization',
    ],
  },
  {
    id: 2,
    name: 'Context Gathering',
    icon: Database,
    color: 'from-blue-500 to-cyan-500',
    description: 'Collect and process relevant information',
    details: ['User input analysis', 'Context retrieval', 'State loading', 'History synthesis'],
  },
  {
    id: 3,
    name: 'Planning',
    icon: Target,
    color: 'from-indigo-500 to-purple-500',
    description: 'Create a structured plan to achieve the goal',
    details: [
      'Task decomposition',
      'Dependency mapping',
      'Resource allocation',
      'Timeline estimation',
    ],
  },
  {
    id: 4,
    name: 'Execution',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    description: 'Execute plan steps using available tools',
    details: ['Step-by-step execution', 'Tool invocation', 'Error handling', 'Progress tracking'],
  },
  {
    id: 5,
    name: 'Synthesis',
    icon: Activity,
    color: 'from-green-500 to-emerald-500',
    description: 'Combine results into a coherent response',
    details: [
      'Result aggregation',
      'Insight extraction',
      'Response formatting',
      'Learning capture',
    ],
  },
];

const capabilities = [
  {
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    title: 'Structured Planning',
    description: 'Agents break down complex tasks into structured plans with clear dependencies',
    stat: 'Dynamic',
    statLabel: 'Plan adaptation',
  },
  {
    icon: Shield,
    color: 'from-blue-500 to-cyan-500',
    title: 'Stateful Execution',
    description: 'Maintain conversation context and agent state across multiple interactions',
    stat: 'Full',
    statLabel: 'Context retention',
  },
  {
    icon: GitBranch,
    color: 'from-indigo-500 to-purple-500',
    title: 'Plan Refinement',
    description: 'Adapt and refine plans dynamically based on execution results',
    stat: 'Real-time',
    statLabel: 'Replanning',
  },
  {
    icon: MessageSquare,
    color: 'from-green-500 to-emerald-500',
    title: 'Observability',
    description: 'Full visibility into agent decisions, plan progress, and execution steps',
    stat: '100%',
    statLabel: 'Trace coverage',
  },
  {
    icon: GitPullRequest,
    color: 'from-orange-500 to-red-500',
    title: 'A2A Delegation',
    description: 'Seamlessly delegate tasks to other agents with automatic task discovery',
    stat: 'Auto',
    statLabel: 'Discovery',
  },
  {
    icon: Clock,
    color: 'from-yellow-500 to-orange-500',
    title: 'Streaming Responses',
    description: 'Real-time streaming of LLM responses including thinking and tool use',
    stat: 'Live',
    statLabel: 'Response flow',
  },
];

export default function Capabilities() {
  const [activeStage, setActiveStage] = useState<number | null>(null);

  return (
    <section id="capabilities" className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
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
              PESAgent Workflow
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            Plan, Execute, Synthesize — a sophisticated workflow for intelligent agents
          </motion.p>
        </motion.div>

        <div className="mb-32">
          <div className="relative">
            {workflowStages.map((stage, index) => (
              <div key={stage.id} className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveStage(activeStage === stage.id ? null : stage.id)}
                  className="relative cursor-pointer mb-4 lg:mb-0"
                >
                  <motion.div
                    className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6 lg:p-8 overflow-hidden relative group"
                    whileHover={{ scale: 1.01, borderColor: 'rgba(99, 102, 241, 0.3)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${stage.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    />

                    <div className="relative flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                      <div className="flex items-start gap-6">
                        <motion.div
                          animate={{
                            scale: activeStage === stage.id ? 1.1 : 1,
                            rotate: activeStage === stage.id ? 360 : 0,
                          }}
                          transition={{ duration: 0.4 }}
                          className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center flex-shrink-0 shadow-2xl`}
                        >
                          <stage.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                        </motion.div>

                        <div>
                          <motion.div
                            className="flex items-center gap-3 mb-2"
                            animate={{ x: activeStage === stage.id ? 5 : 0 }}
                          >
                            <span
                              className={`w-8 h-8 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center text-white font-bold text-sm`}
                            >
                              {stage.id}
                            </span>
                            <h3 className="text-xl lg:text-2xl font-bold tracking-tight">
                              {stage.name}
                            </h3>
                          </motion.div>
                          <p className="text-slate-400">{stage.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 ml-auto">
                        {stage.details.slice(0, 2).map((detail) => (
                          <motion.span
                            key={detail}
                            className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs lg:text-sm text-slate-300"
                            whileHover={{ y: -2, borderColor: 'rgba(99, 102, 241, 0.5)' }}
                          >
                            {detail}
                          </motion.span>
                        ))}
                        <motion.span className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs lg:text-sm text-slate-300">
                          +{stage.details.length - 2}
                        </motion.span>
                      </div>

                      <motion.div
                        animate={{ rotate: activeStage === stage.id ? 90 : 0 }}
                        className="hidden lg:flex"
                      >
                        <ArrowRight className="w-6 h-6 text-slate-500" />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {activeStage === stage.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6 pt-6 border-t border-slate-800/50"
                        >
                          <h4 className="text-sm font-semibold text-indigo-400 mb-4 uppercase tracking-wider">
                            Stage Details
                          </h4>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {stage.details.map((detail) => (
                              <motion.div
                                key={detail}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="px-4 py-3 bg-slate-800/30 border border-slate-700/30 rounded-lg text-sm text-slate-300"
                              >
                                {detail}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>

                {index < workflowStages.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="hidden lg:flex justify-center py-2"
                  >
                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="flex flex-col items-center gap-1"
                    >
                      <ArrowRight className="w-5 h-5 text-slate-600" />
                    </motion.div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Agent Capabilities
              </span>
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="group relative"
              >
                <motion.div
                  className="relative h-full bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 overflow-hidden"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${capability.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  <div className="relative">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${capability.color} flex items-center justify-center mb-5 shadow-xl`}
                    >
                      <capability.icon className="w-7 h-7 text-white" />
                    </motion.div>

                    <h4 className="text-xl font-bold mb-3 tracking-tight">{capability.title}</h4>
                    <p className="text-slate-400 mb-4 leading-relaxed">{capability.description}</p>

                    <div className="pt-4 border-t border-slate-800/50">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                      >
                        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                          {capability.stat}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{capability.statLabel}</div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
