import fs from 'fs';
import path from 'path';

export interface DocMetadata {
  slug: string;
  title: string;
  category: 'Platform' | 'Resources' | 'Legal';
}

export const DOCS_METADATA: Record<string, Omit<DocMetadata, 'slug'>> = {
  'governance': { title: 'Governance', category: 'Platform' },
  'cardano-integration': { title: 'Cardano Integration', category: 'Resources' },
  'community-guidelines': { title: 'Community Guidelines', category: 'Resources' },
  'grants': { title: 'Grants & Funding', category: 'Resources' },
  'terms': { title: 'Terms of Service', category: 'Legal' },
  'privacy': { title: 'Privacy Policy', category: 'Legal' },
  'immutable-records': { title: 'Immutable Records', category: 'Legal' },
};

const DOCS_DIR = path.join(process.cwd(), 'src/content/docs');

export async function getDocContent(slug: string): Promise<{ title: string; content: string } | null> {
  try {
    const filename = slug === 'index' || !slug ? 'index.md' : `${slug}.md`;
    const filePath = path.join(DOCS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = await fs.promises.readFile(filePath, 'utf-8');
    
    // Extract title from metadata or fall back to extracting the first h1
    const meta = DOCS_METADATA[slug];
    let title = meta?.title || '';
    
    if (!title) {
      const match = content.match(/^#\s+(.+)$/m);
      title = match ? match[1] : slug;
    }

    return { title, content };
  } catch (error) {
    console.error(`Error reading doc ${slug}:`, error);
    return null;
  }
}

export function getDocsList(): DocMetadata[] {
  return Object.entries(DOCS_METADATA).map(([slug, meta]) => ({
    slug,
    ...meta,
  }));
}
