import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
    content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="markdown-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    // Custom heading renderers for TOC linking
                    h1: ({ node, ...props }) => (
                        <h1
                            id={props.children?.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}
                            className="text-3xl font-bold text-white mb-6 mt-8 first:mt-0"
                            {...props}
                        />
                    ),
                    h2: ({ node, ...props }) => (
                        <h2
                            id={props.children?.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}
                            className="text-2xl font-semibold text-white mb-4 mt-8 pb-2 border-b border-slate-800"
                            {...props}
                        />
                    ),
                    h3: ({ node, ...props }) => (
                        <h3
                            id={props.children?.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}
                            className="text-xl font-semibold text-slate-200 mb-3 mt-6"
                            {...props}
                        />
                    ),
                    h4: ({ node, ...props }) => (
                        <h4
                            id={props.children?.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}
                            className="text-lg font-medium text-slate-300 mb-2 mt-4"
                            {...props}
                        />
                    ),
                    p: ({ node, ...props }) => (
                        <p className="text-slate-300 leading-relaxed mb-4" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                        <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2 ml-4" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol className="list-decimal list-inside text-slate-300 mb-4 space-y-2 ml-4" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                        <li className="text-slate-300 leading-relaxed" {...props} />
                    ),
                    a: ({ node, href, ...props }) => (
                        <a
                            href={href}
                            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
                            target={href?.startsWith('http') ? '_blank' : undefined}
                            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                            {...props}
                        />
                    ),
                    strong: ({ node, ...props }) => (
                        <strong className="font-semibold text-white" {...props} />
                    ),
                    em: ({ node, ...props }) => (
                        <em className="italic text-slate-200" {...props} />
                    ),
                    code: ({ node, className, children, ...props }) => {
                        const isInline = !className;
                        if (isInline) {
                            return (
                                <code
                                    className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono"
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                    pre: ({ node, ...props }) => (
                        <pre
                            className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 overflow-x-auto text-sm"
                            {...props}
                        />
                    ),
                    blockquote: ({ node, ...props }) => (
                        <blockquote
                            className="border-l-4 border-indigo-500 bg-slate-900/50 pl-4 py-2 my-4 italic text-slate-300"
                            {...props}
                        />
                    ),
                    hr: ({ node, ...props }) => (
                        <hr className="border-slate-800 my-8" {...props} />
                    ),
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto mb-6">
                            <table
                                className="w-full border-collapse border border-slate-800 rounded-lg overflow-hidden"
                                {...props}
                            />
                        </div>
                    ),
                    thead: ({ node, ...props }) => (
                        <thead className="bg-slate-900" {...props} />
                    ),
                    tbody: ({ node, ...props }) => (
                        <tbody className="divide-y divide-slate-800" {...props} />
                    ),
                    tr: ({ node, ...props }) => (
                        <tr className="hover:bg-slate-800/50 transition-colors" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                        <th
                            className="px-4 py-3 text-left text-sm font-semibold text-slate-200 border-b border-slate-700"
                            {...props}
                        />
                    ),
                    td: ({ node, ...props }) => (
                        <td
                            className="px-4 py-3 text-sm text-slate-300 border-b border-slate-800"
                            {...props}
                        />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
