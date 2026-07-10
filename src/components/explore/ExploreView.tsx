'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon, XIcon } from 'lucide-react';
import { useExploreStore } from '@/store/exploreStore';
import { useGetExploreItems, type ExploreItem } from '@/services/explore';
import { StatePanel } from '@/components/ui/StatePanel';

import ExploreHeader from './ExploreHeader';
import ExploreFiltersPanel from './ExploreFiltersPanel';
import ExploreTabs from './ExploreTabs';
import ExploreCard from './ExploreCard';
import { ROUTES } from '@/lib/routes';
import { Button } from '../ui/button';
import AppPageContainer from '../layout/AppPageContainer';
import { useAuth } from '@/contexts/auth-context';

export default function ExploreView() {
  const router = useRouter();
  const { filters, activeTab, setFilter } = useExploreStore();
  const {userId} = useAuth();
  const isAuthenticated = !!userId;

  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<ExploreItem[]>([]);

  const queryFilters = useMemo(() => ({
    search: filters.query,
    topic: filters.topic,
    location: filters.location,
    visibility: filters.visibility,
    activityLevel: filters.activityLevel,
  }), [filters.activityLevel, filters.location, filters.query, filters.topic, filters.visibility]);

  const { data: page, isLoading, isError, error, refetch, isFetching } = useGetExploreItems(queryFilters, activeTab, offset);

  useEffect(() => {
    setOffset(0);
    setItems([]);
  }, [activeTab, queryFilters]);

  useEffect(() => {
    if (!page) return;
    setItems((current) => (offset === 0 ? page.items : [...current, ...page.items]));
  }, [offset, page]);

  const handleLoadMore = () => {
    if (!page?.meta.hasMore || isFetching) return;
    setOffset(page.meta.nextOffset);
  };

  const getClickOptions = (item: ExploreItem) => {
    let href = '';
    let onClick;

    switch (item.type as string) {
      case 'community': 
        href = ROUTES.VILLAGE.HOME(item.communityId as string);
      break;
      case 'publication':
        href = ROUTES.VILLAGE.PROJECTS(item.communityId as string);
      break;
      case 'collaboration':
        href = ROUTES.VILLAGE.PROJECTS(item.communityId as string);
      break;
      case 'project':
        href = ROUTES.VILLAGE.PROJECT(item.communityId as string, item.id as string);
      break;
      default:
        onClick = () => navigateToDetail(item as unknown as Record<string, unknown>);
      break;
    }
    
    return {
      href,
      onClick
    }
  }
    

  const navigateToDetail = (item: Record<string, unknown>) => {
    switch (item.type as string) {
      default:
      case 'COMMUNITY': 
        router.push(ROUTES.VILLAGE.HOME(item.communityId as string));
      break;
      case 'PUBLICATION':
        router.push(ROUTES.VILLAGE.PROJECTS(item.communityId as string));
      break;
      case 'COLLABORATION':
        router.push(ROUTES.VILLAGE.PROJECTS(item.communityId as string));
      break;
      case 'PROJECT':
        router.push(ROUTES.VILLAGE.PROJECT(item.communityId as string, item.projectId as string));
      break;
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter('query', e.target.value);
  };

  const handleClearSearch = () => {
    setFilter('query', '');
  };

  return (
    <AppPageContainer 
    {...(!isAuthenticated ? {} : {
        title: "Explore",
        description: "Discover communities, projects, and collaborations emerging across the network."
      })}
    >
      {!isAuthenticated && <ExploreHeader />}

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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearSearch}
            >
              <XIcon size={16} />
            </Button>
          )}
        </div>

        {/* Filters Panel Popover Trigger */}
        <ExploreFiltersPanel />
      </div>

      {/* 3. CATEGORY TABS SWITCHER */}
      <ExploreTabs />

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
        {isLoading && items.length === 0 ? (
          <StatePanel
            variant="loading"
            title="Loading explore listings"
            description="We are fetching the latest communities from the registry."
          />
        ) : isError ? (
          <StatePanel
            variant="error"
            title="Could not load explore listings"
            description="Something went wrong while fetching the registry."
            errorMessage={error instanceof Error ? error.message : 'Failed to load explore listings.'}
            onRetry={() => void refetch()}
          />
        ) : items.length === 0 ? (
          <StatePanel
            variant="empty"
            title="No listings found"
            description="Try adjusting your search or filters to surface more communities."
          />
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item, index) => (
                <ExploreCard
                  key={item.id}
                  item={item}
                  index={index}
                  clickOptions={getClickOptions(item)}
                />
              ))}
            </div>

            {page?.meta.hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="flex items-center gap-2 px-6 py-2.5 bg-theme-surface-high border border-theme-outline/25 text-xs font-sans font-bold uppercase tracking-widest rounded-xl hover:border-theme-clay/40 text-theme-on-surface/85 transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isFetching ? 'Loading more' : 'Load More Listings'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppPageContainer>
  );
}
