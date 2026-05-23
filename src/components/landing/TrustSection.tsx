"use client";
import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Fingerprint, Shield } from 'lucide-react';

const TooltipText = ({ text, tooltip, id, activeTooltip, setActiveTooltip }: { text: string, tooltip: string, id: string, activeTooltip: string | null, setActiveTooltip: (id: string | null) => void }) => (
  <span 
    className="relative inline-block cursor-help border-b border-dashed border-theme-accent/50 text-theme-forest group"
    onMouseEnter={() => setActiveTooltip(id)}
    onMouseLeave={() => setActiveTooltip(null)}
  >
    {text}
    {activeTooltip === id && (
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-theme-surface-high border border-theme-outline/20 text-xs font-sans text-theme-on-surface shadow-xl rounded-lg z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
        {tooltip}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-theme-outline/20"></span>
      </span>
    )}
  </span>
);

export const TrustSection = ({ itemVariants, containerVariants }: { itemVariants: Variants, containerVariants: Variants }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  return (
    <motion.section 
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="py-40 px-6 bg-theme-forest text-theme-parchment relative z-10"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div variants={itemVariants} className="space-y-8">
          <span className="font-sans text-xs uppercase tracking-widest text-theme-clay font-bold block">The Passport</span>
          <h2 className="font-serif text-5xl leading-tight">Trust built on <br/>provable contributions.</h2>
          <p className="font-sans text-lg text-theme-parchment/70 leading-relaxed">
            Your reputation in the Mosaic is defined by the work you do. Every edit, every proposal, and every artifact you create is recorded in your personal Passport. 
          </p>
          <p className="font-sans text-lg text-theme-parchment/70 leading-relaxed">
            By leveraging <TooltipText id="blockchain" text="immutable ledger technology" tooltip="A decentralized database (Cardano) that permanently records history without requiring a central authority, ensuring your contributions can never be deleted." activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />, your history becomes a permanent, verifiable testament to your skill and collaboration, establishing trust without needing <TooltipText id="middlemen" text="centralized authorities" tooltip="Traditional platforms that act as gatekeepers, owning your data and dictating your reputation." activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
            <Shield className="text-theme-clay mb-6" size={32} />
            <h4 className="font-serif text-xl mb-3">Verified Identity</h4>
            <p className="text-sm text-theme-parchment/60 font-sans leading-relaxed">Your profile is cryptographically secured, ensuring nobody can impersonate your creative legacy.</p>
          </div>
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm mt-0 sm:mt-12">
            <Fingerprint className="text-theme-clay mb-6" size={32} />
            <h4 className="font-serif text-xl mb-3">Immutable History</h4>
            <p className="text-sm text-theme-parchment/60 font-sans leading-relaxed">All published works are permanently preserved, creating a censorship-resistant portfolio.</p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
