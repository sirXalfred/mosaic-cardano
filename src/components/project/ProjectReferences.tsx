import React from 'react';
import { ProjectDetail } from '@/services/projects';
import { Link as LinkIcon, FileText, BookOpen } from 'lucide-react';

export default function ProjectReferences({ project }: { project: ProjectDetail }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex justify-between items-end mb-8 border-b border-theme-outline/20 pb-4">
        <h2 className="font-serif text-2xl text-theme-forest">Project References</h2>
        <button className="text-theme-accent px-4 py-2 rounded border border-theme-accent/30 text-xs font-sans uppercase tracking-widest font-bold hover:bg-theme-accent/5 cursor-pointer flex items-center gap-2">
          <LinkIcon size={14} /> Add Source
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {project.references.map(ref => (
          <a href={ref.url} key={ref.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-theme-outline/20 hover:border-theme-clay hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded bg-theme-surface-low flex items-center justify-center text-theme-accent shrink-0 group-hover:bg-theme-clay/10 transition-colors">
              {ref.type === 'Document' ? <FileText size={18} /> : ref.type === 'Archive' ? <BookOpen size={18} /> : <LinkIcon size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-theme-forest text-sm truncate">{ref.title}</p>
              <p className="text-[10px] uppercase tracking-widest text-theme-on-surface/60 mt-0.5">{ref.type}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
