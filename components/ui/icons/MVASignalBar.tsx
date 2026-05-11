import React from 'react';

export default function MVASignalBar({ signals }: { signals: { financial: number; social: number; cultural: number; knowledge: number } }) {
  return (
    <div className="flex h-1 w-full rounded-full overflow-hidden bg-black/5 mt-3">
      <div style={{ width: `${signals.financial}%` }} className="bg-[#4338CA] opacity-70" />
      <div style={{ width: `${signals.social}%` }} className="bg-[#F97316] opacity-70" />
      <div style={{ width: `${signals.cultural}%` }} className="bg-[#CA8A04] opacity-70" />
      <div style={{ width: `${signals.knowledge}%` }} className="bg-[#1D4ED8] opacity-70" />
    </div>
  );
}
