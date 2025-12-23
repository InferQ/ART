import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Layers,
  Cpu,
  Database,
  Activity,
  GitBranch,
  ChevronRight,
  Info,
  ExternalLink,
} from 'lucide-react';

const architectureLayers = [
  {
    id: 1,
    name: 'Application Layer',
    icon: Layers,
    color: 'from-purple-500 to-pink-500',
    description: 'Your React/TypeScript application',
    details: ['React Components', 'UI Integration', 'State Hooks', 'Custom UI Components'],
    flow: 'User interaction flows down through agent orchestration',
  },
  {
    id: 2,
    name: 'State & Context Layer',
    icon: Database,
    color: 'from-blue-500 to-cyan-500',
    description: 'Manage agent state and conversation context',
    details: ['ThreadConfig', 'AgentState', 'Message History', 'Plan Tracking', 'Context Managers'],
    flow: 'State flows bidirectionally between UI and Reasoning layers',
  },
  {
    id: 3,
    name: 'Reasoning Layer',
    icon: Cpu,
    color: 'from-indigo-500 to-purple-500',
    description: 'Core agent orchestration and intelligence',
    details: ['PESAgent', 'ProviderManager', 'OutputParser', 'Plan Management', 'Dynamic Planning'],
    flow: 'LLM reasoning transforms inputs into executable plans',
  },
  {
    id: 4,
    name: 'Execution Layer',
    icon: Activity,
    color: 'from-orange-500 to-red-500',
    description: 'Tool and resource access for agent actions',
    details: ['ToolRegistry', 'Custom Tools', 'MCP Integration', 'A2A Tasks', 'Tool Executors'],
    flow: 'Plan steps are executed using available tools and resources',
  },
  {
    id: 5,
    name: 'Observability Layer',
    icon: GitBranch,
    color: 'from-green-500 to-emerald-500',
    description: 'Monitor and debug agents in production',
    details: ['ObservationManager', 'Streaming Updates', 'Debug Insights', 'Execution Tracing'],
    flow: 'All events flow through for comprehensive observability',
  },
];

export default function Architecture() {
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  const [activeLayer, setActiveLayer] = useState<number | null>(null);

  return (
    <section
      id="architecture"
      className="py-32 px-6 bg-gradient-to-b from-slate-900/50 to-slate-950/50 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto relative">
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
              Architecture
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            A layered architecture designed for flexibility, control, and production deployment
          </motion.p>
        </motion.div>

        <div className="relative mb-20">
          {architectureLayers.map((layer, index) => (
            <div key={layer.id} className="relative">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredLayer(layer.id)}
                onMouseLeave={() => setHoveredLayer(null)}
                onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
                className="relative cursor-pointer group"
              >
                <motion.div
                  className="relative bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6 lg:p-8 overflow-hidden"
                  whileHover={{ scale: 1.01, borderColor: 'rgba(99, 102, 241, 0.3)' }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${layer.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  <div className="relative flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${layer.color} flex items-center justify-center flex-shrink-0 shadow-2xl shadow-${layer.color.split('-')[0]}-500/25`}
                    >
                      <layer.icon className="w-10 h-10 text-white" />
                    </motion.div>

                    <div className="flex-1">
                      <h3 className="text-2xl lg:text-3xl font-bold mb-2 tracking-tight">
                        {layer.name}
                      </h3>
                      <p className="text-lg text-slate-400">{layer.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {layer.details.slice(0, 3).map((detail) => (
                        <motion.span
                          key={detail}
                          className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300"
                          whileHover={{ y: -2, borderColor: 'rgba(99, 102, 241, 0.5)' }}
                        >
                          {detail}
                        </motion.span>
                      ))}
                      {layer.details.length > 3 && (
                        <motion.span className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
                          +{layer.details.length - 3}
                        </motion.span>
                      )}
                    </div>

                    <motion.div
                      animate={{ rotate: activeLayer === layer.id ? 90 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="hidden lg:flex"
                    >
                      <ChevronRight className="w-6 h-6 text-slate-500" />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {activeLayer === layer.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 pt-6 border-t border-slate-800/50"
                      >
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-semibold text-indigo-400 mb-3 uppercase tracking-wider">
                              Components
                            </h4>
                            <ul className="space-y-2">
                              {layer.details.map((detail) => (
                                <li key={detail} className="flex items-center gap-2 text-slate-300">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wider">
                              Data Flow
                            </h4>
                            <p className="text-slate-400 leading-relaxed">{layer.flow}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {index < architectureLayers.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="hidden lg:flex justify-center py-4"
                  >
                    <motion.div
                      animate={{
                        y: [0, 10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="flex flex-col items-center gap-2 text-slate-600"
                    >
                      <span className="text-xs uppercase tracking-widest">Data flows down</span>
                      <ChevronRight className="w-6 h-6 -rotate-90" />
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <motion.p
            className="text-slate-400 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Click on any layer to explore its components and data flow
          </motion.p>
          <motion.a
            href="https://github.com/inferq/art"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 hover:bg-indigo-500/20 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ExternalLink className="w-4 h-4" />
            Explore the Code
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
