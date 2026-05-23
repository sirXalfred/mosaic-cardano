import React from 'react';
import Link from 'next/link';
import MosaicBrand from '../ui/icons/MosaicBrand';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0a0f0d] text-theme-parchment py-24 px-6 md:px-12 lg:px-24 border-t border-theme-outline/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16">
        
        {/* Brand Column */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-8">
          <div>
            <MosaicBrand size="large" />
            <p className="font-serif text-2xl leading-relaxed text-theme-parchment/70 max-w-sm italic">
              &quot;Weaving the fragmented memories of the world into an immutable tapestry.&quot;
            </p>
          </div>
          <div className="flex gap-4">
            {/* Minimal social placeholders */}
            <a href="#" className="w-10 h-10 rounded-full border border-theme-parchment/20 flex items-center justify-center hover:bg-theme-parchment hover:text-[#0a0f0d] transition-all">𝕏</a>
            <a href="#" className="w-10 h-10 rounded-full border border-theme-parchment/20 flex items-center justify-center hover:bg-theme-parchment hover:text-[#0a0f0d] transition-all">GH</a>
            <a href="#" className="w-10 h-10 rounded-full border border-theme-parchment/20 flex items-center justify-center hover:bg-theme-parchment hover:text-[#0a0f0d] transition-all">DC</a>
          </div>
        </div>

        {/* Links Columns */}
        <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <h4 className="font-sans text-xs uppercase tracking-widest text-theme-parchment/50 font-bold">Platform</h4>
            <ul className="space-y-4 font-sans text-sm">
              <li><Link href="/explore" className="text-theme-parchment/80 hover:text-theme-accent transition-colors">Explore Villages</Link></li>
              <li><Link href="#" className="text-theme-parchment/80 hover:text-theme-accent transition-colors">Global Archive</Link></li>
              <li><Link href="#" className="text-theme-parchment/80 hover:text-theme-accent transition-colors">The Studio</Link></li>
              <li><Link href="#" className="text-theme-parchment/80 hover:text-theme-accent transition-colors">Governance</Link></li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h4 className="font-sans text-xs uppercase tracking-widest text-theme-parchment/50 font-bold">Resources</h4>
            <ul className="space-y-4 font-sans text-sm">
              <li><Link href="#" className="text-theme-parchment/80 hover:text-theme-accent transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-theme-parchment/80 hover:text-theme-accent transition-colors">Cardano Integration</Link></li>
              <li><Link href="#" className="text-theme-parchment/80 hover:text-theme-accent transition-colors">Community Guidelines</Link></li>
              <li><Link href="#" className="text-theme-parchment/80 hover:text-theme-accent transition-colors">Grants & Funding</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-sans text-xs uppercase tracking-widest text-theme-parchment/50 font-bold">Legal</h4>
            <ul className="space-y-4 font-sans text-sm">
              <li><Link href="#" className="text-theme-parchment/80 hover:text-theme-accent transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-theme-parchment/80 hover:text-theme-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-theme-parchment/80 hover:text-theme-accent transition-colors">Immutable Records</Link></li>
            </ul>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-theme-parchment/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-theme-parchment/40">
        <p>© {new Date().getFullYear()} Mosaic Protocol. All rights reversed.</p>
        <p>Built on Cardano. Secured by the Collective.</p>
      </div>
    </footer>
  );
}
