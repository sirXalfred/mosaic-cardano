"use client";
import React from 'react';
import Link from 'next/link';
import { getActionItemLabel, useGetActionItems } from '@/services/home';
import { Mail, Edit3, ArrowRight } from 'lucide-react';
import { StatePanel } from '@/components/ui/StatePanel';

export default function ActionItems({hideIfEmpty}: {hideIfEmpty: boolean}) {
  const { data: items, isLoading, isError, error, refetch } = useGetActionItems();
  if (isLoading) {
    return <StatePanel variant="loading" title="Loading attention items" description="We are checking for invitations, mentions, and project updates." className="mb-12" />;
  }

  if (isError) {
    return (
      <StatePanel
        variant="error"
        title="Could not load attention items"
        description="Something went wrong while fetching the items that need your attention."
        errorMessage={error instanceof Error ? error.message : 'Failed to load attention items.'}
        onRetry={() => void refetch()}
        className="mb-12"
      />
    );
  }

  if (!items || items.length === 0) {
    if (hideIfEmpty){
      return <></>
    }

    return (
      <StatePanel
        variant="empty"
        title="Nothing needs your attention"
        description="When invitations, mentions, or project updates arrive, they will show up here."
        className="mb-12"
      />
    );
  }

  return (
    <div className="mb-12">
      <h2 className="font-serif text-xl font-medium text-theme-forest mb-4 flex items-center gap-2">
        Needs Your Attention
        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-sans tracking-widest">{items.length}</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <Link href={item.link} key={item.id}>
            <div className="h-full bg-[#FFFBF5] border-2 border-theme-outline/20 p-5 rounded-xl hover:border-theme-accent transition-colors flex items-start justify-between group cursor-pointer shadow-sm">
              <div className="flex items-start gap-4">
                <div className="mt-1 text-theme-accent bg-theme-accent/10 p-2 rounded-lg">
                  {item.type === 'INVITE' ? <Mail size={20} /> : <Edit3 size={20} />}
                </div>
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-theme-on-surface/60 mb-1">{getActionItemLabel(item.type)}</p>
                  <h3 className="font-bold text-theme-forest text-sm mb-1">{item.title}</h3>
                  <p className="text-theme-on-surface/80 text-sm">{item.description}</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-theme-outline group-hover:text-theme-accent transition-colors mt-2" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
