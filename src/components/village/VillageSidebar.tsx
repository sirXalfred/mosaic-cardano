"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Users,
  LogOut,
  Scale,
  LandmarkIcon,
  PiggyBankIcon,
  SquareIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useGetVillageDetails } from '@/services/villages';
import AppSidebar from '../layout/AppSidebar';
import { ROUTES } from '@/lib/routes';

export default function VillageSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const communityId = params.community_id as string;
  const { data: village, isLoaded } = useGetVillageDetails(communityId);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedState = localStorage.getItem('mosaic_village_sidebar_collapsed');
    if (storedState) {
      setIsCollapsed(JSON.parse(storedState));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('mosaic_village_sidebar_collapsed', JSON.stringify(newState));
  };

  if (!mounted) return null; // Avoid hydration mismatch

  const navItems = [
    { name: 'Profile', path: ROUTES.VILLAGE.HOME(communityId), icon: SquareIcon, exact: true },
    { name: 'Town Square', path: ROUTES.VILLAGE.TOWNSQUARE(communityId), icon: LandmarkIcon },
    { name: 'Feed', path: ROUTES.VILLAGE.FEED(communityId), icon: MessageSquare },
    { name: 'Library', path: ROUTES.VILLAGE.LIBRARY(communityId), icon: BookOpen },
    { name: 'Treasury', path: ROUTES.VILLAGE.TREASURY(communityId), icon: PiggyBankIcon },
    { name: 'Governance', path: ROUTES.VILLAGE.GOVERNANCE(communityId), icon: Scale },
    { name: 'Members', path: ROUTES.VILLAGE.MEMBERS(communityId), icon: Users },
  ];

  if (isLoaded && !village?.isMember) {
    return <AppSidebar />
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-dvh overflow-auto scrollbar-hide flex flex-col py-8 bg-theme-parchment border-r border-theme-outline/20 z-50 transition-all duration-300",
        isCollapsed ? "w-20 px-2" : "w-64 px-4"
      )}
    >
      <div className={cn("mb-10 flex items-center justify-between", isCollapsed ? "px-2 justify-center" : "px-4")}>
        {!isCollapsed && (
          <div className='flex items-center gap-3 overflow-hidden'>
            <div className="w-8 h-8 rounded bg-theme-clay shrink-0 flex items-center justify-center font-serif text-white font-bold">
              {village?.name.charAt(0) || 'V'}
            </div>
            <h1 className="font-serif text-lg font-medium text-theme-forest leading-tight truncate">
              {village?.name || 'Loading...'}
            </h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-theme-forest opacity-50 hover:opacity-100 transition-opacity shrink-0"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.path : pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
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
              {isCollapsed ?
                <span className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-full ml-2 bg-theme-accent text-theme-parchment text-xs uppercase tracking-widest py-2 px-4 rounded-md animate-onrender --slide-right z-50 whitespace-nowrap">{item.name}</span>
                :
                <span className="font-sans text-[12px] uppercase tracking-widest">{item.name}</span>}
              {isActive && !isCollapsed && (
                <span className="absolute right-0 w-1 h-4 bg-theme-accent rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-auto border-t border-theme-outline/20 pt-6", isCollapsed ? "px-2" : "px-4")}>
        <div className="space-y-4">
          <Link href={ROUTES.VILLAGE.SETTINGS(communityId)} className={cn("flex items-center text-sm opacity-60 hover:opacity-100 hover:text-theme-accent transition-colors", isCollapsed ? "justify-center" : "gap-3")}>
            <Settings size={18} />
            {!isCollapsed && <span>Village Settings</span>}
          </Link>
          <Link href="/home" className={cn("flex items-center text-sm text-theme-clay opacity-80 hover:opacity-100 transition-colors mt-4 pt-4 border-t border-theme-outline/10", isCollapsed ? "justify-center" : "gap-3")}>
            <LogOut size={18} className="rotate-180" />
            {!isCollapsed && <span>Exit to Mosaic</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
