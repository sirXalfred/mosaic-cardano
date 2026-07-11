import WorkspaceEditorClient from './WorkspaceEditorClient';

export async function generateMetadata() {
  return { title: 'Mosaic Workspace' };
}

export default async function WorkspacePage({ params }: { params: Promise<{ document_id: string }> }) {
  const { document_id } = await params;

  return (
    <WorkspaceEditorClient 
      documentId={document_id}
      initialData={null}
    />
  );
}
