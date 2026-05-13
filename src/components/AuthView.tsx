"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PERKS, MOSAIC_EASE } from '../lib/data';
import { Button } from './ui/button';

export default function AuthView() {
  const router = useRouter();
  const [perkIndex, setPerkIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setPerkIndex(p => (p + 1) % PERKS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 1, ease: MOSAIC_EASE }} className="min-h-screen flex w-full relative z-20">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#1E1B4B] text-[#F3F4F6] flex-col justify-center px-24">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={perkIndex} initial={{ rotateX: 90, opacity: 0, filter: 'blur(10px)' }} animate={{ rotateX: 0, opacity: 1, filter: 'blur(0px)' }} exit={{ rotateX: -90, opacity: 0, filter: 'blur(10px)' }} transition={{ duration: 1.2, ease: MOSAIC_EASE }} className="relative z-10">
            <h3 className="font-serif text-5xl mb-6 italic">{PERKS[perkIndex].title}</h3>
            <p className="text-xl opacity-60 max-w-md leading-relaxed">{PERKS[perkIndex].desc}</p>
            <div className="w-12 h-1 mt-10 rounded-full transition-colors duration-1000" style={{ backgroundColor: PERKS[perkIndex].accent }} />
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-12 left-24 flex gap-2">
          {PERKS.map((_, i) => (<div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === perkIndex ? 'w-8 bg-amber-500' : 'w-2 bg-white/20'}`} />))}
        </div>
      </div>

      <div className="flex-1 bg-[#FFFBF5] flex flex-col justify-center px-6 md:px-24">
        <div className="max-w-md w-full mx-auto">
          <h2 className="font-serif text-4xl mb-2 text-[#111827]">Welcome to the Square.</h2>
          <p className="text-[#6B7280] mb-10">Join a village to start creating.</p>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); router.push('/onboarding'); }}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Display Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" />
                <input required type="text" placeholder="David Artisan" className="w-full bg-white border border-black/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#4338CA] transition-all text-[#111827]" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" />
                <input required type="email" placeholder="david@mosaic.so" className="w-full bg-white border border-black/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#4338CA] transition-all text-[#111827]" />
              </div>
            </div>

            <Button className='w-full' type="submit">Join the Village</Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
