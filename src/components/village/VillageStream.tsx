"use client";
import React from 'react';
import { useGetVillageStream } from '@/services/villages';
import { MessageSquare, History } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export default function VillageStream({ communityId }: { communityId: string }) {
  const { data: stream, isLoading } = useGetVillageStream();

  return (
    <div>
      <div className="flex items-end justify-between mb-6 border-b border-theme-outline/30 pb-2">
        <h3 className="font-serif text-2xl font-medium text-theme-forest">The Village Stream</h3>
        <Link href={ROUTES.VILLAGE.FEED(communityId)} className="font-sans text-[10px] uppercase tracking-widest text-theme-accent hover:opacity-80">
          Join Conversation
        </Link>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-theme-surface rounded-xl border border-theme-outline/20"></div>
            <div className="h-24 bg-theme-surface rounded-xl border border-theme-outline/20"></div>
          </div>
        ) : (
          stream?.map((item) => (
            <Link href={ROUTES.VILLAGE.FEED(communityId)} key={item.id} className="flex gap-4 group cursor-pointer">
              <div className="shrink-0 w-10 h-10 rounded-full bg-theme-clay flex items-center justify-center text-xs font-bold text-white group-hover:bg-theme-accent transition-colors">
                {item.author.charAt(0)}
              </div>
              <div className="flex-1 bg-theme-surface px-6 py-4 rounded-xl border border-theme-outline/20 group-hover:border-theme-accent transition-colors">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-bold text-theme-forest">{item.author}</span>
                  <span className="font-mono text-[12px] text-theme-on-surface/70">
                    {item.timeAgo} • {item.topic}
                  </span>
                </div>
                <p className="text-theme-on-surface/80 leading-relaxed text-sm">{item.content}</p>
                <div className="mt-4 flex gap-6">
                  <span className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-theme-on-surface/70">
                    <MessageSquare size={14} /> {item.contributions} Contributions
                  </span>
                  {item.lastUpdated && (
                    <span className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-theme-on-surface/70">
                      <History size={14} /> Last updated {item.lastUpdated}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
