"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Users, CheckCircle, 
  MessageSquare, FileText, Link as LinkIcon, Calendar, BookOpen,
  ChevronLeftIcon
} from 'lucide-react';
import { useGetProjectDetails } from '@/services/projects';

// Import modular components
import ProjectOverview from '@/components/project/ProjectOverview';
import ProjectContributors from '@/components/project/ProjectContributors';
import ProjectTasks from '@/components/project/ProjectTasks';
import ProjectArtifacts from '@/components/project/ProjectArtifacts';
import ProjectDiscussions from '@/components/project/ProjectDiscussions';
import ProjectReferences from '@/components/project/ProjectReferences';
import ProjectDeadlines from '@/components/project/ProjectDeadlines';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TexturedCard } from '@/components/ui/textured-card';

type Tab = 'overview' | 'contributors' | 'tasks' | 'artifacts' | 'discussions' | 'references' | 'deadlines';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const communityId = params.community_id as string;
  const projectId = params.project_id as string;
  
  const { data: project, isLoading } = useGetProjectDetails(projectId);
  const [activeTab, setActiveTab] = useState<Tab|string>('overview');

  if (isLoading) {
    return (
      <div className="w-full min-h-screen p-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-32 bg-theme-outline/20 rounded"></div>
          <div className="h-16 w-3/4 bg-theme-outline/20 rounded"></div>
          <div className="h-4 w-1/2 bg-theme-outline/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-theme-on-surface/60 font-serif text-xl">Project not found in the archives.</p>
      </div>
    );
  }

  const tabs: { id: Tab, label: string, icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'contributors', label: 'Contributors', icon: Users },
    { id: 'tasks', label: 'Milestones', icon: CheckCircle },
    { id: 'artifacts', label: 'Artifacts', icon: FileText },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare },
    { id: 'references', label: 'References', icon: LinkIcon },
    { id: 'deadlines', label: 'Deadlines', icon: Calendar },
  ];

  return (
    <div className="w-full min-h-screen pb-24 bg-theme-surface">
      {/* Header / Hero */}
      <header className="px-6 md:px-12 lg:px-24 py-12 bg-theme-surface-low border-b border-theme-outline/20">
        <div className="max-w-6xl mx-auto">
          <Button asChild variant="link" size="sm" className="pl-0 text-theme-on-surface/60 hover:text-theme-forest font-sans uppercase tracking-widest text-[10px] font-bold mb-4">
            <Link href={ROUTES.VILLAGE.PROJECTS(communityId)}>
              <ChevronLeftIcon size={14} className="mr-1" />
              Back to Projects
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-theme-accent/10 text-theme-accent border border-theme-accent/20 px-3 py-1 rounded font-sans text-[10px] uppercase tracking-widest font-bold">
                  {project.status}
                </span>
                <span className="text-theme-on-surface/60 text-xs font-sans">
                  Est. {project.dateCreated}
                </span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-theme-forest mb-4 leading-tight">
                {project.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <span key={tag} className="bg-theme-outline/10 px-2 py-1 rounded text-xs font-sans text-theme-on-surface/70 border border-theme-outline/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <TexturedCard patternId={2} className="w-full md:w-64 bg-theme-parchment p-5 rounded-xl border border-theme-outline/20 shadow-sm">
              <div className="flex justify-between items-end mb-2">
                <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-theme-on-surface/60">Completion</span>
                <span className="font-serif text-2xl text-theme-forest">{project.progress}%</span>
              </div>
              <div className="w-full h-2 bg-theme-outline/20 rounded-full overflow-hidden mb-4 relative z-10">
                <div className="h-full bg-theme-clay" style={{ width: `${project.progress}%` }}></div>
              </div>
              <p className="text-xs text-theme-on-surface/70 font-sans text-center relative z-10">
                Target: {project.targetDeadline}
              </p>
            </TexturedCard>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="sticky top-0 z-30 bg-theme-surface/90 backdrop-blur-md border-b border-theme-outline/20 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto flex overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-5 px-6 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-theme-accent text-theme-accent' 
                  : 'border-transparent text-theme-on-surface/60 hover:text-theme-forest hover:bg-theme-outline/5'
              }`}
            >
              <tab.icon size={16} />
              <span className="font-sans text-xs uppercase tracking-widest font-bold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-12">
        {activeTab === 'overview' && <ProjectOverview project={project} setActiveTab={setActiveTab} />}
        {activeTab === 'contributors' && <ProjectContributors project={project} />}
        {activeTab === 'tasks' && <ProjectTasks project={project} />}
        {activeTab === 'artifacts' && <ProjectArtifacts project={project} projectId={projectId} />}
        {activeTab === 'discussions' && <ProjectDiscussions project={project} />}
        {activeTab === 'references' && <ProjectReferences project={project} />}
        {activeTab === 'deadlines' && <ProjectDeadlines project={project} />}
      </main>
    </div>
  );
}
