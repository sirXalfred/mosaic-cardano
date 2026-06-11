"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { TexturedCard } from '../ui/textured-card';
import { useGetFeaturedArtifacts } from '@/services/villages';

export const LivingLibrarySection = () => {
  const { data: featuredArtifacts, isLoading: isLoadingArtifacts } = useGetFeaturedArtifacts();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!featuredArtifacts || featuredArtifacts.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredArtifacts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [featuredArtifacts, isPaused]);

  return (
    <div 
      className="max-w-7xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="text-center mb-20">
        <h2 className="font-serif text-5xl md:text-6xl text-theme-forest mb-6">Featured Pieces</h2>
        <p className="font-sans text-lg text-theme-on-surface/70 max-w-2xl mx-auto">
          Explore the knowledge, work, and discussions actively preserved by our communities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[400px]">
        
        {/* Left Side: Animated Featured Card */}
        <div className="relative aspect-square">
          {isLoadingArtifacts ? (
            <div className="size-full bg-theme-surface-high animate-pulse rounded-3xl border border-theme-outline/20"></div>
          ) : featuredArtifacts && featuredArtifacts.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="size-full"
              >
                <TexturedCard 
                  patternId={((activeIndex % 5) + 1) as 1 | 2 | 3 | 4 | 5} 
                  patternColor="text-theme-clay"
                  patternOpacity="opacity-50 group-hover:opacity-70 transition-opacity duration-500"
                  className="bg-theme-surface-high border border-theme-outline/20 rounded-3xl p-12 flex flex-col justify-center relative overflow-hidden group shadow-2xl size-full cursor-pointer hover:-translate-y-2 hover:border-theme-clay/50 transition-all"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-theme-clay/5 rounded-full blur-3xl group-hover:bg-theme-clay/10 transition-colors duration-700"></div>
                  <BookOpen size={48} className="text-theme-clay mb-8 opacity-50" />
                  <h3 className="font-serif text-3xl mb-4 z-10">{featuredArtifacts[activeIndex].title}</h3>
                  <p className="font-sans text-theme-on-surface/80 leading-relaxed mb-8 z-10 line-clamp-4">
                    {featuredArtifacts[activeIndex].description}
                  </p>
                  <div className="z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-theme-accent mt-auto">
                    Read Artifact <ArrowRight size={14} />
                  </div>
                </TexturedCard>
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>

        {/* Right Side: List of Artifacts */}
        <div className="space-y-4 min-h-[300px]">
          {isLoadingArtifacts ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-theme-surface-high animate-pulse rounded-xl border border-theme-outline/20"></div>
              ))}
            </>
          ) : (
            featuredArtifacts?.map((artifact, idx) => (
              <div 
                key={artifact.id} 
                onClick={() => setActiveIndex(idx)}
                className={`group cursor-pointer p-4 rounded-xl transition-all flex items-center justify-between border ${activeIndex === idx ? 'bg-theme-surface-high border-theme-clay/50 shadow-md translate-x-2' : 'border-transparent hover:border-theme-outline/20 hover:bg-theme-surface'}`}
              >
                <div>
                  <h4 className={`font-serif text-lg mb-1 transition-colors ${activeIndex === idx ? 'text-theme-clay' : 'group-hover:text-theme-clay'}`}>{artifact.title}</h4>
                  <p className="text-[10px] font-sans text-theme-on-surface/50 uppercase tracking-widest">{artifact.community}</p>
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded border ${activeIndex === idx ? 'bg-theme-clay/10 border-theme-clay/30 text-theme-clay' : 'bg-theme-surface-high border-theme-outline/10 text-theme-on-surface/70'}`}>
                  {artifact.type}
                </span>
              </div>
            ))
          )}
          <Button variant="ghost" className="uppercase tracking-widest font-bold text-xs text-theme-accent ml-2 mt-4">
            Explore Library
          </Button>
        </div>

      </div>
    </div>
  );
};
