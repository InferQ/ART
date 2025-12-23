import { motion } from 'framer-motion';
import { CheckCircle, ChevronRight, ExternalLink } from 'lucide-react';

const features = [
  {
    category: 'Core Framework',
    icon: '🏗️',
    items: [
      'TypeScript with full type safety',
      'Browser-first architecture',
      'Modular and swappable components',
      'Comprehensive error handling',
      'Developer-friendly API',
    ],
    color: 'from-indigo-500 to-purple-500',
  },
  {
    category: 'Agent System',
    icon: '🤖',
    items: [
      'Plan-Execute-Synthesize (PES) workflow',
      'Dynamic plan management and refinement',
      'Stateful execution with context management',
      'Multi-agent task delegation (A2A)',
      'Custom agent personas',
    ],
    color: 'from-purple-500 to-pink-500',
  },
  {
    category: 'Observability',
    icon: '📊',
    items: [
      'Real-time observation updates',
      'Streaming responses including reasoning',
      'Complete execution tracing',
      'Debug-friendly insights',
      'Performance monitoring',
    ],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    category: 'Integrations',
    icon: '🔌',
    items: [
      'MCP (Model Context Protocol) support',
      'OAuth authentication strategies',
      'Supabase persistence layer',
      'Custom tool registry',
      'Provider adapters',
    ],
    color: 'from-green-500 to-emerald-500',
  },
  {
    category: 'Reasoning Providers',
    icon: '🧠',
    items: [
      'Anthropic (Claude with thinking)',
      'OpenAI (GPT-4 with o1 reasoning)',
      'Google Gemini (with thoughts)',
      'OpenRouter (multi-provider access)',
      'DeepSeek (with reasoning modes)',
      'Custom provider adapters',
    ],
    color: 'from-orange-500 to-red-500',
  },
  {
    category: 'Storage Options',
    icon: '💾',
    items: [
      'In-memory storage (default)',
      'IndexedDB for browser persistence',
      'Supabase integration',
      'Custom storage adapters',
      'State repositories',
    ],
    color: 'from-yellow-500 to-orange-500',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 px-6 relative overflow-hidden">
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
              Features
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            Comprehensive capabilities for production-ready AI agents
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.4 + index * 0.08 }}
              className="group relative"
            >
              <motion.div
                className="relative h-full bg-slate-900/50 border border-slate-800/50 rounded-3xl p-8 overflow-hidden"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl shadow-xl`}
                    >
                      {category.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold tracking-tight text-white">
                      {category.category}
                    </h3>
                  </div>

                  <ul className="space-y-4">
                    {category.items.map((item, itemIndex) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + index * 0.08 + itemIndex * 0.05 }}
                        className="flex items-start gap-3 group/item"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5"
                        >
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </motion.div>
                        <span className="text-slate-300 leading-relaxed">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2 }}
          className="text-center mt-20"
        >
          <motion.a
            href="/ART/components/index.html"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 font-medium hover:bg-indigo-500/20 transition-all"
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Explore Full API Documentation</span>
            <ExternalLink className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
