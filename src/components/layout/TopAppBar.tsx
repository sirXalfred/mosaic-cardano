"use client";

import React, { ReactNode, useState } from 'react';
import { BellIcon, PlusIcon, User, Palette, Award, LogOut, User2Icon } from 'lucide-react';
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
import CreateProjectModal from '../project/CreateProjectModal';

function TopAppBar() {
  const { data: authState } = useGetAuthState();
  const isAuthenticated = authState?.isAuthenticated;
  const user = authState?.user;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
    <header className="flex justify-end items-center w-full px-6 md:px-12 lg:px-24 py-8 h-12 sticky top-0 z-40 bg-theme-parchment/80 backdrop-blur-md border-b border-theme-outline/30">
      <div className="flex items-center gap-6">

        {isAuthenticated && (
          <DropdownMenu>
            <Button asChild variant="outline" size="sm" className="">
              <DropdownMenuTrigger>
                <PlusIcon />
                Create
              </DropdownMenuTrigger>
            </Button>

            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={ROUTES.NEW_COMMUNITY}>
                Start a new Community
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Create a Collaboration
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsCreateModalOpen(true)}>
                Create a new Project
              </DropdownMenuItem>
              <DropdownMenuItem>
                Create a new Publication
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href={ROUTES.NOTIFICATIONS}>
              <BellIcon />
            </Link>
          </Button>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-full bg-theme-outline/30 overflow-hidden flex items-center justify-center font-bold text-xs text-theme-forest shadow-sm cursor-pointer hover:scale-105 transition-transform border border-transparent focus:outline-none focus:ring-2 focus:ring-theme-accent/50">
                  {user.avatarUrl ? (
                    <Image width={100} height={100} src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.initials || 'U'}</span>
                  )}
                </button>
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

                <DropdownMenuItem asChild>
                  <div className="flex items-center gap-3 w-full">
                    <Award size={16} className="text-theme-on-surface/60" />
                    <span>Badges</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="cursor-pointer font-sans text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 py-2.5 rounded-lg">
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

      
      <CreateProjectModal
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}


export const TopAppBarWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <TopAppBar />
      {children}
    </>
  );
}