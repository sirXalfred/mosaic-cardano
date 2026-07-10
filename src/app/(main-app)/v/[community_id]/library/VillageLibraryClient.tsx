"use client";
import React, { useState } from 'react';
import { useGetVillageLibrary } from '@/services/villages';
import { StatePanel } from '@/components/ui/StatePanel';
import { Loader2, MoveRight } from 'lucide-react';
import { PieceCard } from '@/components/piece/PieceCard';
import { PieceDetails } from '@/types/mosaic';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

const FILTERS = ['All', 'Pieces', 'Publications', 'Projects'];

export default function VillageLibraryClient({
  communityId,
  initialData,
}: {
  communityId: string;
  initialData: unknown;
}) {
  const [activeFilter, setActiveFilter] = useState('All');
  const displayActive = activeFilter === 'All' ? 'items' : activeFilter;

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetVillageLibrary(communityId, activeFilter, initialData);

  const items = data?.pages.flatMap(page => page.items) || [];

  return (
    <>
      <div className="flex justify-between items-center bg-theme-surface-low rounded-xl p-4 border border-theme-outline/20">
        <p className="text-sm text-theme-on-surface/70">
          Looking for a piece that has not been published yet?
        </p>
        <Button variant="link" size="none" asChild className="text-theme-accent font-bold group">
          <Link href={ROUTES.WORKSPACE}>Visit Workspace <MoveRight className='group-hover:translate-x-2 transition-transform' /> </Link>
        </Button>
      </div>

      <div className="sticky top-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide z-10 bg-theme-parchment py-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 cursor-pointer rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
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
        <StatePanel 
          variant="empty" 
          title="No Items Found" 
          description={`There are no published ${displayActive} in this community yet.`}
          hasAction
          actionLabel="Create a Piece"
          onTriggerAction={() => {}}
        />
      ) : (
        <>
          <div className="flex flex-col gap-6 mt-4">
            {items.map((item, i) => (
              <PieceCard key={`${item.id}-${i}`} piece={item as unknown as PieceDetails} />
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
    </>
  );
}
