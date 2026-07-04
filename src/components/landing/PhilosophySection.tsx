import React from 'react';
import { motion, Variants } from 'framer-motion';

export const PhilosophySection = ({ itemVariants, containerVariants }: { itemVariants: Variants, containerVariants: Variants }) => {
  return (
    <motion.section 
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="py-40 px-6 bg-theme-surface relative z-10 border-y border-theme-outline/10"
    >
      <div className="max-w-4xl mx-auto text-center relative z-20">
        <motion.h2 variants={itemVariants} className="font-serif text-4xl md:text-6xl text-theme-forest italic">Why Mosaic?</motion.h2>
        <div className="space-y-12 text-lg md:text-2xl font-serif leading-loose text-theme-on-surface/80">
          <motion.p variants={itemVariants}>
            Great ideas rarely come from one person. They grow through collaboration, discussion, and shared effort. But most online collaboration happens on platforms that don&apos;t truly preserve ownership, attribution, or history.
          </motion.p>
          <motion.p variants={itemVariants}>
            Mosaic gives communities a place to build together while ensuring every contribution is transparent, verifiable, and permanently connected to the people who made it. Your community owns its work, not the platform.
          </motion.p>
        </div>
      </div>
    </motion.section>
  );
};
