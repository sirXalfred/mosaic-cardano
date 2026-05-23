import React from 'react';
import Link from 'next/link';
import { GitMergeIcon, FileTextIcon, CheckCircle2Icon } from 'lucide-react';
import type { Contribution } from '../../services/users';

export const ContributionRecord = ({ contributions, isLoading }: { contributions?: Contribution[], isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-theme-surface-high animate-pulse rounded mb-8" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 w-full bg-theme-surface-high animate-pulse rounded-xl border border-theme-outline/10" />
        ))}
      </div>
    );
  }

  if (!contributions || contributions.length === 0) return null;

  const getIcon = (action: string) => {
    switch(action) {
      case 'Drafted Artifact': return <FileTextIcon size={18} className="text-theme-clay" />;
      case 'Merged Pull Request': return <GitMergeIcon size={18} className="text-emerald-600" />;
      case 'Peer Review': return <CheckCircle2Icon size={18} className="text-blue-600" />;
      default: return <FileTextIcon size={18} className="text-theme-on-surface/40" />;
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="font-serif text-3xl text-theme-forest border-b border-theme-outline/10 pb-4">Contribution Record</h3>
      
      <div className="relative border-l border-theme-outline/20 ml-4 space-y-10 py-2">
        {contributions.map((item) => (
          <div key={item.id} className="relative pl-8">
            {/* Timeline Dot */}
            <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-theme-parchment border border-theme-outline/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-theme-clay" />
            </div>

            <div className="bg-theme-surface-high border border-theme-outline/10 rounded-xl p-5 hover:border-theme-outline/30 transition-colors shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {getIcon(item.action)}
                  <span className="font-bold text-sm uppercase tracking-widest text-theme-forest">{item.action}</span>
                  <span className="text-theme-on-surface/40 text-sm">on</span>
                  <Link href={`/artifact/${item.id}`} className="font-serif font-bold text-theme-forest hover:text-theme-clay hover:underline decoration-theme-clay/30 transition-all">{item.target}</Link>
                </div>
                <span className="text-xs font-mono text-theme-on-surface/50 uppercase tracking-widest">{item.date}</span>
              </div>
              
              <p className="text-theme-on-surface/70 text-sm leading-relaxed mb-4">
                {item.description}
              </p>

              <div className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-theme-surface rounded border border-theme-outline/10 text-theme-on-surface/60 inline-block">
                {item.community}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
