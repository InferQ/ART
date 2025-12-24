import { useParams, Navigate } from 'react-router-dom';
import DocsLayout from './DocsLayout';
import MarkdownRenderer from './MarkdownRenderer';
import { getAllConcepts, getAllHowTos, getConceptBySlug, getHowToBySlug } from '../docs-content';

interface DocPageProps {
    type: 'concepts' | 'how-to';
}

export default function DocPage({ type }: DocPageProps) {
    const { slug } = useParams<{ slug: string }>();

    const allDocs = type === 'concepts' ? getAllConcepts() : getAllHowTos();
    const currentDoc = type === 'concepts'
        ? getConceptBySlug(slug || '')
        : getHowToBySlug(slug || '');

    // Redirect to first doc if no slug provided
    if (!slug && allDocs.length > 0) {
        return <Navigate to={`/${type === 'concepts' ? 'concepts' : 'how-to'}/${allDocs[0].slug}`} replace />;
    }

    // Show 404 if doc not found
    if (!currentDoc) {
        return (
            <DocsLayout allDocs={allDocs} docType={type}>
                <div className="text-center py-20">
                    <h1 className="text-4xl font-bold text-white mb-4">Document Not Found</h1>
                    <p className="text-slate-400 mb-8">
                        The document you're looking for doesn't exist.
                    </p>
                </div>
            </DocsLayout>
        );
    }

    return (
        <DocsLayout allDocs={allDocs} currentDoc={currentDoc} docType={type}>
            <MarkdownRenderer content={currentDoc.content} />
        </DocsLayout>
    );
}
