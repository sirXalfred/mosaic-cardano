"use client";
import React from 'react';
import { useGetVillageTimeline } from '@/services/villages';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export default function LibraryOfMemory() {
  const { data: timeline, isLoading } = useGetVillageTimeline();
  const params = useParams();
  const communityId = params.community_id as string;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 border-b border-theme-outline/30 pb-2">
        <h3 className="font-serif text-xl font-medium">Library of Memory</h3>
        <Link href={ROUTES.VILLAGE.LIBRARY(communityId)} className="text-theme-accent font-sans text-[10px] uppercase tracking-widest flex items-center gap-1 hover:opacity-80 transition-opacity">
          View Archive <ChevronRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-6 pl-6">
          <div className="h-16 bg-theme-surface-low rounded border border-theme-outline/20"></div>
          <div className="h-16 bg-theme-surface-low rounded border border-theme-outline/20"></div>
        </div>
      ) : (
        <div className="relative pl-6 space-y-8 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-theme-outline/50">
          {timeline?.map((item) => (
            <div key={item.id} className="relative">
              <span className={`absolute -left-7 top-1.5 w-2 h-2 rounded-full ${item.dotColor} ring-4 ring-theme-surface`}></span>
              <p className="font-serif text-sm text-theme-forest mb-1 italic">{item.date}</p>
              <h4 className="font-bold text-sm text-theme-forest">{item.title}</h4>
              <p className="text-xs text-theme-on-surface/70 leading-relaxed mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
