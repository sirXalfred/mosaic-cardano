"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MosaicSymbol from './ui/icons/MosaicSymbol';
import { MOSAIC_EASE } from '../lib/data';
import { Button } from './ui/button';
import Link from 'next/link';

export default function LandingView() {
  const router = useRouter();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }} transition={{ duration: 1.2, ease: MOSAIC_EASE }} className="relative z-10 w-full">
      <nav className="fixed top-0 w-full z-[60] px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <MosaicSymbol color="#4338CA" />
          <span className="font-serif text-2xl tracking-tighter text-[#111827]">mosaic</span>
        </div>
        <Button asChild>
          <Link href="/auth">
            <div className='flex items-center gap-2'>
              <span className='text-xl'>Enter</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-700" />
            </div>
          </Link>
        </Button>
      </nav>

      <main className="pt-48 pb-32 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-7xl md:text-9xl leading-[0.85] mb-12 italic tracking-tighter text-[#111827]">
            For those who <br />
            <span className="not-italic text-amber-600">build worlds.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-16 max-w-xl mx-auto font-medium opacity-60 text-[#111827]">Collaborative infrastructure for creative villages. Write, document, and earn together on Cardano.</p>
          <Button onClick={() => router.push('/auth')} variant="default" size="xl" className="group flex items-center gap-3 mx-auto shadow-2xl">Open the Gates <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-700" /></Button>
        </div>
      </main>
    </motion.div>
  );
}
