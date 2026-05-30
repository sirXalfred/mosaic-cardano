"use client";
import React from 'react';
import { Wallet, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

export default function VillageTreasury() {
  const params = useParams();
  const communityId = params.community_id as string;

  return (
    <div className="bg-theme-forest text-theme-parchment p-6 rounded-lg shadow-xl relative group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Wallet className="text-theme-clay" size={24} />
          <h3 className="font-serif text-xl font-medium">Village Treasury</h3>
        </div>
        <Link href={ROUTES.VILLAGE.TREASURY(communityId)} className="text-theme-clay font-sans text-[10px] uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Ledger <ChevronRight size={14} />
        </Link>
      </div>
      <div className="mb-6">
        <p className="font-sans text-[10px] uppercase tracking-widest text-theme-surface-high/70 mb-1">Communal Funds</p>
        <p className="font-mono text-2xl tracking-widest text-theme-clay">
          12,840 <span className="text-sm opacity-60">SCR</span>
        </p>
      </div>
      <div className="space-y-3">
        <p className="font-sans text-[10px] uppercase tracking-widest text-theme-surface-high/70 border-b border-theme-parchment/10 pb-1">
          Recent Distributions
        </p>
        <div className="flex justify-between text-xs font-mono">
          <span>Mali Site Prep</span>
          <span className="text-theme-clay">-450 SCR</span>
        </div>
        <div className="flex justify-between text-xs font-mono">
          <span>Steward Stipends</span>
          <span className="text-theme-clay">-1,200 SCR</span>
        </div>
        <div className="flex justify-between text-xs font-mono">
          <span>Common Rent</span>
          <span className="text-theme-clay">-50 SCR</span>
        </div>
      </div>
    </div>
  );
}
