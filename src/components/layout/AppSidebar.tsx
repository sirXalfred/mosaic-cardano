"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SettingsIcon,
  HelpCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  CompassIcon,
  PlusIcon,
  ChevronDownIcon,
  LogInIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MosaicSymbol from '../ui/icons/MosaicSymbol';
import { Button } from '../ui/button';
import { useGetAuthState } from '@/services/auth';
import { ROUTES } from '@/lib/routes';
import { useExploreStore } from '@/store/exploreStore';
import { useGetFeaturedVillages } from '@/services/villages';

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [villagesExpanded, setVillagesExpanded] = useState(true);

  const { data: authState } = useGetAuthState();
  const isAuthenticated = authState?.isAuthenticated ?? false;

  const { joinedCommunities } = useExploreStore();
  const { data: featuredVillages = [] } = useGetFeaturedVillages();

  // To avoid empty states if store hasn't populated, we'll just show the ones matching joinedCommunities,
  // or a default fallback if none match.
  const userVillages = featuredVillages.filter(v => joinedCommunities.includes(v.id));
  // Fallback to show at least one if the mock data doesn't match
  const displayVillages = userVillages.length > 0 ? userVillages : featuredVillages.slice(0, 1);

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

  const handleAuthRedirect = (nextUrl: string) => {
    router.push(`${ROUTES.AUTH}?next=${encodeURIComponent(nextUrl)}`);
  };

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <aside
      className={cn(
        "group/sidebar fixed left-0 top-0 h-dvh overflow-auto scrollbar-hide flex flex-col py-8 bg-theme-parchment border-r border-theme-outline/20 z-50 transition-all duration-300",
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

        {isCollapsed && (
          <div className="group-hover/sidebar:hidden bg-theme-parchment absolute left-1/2 -translate-x-1/2">
            <MosaicSymbol />
          </div>
        )}
      </div>

      <nav className="flex-1 flex flex-col space-y-2">
        {/* Main Nav Links */}
        <Link
          href={ROUTES.HOME}
          className={cn(
            "flex items-center py-3 rounded-lg transition-colors duration-200 relative group",
            isCollapsed ? "justify-center px-0" : "px-4 gap-3",
            pathname.startsWith(ROUTES.HOME)
              ? "text-theme-accent font-bold bg-theme-forest/5"
              : "text-theme-on-surface opacity-60 hover:opacity-100 hover:text-theme-accent"
          )}
        >
          <HomeIcon size={20} />
          {isCollapsed ? (
            <span className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-full ml-2 bg-theme-accent text-theme-parchment text-xs uppercase tracking-widest py-2 px-4 rounded-md animate-onrender --slide-right">Home</span>
          ) : (
            <span className="font-sans text-[12px] uppercase tracking-widest">Home</span>
          )}
          {pathname.startsWith(ROUTES.HOME) && !isCollapsed && (
            <span className="absolute right-0 w-1 h-4 bg-theme-accent rounded-full" />
          )}
        </Link>

        {isAuthenticated && (
          <Link
            href={ROUTES.EXPLORE}
            className={cn(
              "flex items-center py-3 rounded-lg transition-colors duration-200 relative group",
              isCollapsed ? "justify-center px-0" : "px-4 gap-3",
              pathname.startsWith(ROUTES.EXPLORE)
                ? "text-theme-accent font-bold bg-theme-forest/5"
                : "text-theme-on-surface opacity-60 hover:opacity-100 hover:text-theme-accent"
            )}
          >
            <CompassIcon size={20} />
            {isCollapsed ? (
              <span className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-full ml-2 bg-theme-accent text-theme-parchment text-xs uppercase tracking-widest py-2 px-4 rounded-md animate-onrender --slide-right">Explore</span>
            ) : (
              <span className="font-sans text-[12px] uppercase tracking-widest">Explore</span>
            )}
            {pathname.startsWith(ROUTES.EXPLORE) && !isCollapsed && (
              <span className="absolute right-0 w-1 h-4 bg-theme-accent rounded-full" />
            )}
          </Link>
        )}

        {/* Unauthenticated View Additions */}
        {!isAuthenticated && (
          <>
            <button
              onClick={() => handleAuthRedirect(ROUTES.NEW_COMMUNITY)}
              className={cn(
                "flex items-center py-3 rounded-lg transition-colors duration-200 relative group text-theme-on-surface opacity-60 hover:opacity-100 hover:text-theme-accent cursor-pointer",
                isCollapsed ? "justify-center px-0" : "px-4 gap-3"
              )}
            >
              <PlusIcon size={20} />
              {isCollapsed ? (
                <span className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-full ml-2 bg-theme-accent text-theme-parchment text-xs uppercase tracking-widest py-2 px-4 rounded-md animate-onrender --slide-right">Start a Community</span>
              ) : (
                <span className="font-sans text-[12px] uppercase tracking-widest text-left">Start a Community</span>
              )}
            </button>

            <div className="flex-1 flex flex-col items-center justify-center px-4 opacity-50 py-10">
              <CompassIcon size={32} className="mb-4 text-theme-forest" />
              {!isCollapsed && (
                <p className="text-center font-sans text-xs tracking-widest uppercase font-bold text-theme-forest">
                  Sign in to Explore <br /> The Registry
                </p>
              )}
              {isCollapsed && (
                <span className="hidden group-hover:block absolute left-full ml-2 bg-theme-accent text-theme-parchment text-xs uppercase tracking-widest py-2 px-4 rounded-md z-50">Sign In Required</span>
              )}
            </div>
          </>
        )}

        {/* Authenticated View: Villages Section */}
        {isAuthenticated && (
          <div className="mt-6 pt-4 border-t border-theme-outline/10">
            {!isCollapsed ? (
              <>
                <button
                  onClick={() => setVillagesExpanded(!villagesExpanded)}
                  className="flex items-center justify-between w-full px-4 py-2 text-xs font-bold uppercase tracking-widest text-theme-on-surface/50 hover:text-theme-forest transition-colors cursor-pointer"
                >
                  <span>My Villages</span>
                  <ChevronDownIcon size={14} className={cn("transition-transform duration-200", villagesExpanded ? "rotate-180" : "rotate-0")} />
                </button>

                {villagesExpanded && (
                  <div className="mt-2 space-y-1 px-2">

                    {displayVillages.map((village) => (
                      <Link
                        key={village.id}
                        href={ROUTES.VILLAGE.HOME(village.id)}
                        className={cn(
                          "flex items-center gap-3 py-2 px-3 rounded-lg transition-colors text-sm",
                          pathname.includes(ROUTES.VILLAGE.HOME(village.id))
                            ? "bg-theme-clay/10 text-theme-accent font-medium"
                            : "text-theme-on-surface/70 hover:bg-theme-surface-high hover:text-theme-forest"
                        )}
                      >
                        <span className="text-base">{village.icon}</span>
                        <span className="truncate">{village.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                <Button asChild variant="outline" className='w-full mt-4' size="sm">
                  <Link href={ROUTES.NEW_COMMUNITY}>
                    <PlusIcon />
                    <span> Start a Village </span>
                  </Link>
                </Button>


              </>
            ) : (
              <div className="flex flex-col items-center gap-3 pt-2">
                {displayVillages.map((village) => (
                  <Link
                    key={village.id}
                    href={ROUTES.VILLAGE.HOME(village.id)}
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full transition-colors relative group",
                      pathname.includes(ROUTES.VILLAGE.HOME(village.id))
                        ? "bg-theme-clay/10 text-theme-accent border border-theme-clay/30"
                        : "bg-theme-surface-high border border-theme-outline/10 hover:border-theme-outline/30"
                    )}
                  >
                    <span className="text-lg">{village.icon}</span>
                    <span className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-full ml-2 bg-theme-accent text-theme-parchment text-xs uppercase tracking-widest py-2 px-4 rounded-md animate-onrender --slide-right z-50 whitespace-nowrap">{village.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className={cn("mt-auto border-t border-theme-outline/20 pt-6 ", isCollapsed ? "px-2" : "px-4")}>
        <div className="space-y-2">
          {isAuthenticated ? (
            <Link href={ROUTES.SETTINGS} className={cn("flex items-center text-sm opacity-60 hover:opacity-100 hover:text-theme-accent py-2 transition-colors", isCollapsed ? "justify-center" : "gap-3 px-2")}>
              <SettingsIcon size={18} />
              {!isCollapsed && <span>Settings</span>}
              {isCollapsed && <span className="hidden group-hover:block absolute left-full ml-2 bg-theme-accent text-theme-parchment text-xs uppercase tracking-widest py-2 px-4 rounded-md z-50">Settings</span>}
            </Link>
          ) : (
            <button onClick={() => handleAuthRedirect(ROUTES.SETTINGS)} className={cn("flex w-full items-center text-sm opacity-60 hover:opacity-100 hover:text-theme-accent py-2 transition-colors cursor-pointer", isCollapsed ? "justify-center" : "gap-3 px-2")}>
              <SettingsIcon size={18} />
              {!isCollapsed && <span>Settings</span>}
              {isCollapsed && <span className="hidden group-hover:block absolute left-full ml-2 bg-theme-accent text-theme-parchment text-xs uppercase tracking-widest py-2 px-4 rounded-md z-50">Settings</span>}
            </button>
          )}

          <Link href={ROUTES.SUPPORT} className={cn("flex items-center text-sm opacity-60 hover:opacity-100 hover:text-theme-accent py-2 transition-colors", isCollapsed ? "justify-center" : "gap-3 px-2")}>
            <HelpCircleIcon size={18} />
            {!isCollapsed && <span>Support</span>}
            {isCollapsed && <span className="hidden group-hover:block absolute left-full ml-2 bg-theme-accent text-theme-parchment text-xs uppercase tracking-widest py-2 px-4 rounded-md z-50">Support</span>}
          </Link>

          {!isAuthenticated && (
            <Link href={ROUTES.AUTH} className={cn("flex items-center text-sm text-theme-accent font-bold py-2 mt-4 bg-theme-clay/10 rounded-lg hover:bg-theme-clay/20 transition-colors", isCollapsed ? "justify-center" : "gap-3 px-4")}>
              <LogInIcon size={18} />
              {!isCollapsed && <span>Sign In</span>}
              {isCollapsed && <span className="hidden group-hover:block absolute left-full ml-2 bg-theme-accent text-theme-parchment text-xs uppercase tracking-widest py-2 px-4 rounded-md z-50">Sign In</span>}
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
