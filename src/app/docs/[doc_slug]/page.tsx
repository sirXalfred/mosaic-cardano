import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getDocContent, getDocsList } from '@/lib/docs';

interface PageProps {
  params: {
    doc_slug: string;
  };
}

export async function generateStaticParams() {
  const docs = getDocsList();
  return docs.map((doc) => ({
    doc_slug: doc.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const doc = await getDocContent(params.doc_slug);
  if (!doc) {
    return {
      title: 'Document Not Found | Mosaic Docs',
    };
  }
  return {
    title: `${doc.title} | Mosaic Docs`,
    description: `Read the official guide on ${doc.title} for the Mosaic community platform.`,
  };
}

export default async function DocPage({ params }: PageProps) {
  const doc = await getDocContent(params.doc_slug);

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
