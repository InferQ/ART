import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  Activity,
  Brain,
  Target,
  Zap,
  Shield,
  MessageSquare,
  GitPullRequest,
  Settings,
  Database,
  Clock,
  Sparkles,
  CheckCircle2,
  Play,
} from 'lucide-react';

const workflowStages = [
  {
    id: 1,
    name: 'Configuration',
    icon: Settings,
    color: 'from-violet-500 to-purple-600',
    glowColor: 'violet',
    description: 'Initialize agent with context, tools, and reasoning provider',
    longDescription: 'The agent loads its persona, registers available tools, and connects to the configured LLM provider. This stage establishes the foundation for intelligent reasoning.',
    details: [
      { label: 'Agent Persona', desc: 'Define identity and behavior' },
      { label: 'Tool Registry', desc: 'Load available capabilities' },
      { label: 'Provider Setup', desc: 'Connect to LLM backend' },
      { label: 'System Prompts', desc: 'Resolve prompt hierarchy' },
    ],
  },
  {
    id: 2,
    name: 'Context Gathering',
    icon: Database,
    color: 'from-blue-500 to-cyan-500',
    glowColor: 'blue',
    description: 'Collect and synthesize all relevant information',
    longDescription: 'Before reasoning, the agent gathers conversation history, loads persistent state, and fetches tool schemas to build complete context awareness.',
    details: [
      { label: 'User Analysis', desc: 'Parse intent and query' },
      { label: 'History Loading', desc: 'Retrieve conversation context' },
      { label: 'State Retrieval', desc: 'Load persistent memory' },
      { label: 'Schema Fetch', desc: 'Prepare tool definitions' },
    ],
  },
  {
    id: 3,
    name: 'Planning',
    icon: Target,
    color: 'from-indigo-500 to-violet-600',
    glowColor: 'indigo',
    description: 'Create a structured TodoList to achieve the goal',
    longDescription: 'The agent thinks holistically about the request, decomposing complex tasks into discrete, executable steps with clear dependencies.',
    details: [
      { label: 'Task Decomposition', desc: 'Break into atomic steps' },
      { label: 'Dependency Mapping', desc: 'Order by prerequisites' },
      { label: 'Plan Refinement', desc: 'Optimize the approach' },
      { label: 'Intent Extraction', desc: 'Capture user goals' },
    ],
  },
  {
    id: 4,
    name: 'Execution',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    glowColor: 'amber',
    description: 'Execute plan steps using available tools',
    longDescription: 'The engine iterates through the TodoList, invoking tools, delegating to other agents, and dynamically adapting based on results.',
    details: [
      { label: 'Step Execution', desc: 'Process each task item' },
      { label: 'Tool Invocation', desc: 'Call registered tools' },
      { label: 'A2A Delegation', desc: 'Coordinate with agents' },
      { label: 'Dynamic Updates', desc: 'Adapt plan in real-time' },
    ],
  },
  {
    id: 5,
    name: 'Synthesis',
    icon: Activity,
    color: 'from-emerald-500 to-green-600',
    glowColor: 'emerald',
    description: 'Combine results into a coherent response',
    longDescription: 'All completed tasks are aggregated, insights are extracted, and the agent generates a final user-facing response with rich metadata.',
    details: [
      { label: 'Result Aggregation', desc: 'Combine task outputs' },
      { label: 'Response Generation', desc: 'Craft final answer' },
      { label: 'UI Metadata', desc: 'Add citations & actions' },
      { label: 'Content Formatting', desc: 'Structure for display' },
    ],
  },
  {
    id: 6,
    name: 'Finalization',
    icon: CheckCircle2,
    color: 'from-teal-500 to-cyan-600',
    glowColor: 'teal',
    description: 'Persist state and finalize the response',
    longDescription: 'The final message is saved to history, agent state is persisted for resumability, and observations are emitted for full traceability.',
    details: [
      { label: 'Save Message', desc: 'Persist to history' },
      { label: 'State Persistence', desc: 'Enable resumability' },
      { label: 'Emit Observations', desc: 'Record for debugging' },
      { label: 'Return Response', desc: 'Deliver to user' },
    ],
  },
];

const capabilities = [
  {
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    title: 'Structured Planning',
    description: 'Break down complex tasks into executable steps with clear dependencies',
    stat: 'Dynamic',
    statLabel: 'Plan adaptation',
  },
  {
    icon: Shield,
    color: 'from-blue-500 to-cyan-500',
    title: 'Stateful Execution',
    description: 'Maintain context and state across sessions with automatic recovery',
    stat: 'Full',
    statLabel: 'Context retention',
  },
  {
    icon: GitPullRequest,
    color: 'from-orange-500 to-red-500',
    title: 'A2A Delegation',
    description: 'Seamlessly delegate tasks to specialized agents',
    stat: 'Auto',
    statLabel: 'Discovery',
  },
  {
    icon: MessageSquare,
    color: 'from-green-500 to-emerald-500',
    title: 'Deep Observability',
    description: 'Complete visibility into every decision and action',
    stat: '100%',
    statLabel: 'Trace coverage',
  },
  {
    icon: Clock,
    color: 'from-yellow-500 to-orange-500',
    title: 'Live Streaming',
    description: 'Real-time token streaming with thinking visualization',
    stat: 'Live',
    statLabel: 'Response flow',
  },
  {
    icon: Sparkles,
    color: 'from-indigo-500 to-purple-500',
    title: 'Plan Refinement',
    description: 'Dynamically adapt plans based on execution results',
    stat: 'Real-time',
    statLabel: 'Replanning',
  },
];

// Animated connection line component
function ConnectionLine({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative h-24 flex justify-center">
      <motion.div
        className="w-px h-full bg-gradient-to-b from-slate-700 to-slate-800"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-700"
        animate={isActive ? { scale: [1, 1.5, 1], backgroundColor: ['#334155', '#6366f1', '#334155'] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {isActive && (
        <motion.div
          className="absolute w-1 bg-gradient-to-b from-indigo-500 to-transparent"
          initial={{ top: 0, height: 0 }}
          animate={{ height: '100%' }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      )}
    </div>
  );
}

// Stage card with scroll-triggered animations
function WorkflowStageCard({ stage, index, isActive, onClick }: {
  stage: typeof workflowStages[0];
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: false, margin: '-20% 0px -20% 0px' });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
      onClick={onClick}
      className={`relative cursor-pointer group ${index % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'}`}
    >
      {/* Glow effect */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${stage.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
        animate={isInView ? { opacity: [0, 0.15, 0.1] } : { opacity: 0 }}
        transition={{ duration: 1.5 }}
      />

      <motion.div
        className={`relative overflow-hidden rounded-3xl border transition-all duration-500 ${isActive
            ? 'border-indigo-500/50 bg-slate-900/90'
            : 'border-slate-800/50 bg-slate-900/60 hover:border-slate-700/50'
          }`}
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ duration: 0.3 }}
        layout
      >
        {/* Animated background gradient */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${stage.color} opacity-0`}
          animate={isActive ? { opacity: 0.08 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Card content */}
        <div className="relative p-8 lg:p-10">
          {/* Header */}
          <div className="flex items-start gap-6 mb-6">
            {/* Stage number and icon */}
            <div className="relative">
              <motion.div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-2xl`}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <stage.icon className="w-10 h-10 text-white" />
              </motion.div>
              <motion.div
                className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}
                animate={isInView ? { scale: [0, 1.2, 1] } : { scale: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {stage.id}
              </motion.div>
            </div>

            {/* Title and description */}
            <div className="flex-1">
              <motion.h3
                className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-2"
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {stage.name}
              </motion.h3>
              <motion.p
                className="text-slate-400 text-lg leading-relaxed"
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {stage.description}
              </motion.p>
            </div>

            {/* Expand indicator */}
            <motion.div
              animate={{ rotate: isActive ? 90 : 0 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:flex w-10 h-10 rounded-full bg-slate-800/50 items-center justify-center"
            >
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </motion.div>
          </div>

          {/* Expanded content */}
          <motion.div
            initial={false}
            animate={{
              height: isActive ? 'auto' : 0,
              opacity: isActive ? 1 : 0
            }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden"
          >
            <div className="pt-6 border-t border-slate-800/50">
              {/* Long description */}
              <p className="text-slate-300 mb-8 leading-relaxed">
                {stage.longDescription}
              </p>

              {/* Details grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stage.details.map((detail, detailIndex) => (
                  <motion.div
                    key={detail.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: detailIndex * 0.1 }}
                    className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-indigo-500/30 transition-colors"
                  >
                    <div className="text-white font-semibold mb-1">{detail.label}</div>
                    <div className="text-slate-500 text-sm">{detail.desc}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Animated border glow */}
        {isActive && (
          <motion.div
            className={`absolute inset-0 rounded-3xl border-2 border-indigo-500/50 pointer-events-none`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

// Floating particles animation
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-indigo-500/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Timeline Progress Bar
function TimelineProgress({ progress }: { progress: number }) {
  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-2 z-40">
      <div className="h-48 w-1 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="w-full bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"
          style={{ height: `${progress * 100}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 font-mono">{Math.round(progress * 100)}%</span>
    </div>
  );
}

export default function Capabilities() {
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Parallax effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const titleScale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="capabilities"
      className="relative py-32 lg:py-48 overflow-hidden"
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </motion.div>

      <FloatingParticles />
      <TimelineProgress progress={smoothProgress.get()} />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-24 lg:mb-32"
          style={{ scale: titleScale, opacity: titleOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8"
          >
            <Play className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">The Agent Lifecycle</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
          >
            <span className="bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
              PESAgent
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Workflow
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            <span className="text-indigo-400 font-semibold">Plan</span>,{' '}
            <span className="text-purple-400 font-semibold">Execute</span>,{' '}
            <span className="text-pink-400 font-semibold">Synthesize</span> —
            <br className="hidden md:block" />
            A sophisticated 6-stage orchestration for intelligent agents
          </motion.p>
        </motion.div>

        {/* Workflow Stages */}
        <div className="relative space-y-6 lg:space-y-0">
          {workflowStages.map((stage, index) => (
            <div key={stage.id}>
              <WorkflowStageCard
                stage={stage}
                index={index}
                isActive={activeStage === stage.id}
                onClick={() => setActiveStage(activeStage === stage.id ? null : stage.id)}
              />
              {index < workflowStages.length - 1 && (
                <div className="hidden lg:block">
                  <ConnectionLine isActive={activeStage === stage.id || activeStage === stage.id + 1} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Capabilities Grid */}
        <motion.div
          className="mt-32 lg:mt-48"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl lg:text-5xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Agent Capabilities
              </span>
            </h3>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Powerful features that make PESAgent production-ready
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative"
              >
                <motion.div
                  className="relative h-full bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 overflow-hidden"
                  whileHover={{ scale: 1.03, y: -8, borderColor: 'rgba(99, 102, 241, 0.3)' }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Hover gradient */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${capability.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  <div className="relative">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${capability.color} flex items-center justify-center mb-6 shadow-xl`}
                    >
                      <capability.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    <h4 className="text-xl font-bold mb-3 tracking-tight text-white">
                      {capability.title}
                    </h4>
                    <p className="text-slate-400 mb-6 leading-relaxed">
                      {capability.description}
                    </p>

                    <div className="pt-4 border-t border-slate-800/50 flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                          {capability.stat}
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">
                          {capability.statLabel}
                        </div>
                      </div>
                      <motion.div
                        className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.1 }}
                      >
                        <ArrowRight className="w-4 h-4 text-indigo-400" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
