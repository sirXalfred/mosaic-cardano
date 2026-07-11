import React from 'react';
import DocsSidebar from '@/components/layout/DocsSidebar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Mosaic Documentation',
  description: 'Understand the architecture, integration, and rules of the Mosaic village platform.',
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-theme-surface-low text-theme-forest flex">
      {/* Documentation Sidebar */}
      <DocsSidebar />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 md:pl-64 flex flex-col">
        {/* Top spacing to account for mobile header */}
        <div className="h-16 md:hidden shrink-0" />
        
        {/* Content wrapper */}
        <main className="flex-1 py-8 px-6 md:py-16 md:px-12 max-w-6xl">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
