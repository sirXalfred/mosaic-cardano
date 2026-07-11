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
  description: 'A platform for creative communities of any shared interest, passion, or hobby. Create together. Show up together. Earn together.',
  keywords: ['communities', 'creators', 'cardano', 'web3', 'village', 'collaboration', 'funding'],
  authors: [{ name: 'Dev_id', url: 'https://github.com/davidtimi1' }],
  openGraph: {
    title: 'Mosaic',
    description: 'A platform for creative communities of any shared interest, passion, or hobby. Create together. Show up together. Earn together.',
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
    description: 'A platform for creative communities of any shared interest, passion, or hobby. Create together. Show up together. Earn together.',
    images: ['/assets/images/banner-image.png'],
  },
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", figtree.variable)}>
      <body>
        <div
          id="global-loader"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#FFFBF5',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.5s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              color: '#8e4d30',
            }}
          >
            <svg
              viewBox="0 0 100 100"
              width="72"
              height="72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 20H50V50H20V20Z"
                stroke="currentColor"
                strokeWidth="1.5"
                pathLength="1"
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: 1,
                  animation: 'draw 3s ease-in-out infinite',
                }}
              />

              <path
                d="M50 20H80V50H50V20Z"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 2"
              />

              <path
                d="M20 50H50V80H20V50Z"
                stroke="currentColor"
                strokeWidth="1"
              />

              <path
                d="M50 50L80 80M80 50L50 80"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>

            <p>Loading...</p>
          </div>

          <style>{`
    @keyframes draw {
      from {
        stroke-dashoffset: 1;
      }
      to {
        stroke-dashoffset: 0;
      }
    }
  `}</style>

          <script dangerouslySetInnerHTML={{
            __html: `
            (function() {
              function hideLoader() {
                var loader = document.getElementById('global-loader');
                if (loader) {
                  loader.style.opacity = '0';
                  setTimeout(function() {
                    loader.style.display = 'none';
                  }, 500);
                }
              }
              if (document.readyState === 'interactive' || document.readyState === 'complete') {
                hideLoader();
              } else {
                window.addEventListener('DOMContentLoaded', hideLoader);
                window.addEventListener('load', hideLoader);
              }
            })();
          `
          }} />
        </div>

        <QueryProvider>
          <AuthProvider>
            <ModalsProvider>
              <div id="up">
                <MeshProviderWrapper>
                  <div id="up">
                    <Initialize />
                    <NextTopLoader color="var(--theme-accent)" />
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
