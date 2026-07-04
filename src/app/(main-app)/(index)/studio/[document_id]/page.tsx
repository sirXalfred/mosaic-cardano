"use client";

import React, { useState } from 'react';
import { useGetDocumentDetails } from '@/services/documents';
import { useGetMyVillages } from '@/services/villages';

import StudioEditor from '@/components/studio/StudioEditor';
import StudioSidebarRight from '@/components/studio/StudioSidebarRight';
import PublishingModal, { PublishStep } from '@/components/studio/PublishingModal';

export default function StudioPage({ params }: { params: { document_id: string } }) {
  const documentId = params.document_id;
  
  const { data: document, isLoading: isDocumentLoading } = useGetDocumentDetails(documentId);
  const { data: myVillages } = useGetMyVillages();
  
  const [publishStep, setPublishStep] = useState<PublishStep | null>(null);
  
  if (isDocumentLoading) {
    return <div className="min-h-screen bg-theme-surface flex items-center justify-center">Loading Studio...</div>;
  }

  // Generate a list of communities the user is a member of for the publishing modal
  const communities = myVillages?.map(v => ({ id: v.id, name: v.name })) || [];

  const nextPublishStep = async (current: PublishStep) => {
    const steps: PublishStep[] = ['draft', 'community', 'review', 'attribution', 'revenue', 'signing', 'success'];
    const idx = steps.indexOf(current);
    if (idx < steps.length - 1) {
      setPublishStep(steps[idx + 1]);
    }
  };

  return (
    <div className="flex h-screen bg-theme-surface overflow-hidden font-sans">
      
      <StudioEditor 
        setPublishStep={setPublishStep} 
        documentId={documentId}
      />
      
      <StudioSidebarRight 
        comments={[]} 
      />
      
      <PublishingModal 
        publishStep={publishStep!} 
        setPublishStep={setPublishStep} 
        documentId={documentId}
        documentTitle={document?.title}
        communities={communities}
        nextPublishStep={nextPublishStep} 
      />
    </div>
  );
}
