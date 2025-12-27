import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Code2, GitBranch, ChevronDown, ChevronUp, Cpu, Database, Layout } from 'lucide-react';
import Background from './Background';
import HeroSection from './HeroSection';
import WhatIsART from './WhatIsART';
import Architecture from './Architecture';
import Capabilities from './Capabilities';
import PESAgentDeepDive from './PESAgentDeepDive';
import Coverage from './Coverage';
import ProductionReady from './ProductionReady';
import Features from './Features';
import UseCases from './UseCases';
import ReleaseNotes from './ReleaseNotes';
import SDKSimplicity from './SDKSimplicity';
import TechnicalControl from './TechnicalControl';
import CTA from './CTA';
import Footer from './Footer';

export default function LandingPage() {
    const { scrollY } = useScroll();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showTechnical, setShowTechnical] = useState(false);
    const heroRef = useRef(null);

    const opacity = useTransform(scrollY, [0, 400], [1, 0]);
    const scale = useTransform(scrollY, [0, 400], [1, 0.95]);
    const heroY = useTransform(scrollY, [0, 400], [0, -100]);

    const navOpacity = useTransform(scrollY, [0, 100], [0, 1]);
    const navBackground = useTransform(
        scrollY,
        [0, 100],
        ['rgba(2, 6, 23, 0)', 'rgba(2, 6, 23, 0.95)']
    );

    return (
        <div className="min-h-screen bg-slate-950 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
            <Background scrollY={scrollY} />

            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300">
                <motion.div
                    style={{ opacity: navOpacity, backgroundColor: navBackground }}
                    className="absolute inset-0 backdrop-blur-xl -z-10"
                />
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <motion.div
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                            }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25"
                        >
                            <Sparkles className="w-6 h-6 text-white" />
                        </motion.div>
                        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            ART Framework
                        </span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hidden md:flex items-center gap-8"
                    >
                        <motion.a
                            href="#use-cases"
                            className="text-slate-300 hover:text-white transition-colors relative group"
                        >
                            Use Cases
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                        </motion.a>
                        <Link
                            to="/concepts"
                            className="text-slate-300 hover:text-white transition-colors relative group"
                        >
                            Concepts
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                        </Link>
                        <Link
                            to="/how-to"
                            className="text-slate-300 hover:text-white transition-colors relative group"
                        >
                            Guides
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                        </Link>
                        
                        <motion.a
                            href="/ART/components/index.html"
                            onClick={(e) => {
                                e.preventDefault();
                                window.location.href = '/ART/components/index.html';
                            }}
                            className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-xl text-sm font-bold hover:bg-indigo-500/20 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/10"
                            whileHover={{ scale: 1.05, y: -1 }}
                        >
                            API Docs
                            <Sparkles className="w-3.5 h-3.5" />
                        </motion.a>

                        <button
                            onClick={() => setShowTechnical(!showTechnical)}
                            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-medium ${showTechnical ? 'bg-indigo-500/20 text-white border border-indigo-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-indigo-500/50 hover:text-indigo-400'}`}
                        >
                            Deep Dive
                            {showTechnical ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </motion.div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="md:hidden text-white p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <BookOpen /> : <Code2 />}
                    </motion.button>
                </div>

                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden mt-4 overflow-hidden"
                    >
                        <div className="glass-card p-6 backdrop-blur-xl">
                            <div className="flex flex-col gap-4">
                                {[
                                    { href: '#use-cases', label: 'Use Cases' },
                                    { to: '/concepts', label: 'Concepts' },
                                    { to: '/how-to', label: 'Guides' },
                                    { href: '/ART/components/index.html', label: 'API Reference', forceReload: true, icon: Sparkles },
                                    { href: 'https://github.com/inferq/art', label: 'GitHub', icon: GitBranch },
                                ].map((item) => (
                                    item.to ? (
                                        <Link
                                            key={item.label}
                                            to={item.to}
                                            className="text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                                        >
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <motion.a
                                            key={item.label}
                                            href={item.href}
                                            onClick={item.forceReload ? (e) => {
                                                e.preventDefault();
                                                window.location.href = item.href!;
                                            } : undefined}
                                            target={item.href?.startsWith('http') ? '_blank' : undefined}
                                            rel={item.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                            className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                                            whileHover={{ x: 5 }}
                                        >
                                            {item.icon && <item.icon className="w-4 h-4" />}
                                            {item.label}
                                        </motion.a>
                                    )
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </nav>

            <motion.section
                ref={heroRef}
                style={{ opacity, scale, y: heroY }}
                className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20"
            >
                <HeroSection />
            </motion.section>

            <WhatIsART scrollY={scrollY} />
            
            <UseCases />

            <SDKSimplicity />

            <Capabilities />

            <TechnicalControl />

            {/* Narrative Bridge to Technicals */}
            <section className="py-24 px-6 bg-slate-950 text-center border-t border-slate-900">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Under the hood.</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        For engineers who want to understand the 6-stage runtime, 
                        the modular protocol layers, and the enterprise-grade robustness core.
                    </p>
                    <button
                        onClick={() => {
                            setShowTechnical(true);
                            setTimeout(() => {
                                document.getElementById('technical-deep-dive')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                        }}
                        className="inline-flex items-center gap-2 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 transition-all"
                    >
                        Reveal Technical Deep Dive
                        <ChevronDown className="w-5 h-5" />
                    </button>
                </div>
            </section>

            <AnimatePresence>
                {showTechnical && (
                    <motion.div
                        id="technical-deep-dive"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="overflow-hidden bg-slate-950"
                    >
                        <PESAgentDeepDive />
                        <Architecture />
                        <Features />
                        <Coverage />
                        <ProductionReady />
                    </motion.div>
                )}
            </AnimatePresence>

            <ReleaseNotes />
            <CTA />
            <Footer />
        </div>
    );
}