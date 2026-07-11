import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ExploreHeader() {
  return (
    <div className="relative p-8 md:p-12 bg-theme-surface-high border border-theme-outline/20 rounded-3xl overflow-hidden mb-8">
      <div className="absolute inset-0 bg-theme-forest/5 pointer-events-none rounded-3xl" />
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 w-full max-w-4xl">
        <div className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-theme-surface-high border border-theme-outline/20 rounded-full">
            <Sparkles size={12} className="text-theme-accent" />
            <span className="text-[10px] uppercase font-sans tracking-widest font-bold text-theme-on-surface/70">
              The Global Archive
            </span>
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-theme-forest leading-tight">
            Mosaic Library
          </h1>
          
          <p className="font-sans text-theme-on-surface/80 max-w-lg leading-relaxed text-sm md:text-base">
            Discover communities, artifacts, and collaborative projects emerging across the network.
          </p>
        </div>
      </div>
    </div>
  );
}
