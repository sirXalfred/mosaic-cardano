import React, { useState } from 'react';
import { ProjectDetail } from '@/services/projects';

export default function ProjectDiscussions({ project }: { project: ProjectDetail }) {
  const [newDiscussionInput, setNewDiscussionInput] = useState('');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      <h2 className="font-serif text-2xl mb-8 border-b border-theme-outline/20 pb-4">Internal Discussions</h2>
      
      <div className="bg-theme-parchment p-6 rounded-xl border border-theme-outline/20 mb-8 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-theme-forest text-white flex items-center justify-center text-sm font-bold shrink-0">
          ME
        </div>
        <div className="flex-1">
          <textarea 
            className="w-full bg-transparent border-none focus:ring-0 resize-none h-20 text-sm placeholder:text-theme-on-surface/40"
            placeholder="Share an update, ask a question, or discuss ideas..."
            value={newDiscussionInput}
            onChange={(e) => setNewDiscussionInput(e.target.value)}
          ></textarea>
          <div className="flex justify-end pt-2 border-t border-theme-outline/10">
            <button className="bg-theme-accent text-white px-6 py-2 rounded text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-theme-accent/90">
              Post
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {project.discussions.map(disc => (
          <div key={disc.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-theme-clay text-white flex items-center justify-center text-sm font-bold shrink-0">
              {project.contributors.find(c => c.name === disc.authorName)?.initials || 'U'}
            </div>
            <div className="flex-1 bg-theme-surface-high p-5 rounded-xl border border-theme-outline/10 rounded-tl-none">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-bold text-theme-forest text-sm">{disc.authorName}</span>
                <span className="text-[10px] text-theme-on-surface/50 font-mono">{disc.timestamp}</span>
              </div>
              <p className="text-sm text-theme-on-surface/80 whitespace-pre-wrap">{disc.content}</p>
              <div className="mt-3 pt-3 border-t border-theme-outline/10 flex gap-4">
                <button className="text-[10px] uppercase tracking-widest font-bold text-theme-on-surface/50 hover:text-theme-forest cursor-pointer">Reply</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
