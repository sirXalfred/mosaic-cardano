import React from 'react';
import { ProjectDetail } from '@/services/projects';

export default function ProjectDeadlines({ project }: { project: ProjectDetail }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      <h2 className="font-serif text-2xl mb-8 border-b border-theme-outline/20 pb-4">Timeline & Deadlines</h2>
      
      <div className="relative border-l-2 border-theme-clay/30 pl-8 ml-4 space-y-12 py-4">
        {project.milestones.map((milestone) => (
          
          <div key={milestone.id} className="relative">
            <div className={`absolute w-4 h-4 rounded-full -left-[41px] top-1 border-4 border-theme-surface ${
              milestone.status === 'Completed' ? 'bg-green-500' : 
              milestone.status === 'Active' ? 'bg-theme-accent' : 'bg-theme-outline/40'
            }`}></div>

            <p className="text-sm font-bold text-theme-accent mb-1">{milestone.date}</p>
            <h3 className="font-serif text-xl text-theme-forest mb-2">{milestone.title}</h3>
            <div className="bg-white p-4 rounded-lg border border-theme-outline/10 shadow-sm inline-block min-w-[250px]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-theme-on-surface/60 uppercase tracking-widest">Status</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                   milestone.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                   milestone.status === 'Active' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                }`}>{milestone.status}</span>
              </div>
              <p className="text-sm text-theme-on-surface/80">{milestone.tasks.filter(t => t.status === 'Completed').length} of {milestone.tasks.length} tasks completed.</p>
            </div>
          </div>
        ))}
        
        <div className="relative">
          <div className="absolute w-4 h-4 rounded-full -left-[41px] top-1 border-4 border-theme-surface bg-theme-forest"></div>
          <p className="text-sm font-bold text-theme-forest mb-1">{project.targetDeadline}</p>
          <h3 className="font-serif text-xl text-theme-forest mb-2">Project Delivery</h3>
          <p className="text-sm text-theme-on-surface/70">Final artifacts to be published to the Library of Memory.</p>
        </div>
      </div>
    </div>
  );
}
