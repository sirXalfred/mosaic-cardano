"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useParams } from 'next/navigation';
import {
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Users,
  LogOut,
  TentIcon,
  XIcon,
  PenToolIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useGetVillageDetails } from '@/services/villages';
import AppSidebar from '../layout/AppSidebar';
import { ROUTES } from '@/lib/routes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/contexts/sidebar-context';

const SidebarTooltip = ({ children, label, isCollapsed }: { children: React.ReactNode; label: string; isCollapsed: boolean }) => {
  if (!isCollapsed) return <>{children}</>;
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={16} className="bg-theme-accent text-theme-parchment text-[10px] uppercase tracking-widest border-none font-bold z-50">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function VillageSidebar({ communityId: propCommunityId }: { communityId?: string }) {
  const pathname = usePathname();
  const params = useParams();
  const communityId = propCommunityId || (params.community_id as string);
  const { data: village, isLoaded, isError } = useGetVillageDetails(communityId);

  const { isMobileOpen, closeMobileSidebar } = useSidebar();
  const [isCollapsedStored, setIsCollapsedStored] = useState(false);
  const isCollapsed = isCollapsedStored && !isMobileOpen;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedState = localStorage.getItem('mosaic_village_sidebar_collapsed');
    if (storedState) {
      setIsCollapsedStored(JSON.parse(storedState));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsedStored;
    setIsCollapsedStored(newState);
    localStorage.setItem('mosaic_village_sidebar_collapsed', JSON.stringify(newState));
  };

  if (!mounted) return null; // Avoid hydration mismatch

  const navItems = [
    { name: 'Profile', path: ROUTES.VILLAGE.PROFILE(communityId), icon: TentIcon, exact: true },
    { name: 'Feed', path: ROUTES.VILLAGE.FEED(communityId), icon: MessageSquare },
    { name: 'Library', path: ROUTES.VILLAGE.LIBRARY(communityId), icon: BookOpen },
    { name: 'Members', path: ROUTES.VILLAGE.MEMBERS(communityId), icon: Users },
  ];

  if (isError || (isLoaded && !village?.isMember)) {
    return <AppSidebar />
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-dvh overflow-auto scrollbar-hide flex flex-col py-8 bg-theme-parchment border-r border-theme-outline/20 z-50 transition-all duration-300",
          "w-full px-4",
          isCollapsed ? "md:w-20 md:px-2" : "md:w-64",
          // Mobile specific classes for drawer
          "-translate-x-full md:translate-x-0",
          isMobileOpen && "translate-x-0 shadow-2xl"
        )}
      >
        <div className={cn("mb-10 flex items-center justify-between", isCollapsed ? "justify-center" : "")}>
          {!isCollapsed && (
            <div className='flex items-center gap-3 overflow-hidden'>
              {isLoaded ? (
                <>
                  <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center overflow-hidden border border-theme-outline/20 bg-theme-surface-high relative">
                    {village?.profileImageUrl ? (
                      <Image
                        src={village.profileImageUrl}
                        alt={village.name || 'Village'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-theme-clay flex items-center justify-center font-serif text-white font-bold">
                        {village?.name?.charAt(0) || 'V'}
                      </div>
                    )}
                  </div>
                  <h1 className="font-serif text-lg font-medium text-theme-forest leading-tight truncate">
                    {village?.name}
                  </h1>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-theme-outline/10 animate-pulse"></div>
                  <div className="w-32 h-6 rounded bg-theme-outline/10 animate-pulse"></div>
                </div>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={isMobileOpen ? closeMobileSidebar : toggleSidebar}
            className="text-theme-forest opacity-50 hover:opacity-100 transition-opacity shrink-0"
          >
            {isMobileOpen ? <XIcon size={20} /> : (isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />)}
          </Button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.path : pathname.startsWith(item.path);
            return (
              <SidebarTooltip key={item.name} label={item.name} isCollapsed={isCollapsed}>
                <Link
                  href={item.path}
                  className={cn(
                    "flex items-center py-3 rounded-lg transition-colors duration-200 relative group",
                    isCollapsed ? "justify-center px-0" : "px-4 gap-3",
                    isActive
                      ? "text-theme-accent font-bold bg-theme-forest/5"
                      : "text-theme-on-surface opacity-60 hover:opacity-100 hover:text-theme-accent"
                  )}
                >
                  <item.icon size={20} />
                  {!isCollapsed && <span className="font-sans text-[12px] uppercase tracking-widest">{item.name}</span>}
                  {isActive && !isCollapsed && (
                    <span className="absolute right-0 w-1 h-4 bg-theme-accent rounded-full" />
                  )}
                </Link>
              </SidebarTooltip>
            );
          })}


          <div className="mt-6 pt-4 border-t border-theme-outline/10">
            <SidebarTooltip key="my workspace" label="My Workspace" isCollapsed={isCollapsed}>
              <Link
                href={ROUTES.WORKSPACE}
                className={cn(
                  "flex items-center py-3 rounded-lg transition-colors duration-200 relative group",
                  isCollapsed ? "justify-center px-0" : "px-4 gap-3",
                  "text-theme-on-surface opacity-60 hover:opacity-100 hover:text-theme-accent"
                )}
              >
                <PenToolIcon size={20} />
                {!isCollapsed && <span className="font-sans text-[12px] uppercase tracking-widest">My Workspace</span>}
              </Link>
            </SidebarTooltip>
          </div>
      </nav>

        <div className={cn("mt-auto border-t border-theme-outline/20 pt-6", isCollapsed ? "px-2" : "px-4")}>
          <div className="space-y-4">
            <SidebarTooltip label="Community Settings" isCollapsed={isCollapsed}>
              <Link href={ROUTES.VILLAGE.SETTINGS(communityId)} className={cn("flex items-center text-sm opacity-60 hover:opacity-100 hover:text-theme-accent transition-colors", isCollapsed ? "justify-center" : "gap-3")}>
                <Settings size={18} />
                {!isCollapsed && <span>Community Settings</span>}
              </Link>
            </SidebarTooltip>

            <SidebarTooltip label="Exit to Mosaic" isCollapsed={isCollapsed}>
              <Link href="/home" className={cn("flex items-center text-sm text-theme-clay opacity-80 hover:opacity-100 transition-colors mt-4 pt-4 border-t border-theme-outline/10", isCollapsed ? "justify-center" : "gap-3")}>
                <LogOut size={18} className="rotate-180" />
                {!isCollapsed && <span>Exit to Mosaic</span>}
              </Link>
            </SidebarTooltip>
          </div>
        </div>
      </aside>
    </>
  );
}
