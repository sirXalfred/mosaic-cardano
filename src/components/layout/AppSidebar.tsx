"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CastleIcon,
  PaletteIcon,
  SettingsIcon,
  HelpCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  UserCircle2Icon,
  CompassIcon,
  PlusIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MosaicSymbol from '../ui/icons/MosaicSymbol';
import { Button } from '../ui/button';

const navItems = [
  { name: 'Home', path: '/home', icon: HomeIcon },
  { name: 'Explore', path: '/explore', icon: CompassIcon },
  { name: 'Villages', path: '/villages', icon: CastleIcon },
  { name: 'Studio', path: '/studio', icon: PaletteIcon },
  { name: 'Profile', path: '/profile', icon: UserCircle2Icon },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedState = localStorage.getItem('mosaic_sidebar_collapsed');
    if (storedState) {
      setIsCollapsed(JSON.parse(storedState));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('mosaic_sidebar_collapsed', JSON.stringify(newState));
  };

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-dvh overflow-auto scrollbar-hide flex flex-col py-8 bg-theme-parchment border-r border-theme-outline/20 z-50 transition-all duration-300",
        isCollapsed ? "w-20 px-2" : "w-64 px-4"
      )}
    >
      <div className={cn("mb-10 flex items-center justify-between", isCollapsed ? "px-2 justify-center" : "px-4")}>
        {!isCollapsed && (
          <Link href="/" className='flex items-center gap-1'>
            <MosaicSymbol />
            <h1 className="font-serif text-xl font-medium text-theme-forest leading-tight">mosaic</h1>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="opacity-50 hover:opacity-100 transition-opacity"
        >
          {isCollapsed ? <ChevronRightIcon size={20} /> : <ChevronLeftIcon size={20} />}
        </Button>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
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
                <span className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-full ml-2 bg-theme-accent text-theme-parchment text-xs uppercase tracking-widest py-2 px-4 rounded-md animate-onrender --slide-right">{item.name}</span>
                :
                <span className="font-sans text-[12px] uppercase tracking-widest">{item.name}</span>}
              {isActive && !isCollapsed && (
                <span className="absolute right-0 w-1 h-4 bg-theme-accent rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-auto border-t border-theme-outline/20 pt-6 ", isCollapsed ? "px-2" : "px-4")}>

        <div className="space-y-4">
          <Button className='w-full tracking-widest gap-1 justify-center' size={isCollapsed ? "icon" : "sm"}>
            <PlusIcon className="size-5" />
            {
              !isCollapsed && (
                "Contribute Work"
              )
            }
          </Button>
          <Link href="/settings" className={cn("flex items-center text-sm opacity-60 hover:opacity-100 hover:text-theme-accent transition-colors", isCollapsed ? "justify-center" : "gap-3")}>
            <SettingsIcon size={18} />
            {!isCollapsed && <span>Settings</span>}
          </Link>
          <Link href="/support" className={cn("flex items-center text-sm opacity-60 hover:opacity-100 hover:text-theme-accent transition-colors", isCollapsed ? "justify-center" : "gap-3")}>
            <HelpCircleIcon size={18} />
            {!isCollapsed && <span>Support</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
