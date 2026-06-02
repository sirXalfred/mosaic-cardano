import React, { useState } from 'react';
import { SlidersHorizontal, MapPin, X, Loader2 } from 'lucide-react';
import { useExploreStore } from '@/store/exploreStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ExploreFiltersPanel() {
  const { filters, setFilter, resetFilters } = useExploreStore();
  const [isOpen, setIsOpen] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [locMessage, setLocMessage] = useState<string | null>(null);

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

  // Visibility list
  const visibilities = ['Public Common', 'Gated Circle', 'Shared Space'];

  // Activity levels
  const activityLevels = ['Active Hearth', 'Emerging', 'Quiet Archive'];

  // Popular countries list
  const popularCountries = ['Nigeria', 'Kenya', 'Senegal', 'Ghana', 'Remote'];

  // Handle current location detection
  const handleDetectLocation = () => {
    setLocLoading(true);
    setLocMessage('Detecting...');

    if (!navigator.geolocation) {
      setLocMessage('Location services unavailable');
      setLocLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        
        setLocMessage(`Detected latitude ${latitude.toFixed(2)}`);
        setLocLoading(false);
        setTimeout(() => setLocMessage(null), 2000);
      },
      () => {
        setLocMessage('Could not detect your location');
        setLocLoading(false);
        setTimeout(() => setLocMessage(null), 2000);
      },
      { timeout: 5000 }
    );
  };

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

          {/* Location Filter */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-theme-on-surface/60">Location</h4>
              <div className="relative flex items-center gap-2">
                {locMessage && (
                  <span className="text-[9px] font-mono text-theme-accent bg-theme-clay/10 px-2 py-0.5 rounded">
                    {locMessage}
                  </span>
                )}
                <button
                  onClick={handleDetectLocation}
                  disabled={locLoading}
                  className="p-1 rounded bg-theme-surface-low border border-theme-outline/20 hover:border-theme-clay/40 text-theme-on-surface/70 hover:text-theme-accent relative group cursor-pointer"
                  title="Use current location"
                >
                  {locLoading ? (
                    <Loader2 size={13} className="animate-spin text-theme-accent" />
                  ) : (
                    <MapPin size={13} />
                  )}
                  
                  {/* Tooltip on Hover */}
                  <span className="absolute bottom-full right-0 mb-1 scale-0 transition-all rounded bg-theme-forest p-1.5 text-[8px] uppercase tracking-wider font-bold text-theme-parchment group-hover:scale-100 whitespace-nowrap z-50">
                    Current Location
                  </span>
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilter('location', e.target.value)}
                placeholder="Search by country, state or region..."
                className="w-full text-xs px-3 py-2 bg-theme-surface-low border border-theme-outline/20 rounded-lg focus:outline-none focus:border-theme-clay/60 text-theme-on-surface font-sans"
              />
              {filters.location && (
                <button
                  onClick={() => setFilter('location', '')}
                  className="absolute right-2.5 top-2.5 text-theme-on-surface/40 hover:text-theme-on-surface cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Popular country presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {popularCountries.map((country) => (
                <button
                  key={country}
                  onClick={() => setFilter('location', filters.location === country ? '' : country)}
                  className={`text-[10px] font-sans px-2 py-1 rounded border transition-all cursor-pointer ${
                    filters.location === country
                      ? 'bg-theme-clay/20 border-theme-clay text-theme-accent font-bold'
                      : 'border-theme-outline/10 text-theme-on-surface/60 hover:border-theme-clay/25 bg-theme-surface-low/10'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility Filter */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-theme-on-surface/60">Visibility</h4>
            <div className="flex gap-2">
              {visibilities.map((vis) => (
                <button
                  key={vis}
                  onClick={() => setFilter('visibility', filters.visibility === vis ? '' : vis)}
                  className={`flex-1 text-[10px] font-sans text-center py-2 rounded-md border transition-all cursor-pointer ${
                    filters.visibility === vis
                      ? 'bg-theme-clay/20 border-theme-clay text-theme-accent font-bold'
                      : 'border-theme-outline/20 text-theme-on-surface/85 hover:border-theme-clay/35 bg-theme-surface-low/30'
                  }`}
                >
                  {vis}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Level Filter */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-theme-on-surface/60">Activity Level</h4>
            <div className="flex gap-2">
              {activityLevels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilter('activityLevel', filters.activityLevel === lvl ? '' : lvl)}
                  className={`flex-1 text-[10px] font-sans text-center py-2 rounded-md border transition-all cursor-pointer ${
                    filters.activityLevel === lvl
                      ? 'bg-theme-clay/20 border-theme-clay text-theme-accent font-bold'
                      : 'border-theme-outline/20 text-theme-on-surface/85 hover:border-theme-clay/35 bg-theme-surface-low/30'
                  }`}
                >
                  {lvl}
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
