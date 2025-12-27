import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { getAllHowTos } from '../docs-content';

export default function HowToIndex() {
    const howTos = getAllHowTos();

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
                        <Link to="/concepts" className="text-sm text-slate-400 hover:text-white transition-colors">
                            Concepts
                        </Link>
                        <Link to="/how-to" className="text-sm text-indigo-400">
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
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                                <BookOpen className="w-7 h-7 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white">How-To Guides</h1>
                                <p className="text-slate-400">Practical tutorials and step-by-step instructions</p>
                            </div>
                        </div>
                        <p className="text-lg text-slate-400 max-w-3xl">
                            Learn how to implement common patterns and integrate the ART Framework
                            into your applications. These guides provide practical, hands-on
                            instructions for real-world use cases.
                        </p>
                    </motion.div>

                    {/* How-To guides list */}
                    <div className="space-y-4">
                        {howTos.map((guide, index) => (
                            <motion.div
                                key={guide.slug}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    to={`/how-to/${guide.slug}`}
                                    className="group flex items-center gap-6 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all"
                                >
                                    <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-3xl">
                                        {guide.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                                            {guide.title}
                                        </h2>
                                        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                                            {guide.description}
                                        </p>
                                        {guide.readTime && (
                                            <span className="inline-block mt-2 text-xs text-slate-500">
                                                📖 {guide.readTime} read
                                            </span>
                                        )}
                                    </div>
                                    <ArrowRight className="flex-shrink-0 w-5 h-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Concepts CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">Want to understand the fundamentals?</h3>
                                <p className="text-slate-400">
                                    Explore our Concepts documentation for in-depth explanations of core architecture.
                                </p>
                            </div>
                            <Link
                                to="/concepts"
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-colors"
                            >
                                View Concepts
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
