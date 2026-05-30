"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetArtifactDetails, useGetDocumentRevisions, useGetArtifactAnalytics } from '@/services/projects';
import AppPageContainer from '@/components/layout/AppPageContainer';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { ChevronLeft, History, BarChart3, Users, Share2, Award, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TexturedCard } from '@/components/ui/textured-card';

export default function ArtifactPage() {
  const params = useParams();
  const artifactId = params.artifact_id as string;
  
  const { data: artifact, isLoading: isArtifactLoading } = useGetArtifactDetails(artifactId);
  const { data: revisions, isLoading: isRevisionsLoading } = useGetDocumentRevisions(artifactId);
  const { data: analytics, isLoading: isAnalyticsLoading } = useGetArtifactAnalytics(artifactId);
  
  if (isArtifactLoading) {
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
  
  if (!artifact) {
    return (
      <AppPageContainer title="Artifact Not Found">
        <p className="text-theme-on-surface/60 font-serif text-xl">This artifact does not exist or has been removed from the archives.</p>
      </AppPageContainer>
    );
  }

  return (
    <AppPageContainer className="max-w-6xl">
      <div className="mb-2 border-b border-theme-outline/20 pb-4">
        <Button asChild variant="link" size="sm" className="pl-0 text-theme-on-surface/60 hover:text-theme-forest font-sans uppercase tracking-widest text-[10px] font-bold">
          <Link href={ROUTES.VILLAGE.PROJECT(artifact.communityId, artifact.projectId)}>
            <ChevronLeft size={14} className="mr-1" />
            Project: {artifact.projectTitle}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20">
        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-12">
          
          <header className="space-y-6">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-theme-forest leading-tight">
              {artifact.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 border-y border-theme-outline/20 py-4">
              <div className="flex -space-x-2 mr-2">
                {artifact.authors.map(author => (
                  <div key={author.id} className="w-10 h-10 rounded-full border-2 border-theme-parchment bg-theme-clay flex items-center justify-center text-xs font-bold text-white shadow-sm" title={`${author.name} - ${author.attributionPercentage}% contribution`}>
                    {author.initials}
                  </div>
                ))}
              </div>
              <div className="text-sm text-theme-on-surface/70">
                <span className="block font-bold text-theme-forest">
                  {artifact.authors.map(a => a.name).join(', ')}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-theme-on-surface/50">Verified Authorship</span>
              </div>
            </div>
            <div className="font-mono text-xs text-theme-on-surface/50 uppercase tracking-widest">
              Published {artifact.updatedAt} • Sealed in Library of Memory
            </div>
          </header>

          <article className="prose prose-stone max-w-none font-serif text-lg leading-relaxed text-theme-forest/90">
            {artifact.content ? (
              <div dangerouslySetInnerHTML={{ __html: artifact.content }} />
            ) : (
              <div className="space-y-6 text-theme-on-surface/70">
                <p>The manuscript begins by outlining the oral lineages of the ancient empires, tracing the paths of the river merchants and storytellers.</p>
                <p>We see a remarkable convergence of language dialects in the northern basin, suggesting a period of intense cultural exchange around the 14th century. The rhythmic patterns of the recorded chants share a striking similarity with the poetry of the eastern plains.</p>
                <p>Further analysis of the field recordings indicates that these stories were not merely historical accounts, but living legal documents, recited to resolve land disputes and forge alliances between neighboring communities.</p>
                <div className="p-6 bg-theme-surface-low border-l-4 border-theme-clay italic my-8 text-base">
                  &quot;The river remembers what the land forgets. The stories of our fathers flow not in water, but in the breath of those who remain.&quot;
                </div>
                <p>This draft serves as the foundational translation for the upcoming anthology, preserving the exact cadence and tonality originally captured during the initial expeditions.</p>
              </div>
            )}
          </article>
        </div>

        {/* Right Column: Metadata, Analytics, Revision History */}
        <div className="space-y-8">
          
          {/* Artifact Analytics */}
          <TexturedCard patternId={3} className="bg-theme-parchment rounded-2xl p-6 border border-theme-outline/20 shadow-sm">
            <h3 className="font-sans uppercase tracking-widest text-xs font-bold text-theme-accent mb-6 flex items-center gap-2">
              <BarChart3 size={16} /> Artifact Analytics
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
                   <h4 className="font-bold text-sm text-theme-forest">Artifact Sealed</h4>
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
