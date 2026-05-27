import React from 'react';
import { ShieldCheckIcon, CalendarDaysIcon } from 'lucide-react';
import { UserProfile } from '@/services/users';

export const ProfileHeader = ({ profile, isLoading }: { profile?: UserProfile, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-theme-surface-high animate-pulse border border-theme-outline/10" />
          <div className="space-y-3 flex-1">
            <div className="h-10 w-48 bg-theme-surface-high animate-pulse rounded" />
            <div className="h-4 w-32 bg-theme-surface-high animate-pulse rounded" />
          </div>
        </div>
        <div className="h-20 w-full bg-theme-surface-high animate-pulse rounded" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end gap-6">

        <div className="w-24 h-24 rounded-full bg-theme-forest text-theme-parchment flex items-center justify-center text-4xl font-serif font-bold shadow-xl border-4 border-theme-parchment shrink-0 relative">
          {profile.displayName.charAt(0)}
          {
            profile.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-theme-clay text-theme-parchment rounded-full p-1 border-2 border-theme-parchment" title="Cryptographically Verified Identity">
                <ShieldCheckIcon size={16} />
              </div>
            )
          }
        </div>

        <div className="space-y-1">
          <h1 className="font-serif text-5xl text-theme-forest">{profile.displayName}</h1>
          <div className="flex flex-wrap items-center gap-4 text-theme-on-surface/60 text-sm font-sans">
            <span className="font-bold">{profile.handle}</span>
            <span className="flex items-center gap-1"><CalendarDaysIcon size={14} /> Joined {profile.joinedDate}</span>
            <span className="px-2 py-0.5 rounded bg-theme-surface-high border border-theme-outline/20 font-mono text-xs uppercase tracking-widest">{profile.walletAddress}</span>
          </div>
        </div>
      </div>

      <p className="text-xl font-serif leading-relaxed text-theme-on-surface/80 max-w-3xl">
        {profile.bio}
      </p>
    </div>
  );
};
