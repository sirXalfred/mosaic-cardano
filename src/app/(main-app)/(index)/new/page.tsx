"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateVillage } from '@/services/villages';
import { Loader2, ArrowRight, Flame, Globe, Type } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { FormError } from '@/components/ui/form-error';

export default function CreateCommunityPage() {
  const router = useRouter();
  const { mutateAsync: createVillage, isPending, isSuccess } = useCreateVillage();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!name || !description) return;
    
    try {
      const response = await createVillage({
        name,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });

      // We expect the backend to return the created CommunityNode
      const newVillageId = response.id;
      
      router.push(ROUTES.VILLAGE.HOME(newVillageId));

    } catch (err) {
      console.error("Failed to create village:", err);
      const error = err as Error;
      setError(error?.message || "Failed to create village. Please try again.");
    }
  };

  return (
      <div className="flex-1 flex items-center justify-center p-6 pb-24">
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-theme-clay/20 text-theme-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <Flame size={32} />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-theme-forest mb-4">Create a new Village</h1>
            <p className="text-theme-on-surface/70 text-lg max-w-md mx-auto">
              Create a new digital village for your community to gather, archive, and collaborate.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-theme-parchment p-8 rounded-2xl shadow-xl border border-theme-outline/20 space-y-6">
            
            <FormError message={error} />

            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-theme-forest flex items-center gap-2">
                <Globe size={14} className="text-theme-accent" /> Settlement Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. The Weavers Guild"
                className="w-full bg-white border border-theme-outline/20 rounded-xl px-4 py-3 text-theme-forest focus:outline-none focus:ring-2 focus:ring-theme-accent/50 transition-all placeholder:text-theme-on-surface/30"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-theme-forest flex items-center gap-2">
                <Type size={14} className="text-theme-accent" /> The Mandate
              </label>
              <textarea
                id="description"
                placeholder="Describe the purpose and culture of this community..."
                className="w-full bg-white border border-theme-outline/20 rounded-xl px-4 py-3 text-theme-forest focus:outline-none focus:ring-2 focus:ring-theme-accent/50 transition-all placeholder:text-theme-on-surface/30 min-h-[120px] resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tags" className="text-xs font-bold uppercase tracking-widest text-theme-forest flex items-center gap-2">
                Tags <span className="text-[10px] text-theme-on-surface/40 normal-case">(Comma separated)</span>
              </label>
              <input
                id="tags"
                type="text"
                placeholder="e.g. archiving, poetry, technology"
                className="w-full bg-white border border-theme-outline/20 rounded-xl px-4 py-3 text-theme-forest focus:outline-none focus:ring-2 focus:ring-theme-accent/50 transition-all placeholder:text-theme-on-surface/30"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={isPending || isSuccess}
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !name || !description || isSuccess}
              className="w-full bg-theme-forest text-theme-parchment rounded-xl py-4 flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest hover:bg-theme-forest/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-md active:scale-[0.98]"
            >
              {isPending || isSuccess ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Igniting Hearth...
                </>
              ) : (
                <>
                  Establish Settlement <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
    </div>
  );
}
