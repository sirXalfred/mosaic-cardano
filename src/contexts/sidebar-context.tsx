"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface SidebarContextType {
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileSidebar = () => setMobileOpen((prev) => !prev);
  const closeMobileSidebar = () => setMobileOpen(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <SidebarContext.Provider value={{ isMobileOpen, setMobileOpen, toggleMobileSidebar, closeMobileSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
