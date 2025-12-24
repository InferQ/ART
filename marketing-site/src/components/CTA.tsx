import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section id="get-started" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[200px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/30 rounded-[2.5rem] p-12 lg:p-20 text-center overflow-hidden backdrop-blur-xl"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0"
            animate={{
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-indigo-500/25"
          >
            <Rocket className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
          >
            <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              Ready to Build?
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Get started with ART and create powerful AI agents in your browser
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/concepts"
              className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold overflow-hidden shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105 hover:-translate-y-1"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Read the Concepts Guide
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              to="/how-to"
              className="px-10 py-5 bg-slate-800/50 text-white rounded-2xl font-semibold border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all hover:scale-105 hover:-translate-y-1"
            >
              How-To Guides
            </Link>

            <motion.a
              href="https://github.com/inferq/art"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 bg-slate-800/50 text-white rounded-2xl font-semibold border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              View on GitHub
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap justify-center gap-8"
          >
            {[
              { label: 'Browser-First', color: 'text-indigo-400' },
              { label: 'TypeScript', color: 'text-purple-400' },
              { label: 'Production Ready', color: 'text-pink-400' },
            ].map((item) => (
              <motion.div
                key={item.label}
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-2 h-2 rounded-full bg-current" />
                <span className={`text-sm font-medium ${item.color}`}>{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
