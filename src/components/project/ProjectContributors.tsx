import React from 'react';
import { ProjectDetail } from '@/services/projects';

export default function ProjectContributors({ project }: { project: ProjectDetail }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="font-serif text-2xl mb-8">Project Stewards & Contributors</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {project.contributors.map(c => (
          <div key={c.id} className="bg-theme-parchment p-6 rounded-xl border border-theme-outline/20 hover:border-theme-clay/50 transition-colors flex flex-col items-center text-center group cursor-pointer shadow-sm hover:shadow-md">
            <div className="w-16 h-16 rounded-full bg-theme-forest text-theme-parchment flex items-center justify-center text-xl font-serif mb-4 transform group-hover:scale-110 transition-transform">
              {c.initials}
            </div>
            <h3 className="font-bold text-lg text-theme-forest">{c.name}</h3>
            <p className="text-sm text-theme-accent mb-4">{c.role}</p>
            <div className="w-full bg-theme-surface rounded p-3 flex justify-between items-center text-sm border border-theme-outline/10">
              <span className="text-theme-on-surface/60">Attribution</span>
              <span className="font-bold text-theme-forest">{c.attributionPercentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
