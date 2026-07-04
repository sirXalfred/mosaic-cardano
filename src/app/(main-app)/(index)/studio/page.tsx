"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Link as LinkIcon, Loader2, Clock, ArrowRight } from 'lucide-react';
import { useCreateDocument, useGetUserDocuments } from '@/services/documents';
import { getLocalDocuments, LocalDocument } from '@/lib/indexeddb';
import AppPageContainer from '@/components/layout/AppPageContainer';
import { ROUTES } from '@/lib/routes';
import { Button } from '@/components/ui/button';

export default function StudioLandingPage() {
  const router = useRouter();
  // No longer requires projectId or communityId by default.

  const [externalUrl, setExternalUrl] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const [localPieces, setLocalPieces] = useState<LocalDocument[]>([]);
  const { mutateAsync: createDocument } = useCreateDocument();
  const { data: documentsData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: piecesLoading } = useGetUserDocuments();

  const allPieces = documentsData?.pages.flatMap((page) => page.data) || [];

  useEffect(() => {
    // Load local documents
    getLocalDocuments().then(setLocalPieces);
  }, []);

  // Merge local pieces with remote pieces, preferring local for recentness
  const mergedPieces = [...localPieces.map(p => ({
    id: p.id,
    title: p.title,
    status: 'LOCAL',
    updatedAt: 'Just now'
  })), ...allPieces.filter(ap => !localPieces.find(lp => lp.id === ap.id))];

  const recentPieces = mergedPieces.slice(0, 4);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCreateNative = () => {
    router.push(`/studio/new`);
  };

  const handleLinkExternal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalUrl) return;

    setIsLinking(true);

    try {
      const { id } = await createDocument({
        title: 'External Document',
        content: externalUrl
      });

      // Redirect to the newly created draft in studio
      router.push(ROUTES.STUDIO + `/${id}`);

    } catch (e) {
      console.error(e);
      setIsLinking(false);
    }
  };

  return (
    <AppPageContainer
      title="Initialize Document" 
      description="Will you draft a native piece within the Mosaic Studio, or link a document already published externally?">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        
        {/* Native Draft Option */}
        <button 
          onClick={handleCreateNative}
          className="bg-white border border-theme-outline/20 hover:border-theme-accent hover:shadow-lg transition-all rounded-2xl p-8 flex flex-col items-start text-left cursor-pointer group h-full"
        >
          <div className="w-12 h-12 bg-theme-clay/10 text-theme-accent rounded-xl flex items-center justify-center mb-6 group-hover:bg-theme-accent group-hover:text-white transition-colors">
            <FileText size={24} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-theme-forest mb-2">Native Draft</h2>
          <p className="text-theme-on-surface/60 text-sm leading-relaxed mb-8 flex-1">
            Open the Studio Editor. Write, collaborate, and ceremonially publish directly on the platform with full attribution.
          </p>
          <span className="text-[10px] uppercase tracking-widest font-bold text-theme-forest flex items-center gap-2">
            Start Writing &rarr;
          </span>
        </button>

        {/* External Link Option */}
        <div className="bg-white border border-theme-outline/20 rounded-2xl p-8 flex flex-col items-start h-full">
          <div className="w-12 h-12 bg-theme-outline/10 text-theme-forest rounded-xl flex items-center justify-center mb-6">
            <LinkIcon size={24} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-theme-forest mb-2">Link External</h2>
          <p className="text-theme-on-surface/60 text-sm leading-relaxed mb-6">
            Have an existing Medium article, Google Doc, or PDF? Link it directly into the project archive.
          </p>
          
          <form onSubmit={handleLinkExternal} className="w-full mt-auto">
            <div className="flex flex-col gap-3">
              <input 
                type="url"
                placeholder="https://"
                required
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full bg-theme-surface border border-theme-outline/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50 transition-all placeholder:text-theme-on-surface/30"
              />
              <Button
                type="submit"
                disabled={!externalUrl || isLinking}
              >
                {isLinking ? <Loader2 size={16} className="animate-spin" /> : 'Link Document'}
              </Button>
            </div>
          </form>
        </div>

      </div>

      {/* Recent Documents Section */}
      <div className="max-w-4xl w-full">
        <div className="flex items-end justify-between mb-8 border-b border-theme-outline/20 pb-4">
          <h2 className="font-serif text-2xl font-bold text-theme-forest flex items-center gap-2">
            <Clock size={20} className="text-theme-accent" /> Recent Documents
          </h2>
          {!showAllDocuments && mergedPieces.length > 4 && (
            <Button 
              variant="outline"
              onClick={() => setShowAllDocuments(true)}
            >
              View More <ArrowRight size={14} />
            </Button>
          )}
        </div>

        {piecesLoading && localPieces.length === 0 ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-theme-accent" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(showAllDocuments ? mergedPieces : recentPieces).map(piece => (
              <div 
                key={piece.id} 
                onClick={() => router.push(`/studio/${piece.id}`)}
                className="bg-white border border-theme-outline/10 hover:border-theme-clay p-5 rounded-xl cursor-pointer transition-colors group flex items-start justify-between"
              >
                <div>
                  <h3 className="font-bold text-theme-forest group-hover:text-theme-accent transition-colors">{piece.title}</h3>
                  <p className="text-xs text-theme-on-surface/50 mt-1 flex items-center gap-2">
                    <span className="uppercase tracking-widest text-[9px] bg-theme-surface-low px-2 py-0.5 rounded text-theme-on-surface/70">
                      {piece.status}
                    </span>
                    • {piece.updatedAt}
                  </p>
                </div>
                <div className="w-8 h-8 rounded bg-theme-surface flex items-center justify-center text-theme-outline/50 group-hover:bg-theme-clay/10 group-hover:text-theme-accent transition-colors">
                  <FileText size={16} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite Scroll Target */}
        {showAllDocuments && hasNextPage && (
          <div ref={observerTarget} className="flex justify-center py-8">
            {isFetchingNextPage ? (
              <Loader2 className="animate-spin text-theme-accent" />
            ) : (
              <div className="h-4" /> 
            )}
          </div>
        )}
        
        {showAllDocuments && !hasNextPage && mergedPieces.length > 0 && (
          <p className="text-center text-xs text-theme-on-surface/40 mt-8 uppercase tracking-widest font-bold">End of Archive</p>
        )}
      </div>

    </AppPageContainer>
    
  );
}
