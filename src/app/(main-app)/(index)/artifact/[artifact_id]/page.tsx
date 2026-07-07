"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetDocumentRevisions, useGetArtifactAnalytics } from '@/services/projects';
import { useGetPieceDetails } from '@/services/pieces';
import { resolveIPFSUri } from '@/lib/ipfs';
import AppPageContainer from '@/components/layout/AppPageContainer';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { ChevronLeft, History, BarChart3, Users, Share2, Award, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TexturedCard } from '@/components/ui/textured-card';

export default function ArtifactPage() {
  const params = useParams();
  const artifactId = params.artifact_id as string;
  
  const { data: piece, isLoading: isPieceLoading } = useGetPieceDetails(artifactId);
  const { data: revisions, isLoading: isRevisionsLoading } = useGetDocumentRevisions(artifactId);
  const { data: analytics, isLoading: isAnalyticsLoading } = useGetArtifactAnalytics(artifactId);

  const [content, setContent] = React.useState<string | null>(null);
  const [isContentLoading, setIsContentLoading] = React.useState(false);

  React.useEffect(() => {
    if (piece?.contentUrl) {
      setIsContentLoading(true);
      const resolvedUrl = resolveIPFSUri(piece.contentUrl);
      fetch(resolvedUrl)
        .then(res => res.text())
        .then(text => setContent(text))
        .catch(err => console.error("Failed to load piece content:", err))
        .finally(() => setIsContentLoading(false));
    }
  }, [piece?.contentUrl]);
  
  if (isPieceLoading) {
    return (
      <AppPageContainer title="Loading Artifact...">
        <div className="animate-pulse space-y-8 max-w-3xl">
           <div className="h-8 w-32 bg-theme-outline/20 rounded"></div>
           <div className="h-16 w-3/4 bg-theme-outline/20 rounded"></div>
           <div className="h-64 w-full bg-theme-outline/20 rounded"></div>
        </div>
      </AppPageContainer>
    );
  }
  
  if (!piece) {
    return (
      <AppPageContainer title="Piece Not Found">
        <p className="text-theme-on-surface/60 font-serif text-xl">This piece does not exist or has been removed from the archives.</p>
      </AppPageContainer>
    );
  }

  return (
    <AppPageContainer className="max-w-6xl">
      <div className="mb-2 border-b border-theme-outline/20 pb-4">
        <Button asChild variant="link" size="sm" className="pl-0 text-theme-on-surface/60 hover:text-theme-forest font-sans uppercase tracking-widest text-[10px] font-bold">
          <Link href={ROUTES.VILLAGE.HOME(piece.community.id)}>
            <ChevronLeft size={14} className="mr-1" />
            Community: {piece.community.name}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20">
        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-12">
          
          <header className="space-y-6">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-theme-forest leading-tight">
              {piece.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 border-y border-theme-outline/20 py-4">
              <div className="flex -space-x-2 mr-2">
                <div key={piece.author.id} className="w-10 h-10 rounded-full border-2 border-theme-parchment bg-theme-clay flex items-center justify-center text-xs font-bold text-white shadow-sm" title={piece.author.name}>
                  {piece.author.name.substring(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="text-sm text-theme-on-surface/70">
                <span className="block font-bold text-theme-forest">
                  {piece.author.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-theme-on-surface/50">Verified Authorship</span>
              </div>
            </div>
            <div className="font-mono text-xs text-theme-on-surface/50 uppercase tracking-widest">
              Published {new Date(piece.createdAt).toLocaleDateString()} • Anchored On-Chain & Sealed in Community Library
            </div>
          </header>

          <article className="prose prose-stone max-w-none font-serif text-lg leading-relaxed text-theme-forest/90">
            {isContentLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-theme-outline/10 rounded w-full"></div>
                <div className="h-4 bg-theme-outline/10 rounded w-5/6"></div>
                <div className="h-4 bg-theme-outline/10 rounded w-4/6"></div>
              </div>
            ) : content ? (
              <div className="whitespace-pre-wrap font-sans text-base leading-loose">{content}</div>
            ) : (
              <div className="p-6 bg-theme-surface-low border border-theme-outline/10 rounded-xl text-center text-theme-on-surface/60">
                Content is not available.
              </div>
            )}
          </article>
        </div>

        {/* Right Column: Metadata, Analytics, Revision History */}
        <div className="space-y-8">
          
          {/* Piece Analytics */}
          <TexturedCard patternId={3} className="bg-theme-parchment rounded-2xl p-6 border border-theme-outline/20 shadow-sm">
            <h3 className="font-sans uppercase tracking-widest text-xs font-bold text-theme-accent mb-6 flex items-center gap-2">
              <BarChart3 size={16} /> Piece Analytics
            </h3>
            
            {isAnalyticsLoading || !analytics ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-theme-outline/10 rounded"></div>
                <div className="h-10 bg-theme-outline/10 rounded"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-theme-surface-low rounded-xl border border-theme-outline/10">
                    <div className="text-theme-on-surface/60 text-xs font-bold mb-1 flex items-center gap-1"><Award size={12} /> Quality</div>
                    <div className="font-serif text-2xl text-theme-forest">{analytics.readershipQualityScore}</div>
                  </div>
                  <div className="p-4 bg-theme-surface-low rounded-xl border border-theme-outline/10">
                    <div className="text-theme-on-surface/60 text-xs font-bold mb-1 flex items-center gap-1"><Share2 size={12} /> Citations</div>
                    <div className="font-serif text-2xl text-theme-forest">{analytics.citations}</div>
                  </div>
                  <div className="p-4 bg-theme-surface-low rounded-xl border border-theme-outline/10">
                    <div className="text-theme-on-surface/60 text-xs font-bold mb-1 flex items-center gap-1"><Bookmark size={12} /> Saves</div>
                    <div className="font-serif text-2xl text-theme-forest">{analytics.saves}</div>
                  </div>
                  <div className="p-4 bg-theme-surface-low rounded-xl border border-theme-outline/10">
                    <div className="text-theme-on-surface/60 text-xs font-bold mb-1 flex items-center gap-1"><Users size={12} /> Reuse</div>
                    <div className="font-serif text-2xl text-theme-forest">{analytics.communityReuse}</div>
                  </div>
                </div>

                {analytics.contributionSpread.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-theme-on-surface/70 mb-3">Community Spread</h4>
                    <div className="space-y-2">
                      {analytics.contributionSpread.map((spread, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-theme-forest font-medium">{spread.label}</span>
                          <span className="font-mono text-theme-on-surface/60 text-xs">{spread.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TexturedCard>

          {/* Revision History */}
          <TexturedCard patternId={1} className="bg-theme-surface-low rounded-2xl p-6 border border-theme-outline/20">
            <h3 className="font-sans uppercase tracking-widest text-xs font-bold text-theme-accent mb-6 flex items-center gap-2">
              <History size={16} /> Provenance Log
            </h3>
            
            {isRevisionsLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-theme-outline/10 rounded"></div>
                <div className="h-12 bg-theme-outline/10 rounded"></div>
              </div>
            ) : (
              <div className="relative pl-4 space-y-6 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-theme-outline/30">
                <div className="relative">
                   <span className="absolute -left-5 top-1.5 w-2 h-2 rounded-full bg-green-500 ring-4 ring-theme-surface-low"></span>
                   <p className="font-mono text-[10px] text-theme-on-surface/50 mb-1">Genesis</p>
                   <h4 className="font-bold text-sm text-theme-forest">Piece Sealed</h4>
                   <p className="text-xs text-theme-on-surface/70 mt-1">Cryptographically signed by contributors.</p>
                </div>
                {revisions?.map((rev) => (
                  <div key={rev.id} className="relative">
                    <span className="absolute -left-5 top-1.5 w-2 h-2 rounded-full bg-theme-clay ring-4 ring-theme-surface-low"></span>
                    <p className="font-mono text-[10px] text-theme-on-surface/50 mb-1">{rev.timestamp}</p>
                    <h4 className="font-bold text-sm text-theme-forest">{rev.authorName}</h4>
                    <p className="text-xs text-theme-on-surface/70 mt-1">{rev.description}</p>
                  </div>
                ))}
              </div>
            )}
          </TexturedCard>

        </div>
      </div>
    </AppPageContainer>
  );
}
