'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon, CompassIcon, XIcon } from 'lucide-react';
import { useExploreStore } from '@/store/exploreStore';
import { useGetExploreItems } from '@/services/explore';

import ExploreHeader from './ExploreHeader';
import ExploreFiltersPanel from './ExploreFiltersPanel';
import ExploreTabs from './ExploreTabs';
import ExploreCard from './ExploreCard';
import { ROUTES } from '@/lib/routes';

export default function ExploreView() {
  const router = useRouter();
  const { filters, activeTab, setFilter, resetFilters } = useExploreStore();

  // Pagination states
  const [visibleCount, setVisibleCount] = useState(4);
  const [isMockLoadingMore, setIsMockLoadingMore] = useState(false);

  // Fetch filtered items using React Query hook
  const { data: allItems = [], isLoading } = useGetExploreItems({
    search: filters.query,
    topic: filters.topic,
    location: filters.location,
    visibility: filters.visibility,
    activityLevel: filters.activityLevel,
  });

  // Reset pagination count when activeTab or filters change
  useEffect(() => {
    setVisibleCount(4);
    setIsMockLoadingMore(false);
  }, [activeTab, filters.query, filters.topic, filters.location, filters.visibility, filters.activityLevel]);

  // Filter items based on active tab
  const displayedItems = allItems.filter(
    (item) => activeTab === 'all' || item.type === activeTab
  );

  // Slice displayed items based on pagination visibleCount
  const paginatedItems = displayedItems.slice(0, visibleCount);

  // Check if there are more items to load
  const hasMore = displayedItems.length > visibleCount;

  const handleLoadMore = () => {
    if (isMockLoadingMore) return;
    setIsMockLoadingMore(true);

    // Simulate network delay for loading more page items
    setTimeout(() => {
      setVisibleCount((prev) => prev + 4);
      setIsMockLoadingMore(false);
    }, 850);
  };

  const navigateToDetail = (communityId: string, itemId: string) => {
    router.push(ROUTES.VILLAGE.PROJECT(communityId, itemId));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter('query', e.target.value);
  };

  const handleClearSearch = () => {
    setFilter('query', '');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <ExploreHeader />

      {/* 2. SEARCH & FILTER HUB */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-theme-surface-low/30 p-4 rounded-2xl border border-theme-outline/15 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-3 text-theme-on-surface/40" size={16} />
          <input
            type="text"
            value={filters.query}
            onChange={handleSearchChange}
            placeholder="Search by community name, title, description or tags..."
            className="w-full pl-10 pr-10 py-2.5 bg-theme-surface-high border border-theme-outline/20 rounded-xl focus:outline-none focus:border-theme-clay/55 text-sm text-theme-on-surface font-sans shadow-sm"
          />
          {filters.query && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-3 text-theme-on-surface/40 hover:text-theme-on-surface cursor-pointer"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>

        {/* Filters Panel Popover Trigger */}
        <ExploreFiltersPanel />
      </div>

      {/* 3. CATEGORY TABS SWITCHER */}
      <ExploreTabs allItems={allItems} isLoading={isLoading} />

      {/* 4. ACTIVE BADGES FOR POPULAR SEARCHES */}
      {Object.entries(filters).some(([key, val]) => key !== 'query' && val !== '') && (
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="text-theme-on-surface/50 font-sans text-[10px] uppercase tracking-wider font-bold">Active Filters:</span>
          {Object.entries(filters).map(([key, value]) => {
            if (!value || key === 'query') return null;
            return (
              <span
                key={key}
                className="bg-theme-clay/10 border border-theme-clay/30 text-theme-accent px-2.5 py-1 rounded-full flex items-center gap-1.5 font-sans"
              >
                <span className="opacity-50 text-[10px] uppercase font-bold tracking-wider">{key}:</span>
                <span className="font-semibold">{value}</span>
                <button
                  onClick={() => setFilter(key as keyof typeof filters, '')}
                  className="hover:text-theme-forest transition-colors font-bold cursor-pointer"
                >
                  <XIcon size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* 5. CONTENT GRID LIST */}
      <div className="min-h-[400px] space-y-8">
        {isLoading ? (
          /* Pulse skeleton screen cards list */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-44 bg-theme-surface-low border border-theme-outline/15 rounded-xl"
              ></div>
            ))}
          </div>
        ) : displayedItems.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedItems.map((item, index) => (
                <ExploreCard
                  key={item.id}
                  item={item}
                  index={index}
                  onClick={() => navigateToDetail(item.communityId, item.id)}
                />
              ))}

              {/* Show exactly ONE blank pulsing skeleton loader card while loading more */}
              {isMockLoadingMore && (
                <div className="h-[190px] w-full bg-theme-surface-low/60 border border-theme-outline/15 rounded-xl animate-pulse flex flex-col justify-between p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-16 bg-theme-outline/15 rounded"></div>
                      <div className="h-4 w-12 bg-theme-outline/15 rounded"></div>
                    </div>
                    <div className="h-6 w-2/3 bg-theme-outline/15 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-theme-outline/15 rounded"></div>
                      <div className="h-3 w-5/6 bg-theme-outline/15 rounded"></div>
                    </div>
                  </div>
                  <div className="h-8 w-full bg-theme-outline/5 border-t border-theme-outline/10 pt-4 flex justify-between items-center">
                    <div className="h-3 w-1/3 bg-theme-outline/15 rounded"></div>
                    <div className="h-4 w-12 bg-theme-outline/15 rounded"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination Load More trigger row */}
            {hasMore && !isMockLoadingMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  className="flex items-center gap-2 px-6 py-2.5 bg-theme-surface-high border border-theme-outline/25 text-xs font-sans font-bold uppercase tracking-widest rounded-xl hover:border-theme-clay/40 text-theme-on-surface/85 transition-all shadow-sm cursor-pointer"
                >
                  Load More Listings
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Custom empty listing state */
          <div className="text-center py-20 bg-theme-surface-high border border-theme-outline/20 rounded-2xl p-8 max-w-lg mx-auto shadow-md">
            <CompassIcon className="mx-auto text-theme-on-surface/20 mb-4" size={56} />
            <h3 className="font-serif text-2xl text-theme-forest mb-2">No Registry Items Found</h3>
            <p className="text-sm text-theme-on-surface/70 font-sans leading-relaxed mb-6">
              There are no villages, projects or documents currently cataloged matching those specific tags or location parameters.
            </p>
            <button
              onClick={resetFilters}
              className="bg-theme-forest text-theme-parchment px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-md cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
