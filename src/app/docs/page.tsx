import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getDocContent } from '@/lib/docs';

export async function generateMetadata() {
  return {
    title: 'Documentation Overview | Mosaic Docs',
    description: 'Understand the architecture, integration, and rules of the Mosaic village platform.',
  };
}

export default async function DocsIndexPage() {
  // Read index.md
  const doc = await getDocContent('index');

  if (!doc) {
    notFound();
  }

  return (
    <article className="animate-onrender slide-up">
      <div className="prose dark:prose-dark max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {doc.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
