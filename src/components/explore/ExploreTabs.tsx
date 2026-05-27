import React from 'react';
import { useExploreStore } from '@/store/exploreStore';
import { motion } from 'framer-motion';
import { ExploreItem } from '@/services/explore';

interface ExploreTabsProps {
  allItems: ExploreItem[];
  isLoading: boolean;
}

export default function ExploreTabs({ allItems, isLoading }: ExploreTabsProps) {
  const { activeTab, setActiveTab } = useExploreStore();

  const tabOptions = [
    { id: 'all', label: 'All Listings' },
    { id: 'collaboration', label: 'Collaborations' },
    { id: 'publication', label: 'Publications' },
    { id: 'community', label: 'Communities' },
    { id: 'project', label: 'Open Projects' },
    { id: 'residency', label: 'Residencies' },
    { id: 'collection', label: 'Collections' },
    { id: 'funded', label: 'Recently Funded' },
  ];

  // Calculate counts dynamically from filtered results or full dataset
  const getCount = (tabId: string) => {
    if (isLoading) return '...';
    if (tabId === 'all') return allItems.length;
    return allItems.filter((item) => item.type === tabId).length;
  };

  return (
    <div className="w-full border-b border-theme-outline/20 overflow-x-auto scrollbar-none">
      <div className="flex space-x-6 pb-2 min-w-max px-1">
        {tabOptions.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = getCount(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-serif text-sm md:text-base font-medium pb-2 transition-all cursor-pointer relative flex items-center gap-2 ${
                isActive ? 'text-theme-forest font-semibold' : 'text-theme-on-surface/50 hover:text-theme-forest/75'
              }`}
            >
              {tab.label}
              
              {/* Count Bubble */}
              {count !== 0 && (
                <span className="font-mono text-[9px] font-bold bg-theme-surface-high border border-theme-outline/15 px-1.5 py-0.5 rounded-full text-theme-on-surface/60">
                  {count}
                </span>
              )}

              {/* Animated active indicator */}
              {isActive && (
                <motion.span
                  layoutId="activeTabUnderlineExplore"
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-theme-clay"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
