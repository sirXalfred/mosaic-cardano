"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SettingsIcon,
  HeartHandshake,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  CompassIcon,
  PlusIcon,
  ChevronDownIcon,
  LogInIcon,
  CrownIcon,
  XIcon,
  PenTool,
  TentIcon
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import MosaicSymbol from '../ui/icons/MosaicSymbol';
import { Button } from '../ui/button';
import { useGetAuthState } from '@/services/auth';
import { ROUTES } from '@/lib/routes';
import { useGetMyVillages } from '@/services/villages';
import { useModals } from '@/contexts/modals-context';
import { MODALS } from '@/lib/modals';
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

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileOpen, closeMobileSidebar } = useSidebar();
  const [isCollapsedStored, setIsCollapsedStored] = useState(false);
  const isCollapsed = isCollapsedStored && !isMobileOpen;
  const [mounted, setMounted] = useState(false);
  const [villagesExpanded, setVillagesExpanded] = useState(true);

  const { data: authState } = useGetAuthState();
  const isAuthenticated = authState?.isAuthenticated ?? false;

  const { data: userVillages = [], isLoading: isLoadingVillages } = useGetMyVillages(isAuthenticated);
  const displayVillages = userVillages;
  const { openModal } = useModals();

  useEffect(() => {
    setMounted(true);
    const storedState = localStorage.getItem('mosaic_sidebar_collapsed');
    if (storedState) {
      setIsCollapsedStored(JSON.parse(storedState));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsedStored;
    setIsCollapsedStored(newState);
    localStorage.setItem('mosaic_sidebar_collapsed', JSON.stringify(newState));
  };

  const handleAuthRedirect = (nextUrl: string) => {
    router.push(`${ROUTES.AUTH}?next=${encodeURIComponent(nextUrl)}`);
  };

  if (!mounted) return null; // Avoid hydration mismatch

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
          "group/sidebar fixed left-0 top-0 h-dvh overflow-auto scrollbar-hide flex flex-col py-8 bg-theme-parchment border-r border-theme-outline/20 z-50 transition-all duration-300",
          "w-full px-4",
          isCollapsed ? "md:w-20 md:px-2" : "md:w-64",
          // Mobile specific classes for drawer
          "-translate-x-full md:translate-x-0",
          isMobileOpen && "translate-x-0 shadow-2xl"
        )}
      >
        <div className={cn("mb-10 flex items-center justify-between", isCollapsed ? "justify-center" : "")}>
          {!isCollapsed && (
            <Link href="/" className='flex items-center gap-1'>
              <MosaicSymbol />
              <h1 className="font-serif text-xl font-medium text-theme-forest leading-tight">mosaic</h1>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={isMobileOpen ? closeMobileSidebar : toggleSidebar}
            className="opacity-50 hover:opacity-100 transition-opacity"
          >
            {isMobileOpen ? <XIcon size={20} /> : (isCollapsed ? <ChevronRightIcon size={20} /> : <ChevronLeftIcon size={20} />)}
          </Button>

          {isCollapsed && (
            <div className="group-hover/sidebar:hidden bg-theme-parchment absolute left-1/2 -translate-x-1/2">
              <MosaicSymbol />
            </div>
          )}
        </div>

        <nav className="flex-1 flex flex-col space-y-2">
          {/* Main Nav Links */}
          {isAuthenticated && (
            <SidebarTooltip label="Home" isCollapsed={isCollapsed}>
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
                {!isCollapsed && <span className="font-sans text-[12px] uppercase tracking-widest">Home</span>}
                {pathname.startsWith(ROUTES.HOME) && !isCollapsed && (
                  <span className="absolute right-0 w-1 h-4 bg-theme-accent rounded-full" />
                )}
              </Link>
            </SidebarTooltip>
          )}

          <SidebarTooltip label="Explore" isCollapsed={isCollapsed}>
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
              {!isCollapsed && <span className="font-sans text-[12px] uppercase tracking-widest">Explore</span>}
              {pathname.startsWith(ROUTES.EXPLORE) && !isCollapsed && (
                <span className="absolute right-0 w-1 h-4 bg-theme-accent rounded-full" />
              )}
            </Link>
          </SidebarTooltip>

          {isAuthenticated && (
            <SidebarTooltip label="Workspace" isCollapsed={isCollapsed}>
              <Link
                href={ROUTES.WORKSPACE}
                className={cn(
                  "flex items-center py-3 rounded-lg transition-colors duration-200 relative group",
                  isCollapsed ? "justify-center px-0" : "px-4 gap-3",
                  pathname.startsWith(ROUTES.WORKSPACE)
                    ? "text-theme-accent font-bold bg-theme-forest/5"
                    : "text-theme-on-surface opacity-60 hover:opacity-100 hover:text-theme-accent"
                )}
              >
                <PenTool size={20} />
                {!isCollapsed && <span className="font-sans text-[12px] uppercase tracking-widest">Workspace</span>}
                {pathname.startsWith(ROUTES.WORKSPACE) && !isCollapsed && (
                  <span className="absolute right-0 w-1 h-4 bg-theme-accent rounded-full" />
                )}
              </Link>
            </SidebarTooltip>
          )}

          {/* Unauthenticated View Additions */}
          {!isAuthenticated && (
            <>
              <SidebarTooltip label="Start a Community" isCollapsed={isCollapsed}>
                <button
                  onClick={() => handleAuthRedirect(ROUTES.NEW_COMMUNITY)}
                  className={cn(
                    "flex items-center py-3 rounded-lg transition-colors duration-200 relative group text-theme-on-surface opacity-60 hover:opacity-100 hover:text-theme-accent cursor-pointer",
                    isCollapsed ? "justify-center px-0" : "px-4 gap-3"
                  )}
                >
                  <PlusIcon size={20} />
                  {!isCollapsed && <span className="font-sans text-[12px] uppercase tracking-widest text-left">Start a Community</span>}
                </button>
              </SidebarTooltip>

              <SidebarTooltip label="Sign In Required" isCollapsed={isCollapsed}>
                <div className="flex-1 flex flex-col items-center justify-center px-4 opacity-50 py-10 group">
                  <CompassIcon size={32} className="mb-4 text-theme-forest" />
                  {!isCollapsed && (
                    <p className="text-center font-sans text-xs tracking-widest uppercase font-bold text-theme-forest">
                      Sign in to join communities and <br /> collaborate
                    </p>
                  )}
                </div>
              </SidebarTooltip>
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
                    <span className="flex items-center gap-2">
                      <TentIcon />
                      <span>My Communities</span>
                    </span>
                    <ChevronDownIcon size={14} className={cn("transition-transform duration-200", villagesExpanded ? "rotate-180" : "rotate-0")} />
                  </button>

                  {villagesExpanded && (
                    <div className="mt-2 space-y-1 px-2">
                      {isLoadingVillages ? (
                        <div className="space-y-2 py-1">
                          <div className="h-10 rounded-lg bg-theme-surface-high animate-pulse" />
                          <div className="h-10 rounded-lg bg-theme-surface-high animate-pulse" />
                        </div>
                      ) : (
                        displayVillages.map((village) => {
                          const imageSrc = village.profileImageUrl || '/assets/images/village-placeholder.png';

                          return (
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
                              <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-theme-outline/20 bg-theme-surface-high">
                                <Image
                                  src={imageSrc}
                                  alt={village.name}
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                  unoptimized
                                />
                              </span>
                              <span className="truncate">{village.name}</span>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  )}

                  <Button asChild variant="outline" className='w-full mt-4' size="sm">
                    <Link href={ROUTES.NEW_COMMUNITY}>
                      <PlusIcon />
                      <span> Start a Community </span>
                    </Link>
                  </Button>


                </>
              ) : (
                <div className="flex flex-col items-center gap-3 pt-2">
                  {displayVillages.map((village) => {
                    const imageSrc = village.profileImageUrl || '/assets/images/village-placeholder.png';

                    return (
                      <SidebarTooltip key={village.id} label={village.name} isCollapsed={isCollapsed}>
                        <Link
                          href={ROUTES.VILLAGE.HOME(village.id)}
                          className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full transition-colors relative group overflow-hidden",
                            pathname.includes(ROUTES.VILLAGE.HOME(village.id))
                              ? "bg-theme-clay/10 text-theme-accent border border-theme-clay/30"
                              : "bg-theme-surface-high border border-theme-outline/10 hover:border-theme-outline/30"
                          )}
                        >
                          <Image
                            src={imageSrc}
                            alt={village.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                            unoptimized
                          />
                        </Link>
                      </SidebarTooltip>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className={cn("mt-auto border-t border-theme-outline/20 pt-6 ", isCollapsed ? "px-2" : "px-4")}>
          <div className="space-y-2">
            {isAuthenticated && (
              <SidebarTooltip label="Upgrade" isCollapsed={isCollapsed}>
                <button onClick={() => openModal(MODALS.PRICING)} className={cn("flex w-full items-center text-sm font-bold text-theme-accent hover:bg-theme-accent/10 rounded-lg py-2 transition-colors cursor-pointer", isCollapsed ? "justify-center" : "gap-3 px-2")}>
                  <CrownIcon size={18} className="fill-theme-accent/20" />
                  {!isCollapsed && <span>Upgrade Plan</span>}
                </button>
              </SidebarTooltip>
            )}

            {isAuthenticated ? (
              <SidebarTooltip label="Settings" isCollapsed={isCollapsed}>
                <Link href={ROUTES.SETTINGS} className={cn("flex items-center text-sm opacity-60 hover:opacity-100 hover:text-theme-accent py-2 transition-colors", isCollapsed ? "justify-center" : "gap-3 px-2")}>
                  <SettingsIcon size={18} />
                  {!isCollapsed && <span>Settings</span>}
                </Link>
              </SidebarTooltip>
            ) : (
              <SidebarTooltip label="Settings" isCollapsed={isCollapsed}>
                <button onClick={() => handleAuthRedirect(ROUTES.SETTINGS)} className={cn("flex w-full items-center text-sm opacity-60 hover:opacity-100 hover:text-theme-accent py-2 transition-colors cursor-pointer", isCollapsed ? "justify-center" : "gap-3 px-2")}>
                  <SettingsIcon size={18} />
                  {!isCollapsed && <span>Settings</span>}
                </button>
              </SidebarTooltip>
            )}

            <SidebarTooltip label="Support & Feedback" isCollapsed={isCollapsed}>
              <button onClick={() => openModal(MODALS.FEEDBACK)} className={cn("flex w-full items-center text-sm opacity-60 hover:opacity-100 hover:text-theme-accent py-2 transition-colors cursor-pointer", isCollapsed ? "justify-center" : "gap-3 px-2")}>
                <HeartHandshake size={18} />
                {!isCollapsed && <span>Support & Feedback</span>}
              </button>
            </SidebarTooltip>

            {!isAuthenticated && (
              <SidebarTooltip label="Sign In" isCollapsed={isCollapsed}>
                <Link href={ROUTES.AUTH} className={cn("flex items-center text-sm text-theme-accent font-bold py-2 mt-4 bg-theme-clay/10 rounded-lg hover:bg-theme-clay/20 transition-colors", isCollapsed ? "justify-center" : "gap-3 px-4")}>
                  <LogInIcon size={18} />
                  {!isCollapsed && <span>Sign In</span>}
                </Link>
              </SidebarTooltip>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
