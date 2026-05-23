import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Compass, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

export const CTASection = ({ itemVariants, containerVariants }: { itemVariants: Variants, containerVariants: Variants }) => {
  return (
    <motion.section 
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="py-40 px-6 text-center relative z-10 border-t border-theme-outline/10"
    >
      <motion.div variants={itemVariants} className="max-w-3xl mx-auto">
        <Compass size={48} className="mx-auto text-theme-clay mb-8 opacity-50" />
        <h2 className="font-serif text-5xl md:text-7xl text-theme-forest mb-8">Ready to weave your legacy?</h2>
        <Button asChild size="xl" className="group mx-auto shadow-xl bg-theme-forest text-theme-parchment hover:bg-theme-clay transition-all duration-500 rounded-xl px-12 py-8">
          <Link href="/auth">
            <div className='flex items-center gap-3'>
              <span className='text-lg uppercase tracking-widest font-sans font-bold'>Join the Mosaic</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
            </div>
          </Link>
        </Button>
      </motion.div>
    </motion.section>
  );
};
