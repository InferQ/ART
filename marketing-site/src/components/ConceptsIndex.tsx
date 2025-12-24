import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
import { getAllConcepts } from '../docs-content';

export default function ConceptsIndex() {
    const concepts = getAllConcepts();

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Background gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_50%)] pointer-events-none" />

            {/* Top navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-3"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25"
                        >
                            <Sparkles className="w-4 h-4 text-white" />
                        </motion.div>
                        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            ART Framework
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/concepts" className="text-sm text-indigo-400">
                            Concepts
                        </Link>
                        <Link to="/how-to" className="text-sm text-slate-400 hover:text-white transition-colors">
                            How-To Guides
                        </Link>
                        <a href="/ART/components/index.html" className="text-sm text-slate-400 hover:text-white transition-colors">
                            API Reference
                        </a>
                    </div>
                </div>
            </nav>

            <main className="relative pt-24 pb-20 px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Back link */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                                <Lightbulb className="w-7 h-7 text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white">Concepts</h1>
                                <p className="text-slate-400">Core ideas and architecture of the ART Framework</p>
                            </div>
                        </div>
                        <p className="text-lg text-slate-400 max-w-3xl">
                            Understand the fundamental building blocks that power the ART Framework.
                            These concept documents explain the key components, their relationships,
                            and how they work together to enable sophisticated AI agents.
                        </p>
                    </motion.div>

                    {/* Concepts grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {concepts.map((concept, index) => (
                            <motion.div
                                key={concept.slug}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    to={`/concepts/${concept.slug}`}
                                    className="group block h-full p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <span className="text-4xl">{concept.icon}</span>
                                        <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                                        {concept.title}
                                    </h2>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                        {concept.description}
                                    </p>
                                    {concept.readTime && (
                                        <span className="text-xs text-slate-500">
                                            📖 {concept.readTime} read
                                        </span>
                                    )}
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* How-to guides CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">Ready to build?</h3>
                                <p className="text-slate-400">
                                    Check out our practical How-To Guides for step-by-step implementation.
                                </p>
                            </div>
                            <Link
                                to="/how-to"
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-colors"
                            >
                                View How-To Guides
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
