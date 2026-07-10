"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useCreatePost } from '@/services/posts';
import { useGetAuthState } from '@/services/auth';
import { useGetVillageMembers } from '@/services/villages';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useModals } from '@/contexts/modals-context';
import { MODALS } from '@/lib/modals';

interface PostComposerProps {
  communityId: string;
  replyToId?: string;
  isInline?: boolean;
  initialContent?: string;
  onSuccessCallback?: () => void;
}

export function PostComposer({ communityId, replyToId, isInline, initialContent, onSuccessCallback }: PostComposerProps) {
  const [content, setContent] = useState(initialContent || '');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionCursorIndex, setMentionCursorIndex] = useState<number | null>(null);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: authState } = useGetAuthState();
  const { mutate: createPost, isPending } = useCreatePost(communityId);
  const { openModal } = useModals();
  const { data: members } = useGetVillageMembers(communityId);

  const user = authState?.user;

  // Filter members based on mentionQuery
  const filteredMembers = React.useMemo(() => {
    if (!mentionQuery || !members) return [];
    const query = mentionQuery.toLowerCase().replace('@', '');
    return members.filter(m => 
      (m.username && m.username.toLowerCase().includes(query)) || 
      (m.displayName && m.displayName.toLowerCase().includes(query))
    ).slice(0, 5);
  }, [mentionQuery, members]);

  // Utility to transform host URLs to mosaic:// protocol
  const transformLinks = (text: string) => {
    if (typeof window === 'undefined') return text;
    const hostUrl = window.location.origin;
    // Regex to match the host URL and any path after it
    const regex = new RegExp(hostUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(/\\S*)?', 'g');
    return text.replace(regex, (match, path) => {
      // If path is empty or just '/', return mosaic://, else mosaic:/path (avoiding double slash if path starts with /)
      if (!path || path === '/') return 'mosaic://';
      return `mosaic:/${path}`;
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Check for mentions logic
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newContent.slice(0, cursorPosition);
    const words = textBeforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1];

    if (currentWord.startsWith('@')) {
      setMentionQuery(currentWord);
      setMentionCursorIndex(cursorPosition - currentWord.length);
      setSelectedMentionIndex(0);
    } else {
      setMentionQuery(null);
      setMentionCursorIndex(null);
    }
  };

  const insertMention = (username: string) => {
    if (mentionCursorIndex === null || !mentionQuery) return;
    
    const beforeMention = content.slice(0, mentionCursorIndex);
    const afterMention = content.slice(mentionCursorIndex + mentionQuery.length);
    
    const newContent = `${beforeMention}@${username} ${afterMention}`;
    setContent(newContent);
    setMentionQuery(null);
    setMentionCursorIndex(null);
    
    // Focus and restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = beforeMention.length + username.length + 2; // +2 for @ and space
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => (prev + 1) % filteredMembers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => (prev - 1 + filteredMembers.length) % filteredMembers.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const member = filteredMembers[selectedMentionIndex];
        if (member.username) {
          insertMention(member.username);
        }
      } else if (e.key === 'Escape') {
        setMentionQuery(null);
      }
    }
  };

  if (!user) {
    return null; 
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPending) return;

    const transformedContent = transformLinks(content);

    createPost({ content: transformedContent, replyToId }, {
      onSuccess: () => {
        setContent(''); 
        setMentionQuery(null);
        
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
    <div className={`bg-card rounded-xl border border-border/20 p-4 shadow-sm ${isInline ? 'mt-2 mb-2 bg-secondary' : 'mb-6'}`}>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-accent flex items-center justify-center shrink-0">
          {user.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.name || 'User'} width={40} height={40} className="object-cover w-full h-full" unoptimized />
          ) : (
            <span className="text-sm text-background font-bold">{user.name?.charAt(0) || 'U'}</span>
          )}
        </div>
        
        <div className="flex-1 flex flex-col gap-3 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={isInline ? "Write a reply..." : "Share an insight, artifact, or thought..."}
            className={`w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground font-sans ${isInline ? 'min-h-[40px] text-base mt-2' : 'min-h-[60px] text-lg'}`}
            autoFocus={isInline}
          />
          
          {mentionQuery !== null && filteredMembers.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50">
              {filteredMembers.map((member, idx) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => member.username && insertMention(member.username)}
                  className={`w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-muted transition-colors ${idx === selectedMentionIndex ? 'bg-muted' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-accent flex items-center justify-center shrink-0">
                    {member.avatarUrl ? (
                      <Image src={member.avatarUrl} alt={member.displayName || 'User'} width={32} height={32} className="object-cover w-full h-full" unoptimized />
                    ) : (
                      <span className="text-xs text-background font-bold">{member.displayName?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{member.displayName}</span>
                    <span className="text-xs text-muted-foreground">@{member.username || 'unknown'}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center border-t border-border/10 pt-3">
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
