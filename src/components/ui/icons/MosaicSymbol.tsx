import React from 'react';
import { motion } from 'framer-motion';

export default function MosaicSymbol({ color, size = 'w-10 h-10' }: { color: string; size?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.path
        d="M20 20H50V50H20V20Z"
        stroke={color}
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
      <motion.path d="M50 20H80V50H50V20Z" stroke={color} strokeWidth="1" strokeDasharray="4 2" />
      <motion.path d="M20 50H50V80H20V50Z" stroke={color} strokeWidth="1" />
      <motion.path d="M50 50L80 80M80 50L50 80" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
