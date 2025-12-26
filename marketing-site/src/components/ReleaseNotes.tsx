/**
 * ReleaseNotes Component
 * 
 * Displays the latest release notes from GitHub releases.
 */

import { motion } from 'framer-motion';
import { Tag, ExternalLink, Sparkles, ArrowRight } from 'lucide-react';

// Release information
const RELEASES = [
    {
        version: 'v0.4.7',
        date: 'December 27, 2024',
        highlights: [
            {
                title: 'PES Agent Robustness',
                description: 'Fixed critical issues in execution loop result population and state recovery',
            },
            {
                title: 'Enhanced Fallback Logic',
                description: 'Smart fallback to tool results when explicit LLM content is missing',
            },
            {
                title: 'HITL Resumption Fixes',
                description: 'Corrected state reset bugs when resuming from suspended agent states',
            },
            {
                title: 'Regression Testing',
                description: 'New integration tests for deep state verification of the execution loop',
            }
        ],
        releaseUrl: 'https://github.com/InferQ/ART/releases/tag/v0.4.7',
    },
    {
        version: 'v0.4.6',
        date: 'December 26, 2024',
        highlights: [
            {
                title: 'TAEF Framework',
                description: 'Tool-Aware Execution Framework bridging the gap between planning and execution',
            },
            {
                title: 'HITL V2',
                description: 'Production-ready Human-in-the-Loop with robust suspension and rejection handling',
            }
        ],
        releaseUrl: 'https://github.com/InferQ/ART/releases/tag/v0.4.6',
    }
];

export default function ReleaseNotes() {
    const latestRelease = RELEASES[0];

    return (
        <section className="py-24 px-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-5xl mx-auto relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        <span className="text-sm font-medium text-violet-300">Latest Release</span>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            What's New in{' '}
                        </span>
                        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                            {latestRelease.version}
                        </span>
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Released {latestRelease.date}
                    </p>
                </motion.div>

                {/* Release highlights grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-10">
                    {latestRelease.highlights.map((highlight, index) => (
                        <motion.div
                            key={highlight.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-violet-500/30 transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                                    <Tag className="w-5 h-5 text-violet-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-violet-400 transition-colors">
                                        {highlight.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        {highlight.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA to GitHub releases */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <a
                        href={latestRelease.releaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-xl transition-all hover:scale-105 hover:-translate-y-0.5 shadow-lg shadow-violet-500/25"
                    >
                        View All Releases
                        <ExternalLink className="w-4 h-4" />
                    </a>
                    <p className="text-slate-500 text-sm mt-3">
                        See full changelog and previous versions on GitHub
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
