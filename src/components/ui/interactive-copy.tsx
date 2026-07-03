"use client";

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InteractiveCopyProps {
  textToCopy?: string | null;
  className?: string;
  iconSize?: number;
}

export function InteractiveCopy({ textToCopy, className, iconSize = 14 }: InteractiveCopyProps) {
  const [copied, setCopied] = useState(false);

  // If there's no text to copy, do not render the component
  if (!textToCopy) return null;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div 
      className={cn("relative inline-flex items-center justify-center cursor-pointer text-theme-on-surface/50 hover:text-theme-on-surface transition-colors", className)} 
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check size={iconSize} className="text-green-500" />
      ) : (
        <Copy size={iconSize} />
      )}

      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.8 }}
            animate={{ opacity: 1, y: -25, scale: 1 }}
            exit={{ opacity: 0, y: -35, scale: 0.9 }}
            className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none z-50 whitespace-nowrap bg-theme-surface-high border border-theme-outline/20 text-theme-on-surface text-xs font-bold px-2 py-1 rounded shadow-lg"
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
