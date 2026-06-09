"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetPostThread } from '@/services/posts';
import VillageLayout from '@/components/village/VillageLayout';
import { PostCard } from '@/components/post/PostCard';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export default function PostPage() {
  const params = useParams();
  const postId = params.postId as string;
  const { data: thread, isLoading } = useGetPostThread(postId);

  const communityId = thread?.[0]?.communityId;

  if (isLoading) {
    return (
      <VillageLayout communityId={undefined}>
         <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-theme-accent" size={32} /></div>
      </VillageLayout>
    );
  }

  if (!thread || thread.length === 0 || !communityId) {
    return (
      <VillageLayout communityId={undefined}>
        <div className="flex items-center justify-center h-full text-theme-on-surface/50 font-sans">
          Post not found
        </div>
      </VillageLayout>
    );
  }

  return (
    <VillageLayout communityId={communityId}>
      <div className="max-w-3xl mx-auto py-8 px-4 w-full">
        <Link 
          href={ROUTES.VILLAGE.FEED(communityId)} 
          className="inline-flex items-center gap-2 text-sm font-bold text-theme-on-surface/50 hover:text-theme-accent transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Village
        </Link>
        <div className="flex flex-col relative mt-2">
          {(() => {
            const target = thread[thread.length - 1];
            let content = (
              <PostCard 
                key={target.id}
                post={target} 
                communityId={communityId} 
                autoExpandDepth={2} 
              />
            );

            for (let i = thread.length - 2; i >= 0; i--) {
              const ancestor = thread[i];
              const child = thread[i + 1];
              content = (
                <PostCard 
                  key={ancestor.id}
                  post={ancestor} 
                  communityId={communityId}
                  focusedChildId={child.id}
                >
                  {content}
                </PostCard>
              );
            }

            return content;
          })()}
        </div>
      </div>
    </VillageLayout>
  );
}
