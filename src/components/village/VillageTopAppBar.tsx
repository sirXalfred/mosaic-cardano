"use client";
import React, { useEffect, useState } from 'react';
import { Bell, Plus, Search, LogOut, Settings, User, Share, Loader2 } from 'lucide-react';
import { useParams, usePathname } from 'next/navigation';
import { useGetVillageDetails, useShareInvite } from '@/services/villages';
import { useGetAuthState, useGetVillageMembership } from '@/services/auth';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/lib/routes';
import { toast } from 'sonner';

export default function VillageTopAppBar() {
  const params = useParams();
  const pathname = usePathname();
  const communityId = params.community_id as string;
  const { data: village, isLoading } = useGetVillageDetails(communityId);
  const { data: authState } = useGetAuthState();
  const { data: membership } = useGetVillageMembership(communityId);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { shareInvite, isGeneratingInvite, isError, error } = useShareInvite(communityId);

  const isMember = authState?.isAuthenticated && membership?.isMember;

  // Determine context actions based on route
  const getContextActions = () => {
    if (!isMember) return null; // Don't show context actions to non-members

    if (pathname.includes('/library')) {
      return (
        <Link href={`/v/${communityId}/create`} className="flex items-center gap-2 bg-theme-forest text-theme-parchment px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-opacity shadow-sm">
          <Plus size={16} /> Submit Artifact
        </Link>
      );
    }
    if (pathname.includes('/governance')) {
      return (
        <Link href={`/v/${communityId}/create`} className="flex items-center gap-2 bg-theme-forest text-theme-parchment px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-opacity shadow-sm">
          <Plus size={16} /> New Proposal
        </Link>
      );
    }
    return (
      <Link href={ROUTES.STUDIO} className="flex items-center gap-2 bg-theme-forest text-theme-parchment px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-opacity shadow-sm">
        <Plus size={16} /> Create
      </Link>
    );
  };

  const handleShareInvite = async () => {
    const inviteUrl = await shareInvite();
    if (inviteUrl) {
      toast.success('Invite link copied to clipboard');
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(error);
    }
  }, [isError, error]);

  return (
    <header className="flex justify-between items-center w-full px-6 md:px-12 lg:px-24 py-8 h-12 sticky top-0 z-40 bg-theme-parchment/90 backdrop-blur-md border-b border-theme-outline/30">
      <div className="flex items-center gap-6">
        {!isMember && (
          <Link href="/home" className='flex items-center gap-2 mr-4 hover:opacity-80 transition-opacity'>
            <div className="w-6 h-6 rounded-md bg-theme-forest flex items-center justify-center text-theme-parchment font-serif font-bold text-xs">m</div>
            <h1 className="font-serif text-lg font-medium text-theme-forest leading-tight hidden sm:block">mosaic</h1>
          </Link>
        )}

        {isLoading ? (
          <div className="h-6 w-48 bg-theme-outline/20 animate-pulse rounded"></div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-theme-surface-high px-4 py-1.5 rounded-full border border-theme-outline/20">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="font-sans text-[10px] uppercase tracking-widest text-theme-forest">
                {village?.memberCount || 0} Scribes Online
              </span>
            </div>
            {!isMember && (
              <button
                className="text-theme-accent font-sans text-[10px] uppercase tracking-widest font-bold hover:text-theme-forest transition-colors"
              >
                Join Village
              </button>
            )}
            {isMember && (
              <span className="text-theme-forest/60 font-sans text-[10px] uppercase tracking-widest font-bold">
                Member
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 relative">
          {isSearchOpen ? (
            <div className="flex items-center bg-theme-surface border border-theme-outline/30 rounded-lg px-3 py-1.5 animate-in fade-in slide-in-from-right-4">
              <Search size={16} className="text-theme-on-surface/50 mr-2" />
              <input
                type="text"
                placeholder="Search village..."
                className="bg-transparent border-none outline-none text-sm w-48"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
            </div>
          ) : (
            <Search
              size={20}
              className="text-theme-on-surface/50 cursor-pointer hover:text-theme-forest transition-colors"
              onClick={() => setIsSearchOpen(true)}
            />
          )}
        </div>
        {isMember && (
          <button 
            onClick={handleShareInvite}
            disabled={isGeneratingInvite}
            className="flex items-center gap-2 text-theme-forest px-3 py-1.5 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-theme-surface transition-colors border border-theme-outline/20 disabled:opacity-50"
          >
            {isGeneratingInvite ? <Loader2 size={16} className="animate-spin" /> : <Share size={16} />}
            Invite
          </button>
        )}
        {getContextActions()}
        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-theme-outline/20">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative cursor-pointer hover:text-theme-forest transition-colors">
                <Bell size={20} className="text-theme-on-surface/70" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-theme-accent rounded-full border-2 border-theme-parchment"></span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2 bg-theme-parchment border-theme-outline/20 shadow-xl">
              <DropdownMenuLabel className="font-serif text-theme-forest">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-theme-outline/10" />
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-theme-surface rounded-md focus:bg-theme-surface">
                <p className="text-sm font-medium text-theme-forest">New Proposal Created</p>
                <p className="text-xs text-theme-on-surface/70">Amina Diallo proposed a new archival method.</p>
                <p className="text-[10px] text-theme-on-surface/40 mt-1 uppercase font-sans tracking-widest">2 hours ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-theme-surface rounded-md focus:bg-theme-surface">
                <p className="text-sm font-medium text-theme-forest">Treasury Request Approved</p>
                <p className="text-xs text-theme-on-surface/70">450 SCR was distributed for Mali Site Prep.</p>
                <p className="text-[10px] text-theme-on-surface/40 mt-1 uppercase font-sans tracking-widest">Yesterday</p>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-theme-outline/10" />
              <DropdownMenuItem className="justify-center text-xs text-theme-accent font-bold uppercase tracking-widest cursor-pointer hover:bg-theme-surface focus:bg-theme-surface">
                View All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-8 h-8 rounded-full bg-theme-outline/30 overflow-hidden flex items-center justify-center font-bold text-xs text-theme-forest shadow-sm cursor-pointer hover:scale-105 transition-transform ring-2 ring-transparent hover:ring-theme-accent/20">
                DA
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 bg-theme-parchment border-theme-outline/20 shadow-xl">
              <DropdownMenuLabel className="font-serif text-theme-forest">My Passport</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-theme-outline/10" />
              <DropdownMenuItem className="cursor-pointer hover:bg-theme-surface focus:bg-theme-surface p-0">
                <Link href="/u/david-artisan" className="flex gap-2 items-center w-full px-2 py-1.5">
                  <User size={16} /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-theme-surface focus:bg-theme-surface flex gap-2 items-center">
                <Settings size={16} /> Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-theme-outline/10" />
              <DropdownMenuItem className="cursor-pointer hover:bg-theme-surface focus:bg-theme-surface flex gap-2 items-center text-red-700/80 hover:text-red-700 focus:text-red-700">
                <LogOut size={16} /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}
