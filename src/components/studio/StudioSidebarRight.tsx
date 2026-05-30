import React from 'react';
import { MessageSquare } from 'lucide-react';
import { DocumentComment } from '@/services/projects';

export default function StudioSidebarRight({ 
  comments 
}: {
  comments: DocumentComment[] | undefined;
}) {
  return (
    <aside className="w-80 border-l border-theme-outline/20 bg-theme-surface-low flex flex-col hidden lg:flex">
      <div className="flex border-b border-theme-outline/20">
        <div className="flex-1 py-4 flex justify-center border-b-2 border-theme-accent text-theme-accent">
          <MessageSquare size={18} />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="font-sans text-[10px] uppercase tracking-widest font-bold text-theme-on-surface/50 mb-4">Inline Comments</h3>
            {comments?.map(comment => (
              <div key={comment.id} className={`p-4 rounded-xl border text-sm ${comment.resolved ? 'bg-theme-surface opacity-60 border-theme-outline/10' : 'bg-white border-theme-clay/30 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-theme-forest">{comment.authorName}</span>
                  <span className="text-[10px] text-theme-on-surface/50">{comment.timestamp}</span>
                </div>
                <p className="text-theme-on-surface/80 mb-3">{comment.content}</p>
                <div className="flex gap-3 pt-3 border-t border-theme-outline/10">
                  {!comment.resolved && <button className="text-[10px] font-bold uppercase tracking-widest text-theme-accent hover:underline cursor-pointer">Resolve</button>}
                  <button className="text-[10px] font-bold uppercase tracking-widest text-theme-on-surface/50 hover:text-theme-forest cursor-pointer">Reply</button>
                </div>
              </div>
            ))}
          </div>
      </div>
    </aside>
  );
}
