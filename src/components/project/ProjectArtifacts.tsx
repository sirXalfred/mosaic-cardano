import React from 'react';
import Link from 'next/link';
import { ProjectDetail } from '@/services/projects';
import { FileText, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { TexturedCard } from '@/components/ui/textured-card';

export default function ProjectArtifacts({ project, projectId }: { project: ProjectDetail, projectId: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8 border-b border-theme-outline/20 pb-4">
        <h2 className="font-serif text-2xl text-theme-forest">Project Artifacts</h2>
        <Link href={`/studio?project_id=${projectId}`} className="bg-theme-forest text-theme-parchment px-6 py-3 rounded-lg text-xs font-sans uppercase tracking-widest font-bold hover:bg-theme-forest/90 cursor-pointer transition-all hover:scale-105 shadow-md flex items-center gap-2">
          <FileText size={16} /> New Artifact
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {project.artifacts.map((artifact, i) => (
          <TexturedCard patternId={(i % 5) + 1 as 1|2|3|4|5} key={artifact.id} className="bg-theme-parchment p-6 rounded-xl border border-theme-outline/20 hover:border-theme-clay/50 transition-colors flex flex-col justify-between group h-48 shadow-sm">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-bold ${
                  artifact.status === 'Published' ? 'bg-theme-forest text-white' : 
                  artifact.status === 'Under Review' ? 'bg-amber-500 text-white' : 'bg-theme-clay/20 text-theme-accent border border-theme-clay/30'
                }`}>
                  {artifact.status}
                </span>
                <span className="text-[10px] text-theme-on-surface/50 font-mono">
                  Updated {artifact.updatedAt}
                </span>
              </div>
              <h3 className="font-serif text-xl text-theme-forest mb-2 line-clamp-2">{artifact.title}</h3>
            </div>
            
            <div className="flex justify-between items-center mt-auto relative z-10">
              <div className="flex -space-x-2">
                {artifact.authorIds.map(id => {
                  const author = project.contributors.find(c => c.id === id);
                  return (
                    <div key={id} className="w-6 h-6 rounded-full border-2 border-theme-parchment bg-theme-clay flex items-center justify-center text-[8px] font-bold text-white">
                      {author?.initials || 'A'}
                    </div>
                  );
                })}
              </div>
              <Link 
                href={artifact.status === 'Published' ? ROUTES.ARTIFACT(artifact.id) : `/studio?project_id=${projectId}&artifact_id=${artifact.id}`} 
                className="text-theme-accent font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {artifact.status === 'Published' ? 'View Details' : 'Open in Studio'} <ChevronRight size={14} />
              </Link>
            </div>
          </TexturedCard>
        ))}
      </div>
    </div>
  );
}
