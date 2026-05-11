"use client";
import React from 'react';
import { motion } from 'framer-motion';
import MosaicSymbol from './ui/icons/MosaicSymbol';
import { Search, Plus } from 'lucide-react';
import { VILLAGES } from '../lib/data';
import VillageCard from './VillageCard';

export default function ExploreView() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen bg-[#FFFBF5] pt-32 px-6 pb-20 w-full relative z-40">
      <nav className="fixed top-0 w-full z-[60] px-6 py-6 flex justify-between items-center backdrop-blur-xl border-b border-black/5 bg-[#FFFBF5]/80">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3"><MosaicSymbol color="#4338CA" size="w-8 h-8" /><span className="font-serif text-xl tracking-tighter text-[#111827]">mosaic</span></div>
          <div className="hidden md:flex gap-6 text-[10px] font-bold uppercase tracking-widest opacity-40 text-[#111827]"><span className="opacity-100 border-b-2 border-[#4338CA] pb-1">Square</span><span>Challenges</span><span>Bounties</span></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20" />
            <input type="text" placeholder="Search the square..." className="bg-black/5 rounded-full py-2 pl-10 pr-4 text-xs outline-none w-48 text-[#111827]" />
          </div>
          <div className="w-8 h-8 rounded-full bg-[#4338CA] flex items-center justify-center text-white text-[10px] font-bold shadow-lg">DA</div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <h2 className="text-6xl font-serif italic mb-6 text-[#111827]">The Public Square.</h2>
          <p className="max-w-xl opacity-60 text-lg text-[#111827]">Discover the living creative life of your new villages.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {VILLAGES.slice(0, 3).map((v, i) => (<VillageCard key={i} v={v} />))}
          <div className="p-10 rounded-[3rem] border-2 border-dashed border-black/10 flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
            <Plus size={40} className="mb-4" />
            <h3 className="font-serif text-xl italic">Create a new village</h3>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
