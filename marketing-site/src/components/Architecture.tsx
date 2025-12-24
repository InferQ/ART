import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Layers,
  Cpu,
  Database,
  Activity,
  GitBranch,
  ArrowRight,
  Zap,
  Maximize2,
} from 'lucide-react';

const architectureLayers = [
  {
    name: 'Application Layer',
    icon: Layers,
    color: 'from-purple-500 to-pink-500',
    description: 'Your React/TypeScript application',
    items: ['React Components', 'UI Integration', 'State Hooks', 'Socket Subscriptions'],
  },
  {
    name: 'State & Context Layer',
    icon: Database,
    color: 'from-blue-500 to-cyan-500',
    description: 'Manage agent state and conversation context',
    items: ['StateManager', 'ThreadConfig', 'AgentState', 'ConversationManager'],
  },
  {
    name: 'Reasoning Layer',
    icon: Cpu,
    color: 'from-indigo-500 to-purple-500',
    description: 'Core agent orchestration with PESAgent',
    items: ['PESAgent', 'ProviderManager', 'OutputParser', 'ReasoningEngine'],
    isCore: true,
  },
  {
    name: 'Execution Layer',
    icon: Activity,
    color: 'from-orange-500 to-red-500',
    description: 'Tool execution and external integrations',
    items: ['ToolRegistry', 'MCP Protocol', 'A2A Delegation', 'McpProxyTool'],
  },
  {
    name: 'Observability Layer',
    icon: GitBranch,
    color: 'from-green-500 to-emerald-500',
    description: 'Monitor and debug agents in real-time',
    items: ['ObservationManager', 'UISystem Sockets', 'LLMStreamSocket', 'A2ATaskSocket'],
  },
];

export default function Architecture() {
  const [activeLayer, setActiveLayer] = useState<number | null>(null);

  return (
    <section
      id="architecture"
      className="py-32 px-6 bg-gradient-to-b from-slate-950/50 to-slate-900/50 relative overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[200px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
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
            <div key={layer.name} className="relative mb-4">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() => setActiveLayer(activeLayer === index ? null : index)}
                className="relative cursor-pointer"
              >
                <motion.div
                  className="relative overflow-hidden rounded-2xl border-2 p-6 lg:p-8 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -5 }}
                  style={{
                    borderColor: layer.isCore
                      ? 'rgba(99, 102, 241, 0.5)'
                      : 'rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${layer.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  <div className="relative flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${layer.color} flex items-center justify-center mb-6 shadow-xl`}
                    >
                      <layer.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </motion.div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
                          {layer.name}
                        </h3>
                        {layer.isCore && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1.2 }}
                            className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-semibold text-indigo-300 uppercase tracking-wider"
                          >
                            Core
                          </motion.span>
                        )}
                      </div>
                      <p className="text-lg text-slate-400 mb-6">{layer.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {layer.items.map((item) => (
                          <motion.span
                            key={item}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300"
                          >
                            {item}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {activeLayer === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 pt-6 border-t border-slate-800/50"
                    >
                      <h4 className="text-sm font-semibold text-indigo-400 mb-4 uppercase tracking-wider">
                        Layer Components
                      </h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {layer.items.map((item) => (
                          <motion.div
                            key={item}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="px-4 py-3 bg-slate-900/50 border border-slate-800/50 rounded-xl text-sm text-slate-300"
                          >
                            {item}
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-semibold text-purple-400 mb-1 uppercase tracking-wider">
                            Data Flow
                          </h5>
                          <p className="text-xs text-slate-500">
                            {index === 0 && 'User interaction flows through agent orchestration'}
                            {index === 1 && 'State flows bidirectionally between all layers'}
                            {index === 2 && 'LLM reasoning transforms inputs to executable plans'}
                            {index === 3 && 'Plan steps execute using tools and resources'}
                            {index === 4 && 'All events are captured for complete observability'}
                          </p>
                        </div>
                        <a
                          href="https://github.com/inferq/art"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 hover:bg-indigo-500/20 transition-all"
                        >
                          View Code
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2 }}
          className="text-center mt-12"
        >
          <p className="text-slate-400 mb-4">Click on any layer to explore its components</p>
          <a
            href="https://github.com/inferq/art"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Explore Full Architecture</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
