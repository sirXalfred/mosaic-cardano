import React, { useState } from 'react';
import { ProjectDetail } from '@/services/projects';
import { CheckCircle, Clock } from 'lucide-react';

export default function ProjectTasks({ project }: { project: ProjectDetail }) {
  const [newTaskInput, setNewTaskInput] = useState('');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      <div className="flex justify-between items-end mb-8 border-b border-theme-outline/20 pb-4">
        <h2 className="font-serif text-2xl text-theme-forest">Milestones & Needs</h2>
        <button className="bg-theme-forest text-theme-parchment px-4 py-2 rounded text-xs font-sans uppercase tracking-widest font-bold hover:bg-theme-forest/90 cursor-pointer">
          Add Milestone
        </button>
      </div>
      
      <div className="space-y-8">
        {project.milestones.map(milestone => (
          <div key={milestone.id} className={`p-6 rounded-xl border ${milestone.status === 'Active' ? 'bg-theme-parchment border-theme-clay/40 shadow-sm' : 'bg-theme-surface-high border-theme-outline/20 opacity-80'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-serif text-xl text-theme-forest mb-1">{milestone.title}</h3>
                <p className="text-xs text-theme-on-surface/60 flex items-center gap-1">
                  <Clock size={12} /> Target: {milestone.date}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest ${
                milestone.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                milestone.status === 'Active' ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-600'
              }`}>
                {milestone.status}
              </span>
            </div>
            
            <div className="space-y-3">
              {milestone.tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded border border-theme-outline/10">
                  <div className="flex items-center gap-3">
                    <button className={`w-5 h-5 rounded flex items-center justify-center border transition-colors cursor-pointer ${task.status === 'Completed' ? 'bg-theme-forest border-theme-forest text-white' : 'border-theme-outline hover:border-theme-forest'}`}>
                      {task.status === 'Completed' && <CheckCircle size={14} />}
                    </button>
                    <span className={`text-sm ${task.status === 'Completed' ? 'line-through text-theme-on-surface/40' : 'text-theme-forest'}`}>
                      {task.title}
                    </span>
                  </div>
                  {task.status === 'Unassigned' ? (
                    <button className="text-[10px] uppercase tracking-widest text-theme-accent font-bold hover:bg-theme-accent/10 px-2 py-1 rounded cursor-pointer transition-colors">
                      Claim Task
                    </button>
                  ) : task.assigneeId ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-theme-on-surface/60">Assignee:</span>
                      <div className="w-6 h-6 rounded-full bg-theme-clay text-white flex items-center justify-center text-[10px] font-bold" title="Assignee">
                        {project.contributors.find(c => c.id === task.assigneeId)?.initials || 'A'}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
              
              {milestone.status === 'Active' && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-theme-outline/10">
                  <input 
                    type="text" 
                    placeholder="Add a new task to this milestone..." 
                    className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder:text-theme-on-surface/40"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                  />
                  <button className="text-xs font-bold text-theme-accent uppercase tracking-widest cursor-pointer">Add</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
