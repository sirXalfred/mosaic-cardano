"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import MosaicSymbol from '../ui/icons/MosaicSymbol';
import { Menu, X, BookOpen, Shield, Hammer } from 'lucide-react';
import { Button } from '../ui/button';

interface DocLink {
  label: string;
  href: string;
}

const DOCS_SITEMAP: Record<string, { icon: React.ReactNode; links: DocLink[] }> = {
  'Platform': {
    icon: <Hammer className="w-4 h-4 text-theme-clay" />,
    links: [
      { label: 'Back to Platform', href: '/' },
      { label: 'Governance', href: '/docs/governance' },
    ]
  },
  'Resources': {
    icon: <BookOpen className="w-4 h-4 text-theme-clay" />,
    links: [
      { label: 'Documentation Home', href: '/docs' },
      { label: 'Cardano Integration', href: '/docs/cardano-integration' },
      { label: 'Community Guidelines', href: '/docs/community-guidelines' },
      { label: 'Grants & Funding', href: '/docs/grants' },
    ]
  },
  'Legal': {
    icon: <Shield className="w-4 h-4 text-theme-clay" />,
    links: [
      { label: 'Terms of Service', href: '/docs/terms' },
      { label: 'Privacy Policy', href: '/docs/privacy' },
      { label: 'Immutable Records', href: '/docs/immutable-records' },
    ]
  }
};

export default function DocsSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header / Top Bar for Docs */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-theme-parchment border-b border-theme-outline/20 flex items-center justify-between px-6 z-40">
        <Link href="/" className="flex items-center gap-1.5">
          <MosaicSymbol size="small" />
          <span className="font-serif text-lg font-medium text-theme-forest">mosaic docs</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-theme-forest">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity" 
          onClick={toggleSidebar} 
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 w-64 bg-theme-parchment border-r border-theme-outline/10 p-6 flex flex-col z-40 transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "pt-24 md:pt-8" // spacing below mobile header or clean desktop alignment
        )}
      >
        {/* Header - Desktop Only */}
        <div className="hidden md:flex flex-col gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <MosaicSymbol />
            <div>
              <h1 className="font-serif text-xl font-medium text-theme-forest leading-none">mosaic</h1>
              <span className="text-[10px] uppercase tracking-widest text-theme-accent font-bold">Documentation</span>
            </div>
          </Link>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 overflow-y-auto space-y-8 pr-2 scrollbar-thin">
          {Object.entries(DOCS_SITEMAP).map(([category, { icon, links }]) => (
            <div key={category} className="space-y-3">
              <h4 className="font-sans text-[10px] uppercase tracking-wider text-theme-forest/40 font-bold flex items-center gap-2">
                {icon}
                <span>{category}</span>
              </h4>
              <ul className="space-y-2 border-l border-theme-outline/20 pl-3 ml-2">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "block text-sm py-1.5 transition-colors relative",
                          isActive
                            ? "text-theme-accent font-semibold"
                            : "text-theme-forest/70 hover:text-theme-accent"
                        )}
                      >
                        {link.label}
                        {isActive && (
                          <span className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-theme-accent rounded-full animate-pulse" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer/Version Info */}
        <div className="border-t border-theme-outline/10 pt-4 mt-6">
          <p className="text-[10px] font-mono text-theme-forest/40">
            Mosaic Docs v0.1.0
          </p>
        </div>
      </aside>
    </>
  );
}
