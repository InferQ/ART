import { motion } from 'framer-motion';
import { Github, Twitter, Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-20 px-6 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold tracking-tight">ART Framework</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Browser-first TypeScript framework for building sophisticated LLM-powered agents.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-4 tracking-tight">Documentation</h3>
            <ul className="space-y-3">
              {[
                { href: '/ART/components/index.html', label: 'API Reference' },
                { href: '/ART/concepts/', label: 'Concepts' },
                { href: '/ART/how-to/', label: 'How-To Guides' },
              ].map((item) => (
                <li key={item.label}>
                  <motion.a
                    href={item.href}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-4 tracking-tight">Resources</h3>
            <ul className="space-y-3">
              {[
                { href: 'https://github.com/inferq/art', label: 'GitHub Repository', icon: Github },
                {
                  href: 'https://github.com/inferq/art/blob/main/CONTRIBUTING.md',
                  label: 'Contributing',
                },
                {
                  href: 'https://github.com/inferq/art/blob/main/CHANGELOG.md',
                  label: 'Changelog',
                },
              ].map((item) => (
                <li key={item.label}>
                  <motion.a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                    whileHover={{ x: 5 }}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-4 tracking-tight">License</h3>
            <p className="text-slate-400 leading-relaxed mb-4">
              MIT License - Open source and free to use in your projects.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Github, href: 'https://github.com/inferq/art' },
                { icon: Twitter, href: 'https://twitter.com/inferq' },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-slate-500 text-sm flex items-center gap-2">
            &copy; {new Date().getFullYear()} ART Framework. Built with{' '}
            <Heart className="w-4 h-4 text-red-500 fill-red-500" /> TypeScript and React.
          </p>
          <motion.div
            className="flex items-center gap-1 text-slate-600 text-xs"
            whileHover={{ opacity: 1 }}
            initial={{ opacity: 0.6 }}
          >
            <Sparkles className="w-3 h-3" />
            <span>AI-Powered Development</span>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
