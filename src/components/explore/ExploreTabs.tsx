import React from 'react';
import { useExploreStore } from '@/store/exploreStore';
import { motion } from 'framer-motion';
// import { ExploreItem } from '@/services/explore';

// interface ExploreTabsProps {
//   allItems: ExploreItem[];
//   isLoading: boolean;
// }

export default function ExploreTabs() {
  const { activeTab, setActiveTab } = useExploreStore();

  const tabOptions = [
    { id: 'all', label: 'All Listings' },
    { id: 'community', label: 'Communities' },
  ];

  return (
    <div className="w-full border-b border-theme-outline/20 overflow-x-auto scrollbar-none">
      <div className="flex space-x-6 pb-2 min-w-max px-1">
        {tabOptions.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-serif text-sm md:text-base font-medium pb-2 transition-all cursor-pointer relative flex items-center gap-2 ${
                isActive ? 'text-theme-forest font-semibold' : 'text-theme-on-surface/50 hover:text-theme-forest/75'
              }`}
            >
              {tab.label}

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
