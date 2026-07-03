import React from 'react';
import { ShieldCheckIcon, CalendarDaysIcon, Edit2Icon } from 'lucide-react';
import { type UserProfile } from '@/services/users';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { truncateWalletAddress } from '@/lib/utils';
import { InteractiveCopy } from '@/components/ui/interactive-copy';
export const ProfileHeader = ({ profile, isLoading }: { profile?: UserProfile, isLoading: boolean }) => {
  const { userId } = useAuth();

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

  const isOwnProfile = userId === profile.id;

  return (
    <div className="space-y-8 relative">
      {isOwnProfile && (
        <Link 
          href="/settings?tab=profile"
          className="absolute top-0 right-0 flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-theme-surface-high hover:bg-theme-surface px-4 py-2 rounded-lg border border-theme-outline/20 transition-colors"
        >
          <Edit2Icon size={14} /> Edit Profile
        </Link>
      )}

      <div className="flex flex-col md:flex-row md:items-end gap-6">

        <div className="w-24 h-24 rounded-full bg-theme-forest text-theme-parchment flex items-center justify-center text-4xl font-serif font-bold shadow-xl border-4 border-theme-parchment shrink-0 relative">
          {profile.displayName.charAt(0).toUpperCase()}
          {
            profile.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-theme-clay text-theme-parchment rounded-full p-1 border-2 border-theme-parchment" title="Cryptographically Verified Identity">
                <ShieldCheckIcon size={16} />
              </div>
            )
          }
        </div>

        <div className="space-y-1 flex-1">
          <h1 className="font-serif text-5xl text-theme-forest">{profile.displayName}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-theme-on-surface/60 text-sm font-sans pt-2">
            <span className="font-bold">{profile.handle}</span>
            <span className="flex items-center gap-1"><CalendarDaysIcon size={14} /> Joined {profile.joinedDate}</span>
            {profile.walletAddress && (
              <span className="px-2 py-0.5 rounded bg-theme-surface-high border border-theme-outline/20 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                {truncateWalletAddress(profile.walletAddress)}
                <InteractiveCopy textToCopy={profile.walletAddress} />
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-xl font-serif leading-relaxed text-theme-on-surface/80 max-w-3xl whitespace-pre-wrap">
        {profile.bio}
      </p>
    </div>
  );
};
