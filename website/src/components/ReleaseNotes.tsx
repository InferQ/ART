/**
 * ReleaseNotes Component
 *
 * Displays the latest release notes from GitHub releases.
 */

import { motion } from 'framer-motion';
import { Tag, ExternalLink, Sparkles } from 'lucide-react';

// Release information
const RELEASES = [
  {
    version: 'v0.4.11',
    date: 'December 27, 2025',
    highlights: [
      {
        title: 'HITL Result Preservation',
        description:
          'Fixed critical data loss when batch includes suspending tools - successful results are now persisted and restored on resumption',
        category: 'Robustness',
      },
      {
        title: 'A2A State Persistence',
        description:
          'Added pendingA2ATasks for crash recovery during Agent-to-Agent delegation polling',
        category: 'Reliability',
      },
      {
        title: 'Truncated Thought Detection',
        description:
          'Detects unclosed thinking tags and treats content as regular output instead of discarding it',
        category: 'Observability',
      },
      {
        title: 'Tool Metadata Preservation',
        description: 'Preserves tool_call_id and name fields for correct provider translation',
        category: 'Integration',
      },
      {
        title: 'Full StepOutputs in Prompts',
        description:
          'Execution prompts now include ALL tool results from previous steps, not just the last one',
        category: 'Performance',
      },
      {
        title: 'Execution Summary Persistence',
        description: 'Records completed step information for follow-up query context',
        category: 'Context',
      },
      {
        title: 'Standardized THOUGHTS Observations',
        description:
          'Consistent THOUGHTS observation system across all PES agent phases (planning, execution, synthesis)',
        category: 'Observability',
      },
      {
        title: 'Enhanced Truncation Limits',
        description:
          'Increased safeStringify default from 200 to 10,000 characters to prevent unexpected truncation',
        category: 'Usability',
      },
    ],
    releaseUrl: 'https://github.com/InferQ/ART/releases/tag/v0.4.11',
  },
  {
    version: 'v0.4.10',
    date: 'December 27, 2025',
    highlights: [
      {
        title: 'Configurable Execution Framework',
        description:
          'New ExecutionConfig for max iterations, TAEF retries, tool result length, and A2A delegation',
        category: 'Configuration',
      },
      {
        title: 'Step Output Table',
        description:
          'Structured persistence of all step outputs without truncation for cross-step data access',
        category: 'Performance',
      },
      {
        title: 'Enhanced Resume Capability',
        description:
          'Full state persisted after each step for reliable resume from failure or pause',
        category: 'Reliability',
      },
    ],
    releaseUrl: 'https://github.com/InferQ/ART/releases/tag/v0.4.10',
  },
];

const categoryColors = {
  Robustness: 'from-green-500 to-emerald-500',
  Reliability: 'from-blue-500 to-cyan-500',
  Observability: 'from-purple-500 to-pink-500',
  Integration: 'from-orange-500 to-red-500',
  Performance: 'from-indigo-500 to-violet-500',
  Context: 'from-teal-500 to-green-500',
  Usability: 'from-yellow-500 to-orange-500',
  Configuration: 'from-rose-500 to-pink-500',
};

export default function ReleaseNotes() {
  const latestRelease = RELEASES[0];

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative">
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
              v0.4.11
            </span>
          </h2>
          <p className="text-slate-400 text-lg">
            Released {latestRelease.date} • Enhanced Robustness & Data Flow
          </p>
        </motion.div>

        {/* Version badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white font-semibold">Production Ready</span>
            <span className="text-slate-400 mx-2">•</span>
            <span className="text-violet-300 font-mono text-sm">{latestRelease.version}</span>
          </div>
        </motion.div>

        {/* Release highlights grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {latestRelease.highlights.map((highlight, index) => (
            <motion.div
              key={highlight.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-violet-500/30 transition-all hover:scale-105"
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${categoryColors[highlight.category as keyof typeof categoryColors]} flex items-center justify-center flex-shrink-0`}
                >
                  <Tag className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {highlight.category}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">
                {highlight.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{highlight.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Previous releases */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Previous Releases</h3>
          <div className="flex flex-wrap gap-3">
            {RELEASES.slice(1).map((release) => (
              <a
                key={release.version}
                href={release.releaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 hover:border-violet-500/30 rounded-lg text-slate-400 hover:text-violet-400 transition-all text-sm"
              >
                <span className="font-mono">{release.version}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </motion.div>

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
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-xl transition-all hover:scale-105 hover:-translate-y-0.5 shadow-lg shadow-violet-500/25"
          >
            <span>View Full Changelog on GitHub</span>
            <ExternalLink className="w-5 h-5" />
          </a>
          <p className="text-slate-500 text-sm mt-4">
            See detailed release notes and all previous versions
          </p>
        </motion.div>
      </div>
    </section>
  );
}
