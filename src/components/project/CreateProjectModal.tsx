"use client";

import React, { useState } from 'react';
import { X, Loader2, Target, Calendar } from 'lucide-react';
import { useCreateProject } from '@/services/projects';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useGetFeaturedVillages } from '@/services/villages';
import { ROUTES } from '@/lib/routes';

export default function CreateProjectModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const params = useParams();
  const currentCommunityId = params.community_id as string;
  const { mutateAsync: createProject, isPending } = useCreateProject();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDeadline, setTargetDeadline] = useState('');

  const [communityId, setCommunityId] = useState(currentCommunityId);
  const {data: villages} = useGetFeaturedVillages();
  const currentVillage = villages?.find((v) => v.id === currentCommunityId);
  const otherVillages = villages?.filter((v) => v.id !== currentCommunityId);


  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      const newProjectId = await createProject({
        communityId,
        title,
        description,
        targetDeadline: targetDeadline || 'TBD'
      });
      onClose();
      router.push(ROUTES.VILLAGE.PROJECT(communityId, newProjectId));
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-theme-forest/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-theme-parchment w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

        <div className="px-6 py-4 border-b border-theme-outline/20 flex justify-between items-center bg-theme-surface-low">
          <h2 className="font-serif text-xl font-medium text-theme-forest">Initialize Project</h2>
          <button onClick={onClose} disabled={isPending} className="text-theme-on-surface/50 hover:text-theme-forest transition-colors cursor-pointer disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* in case no community was identified, dropdown to select which one base don communites the person belongs to else it will be autoselected */}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-theme-forest flex items-center gap-2">
              <Target size={14} className="text-theme-accent" /> Community
            </label>

            <select
              value={communityId || 'none'}
              onChange={(e) => setCommunityId(e.target.value)}
              disabled={isPending || !!currentVillage}
              className="w-full bg-white border border-theme-outline/20 rounded-xl px-4 py-3 text-sm text-theme-forest focus:outline-none focus:ring-2 focus:ring-theme-accent/50 transition-all placeholder:text-theme-on-surface/30"
            >

              <option value="none" disabled> Choose a Community </option>

              {currentVillage && (
                <option value={currentVillage.id}> {currentVillage.name} </option>
              )}

              {otherVillages?.map((village) => (
                <option key={village.id} value={village.id}>
                  {village.name}
                </option>
              ))}
            </select>

          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-theme-forest flex items-center gap-2">
              <Target size={14} className="text-theme-accent" /> Project Title
            </label>
            <input
              type="text"
              placeholder="e.g. Translation Cycle II"
              className="w-full bg-white border border-theme-outline/20 rounded-xl px-4 py-3 text-sm text-theme-forest focus:outline-none focus:ring-2 focus:ring-theme-accent/50 transition-all placeholder:text-theme-on-surface/30"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isPending}
            />
          </div>


          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-theme-forest flex items-center gap-2">
              <Target size={14} className="text-theme-accent" /> The Mandate (Description)
            </label>
            <textarea
              placeholder="What is the mission of this project?"
              className="w-full bg-white border border-theme-outline/20 rounded-xl px-4 py-3 text-sm text-theme-forest focus:outline-none focus:ring-2 focus:ring-theme-accent/50 transition-all placeholder:text-theme-on-surface/30 min-h-[100px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-theme-forest flex items-center gap-2">
              <Calendar size={14} className="text-theme-accent" /> Target Deadline (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Dec 2026"
              className="w-full bg-white border border-theme-outline/20 rounded-xl px-4 py-3 text-sm text-theme-forest focus:outline-none focus:ring-2 focus:ring-theme-accent/50 transition-all placeholder:text-theme-on-surface/30"
              value={targetDeadline}
              onChange={(e) => setTargetDeadline(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-theme-outline/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-theme-on-surface/60 hover:text-theme-forest cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !title || !description}
              className="bg-theme-forest text-theme-parchment px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-theme-forest/90 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
