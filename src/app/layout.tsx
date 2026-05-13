import "../styles/globals.css";
import type { ReactNode } from 'react';
import FilmGrain from '../components/FilmGrain';
import { Figtree } from "next/font/google";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: 'mosaic',
  description: 'Mosaic Cardano - Modular Next.js App'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", figtree.variable)}>
      <body>
        <div className="min-h-screen bg-[#FFFBF5] relative selection:bg-amber-200/50">
          <FilmGrain />
            {children}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#4338CA]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </div>
      </body>
    </html>
  );
}
