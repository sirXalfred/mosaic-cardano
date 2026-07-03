import "../styles/globals.css";

import type { ReactNode } from 'react';
import { Figtree } from "next/font/google";
import { cn } from "@/lib/utils";
import QueryProvider from "@/contexts/query-provider";
import NextTopLoader from "nextjs-toploader";
import { AuthProvider } from "@/contexts/auth-context";
import { ModalsProvider } from "@/contexts/modals-context";
import { ModalsContainer } from "@/components/layout/ModalsContainer";
import { Toaster } from "@/components/ui/sonner";
import dynamic from 'next/dynamic';

const MeshProviderWrapper = dynamic(
  () => import('@/contexts/mesh-provider').then((mod) => mod.default),
  { ssr: false }
);

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans', adjustFontFallback: true, });


import type { Metadata } from 'next';
import { Initialize } from "@/components/layout/Initialize";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,

  title: {
    default: 'Mosaic',
    template: '%s | Mosaic',
  },
  description: 'A village platform for creative communities of any shared interest, passion, or hobby. Create together. Show up together. Earn together.',
  keywords: ['communities', 'creators', 'cardano', 'web3', 'village', 'collaboration', 'funding'],
  authors: [{ name: 'Dev_id', url: 'https://github.com/davidtimi1' }],
  openGraph: {
    title: 'Mosaic',
    description: 'A village platform for creative communities of any shared interest, passion, or hobby. Create together. Show up together. Earn together.',
    url: siteUrl,
    siteName: 'Mosaic',
    images: [
      {
        url: '/assets/images/banner-image.png',
        width: 1200,
        height: 630,
        alt: 'Mosaic - Every community. Every passion. One home.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mosaic',
    description: 'A village platform for creative communities of any shared interest, passion, or hobby. Create together. Show up together. Earn together.',
    images: ['/assets/images/banner-image.png'],
  },
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", figtree.variable)}>
      <body>
        <QueryProvider>
          <AuthProvider>
            <ModalsProvider>
              <div id="up">
                <MeshProviderWrapper>
                  <div id="up">
                    <Initialize />
                    <NextTopLoader color="var(--color-theme-accent)" />
                    <div className="min-h-screen bg-[#FFFBF5] relative selection:bg-amber-200/50">
                      {children}
                      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#4338CA]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
                    </div>
                    <ModalsContainer />
                  </div>
                </MeshProviderWrapper>
              </div>
            </ModalsProvider>
          </AuthProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
