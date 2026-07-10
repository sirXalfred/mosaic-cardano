import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useExploreStore } from '@/store/exploreStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ExploreFiltersPanel() {
  const { filters, setFilter, resetFilters } = useExploreStore();
  const [isOpen, setIsOpen] = useState(false);

  // Topics list
  const topics = [
    'Literary Arts',
    'Visual Arts',
    'Music & Audio',
    'Exploration',
    'Knowledge',
    'Technology',
    'Ecology',
  ];

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, val]) => key !== 'query' && val !== ''
  ).length;

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-sans font-bold uppercase tracking-widest transition-all cursor-pointer ${
              isOpen || activeFiltersCount > 0
                ? 'bg-theme-clay/10 border-theme-clay text-theme-accent shadow-md'
                : 'bg-theme-surface-high border-theme-outline/25 text-theme-on-surface/80 hover:border-theme-clay/40'
            }`}
            id="toggle-filters-button"
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-theme-accent text-theme-parchment rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        {/* Portaled dropdown content alignment ensures viewport correctness */}
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-80 md:w-96 p-4 space-y-4"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b border-theme-outline/10">
            <h3 className="font-serif text-base text-theme-forest font-medium">Refine Registry</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-theme-on-surface/50 hover:text-theme-on-surface cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Topic Filter */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-theme-on-surface/60">Topic</h4>
            <div className="flex flex-wrap gap-1.5">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter('topic', filters.topic === t ? '' : t)}
                  className={`text-[10px] font-sans px-2.5 py-1.5 rounded-md border transition-all cursor-pointer ${
                    filters.topic === t
                      ? 'bg-theme-clay/20 border-theme-clay text-theme-accent font-bold'
                      : 'border-theme-outline/20 text-theme-on-surface/85 hover:border-theme-clay/35 bg-theme-surface-low/30'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeFiltersCount > 0 && (
        <button
          onClick={resetFilters}
          className="text-xs font-sans text-theme-on-surface/60 hover:text-theme-accent font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
