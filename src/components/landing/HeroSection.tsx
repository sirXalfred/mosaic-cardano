import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export const HeroSection = ({ itemVariants, containerVariants }: { itemVariants: Variants, containerVariants: Variants }) => {
  return (
    <main className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 text-center pt-40 z-10">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto relative">
        <motion.div variants={itemVariants} className="absolute -top-32 -left-32 w-64 h-64 bg-theme-clay/10 rounded-full blur-3xl"></motion.div>
        <motion.div variants={itemVariants} className="absolute -bottom-32 -right-32 w-96 h-96 bg-theme-forest/5 rounded-full blur-3xl"></motion.div>
        
        <motion.h1 variants={itemVariants} className="font-serif text-7xl md:text-8xl lg:text-9xl leading-[0.85] mb-12 italic tracking-tighter text-theme-forest relative z-10 drop-shadow-sm">
          For those who <br />
          <span className="not-italic text-theme-clay">build worlds.</span>
        </motion.h1>
        <motion.p variants={itemVariants} className="text-xl md:text-2xl mb-16 max-w-2xl mx-auto font-medium opacity-70 text-theme-on-surface leading-relaxed relative z-10">
          Collaborative infrastructure for creative villages. Write, document, and preserve together in an immutable archive.
        </motion.p>
        <motion.div variants={itemVariants}>
          <Button asChild size="xl" className="group mx-auto transition-all duration-500 rounded-xl px-12 py-8 relative z-10">
            <Link href={ROUTES.AUTH}>
              <div className='flex items-center gap-3'>
                <span className='text-xl uppercase tracking-widest font-sans font-bold'>Join the Beta</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-700" />
              </div>
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
};
