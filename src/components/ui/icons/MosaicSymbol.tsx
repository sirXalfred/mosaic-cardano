"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function MosaicSymbol({ className = "stroke-color-theme-accent", size = 'w-10 h-10' }: { className?: string; size?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.path
        d="M20 20H50V50H20V20Z"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        className={className}
      />
      <motion.path d="M50 20H80V50H50V20Z" className={className} strokeWidth="1" strokeDasharray="4 2" />
      <motion.path d="M20 50H50V80H20V50Z" className={className} strokeWidth="1" />
      <motion.path d="M50 50L80 80M80 50L50 80" className={className} strokeWidth="1.5" />
    </svg>
  );
}
