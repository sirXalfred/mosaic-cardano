import React from 'react';
import Link from 'next/link';
import { Award, Code2, Tent, HeartHandshake, FolderKanban } from 'lucide-react';
import { Reputation } from '@/services/users';
import { ROUTES } from '@/lib/routes';

export const ReputationSidebar = ({ reputation, isLoading }: { reputation?: Reputation, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="space-y-12">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-32 bg-theme-surface-high animate-pulse rounded" />
            <div className="h-24 w-full bg-theme-surface-high animate-pulse rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (!reputation) return null;

  return (
    <div className="space-y-12 bg-theme-surface-high/50 p-6 md:p-8 rounded-3xl border border-theme-outline/10 h-full">

      {/* Badges Section */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-theme-on-surface/50">
          <Award size={16} /> Verified Badges
        </h4>
        <div className="flex flex-wrap gap-3">
          {reputation.badges.map((badge) => (
            <div key={badge.id} className="flex items-center gap-2 bg-theme-surface border border-theme-outline/20 px-3 py-2 rounded-lg shadow-sm hover:border-theme-clay/30 transition-colors cursor-help" title={badge.name}>
              <span className="text-lg">{badge.icon}</span>
              <span className="font-sans text-sm font-medium text-theme-forest">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Section */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-theme-on-surface/50">
          <Code2 size={16} /> Skills
        </h4>
        <div className="flex flex-wrap gap-2">
          {reputation.skills.map((skill: string, i: number) => (
            <span key={i} className="px-3 py-1 bg-theme-surface border border-theme-outline/10 text-theme-forest text-xs rounded-full font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Communities Section */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-theme-on-surface/50">
          <Tent size={16} /> Communities
        </h4>
        <div className="space-y-3">
          {reputation.communities.map((comm) => (
            <Link key={comm.id} href={ROUTES.VILLAGE.HOME(comm.id)} className="flex items-center justify-between p-3 bg-theme-surface border border-theme-outline/10 hover:border-theme-clay/30 hover:-translate-y-0.5 rounded-xl transition-all shadow-sm">
              <span className="font-serif font-bold text-theme-forest">{comm.name}</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-theme-clay">{comm.role}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Projects Section */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-theme-on-surface/50">
          <FolderKanban size={16} /> Projects
        </h4>
        <div className="flex flex-wrap gap-2">
          {reputation.projects.map((proj: string, i: number) => (
            <span key={i} className="px-3 py-1.5 bg-theme-surface border border-theme-outline/10 text-theme-forest text-sm font-serif rounded-lg">
              {proj}
            </span>
          ))}
        </div>
      </div>

      {/* Support History Section */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-theme-on-surface/50">
          <HeartHandshake size={16} /> Support History
        </h4>
        <div className="space-y-3">
          {reputation.supportHistory.map((support) => (
            <div key={support.id} className="p-4 bg-theme-surface border border-theme-outline/10 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-600/10 px-2 py-0.5 rounded">{support.type}</span>
                <span className="font-mono text-xs font-bold text-theme-forest">{support.amount}</span>
              </div>
              <p className="font-serif text-sm text-theme-forest">{support.reason}</p>
              <p className="font-sans text-xs text-theme-on-surface/50">From: {support.source}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
