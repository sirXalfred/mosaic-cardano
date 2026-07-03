"use client";
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Users } from 'lucide-react';
import Image from 'next/image';
import { TexturedCard } from '../ui/textured-card';
import { useGetFeaturedVillages } from '@/services/villages';

export const CommunityShowcaseSection = ({ itemVariants, containerVariants }: { itemVariants: Variants, containerVariants: Variants }) => {
  const { data: featuredVillages, isLoading: isLoadingVillages } = useGetFeaturedVillages();

  return (
    <motion.section 
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="py-40 px-6 relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={itemVariants} className="mb-16">
          <span className="font-sans text-xs uppercase tracking-widest text-theme-accent font-bold mb-4 block">Active Communities</span>
          <h2 className="font-serif text-4xl md:text-6xl text-theme-forest">Built by the people.</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[400px]">
          {isLoadingVillages ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-theme-surface-high p-10 rounded-2xl border border-theme-outline/20 animate-pulse h-full"></div>
              ))}
            </>
          ) : (
            featuredVillages?.slice(0, 3).map((village, i) => (
              <motion.div key={village.id} variants={itemVariants} className="group cursor-pointer h-full">
                <TexturedCard 
                  patternId={((i % 5) + 1) as 1 | 2 | 3 | 4 | 5} 
                  patternColor="text-theme-forest"
                  patternOpacity="opacity-50 group-hover:opacity-70 transition-opacity duration-500"
                  className="bg-theme-surface-high p-10 rounded-2xl border border-theme-outline/20 hover:border-theme-clay/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="w-16 h-16 mb-6 rounded-2xl overflow-hidden relative border border-theme-outline/20 group-hover:scale-110 transition-transform duration-500 origin-left">
                      <Image 
                        src={village.profileImageUrl || '/assets/images/village-placeholder.png'} 
                        alt={village.name} 
                        fill 
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <h3 className="font-serif text-2xl mb-4 group-hover:text-theme-clay transition-colors">{village.name}</h3>
                    <p className="font-sans text-sm text-theme-on-surface/70 leading-relaxed">{village.desc}</p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-theme-outline/10 flex items-center justify-between text-xs font-bold uppercase tracking-widest font-sans text-theme-on-surface/50">
                    <span className="flex items-center gap-2"><Users size={14} /> {village.members}</span>
                    <span className="text-theme-accent group-hover:translate-x-1 transition-transform">Visit</span>
                  </div>
                </TexturedCard>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.section>
  );
};
