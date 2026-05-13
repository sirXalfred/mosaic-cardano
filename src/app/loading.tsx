import React from 'react';
import MosaicSymbol from '../components/ui/icons/MosaicSymbol';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FFFBF5]/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <MosaicSymbol color="#4338CA" size="w-12 h-12" />
        <p className="font-serif italic text-[#4338CA] opacity-60">Loading...</p>
      </div>
    </div>
  );
}
