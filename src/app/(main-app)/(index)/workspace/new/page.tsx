import WorkspaceEditorClient from '../[document_id]/WorkspaceEditorClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Draft | Mosaic Workspace',
};

export default function NewWorkspacePage() {
  return (
    <WorkspaceEditorClient 
      documentId="new"
      initialData={null}
    />
  );
}
