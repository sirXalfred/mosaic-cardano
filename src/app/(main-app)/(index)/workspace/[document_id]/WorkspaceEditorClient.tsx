"use client";

import React, { useState } from 'react';
import { useGetDocumentDetails, useGetDocumentComments } from '@/services/documents';
import { useGetMyVillages } from '@/services/villages';

import StudioEditor from '@/components/studio/StudioEditor';
import StudioSidebarRight from '@/components/studio/StudioSidebarRight';
import PublishingModal from '@/components/studio/PublishingModal';
import { PublishStep, DocumentDetails } from '@/types/mosaic';

export default function WorkspaceEditorClient({ 
  documentId, 
  initialData 
}: { 
  documentId: string;
  initialData?: DocumentDetails | null;
}) {
  const { document, isLoading: isDocumentLoading, isContentLoading } = useGetDocumentDetails(documentId);
  const { data: comments } = useGetDocumentComments(documentId);
  const { data: myVillages } = useGetMyVillages();
  
  const [publishStep, setPublishStep] = useState<PublishStep | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  if (isDocumentLoading && !initialData) {
    return <div className="min-h-screen bg-theme-surface flex items-center justify-center">Loading Workspace...</div>;
  }

  // Generate a list of communities the user is a member of for the publishing modal
  const communities = myVillages?.map(v => ({ id: v.id, name: v.name })) || [];

  const nextPublishStep = async (current: PublishStep) => {
    const steps: PublishStep[] = ['draft', 'community', 'propose', 'waiting', 'mint', 'success'];
    const idx = steps.indexOf(current);
    if (idx < steps.length - 1) {
      setPublishStep(steps[idx + 1]);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-theme-surface overflow-hidden font-sans relative">
      
      <StudioEditor 
        setPublishStep={setPublishStep} 
        documentId={documentId}
        document={document || null}
        isContentLoading={isContentLoading}
        toggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
      />
      
      {/* Mobile Backdrop */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
      
      <StudioSidebarRight 
        comments={comments || []} 
        document={document || null}
        isMobileOpen={showMobileSidebar}
        closeMobileSidebar={() => setShowMobileSidebar(false)}
      />
      
      <PublishingModal 
        publishStep={publishStep!} 
        setPublishStep={setPublishStep} 
        document={document || null}
        communities={communities}
        nextPublishStep={nextPublishStep} 
      />
    </div>
  );
}
