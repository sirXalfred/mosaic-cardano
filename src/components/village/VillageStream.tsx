"use client";
import React from 'react';
import { useGetVillagePosts } from '@/services/posts';
import { PostComposer } from '@/components/post/PostComposer';
import { PostCard } from '@/components/post/PostCard';

export default function VillageStream({ communityId }: { communityId: string }) {
  const { data: posts, isLoading } = useGetVillagePosts(communityId);

  return (
    <div>
      <div className="flex items-end justify-between mb-6 border-b border-theme-outline/30 pb-2">
        <h3 className="font-serif text-2xl font-medium text-theme-forest">The Village Stream</h3>
      </div>

      <PostComposer communityId={communityId} />

      <div className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-theme-surface rounded-xl border border-theme-outline/20"></div>
            <div className="h-32 bg-theme-surface rounded-xl border border-theme-outline/20"></div>
          </div>
        ) : posts && posts.length > 0 ? (
          posts.map((post, index) => (
            <PostCard 
              key={post.id} 
              post={post} 
              communityId={communityId} 
              autoExpandDepth={index < 5 ? 2 : 0} 
            />
          ))
        ) : (
          <div className="py-12 text-center text-theme-on-surface/50 font-sans">
            No posts yet. Start the conversation!
          </div>
        )}
      </div>
    </div>
  );
}
