import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ArrowLeft, ChevronRight, BookOpen, Lightbulb, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { DocContent } from '../docs-content';

interface DocsLayoutProps {
    children: React.ReactNode;
    allDocs: DocContent[];
    currentDoc?: DocContent;
    docType: 'concepts' | 'how-to';
}

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

function extractTOC(content: string): TOCItem[] {
    const headingRegex = /^(#{2,4})\s+(.+)$/gm;
    const toc: TOCItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        toc.push({ id, text, level });
    }

    return toc;
}

export default function DocsLayout({ children, allDocs, currentDoc, docType }: DocsLayoutProps) {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tocItems, setTocItems] = useState<TOCItem[]>([]);
    const [activeHeading, setActiveHeading] = useState<string>('');

    const basePath = docType === 'concepts' ? '/concepts' : '/how-to';
    const title = docType === 'concepts' ? 'Concepts' : 'How-To Guides';
    const Icon = docType === 'concepts' ? Lightbulb : BookOpen;

    useEffect(() => {
        if (currentDoc?.content) {
            setTocItems(extractTOC(currentDoc.content));
        }
    }, [currentDoc]);

    useEffect(() => {
        const handleScroll = () => {
            const headings = document.querySelectorAll('.markdown-content h2, .markdown-content h3');
            let current = '';

            headings.forEach((heading) => {
                const rect = heading.getBoundingClientRect();
                if (rect.top <= 100) {
                    current = heading.id;
                }
            });

            setActiveHeading(current);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const currentIndex = allDocs.findIndex(d => d.slug === currentDoc?.slug);
    const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
    const nextDoc = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Background gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_50%)] pointer-events-none" />

            {/* Top navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
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
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                        <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-indigo-400" />
                            <span className="text-slate-300 font-medium">{title}</span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/concepts" className={`text-sm transition-colors ${location.pathname.startsWith('/concepts') ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}>
                            Concepts
                        </Link>
                        <Link to="/how-to" className={`text-sm transition-colors ${location.pathname.startsWith('/how-to') ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}>
                            How-To Guides
                        </Link>
                        <Link to="/ART/components/index.html" className="text-sm text-slate-400 hover:text-white transition-colors">
                            API Reference
                        </Link>
                    </div>

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="relative pt-20 flex max-w-7xl mx-auto">
                {/* Left sidebar - Navigation */}
                <aside
                    className={`fixed md:sticky top-20 left-0 z-40 w-72 h-[calc(100vh-5rem)] bg-slate-950/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-r border-slate-800 md:border-0 overflow-y-auto transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                        }`}
                >
                    <div className="p-6">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>

                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                            {title}
                        </h3>

                        <nav className="space-y-1">
                            {allDocs.map((doc) => {
                                const isActive = location.pathname === `${basePath}/${doc.slug}`;
                                return (
                                    <Link
                                        key={doc.slug}
                                        to={`${basePath}/${doc.slug}`}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <span className="text-lg">{doc.icon}</span>
                                        <span className="text-sm font-medium">{doc.title}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 min-w-0 px-6 md:px-12 py-8">
                    {currentDoc && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Document header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-3xl">{currentDoc.icon}</span>
                                    <div>
                                        <h1 className="text-3xl font-bold text-white">{currentDoc.title}</h1>
                                        {currentDoc.readTime && (
                                            <span className="text-sm text-slate-500">📖 {currentDoc.readTime} read</span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-slate-400 text-lg">{currentDoc.description}</p>
                            </div>

                            {/* Content */}
                            <div className="prose prose-invert max-w-none">
                                {children}
                            </div>

                            {/* Previous/Next navigation */}
                            <div className="mt-16 pt-8 border-t border-slate-800 flex justify-between gap-4">
                                {prevDoc ? (
                                    <Link
                                        to={`${basePath}/${prevDoc.slug}`}
                                        className="flex-1 group p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/50 transition-all"
                                    >
                                        <div className="text-sm text-slate-500 mb-1">← Previous</div>
                                        <div className="text-white font-medium group-hover:text-indigo-400 transition-colors">
                                            {prevDoc.title}
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="flex-1" />
                                )}
                                {nextDoc && (
                                    <Link
                                        to={`${basePath}/${nextDoc.slug}`}
                                        className="flex-1 group p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/50 transition-all text-right"
                                    >
                                        <div className="text-sm text-slate-500 mb-1">Next →</div>
                                        <div className="text-white font-medium group-hover:text-indigo-400 transition-colors">
                                            {nextDoc.title}
                                        </div>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {!currentDoc && children}
                </main>

                {/* Right sidebar - Table of Contents */}
                {currentDoc && tocItems.length > 0 && (
                    <aside className="hidden xl:block sticky top-20 w-64 h-[calc(100vh-5rem)] overflow-y-auto border-l border-slate-800">
                        <div className="p-6">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                On this page
                            </h4>
                            <nav className="space-y-1">
                                {tocItems.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const element = document.getElementById(item.id);
                                            if (element) {
                                                const yOffset = -100;
                                                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                                window.scrollTo({ top: y, behavior: 'smooth' });
                                            }
                                        }}
                                        className={`block text-sm transition-colors ${item.level === 3 ? 'pl-4' : item.level === 4 ? 'pl-8' : ''
                                            } ${activeHeading === item.id
                                                ? 'text-indigo-400'
                                                : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {item.text}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
