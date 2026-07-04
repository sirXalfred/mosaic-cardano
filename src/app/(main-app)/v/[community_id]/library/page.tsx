"use client";
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetVillageLibrary } from '@/services/villages';
import { StatePanel } from '@/components/ui/StatePanel';
import { Loader2 } from 'lucide-react';
import { PostCard } from '@/components/post/PostCard';
import AppPageContainer from '@/components/layout/AppPageContainer';


const FILTERS = ['All', 'Pieces', 'Publications', 'Projects'];

export default function VillageLibraryPage() {
  return (
    <VillageLibraryPageContent />
  )
}

function VillageLibraryPageContent() {
  const params = useParams();
  const communityId = params.community_id as string;
  const [activeFilter, setActiveFilter] = useState('All');
  const displayActive = activeFilter === 'All' ? 'item' : activeFilter;

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetVillageLibrary(communityId, activeFilter);

  const items = data?.pages.flatMap(page => page.items) || [];

  return (
    <AppPageContainer title="Village Library" description="The permanent archive of everything created and published by this community">

      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
              activeFilter === filter
                ? 'bg-theme-forest text-theme-parchment'
                : 'bg-theme-surface border border-theme-outline/20 text-theme-on-surface/70 hover:bg-theme-surface-high'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {isLoading ? (
        <StatePanel variant="loading" title="Loading Library" description="Fetching library materials..." />
      ) : isError ? (
        <StatePanel variant="error" title="Failed to Load" description="An error occurred while fetching the library." onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <StatePanel variant="empty" title="Empty Library" description={`No ${displayActive.toLowerCase()} found in the library yet.`} />
      ) : (
        <>
          <div className="flex flex-col gap-6">
            {items.map((item, i) => (
              <PostCard key={`${item.id}-${i}`} post={item} communityId={communityId} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="flex items-center gap-2 bg-theme-surface border border-theme-outline/20 text-theme-forest px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-theme-surface-high transition-colors disabled:opacity-50"
              >
                {isFetchingNextPage ? <Loader2 size={16} className="animate-spin" /> : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </AppPageContainer>
  );
}
