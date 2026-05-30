"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetProjectDetails, useGetDocumentComments } from '@/services/projects';

import StudioEditor from '@/components/studio/StudioEditor';
import StudioSidebarRight from '@/components/studio/StudioSidebarRight';
import PublishingModal, { PublishStep } from '@/components/studio/PublishingModal';
import { useUpdateArtifact } from '@/services/projects';

export default function StudioPage({ params }: { params: { document_id: string } }) {
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('project_id') || '1';
  const artifactId = params.document_id === 'new' ? null : params.document_id;
  const communityId = searchParams?.get('community_id') || 'scribes-of-sahel';
  
  const { data: project, isLoading: isProjectLoading } = useGetProjectDetails(projectId);
  const { data: comments } = useGetDocumentComments(artifactId || 'temp');
  
  const [publishStep, setPublishStep] = useState<PublishStep | null>(null);
  
  const { mutateAsync: updateArtifact } = useUpdateArtifact();
  
  if (isProjectLoading) {
    return <div className="min-h-screen bg-theme-surface flex items-center justify-center">Loading Studio...</div>;
  }

  const nextPublishStep = async (current: PublishStep) => {
    const steps: PublishStep[] = ['draft', 'review', 'attribution', 'revenue', 'signing', 'success'];
    const idx = steps.indexOf(current);
    if (idx < steps.length - 1) {
      if (steps[idx + 1] === 'signing') {
        setPublishStep('signing');
        
        try {
          if (artifactId) {
            await updateArtifact({
              projectId,
              artifactId,
              updates: { status: 'Published' }
            });
          }
          setPublishStep('success');
        } catch (e) {
          console.error(e);
          setPublishStep('draft'); // Fallback on error
        }
      } else {
        setPublishStep(steps[idx + 1]);
      }
    }
  };

  return (
    <div className="flex h-screen bg-theme-surface overflow-hidden font-sans">
      
      <StudioEditor 
        setPublishStep={setPublishStep} 
        projectId={projectId}
        artifactId={artifactId}
      />
      
      <StudioSidebarRight 
        comments={comments} 
      />
      
      <PublishingModal 
        publishStep={publishStep!} 
        setPublishStep={setPublishStep} 
        project={project || null} 
        communityId={communityId} 
        projectId={projectId} 
        artifactId={artifactId}
        nextPublishStep={nextPublishStep} 
      />
    </div>
  );
}
