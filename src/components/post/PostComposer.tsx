"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useCreatePost } from '@/services/posts';
import { useGetAuthState } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useModals } from '@/contexts/modals-context';
import { MODALS } from '@/lib/modals';

interface PostComposerProps {
  communityId: string;
  replyToId?: string;
  isInline?: boolean;
  onSuccessCallback?: () => void;
}

export function PostComposer({ communityId, replyToId, isInline, onSuccessCallback }: PostComposerProps) {
  const [content, setContent] = useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { data: authState } = useGetAuthState();
  const { mutate: createPost, isPending } = useCreatePost(communityId);
  const { openModal } = useModals();


  const user = authState?.user;

  if (!user) {
    return null; // Or a prompt to log in
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPending) return;

    createPost({ content, replyToId }, {
      onSuccess: () => {
        setContent(''); // Reset on success
        
        const hasPostedBefore = localStorage.getItem('mosaic_has_posted');
        if (!hasPostedBefore) {
          localStorage.setItem('mosaic_has_posted', 'true');
          toast.message('Give a feedback on your experience?', {
            action: {
              label: 'Feedback',
              onClick: () => openModal(MODALS.FEEDBACK),
            },
            duration: 10000,
          });
        }
        
        if (onSuccessCallback) onSuccessCallback();
      }
    });
  };

  return (
    <div className={`bg-theme-surface rounded-xl border border-theme-outline/20 p-4 shadow-sm ${isInline ? 'mt-2 mb-2 bg-theme-surface-low' : 'mb-6'}`}>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-theme-clay flex items-center justify-center shrink-0">
          {user.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.name || 'User'} width={40} height={40} className="object-cover w-full h-full" unoptimized />
          ) : (
            <span className="text-sm text-white font-bold">{user.name?.charAt(0) || 'U'}</span>
          )}
        </div>
        
        <div className="flex-1 flex flex-col gap-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isInline ? "Write a reply..." : "Share an insight, artifact, or thought..."}
            className={`w-full bg-transparent border-none outline-none resize-none text-theme-forest placeholder:text-theme-on-surface/40 font-sans ${isInline ? 'min-h-[40px] text-base mt-2' : 'min-h-[60px] text-lg'}`}
            autoFocus={isInline}
          />
          
          <div className="flex justify-between items-center border-t border-theme-outline/10 pt-3">
            <div className="text-xs text-theme-on-surface/40 font-mono">
              {content.length > 0 && `${content.length}/5000`}
            </div>
            
            <Button 
              type="submit" 
              disabled={!content.trim() || isPending}
              className={`rounded-full px-6 bg-theme-forest text-theme-parchment hover:opacity-90 ${isInline ? 'py-1.5 h-8 text-xs' : ''}`}
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : (isInline ? 'Reply' : 'Post')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
