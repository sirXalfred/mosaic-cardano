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
        <motion.h2 variants={itemVariants} className="font-serif text-4xl md:text-6xl text-theme-forest italic">Our Philosophy</motion.h2>
        <div className="space-y-12 text-lg md:text-2xl font-serif leading-loose text-theme-on-surface/80">
          <motion.p variants={itemVariants}>
            We believe that creation is inherently collaborative, yet the tools we use fragment our shared memory. Mosaic is a digital settlement designed for sovereign communities to weave their fragmented works into a cohesive tapestry.
          </motion.p>
          <motion.p variants={itemVariants}>
            Here, every piece is preserved immutably, every contribution is recognized, and the community controls its own legacy without relying on fleeting platforms.
          </motion.p>
        </div>
      </div>
    </motion.section>
  );
};
