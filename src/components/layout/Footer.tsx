"use client";

import React from 'react';
import Link from 'next/link';
import { useModals } from '@/contexts/modals-context';
import { MODALS } from '@/lib/modals';
import MosaicBrand from '../ui/icons/MosaicBrand';
import { Github, Twitter } from 'lucide-react';
import { CardanoIcon } from '../ui/icons/CardanoLogo';
import MosaicSymbol from '../ui/icons/MosaicSymbol';

type SitemapLink = {
  label: string;
  href?: string;
  action?: string;
};

const SITEMAP: Record<string, SitemapLink[]> = {
  Platform: [
    { label: 'Explore Communities', href: '/explore' },
    { label: 'Global Archive', href: '#' },
    { label: 'The Studio', href: '/studio' },
    { label: 'Governance', href: '/docs/governance' },
    { label: 'Support & Feedback', action: 'FEEDBACK_MODAL' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Cardano Integration', href: '/docs/cardano-integration' },
    { label: 'Community Guidelines', href: '/docs/commuity-guidelines' },
    { label: 'Grants & Funding', href: '/docs/grants' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '/docs/terms' },
    { label: 'Privacy Policy', href: '/docs/privacy' },
    { label: 'Immutable Records', href: '/docs/immutable-records' },
  ],
};

export default function Footer() {
  const { openModal } = useModals();

  return (
    <footer className="w-full bg-[#0a0f0d] text-theme-parchment py-24 px-6 md:px-12 lg:px-24 border-t border-theme-outline/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16">
        
        {/* Brand Column */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-8">
          <div>
            <MosaicBrand size="large" />
            <p className="font-serif text-2xl leading-relaxed text-theme-parchment/70 max-w-sm italic mt-4">
              &quot;A village platform for creative communities of any shared interest, passion, or hobby. Create together. Show up together. Earn together.&quot;
            </p>
          </div>
          <div className="flex gap-4">
            <a href="https://x.com/DavidTimi_1" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-theme-parchment/20 flex items-center justify-center hover:bg-theme-parchment hover:text-[#0a0f0d] transition-all">
              <Twitter size={18} />
            </a>
            <a href="https://github.com/sirXalfred/mosaic-cardano" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-theme-parchment/20 flex items-center justify-center hover:bg-theme-parchment hover:text-[#0a0f0d] transition-all">
              <Github size={18} />
            </a>
            <a href="/v/mosaic-cardano" target="_blank" rel="noreferrer" className="group w-10 h-10 rounded-full border border-theme-parchment/20 flex items-center justify-center hover:bg-theme-parchment hover:text-[#0a0f0d] transition-all">
              <MosaicSymbol className="stroke-white group-hover:stroke-black" size="size-8" />
            </a>
          </div>
        </div>

        {/* Links Columns */}
        <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
          {Object.entries(SITEMAP).map(([category, links]) => (
            <div key={category} className="space-y-6">
              <h4 className="font-sans text-xs uppercase tracking-widest text-theme-parchment/50 font-bold">{category}</h4>
              <ul className="space-y-4 font-sans text-sm">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link href={link.href} className="text-theme-parchment/80 hover:text-theme-accent transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <button onClick={() => link.action === 'FEEDBACK_MODAL' && openModal(MODALS.FEEDBACK)} className="text-theme-parchment/80 hover:text-theme-accent cursor-pointer transition-colors text-left w-full">
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-theme-parchment/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-theme-parchment/40">
        <p>© {new Date().getFullYear()} Mosaic. All rights reversed.</p>
        <p className='flex items-center gap-2'>
          <Link href="https://cardano.org" className='flex items-center gap-2 hover:underline hover:text-white transition-colors' target='_blank' rel='noopener noreferrer'>
            <CardanoIcon size={20} color='white' />
            <span>Built on Cardano</span>
          </Link>
           <br className="md:hidden"/> <span className="hidden md:inline">|</span> <span> Built with ❤️ by </span> <a href="https://github.com/davidtimi1" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">Dev_id</a></p>
      </div>
    </footer>
  );
}
