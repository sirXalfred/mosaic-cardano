"use client";
import React, { ReactNode } from 'react';
import { BellIcon } from 'lucide-react';

function TopAppBar() {
  return (
    <header className="flex justify-between items-center w-full px-6 md:px-12 lg:px-24 py-8 h-12 sticky top-0 z-40 bg-theme-parchment/80 backdrop-blur-md border-b border-theme-outline/30">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <BellIcon size={20} className="text-theme-on-surface/70 cursor-pointer hover:text-theme-forest" />
          <div className="w-8 h-8 rounded-full bg-theme-outline/30 overflow-hidden flex items-center justify-center font-bold text-xs text-theme-forest shadow-sm cursor-pointer hover:scale-105 transition-transform">
            DA
          </div>
        </div>
      </div>
    </header>
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