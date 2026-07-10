"use client";
import React, { useState } from 'react';
import { useGetVillagePosts } from '@/services/posts';
import { PostComposer } from '@/components/post/PostComposer';
import { PostCard } from '@/components/post/PostCard';
import { cn } from '@/lib/utils';
import { useGetVillageDetails } from '@/services/villages';

type TabType = 'Latest' | 'Top' | 'Announcements' | 'Pieces';

export default function VillageStream({ communityId }: { communityId: string }) {
  const [activeTab, setActiveTab] = useState<TabType>('Latest');
  const { data: posts, isLoading } = useGetVillagePosts(communityId, activeTab);
  const { data: village } = useGetVillageDetails(communityId);
  const isCreator = village?.isCreator;

  return (
    <div>
      <div className="mb-6 border-b border-theme-outline/30 pb-2"></div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-theme-outline/20 mb-6">
        {(['Latest', 'Top', 'Announcements', 'Pieces'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-2 font-sans text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer",
              activeTab === tab 
                ? "text-theme-accent border-b-2 border-theme-accent" 
                : "text-theme-on-surface/50 hover:text-theme-forest border-b-2 border-transparent"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

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
            {isCreator ? (
              <p className="font-bold text-theme-forest mb-2">Make your first announcement</p>
            ) : (
              <p className="font-bold text-theme-forest mb-2">Make your first post</p>
            )}
            <p>No posts found for this filter. Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Sticky Post Composer at Bottom */}
      <div className="sticky bottom-6 z-40 mt-8">
        <div className="shadow-2xl rounded-xl ring-1 ring-theme-outline/20">
          <PostComposer 
            communityId={communityId} 
            initialContent={!isLoading && posts?.length === 0 && !isCreator ? "Hiii, it's great being here in this community" : undefined}
          />
        </div>
      </div>
    </div>
  );
}
