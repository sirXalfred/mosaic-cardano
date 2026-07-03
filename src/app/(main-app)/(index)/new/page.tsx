"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateVillage } from '@/services/villages';
import { Loader2, ArrowRight, Flame, Globe, Type, Image as ImageIcon } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { FormError } from '@/components/ui/form-error';
import { Button } from '@/components/ui/button';
import { useModals } from '@/contexts/modals-context';
import { MODALS } from '@/lib/modals';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { createVillageProfileImage } from '@/lib/create-village-profile-image';
import { toast } from 'sonner';

export default function CreateCommunityPage() {
  const router = useRouter();
  const { mutateAsync: createVillage, isPending, isSuccess } = useCreateVillage();
  const { openModal } = useModals();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [isUploading, setIsUploading] = useState(false);
  const [hasUpload, setHasUpload] = useState(false);

  const generativeUrl = createVillageProfileImage(name);
  const displayedImage = imagePreview || (hasUpload ? generativeUrl : undefined);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!name || !description) return;

    try {
      let finalImageUrl = generativeUrl;
      setIsUploading(true);
      setHasUpload(true);

      if (imageFile) {
        finalImageUrl = await uploadToCloudinary(imageFile);
      }

      const response = await createVillage({
        name,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        profileImageUrl: finalImageUrl
      });

      // We expect the backend to return the created CommunityNode
      const newVillageId = response.id;

      toast.message('Give a feedback on your experience?', {
        action: {
          label: 'Feedback',
          onClick: () => openModal(MODALS.FEEDBACK),
        },
        duration: 10000,
      });

      router.push(ROUTES.VILLAGE.HOME(newVillageId));

    } catch (err) {
      console.error("Failed to create village:", err);
      const errorMessage = (err as Error).message || "Failed to create village. Please try again.";
      if (errorMessage.includes('PLAN_LIMIT')) {
        setError(errorMessage);
        setTimeout(() => openModal(MODALS.PRICING), 1500);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsUploading(false);
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

          <div className="flex flex-col items-center gap-4 pb-4 border-b border-theme-outline/10">
            <label
              htmlFor="avatar-upload"
              className="relative cursor-pointer group rounded-full overflow-hidden w-24 h-24 border-2 border-theme-outline/20 bg-theme-surface-raised flex items-center justify-center hover:border-theme-accent transition-colors shadow-sm"
            >
              {displayedImage ? (
                <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayedImage}
                  alt="Village Avatar Preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                </>
              ) : (
                <ImageIcon className="w-8 h-8 text-theme-on-surface/30" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon className="text-white w-6 h-6" />
              </div>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={isPending || isUploading}
            />
            <div className="text-center">
              <p className="text-sm font-bold text-theme-forest">Profile Image</p>
              <p className="text-xs text-theme-on-surface/50">Upload a custom image or use the generated avatar.</p>
              {imagePreview && (
                <button 
                  type="button" 
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }} 
                  className="text-xs text-red-500 hover:text-red-600 font-semibold mt-2 transition-colors"
                >
                  Remove Image
                </button>
              )}
            </div>
          </div>

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

          <Button
            type="submit"
            disabled={isPending || isUploading || !name || !description || isSuccess}
          >
            {isPending || isUploading || isSuccess ? (
              <>
                <Loader2 size={18} className="animate-spin" /> {isUploading ? 'Uploading Image...' : 'Igniting Hearth...'}
              </>
            ) : (
              <>
                Establish Settlement <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
