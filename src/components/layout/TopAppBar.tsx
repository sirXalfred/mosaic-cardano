"use client";

import React, { ReactNode } from 'react';
import { BellIcon, PlusIcon, User, Palette, Award, LogOut, User2Icon, Wallet, MenuIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useGetAuthState } from '@/services/auth';
import { ROUTES } from '@/lib/routes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useModals } from '@/contexts/modals-context';
import { MODALS } from '@/lib/modals';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '../ui/skeleton';
import dynamic from 'next/dynamic';
import { useSidebar } from '@/contexts/sidebar-context';
import NotificationDropdownList from '@/components/notifications/NotificationDropdownList';
import { useGetNotifications } from '@/services/notifications';

const WalletStatus = dynamic(() => import('@/components/wallet/WalletStatus').then((mod) => mod.WalletStatus), {
  ssr: false,
});
const WalletIndicatorBadge = dynamic(() => import('@/components/wallet/WalletStatus').then((mod) => mod.WalletIndicatorBadge), {
  ssr: false,
});

interface TopAppBarProps {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}

function TopAppBar({ leftContent, rightContent }: TopAppBarProps) {
  const { data: authState, isLoading } = useGetAuthState();
  const { logout: handleLogout } = useAuth();
  const isAuthenticated = authState?.isAuthenticated;
  const user = authState?.user;

  const { openModal } = useModals();

  const { toggleMobileSidebar } = useSidebar();
  const { data: notificationsData } = useGetNotifications(10);
  const hasUnread = notificationsData?.pages[0]?.items.some(n => !n.isRead) || false;

  const handleLogoutClicked = () => {
    handleLogout();
  }

  return (
    <>
      <header className={`flex ${leftContent ? 'justify-between' : 'justify-between md:justify-end'} items-center w-full px-4 md:px-12 lg:px-24 py-8 h-12 sticky top-0 z-40 bg-theme-parchment/80 backdrop-blur-md border-b border-theme-outline/30`}>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileSidebar}>
            <MenuIcon size={20} />
          </Button>
          {leftContent && (
            <div className="flex items-center">
              {leftContent}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {rightContent}
          
          {isAuthenticated && <WalletStatus className="hidden md:flex" />}

          {isAuthenticated && (
            <DropdownMenu>
              <Button asChild size="sm" className="px-2 md:px-3">
                <DropdownMenuTrigger>
                  <PlusIcon size="16" />
                  <span className="hidden md:inline-block ml-1">CREATE</span>
                </DropdownMenuTrigger>
              </Button>

              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.NEW_COMMUNITY}>
                    Start a new Community
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  Create a Collaboration
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openModal(MODALS.CREATE_PROJECT)}>
                  Create a new Project
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.STUDIO}>
                    Create a new Publication
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-theme-outline/10 relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-theme-accent/50">
                <BellIcon size={20} className="text-theme-on-surface/80 hover:text-theme-forest transition-colors" />
                {hasUnread && <div className="absolute top-2 right-2 w-2 h-2 bg-theme-accent rounded-full border border-theme-parchment" />}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-theme-surface-high border-theme-outline/20 shadow-lg rounded-xl mt-2 p-0 overflow-hidden">
                <div className="p-4 border-b border-theme-outline/10 flex justify-between items-center bg-theme-surface-low/50">
                  <h3 className="font-bold text-sm text-theme-forest">Notifications</h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  <NotificationDropdownList />
                </div>
                <div className="p-2 border-t border-theme-outline/10 bg-theme-surface-low/50">
                  <Button asChild variant="ghost" className="w-full text-xs font-bold text-theme-accent hover:text-theme-accent hover:bg-theme-accent/10">
                    <Link href={ROUTES.NOTIFICATIONS}>View All Notifications</Link>
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {
              isLoading ? (
                <Skeleton className="w-8 h-8 rounded-full" />

              ) : (isAuthenticated && user) ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="relative">
                      <button className="w-8 h-8 rounded-full bg-theme-outline/30 overflow-hidden flex items-center justify-center font-bold text-xs text-theme-forest shadow-sm cursor-pointer hover:scale-105 transition-transform border border-transparent focus:outline-none focus:ring-2 focus:ring-theme-accent/50">
                        {user.avatarUrl ? (
                          <Image width={100} height={100} src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.initials || 'U'}</span>
                        )}
                      </button>
                      <WalletIndicatorBadge />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-theme-surface-high border-theme-outline/25 shadow-lg rounded-xl mt-2 p-2">
                    <div className="px-2 py-2 mb-2 border-b border-theme-outline/10">
                      <p className="text-sm font-bold text-theme-forest">{user.name}</p>
                    </div>

                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.PROFILE} className="flex items-center gap-3 w-full">
                        <User size={16} className="text-theme-on-surface/60" />
                        <span>View Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.STUDIO} className="flex items-center gap-3 w-full">
                        <Palette size={16} className="text-theme-on-surface/60" />
                        <span>Studio</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => openModal(MODALS.BADGES)} className="cursor-pointer">
                      <div className="flex items-center gap-3 w-full">
                        <Award size={16} className="text-theme-on-surface/60" />
                        <span>Badges</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => openModal(MODALS.WALLET_CONNECT)} className="cursor-pointer font-sans text-sm py-2.5 rounded-lg">
                      <div className="flex items-center gap-3 w-full">
                        <Wallet size={16} className="text-theme-on-surface/60" />
                        <span>Manage Wallet</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleLogoutClicked} className="cursor-pointer font-sans text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 py-2.5 rounded-lg">
                      <div className="flex items-center gap-3 w-full">
                        <LogOut size={16} className="text-red-500" />
                        <span>Logout</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>


              ) : (
                <Button asChild>
                  <Link href={ROUTES.AUTH}>
                    <User2Icon />
                    <span>Sign In</span>
                  </Link>
                </Button>
              )}
          </div>
        </div>
      </header>
    </>
  );
}


export const TopAppBarWrapper = ({ children, leftContent, rightContent }: { children: ReactNode, leftContent?: ReactNode, rightContent?: ReactNode }) => {
  return (
    <>
      <TopAppBar leftContent={leftContent} rightContent={rightContent} />
      {children}
    </>
  );
}