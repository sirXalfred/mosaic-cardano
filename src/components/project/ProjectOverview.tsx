import React from 'react';
import { ProjectDetail } from '@/services/projects';
import { TexturedCard } from '@/components/ui/textured-card';

export default function ProjectOverview({ project, setActiveTab }: { project: ProjectDetail, setActiveTab: (tab: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="md:col-span-2 space-y-8">
        <div>
          <h3 className="font-sans text-xs uppercase tracking-widest font-bold text-theme-accent mb-4">The Mandate</h3>
          <p className="font-serif text-xl leading-relaxed text-theme-forest">
            {project.description}
          </p>
        </div>
        
        <div className="pt-8 border-t border-theme-outline/20">
          <h3 className="font-sans text-xs uppercase tracking-widest font-bold text-theme-accent mb-6">Recent Discussions</h3>
          <div className="space-y-4">
            {project.discussions.slice(0, 2).map(disc => (
              <div key={disc.id} className="bg-theme-parchment p-5 rounded-lg border border-theme-outline/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-theme-forest">{disc.authorName}</span>
                  <span className="text-xs text-theme-on-surface/50">{disc.timestamp}</span>
                </div>
                <p className="text-sm text-theme-on-surface/80">{disc.content}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveTab('discussions')} className="mt-4 text-theme-accent font-sans text-xs uppercase tracking-widest font-bold hover:underline underline-offset-4 cursor-pointer">
            View all discussions
          </button>
        </div>
      </div>
      
      <div className="space-y-8">
        <TexturedCard patternId={3} className="bg-theme-surface-high p-6 rounded-xl border border-theme-outline/20">
          <h3 className="font-sans text-xs uppercase tracking-widest font-bold text-theme-accent mb-4">Current Focus</h3>
          <div className="bg-theme-parchment p-4 rounded border border-theme-clay/30 relative z-10">
            <p className="text-sm font-medium text-theme-forest mb-2">Phase 2: Transcription & Translation</p>
            <p className="text-xs text-theme-on-surface/70">1 task remaining to complete this phase.</p>
          </div>
        </TexturedCard>
        
        <div>
          <h3 className="font-sans text-xs uppercase tracking-widest font-bold text-theme-accent mb-4">Top Stewards</h3>
          <div className="flex flex-col gap-3">
            {project.contributors.slice(0, 3).map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-theme-clay flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {c.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-theme-forest leading-none">{c.name}</p>
                  <p className="text-xs text-theme-on-surface/60">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
