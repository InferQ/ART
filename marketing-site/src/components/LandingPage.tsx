import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Code2, GitBranch } from 'lucide-react';
import Background from './Background';
import HeroSection from './HeroSection';
import WhatIsART from './WhatIsART';
import Architecture from './Architecture';
import Capabilities from './Capabilities';
import Benefits from './Benefits';
import Features from './Features';
import UseCases from './UseCases';
import CTA from './CTA';
import Footer from './Footer';

export default function LandingPage() {
    const { scrollY } = useScroll();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
                            href="/ART/components/index.html"
                            className="text-slate-300 hover:text-white transition-colors relative group"
                            whileHover={{ scale: 1.05 }}
                        >
                            API Docs
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
                            How-To Guides
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                        </Link>
                        <motion.a
                            href="#benefits"
                            className="text-slate-300 hover:text-white transition-colors relative group"
                            whileHover={{ scale: 1.05 }}
                        >
                            Benefits
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                        </motion.a>
                        <motion.a
                            href="#features"
                            className="text-slate-300 hover:text-white transition-colors relative group"
                            whileHover={{ scale: 1.05 }}
                        >
                            Features
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                        </motion.a>
                        <motion.a
                            href="https://github.com/inferq/art"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-300 hover:text-white transition-colors relative group"
                            whileHover={{ scale: 1.05 }}
                        >
                            GitHub
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                        </motion.a>
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
                                    { href: '/ART/components/index.html', label: 'API Reference' },
                                    { to: '/concepts', label: 'Concepts' },
                                    { to: '/how-to', label: 'How-To Guides' },
                                    { href: '#benefits', label: 'Benefits' },
                                    { href: '#features', label: 'Features' },
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
            <Architecture />
            <Capabilities />
            <Benefits />
            <Features />
            <UseCases />
            <CTA />
            <Footer />
        </div>
    );
}
