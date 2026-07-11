import { getApiDocs } from '@/lib/swagger';
import SwaggerUIWrapper from '@/components/SwaggerUIWrapper';

export const metadata = {
  title: 'API Documentation | Mosaic',
};

export default async function ApiDocsPage() {
  const spec = await getApiDocs();
  return (
    <div className="bg-white min-h-screen">
      <SwaggerUIWrapper spec={spec} />
    </div>
  );
}
