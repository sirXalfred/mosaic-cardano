import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProjectDetail } from '@/services/projects';

export default function StudioSidebarLeft({ project }: { project: ProjectDetail | null }) {
  const router = useRouter();

  return (
    <aside className="w-16 md:w-64 border-r border-theme-outline/20 bg-theme-surface-low flex flex-col transition-all">
      <div className="p-4 border-b border-theme-outline/20 flex items-center justify-center md:justify-start gap-3">
        <button onClick={() => router.back()} className="text-theme-on-surface/50 hover:text-theme-forest transition-colors cursor-pointer">
          <ChevronLeft size={20} />
        </button>
        <span className="hidden md:inline font-bold text-xs uppercase tracking-widest text-theme-forest truncate">Back</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 hidden md:block">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-theme-on-surface/50 font-bold mb-3">Project</p>
          <p className="text-sm font-bold text-theme-forest truncate">{project?.title || 'Untitled Project'}</p>
        </div>
        
        <div>
          <p className="text-[10px] uppercase tracking-widest text-theme-on-surface/50 font-bold mb-3">Document Outline</p>
          <ul className="space-y-2 text-sm text-theme-on-surface/70">
            <li className="font-medium text-theme-forest cursor-pointer hover:underline">1. Introduction</li>
            <li className="pl-4 cursor-pointer hover:underline">1.1 Historical Context</li>
            <li className="font-medium cursor-pointer hover:underline">2. Translation Notes</li>
            <li className="pl-4 cursor-pointer hover:underline">2.1 Stanza 1</li>
            <li className="pl-4 cursor-pointer hover:underline">2.2 Stanza 2</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
