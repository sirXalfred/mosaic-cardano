"use client";
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Sparkles, Heart, MessageSquare, ChevronRight } from 'lucide-react';
import MVASignalBar from './ui/icons/MVASignalBar';
import { callGemini } from '../lib/gemini';
import { Button } from './ui/button';

export default function VillageCard({ v }: any) {
  const [vibe, setVibe] = useState('');
  const [isLoadingVibe, setIsLoadingVibe] = useState(false);

  const getVibe = async () => {
    setIsLoadingVibe(true);
    try {
      const prompt = `Village: ${v.name}. Latest Activity Preview: "${v.preview}". In exactly one warm, literary sentence, describe the soul of this community.`;
      const response = await callGemini(prompt);
      setVibe(response || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingVibe(false);
    }
  };

  return (
    <div className="p-8 rounded-[3rem] bg-white border border-black/5 shadow-sm hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">{v.icon}</div>
          <div>
            <h4 className="font-serif text-lg font-bold text-[#111827]">{v.name}</h4>
            <p className="text-[9px] font-bold uppercase opacity-30 tracking-widest text-[#111827]">{v.type}</p>
          </div>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3].map(j => <div key={j} className="w-6 h-6 rounded-full border-2 border-white bg-slate-300" />)}
        </div>
      </div>

      <div className="min-h-[60px] mb-8">
        <AnimatePresence mode="wait">
          {vibe ? (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-sm italic text-[#4338CA] leading-relaxed font-serif">"{vibe}"</motion.p>
          ) : (
            <p className="text-sm opacity-60 line-clamp-2 italic text-[#111827]">"{v.preview}"</p>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-4 border-t border-black/5">
        <div className="flex justify-between text-[9px] font-bold opacity-30 mb-2 uppercase tracking-widest text-[#111827]">
          <span>Impact Signal</span>
          <span>{v.mva} MVA</span>
        </div>
        <MVASignalBar signals={v.signals} />
        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-3 opacity-30"><Heart size={16}/> <MessageSquare size={16}/></div>
          <Button variant="ghost" size="none" className="text-xs font-bold text-[#4338CA] group-hover:gap-2 flex items-center gap-1 bg-transparent hover:bg-transparent">Read Story <ChevronRight size={14}/></Button>
        </div>
      </div>
    </div>
  );
}
