import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { FileText } from 'lucide-react';
import { PieceDetails } from '@/services/backend/piece.service';

export function PieceCard({ piece }: { piece: PieceDetails }) {
  // Format the date
  const date = new Date(piece.createdAt);
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);

  return (
    <Link href={ROUTES.ARTIFACT(piece.id)} className="block group">
      <div className="bg-theme-surface border border-theme-outline/10 hover:border-theme-clay/50 p-6 rounded-2xl cursor-pointer transition-all hover:bg-theme-surface-high hover:-translate-y-1 shadow-sm hover:shadow-md flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-theme-surface-high flex items-center justify-center text-theme-clay group-hover:bg-theme-clay/10 transition-colors shrink-0">
          <FileText size={24} />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-serif text-xl font-bold text-theme-forest group-hover:text-theme-clay transition-colors">{piece.title}</h3>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-theme-surface-high border border-theme-outline/10 text-theme-on-surface/70 group-hover:border-theme-clay/30 group-hover:text-theme-clay group-hover:bg-theme-clay/5 transition-all">
              {piece.contentType || 'Piece'}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-sans text-theme-on-surface/60">
            <div className="flex items-center gap-1.5">
              <span className="font-bold uppercase tracking-widest opacity-70">Author:</span>
              <span className="text-theme-forest font-medium">{piece.author.name}</span>
            </div>
            
            <div className="w-1 h-1 rounded-full bg-theme-outline/20"></div>
            
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
