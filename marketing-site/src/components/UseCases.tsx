import { motion } from 'framer-motion';
import { MessageSquare, Database, Zap, Code2, ArrowRight, ExternalLink } from 'lucide-react';

const useCases = [
  {
    icon: MessageSquare,
    color: 'from-purple-500 to-pink-500',
    title: 'Customer Support Agents',
    description:
      'Build intelligent support agents that understand context, access knowledge bases, and provide accurate responses.',
    features: [
      'Knowledge base integration',
      'Context-aware conversations',
      'Multi-turn reasoning',
      'Tool-assisted responses',
    ],
    tags: ['Support', 'Knowledge Base', 'Context'],
  },
  {
    icon: Database,
    color: 'from-blue-500 to-cyan-500',
    title: 'Data Analysis & Research',
    description:
      'Create agents that analyze data, generate reports, and provide insights through structured planning.',
    features: [
      'Data processing tools',
      'Report generation',
      'Pattern recognition',
      'Statistical analysis',
    ],
    tags: ['Analytics', 'Reports', 'Research'],
  },
  {
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    title: 'Workflow Automation',
    description:
      'Automate complex workflows by breaking them down into structured plans and executing with multiple tools.',
    features: ['Multi-step workflows', 'Error handling', 'Progress tracking', 'Rollback support'],
    tags: ['Automation', 'Workflows', 'Productivity'],
  },
  {
    icon: Code2,
    color: 'from-green-500 to-emerald-500',
    title: 'Development Assistants',
    description:
      'Build coding assistants that understand codebases, suggest improvements, and help with debugging.',
    features: ['Codebase analysis', 'Code generation', 'Debug assistance', 'Documentation help'],
    tags: ['Development', 'Code', 'Productivity'],
  },
];

export default function UseCases() {
  return (
    <section
      id="use-cases"
      className="py-32 px-6 bg-gradient-to-b from-slate-950/50 to-slate-900/50 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[200px]" />
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
              Real-World Use Cases
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            Powering AI applications across industries
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="group relative"
            >
              <motion.div
                className="relative h-full bg-slate-900/80 border border-slate-800/50 rounded-3xl p-8 lg:p-10 overflow-hidden"
                whileHover={{ scale: 1.02, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${useCase.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.15 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-6 shadow-xl`}
                  >
                    <useCase.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3 className="text-2xl lg:text-3xl font-bold mb-4 tracking-tight">
                    {useCase.title}
                  </h3>
                  <p className="text-slate-400 mb-6 leading-relaxed">{useCase.description}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {useCase.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        className="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-full text-xs font-medium text-slate-300 uppercase tracking-wider"
                        whileHover={{ y: -2, borderColor: 'rgba(99, 102, 241, 0.5)' }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {useCase.features.map((feature, featureIndex) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + index * 0.1 + featureIndex * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className="w-2 h-2 rounded-full bg-indigo-500"
                        />
                        <span className="text-slate-300">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1, x: 5 }}
                    className="mt-8 pt-6 border-t border-slate-800/50 flex items-center gap-2 text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <span>Explore example</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <motion.a
            href="/ART/how-to/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 font-medium hover:bg-indigo-500/20 transition-all"
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>View How-To Guides</span>
            <ExternalLink className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
