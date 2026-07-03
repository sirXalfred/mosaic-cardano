"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import MosaicBrand from './ui/icons/MosaicBrand';
import { MOSAIC_EASE } from '../lib/data';
import Footer from './layout/Footer';
import { useModals } from '@/contexts/modals-context';
import { MODALS } from '@/lib/modals';

// Extracted Components
import { HeroSection } from './landing/HeroSection';
import { PhilosophySection } from './landing/PhilosophySection';
import { CommunityShowcaseSection } from './landing/CommunityShowcaseSection';
import { LivingLibrarySection } from './landing/LivingLibrarySection';
import { TrustSection } from './landing/TrustSection';
import { CTASection } from './landing/CTASection';
import { PricingSection } from './landing/PricingSection';
import { Button } from './ui/button';

export default function LandingView() {
  const { openModal } = useModals();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, ease: MOSAIC_EASE }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: MOSAIC_EASE } }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: 'blur(10px)' }} transition={{ duration: 1.2, ease: MOSAIC_EASE }} className="relative z-10 w-full bg-theme-parchment text-theme-forest overflow-x-hidden">
      
      {/* Background Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuC9QuQNM5A8ulD-usGL7WPxprHWmeC1zp2nhD8CF6pluhdSTFuGFuDybp4W_4FJrvqFXLHILme-ekFljqjyy1t27hqsnYO2PUlSGsXUH1BfWcy0l0MKNAy2jiO3HvfNGyioojpRvp8bVSINIT5kfC9L4YKawElG2iVn_euP7Vj-dA-gIgOS9mvtepudjtKzCEPea5dqpIe5HBeRa1_s6b3zisR-w8wf7EZ1vl74rUcdHioIx5gkTk5zqs3kBht290neCZWMfeVva1U)' }} />

      <nav className="fixed top-0 w-full z-[60] py-6 bg-theme-parchment/80 backdrop-blur-md border-b border-theme-outline/10">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <MosaicBrand size="medium" />
          </div>
          <div className="flex items-center gap-6">
            <Button variant="link" onClick={() => openModal(MODALS.FEEDBACK)} className="text-theme-forest/60 hover:text-theme-forest">
              SUPPORT & FEEDBACK
            </Button>
            <Link href="/auth" className="font-sans text-xs uppercase tracking-widest font-bold text-theme-accent hover:text-theme-forest transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <HeroSection containerVariants={containerVariants} itemVariants={itemVariants} />

      {/* 2. Philosophy Section */}
      <PhilosophySection containerVariants={containerVariants} itemVariants={itemVariants} />

      {/* 3. Community Showcase Section */}
      <CommunityShowcaseSection containerVariants={containerVariants} itemVariants={itemVariants} />

      {/* 4. Trust & Reputation Section */}
      <TrustSection containerVariants={containerVariants} itemVariants={itemVariants} />

      {/* 5. Artifact Highlights Section */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="py-40 px-6 relative z-10"
      >
        <LivingLibrarySection />
      </motion.section>

      {/* 6. Pricing Section */}
      <PricingSection containerVariants={containerVariants} />

      {/* 7. CTA Section */}
      <CTASection containerVariants={containerVariants} itemVariants={itemVariants} />

      {/* 7. Footer */}
      <Footer />

    </motion.div>
  );
}
