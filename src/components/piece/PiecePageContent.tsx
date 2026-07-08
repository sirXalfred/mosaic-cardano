"use client";

import React from 'react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { resolveIPFSUri } from '@/lib/ipfs';
import AppPageContainer from '@/components/layout/AppPageContainer';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { ArrowLeft, Users, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TexturedCard } from '@/components/ui/textured-card';
import { PieceDetails } from '@/types/mosaic';

export default function PiecePageContent({ piece }: { piece?: PieceDetails | null }) {

  const [content, setContent] = React.useState<string | null>(null);
  const [isContentLoading, setIsContentLoading] = React.useState(false);
  const [isContentError, setIsContentError] = React.useState(false);

  const contributors: {userId: string, name: string, username: string, role: string, weight: number}[] = piece?.contributors || [];
  const creator = contributors.find((c) => c.role === 'Creator') || contributors[0];
  const coContributors = contributors.filter((c) => c.userId !== creator?.userId);
  const authorName = creator?.name || 'Unknown Author';
  const authorID = creator?.userId || 'Unknown';
  const community = piece?.community;
  const backRoute = community?.id ? ROUTES.VILLAGE.HOME(community.id) : ROUTES.EXPLORE;

  React.useEffect(() => {
    if (piece?.contentUrl) {
      setIsContentLoading(true);
      setIsContentError(false);
      const resolvedUrl = resolveIPFSUri(piece.contentUrl);
      fetch(resolvedUrl)
        .then(async (res) => {
          if (!res.ok) {
            setIsContentError(true);
            return null;
          }
          return res.text();
        })
        .then(text => {
          if (text) setContent(text);
        })
        .catch(err => {
          console.error("Failed to load piece content:", err);
          setIsContentError(true);
        })
        .finally(() => setIsContentLoading(false));
    }
  }, [piece?.contentUrl]);

  // if (isPieceLoading) {
  //   return (
  //     <AppPageContainer title="Loading Piece...">
  //       <div className="animate-pulse space-y-8 max-w-3xl">
  //         <div className="h-8 w-32 bg-theme-outline/20 rounded"></div>
  //         <div className="h-16 w-3/4 bg-theme-outline/20 rounded"></div>
  //         <div className="h-64 w-full bg-theme-outline/20 rounded"></div>
  //       </div>
  //     </AppPageContainer>
  //   );
  // }

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
          <Link href={backRoute}>
            <ArrowLeft size={14} className="mr-1" />
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
              <div className="flex -space-x-3 mr-2 group cursor-pointer" onClick={() => document.getElementById('contributors-list')?.scrollIntoView({ behavior: 'smooth' })}>
                {/* Creator */}
                <div key={authorID} className="w-10 h-10 rounded-full border-2 border-theme-parchment bg-theme-clay flex items-center justify-center text-xs font-bold text-white shadow-sm z-20 relative" title={`${authorName} (Creator)`}>
                  {authorName?.substring(0, 2).toUpperCase()}
                </div>
                {/* Co-contributors (up to 3) */}
                {coContributors.slice(0, 3).map((c, i) => (
                  <div key={c.userId} className={`w-10 h-10 rounded-full border-2 border-theme-parchment bg-theme-accent flex items-center justify-center text-xs font-bold text-white shadow-sm relative`} style={{ zIndex: 19 - i }} title={`${c.name} (${c.role})`}>
                    {c.name?.substring(0, 2).toUpperCase()}
                  </div>
                ))}
                {coContributors.length > 3 && (
                  <div className="w-10 h-10 rounded-full border-2 border-theme-parchment bg-theme-surface-high flex items-center justify-center text-[10px] font-bold text-theme-on-surface/60 shadow-sm z-10 relative">
                    +{coContributors.length - 3}
                  </div>
                )}
              </div>
              <div className="text-sm text-theme-on-surface/70">
                <span className="block font-bold text-theme-forest">
                  {authorName} {coContributors.length > 0 && <span className="text-theme-on-surface/50 font-normal">and {coContributors.length} other{coContributors.length > 1 ? 's' : ''}</span>}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-theme-on-surface/50">Verified Authorship</span>
              </div>
            </div>
            <div className="font-mono text-xs text-theme-on-surface/50 uppercase tracking-widest">
              Published {new Date(piece.createdAt).toLocaleDateString()} • Secured on the Blockchain & Published to the Community Library
            </div>
          </header>

          <article className="max-w-none font-serif text-lg leading-relaxed text-theme-forest/90">
            {isContentLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-theme-outline/10 rounded w-full"></div>
                <div className="h-4 bg-theme-outline/10 rounded w-5/6"></div>
                <div className="h-4 bg-theme-outline/10 rounded w-4/6"></div>
              </div>
            ) : isContentError ? (
              <div className="p-12 bg-theme-surface-low border border-theme-outline/10 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-theme-clay/10 rounded-full flex items-center justify-center text-theme-accent">
                  <Bookmark size={32} />
                </div>
                <h3 className="font-serif text-2xl text-theme-forest">Content Temporarily Unavailable</h3>
                <p className="text-theme-on-surface/60 max-w-md mx-auto">
                  This piece is secured on-chain, but the underlying content could not be retrieved from the decentralized storage network right now. Please try again later.
                </p>
              </div>
            ) : content ? (
              <div className="max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({...props}) => <h1 className="font-serif text-4xl text-theme-forest mt-10 mb-6 font-bold leading-tight" {...props} />,
                    h2: ({...props}) => <h2 className="font-serif text-3xl text-theme-forest mt-8 mb-5 font-bold leading-tight" {...props} />,
                    h3: ({...props}) => <h3 className="font-serif text-2xl text-theme-forest mt-6 mb-4 font-bold leading-snug" {...props} />,
                    p: ({...props}) => <p className="text-theme-on-surface/90 leading-loose my-5" {...props} />,
                    ul: ({...props}) => <ul className="list-disc list-outside ml-6 space-y-2 my-5 text-theme-on-surface/90" {...props} />,
                    ol: ({...props}) => <ol className="list-decimal list-outside ml-6 space-y-2 my-5 text-theme-on-surface/90" {...props} />,
                    li: ({...props}) => <li className="leading-relaxed" {...props} />,
                    a: ({...props}) => <a className="text-theme-accent underline decoration-theme-accent/30 hover:decoration-theme-accent transition-colors font-medium" {...props} />,
                    blockquote: ({...props}) => <blockquote className="border-l-4 border-theme-clay pl-6 italic my-8 text-theme-on-surface/80 bg-theme-surface-low/30 py-3 rounded-r-lg" {...props} />,
                    code: ({className, children, ...props}) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match && !className;
                      return isInline ? (
                        <code className="bg-theme-surface-low text-theme-accent font-mono px-1.5 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-theme-surface-low text-sm font-mono p-5 rounded-xl border border-theme-outline/20 my-6 overflow-x-auto shadow-sm">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    // eslint-disable-next-line @next/next/no-img-element
                    img: ({...props}) => <img className="rounded-2xl shadow-md max-w-full h-auto my-8 border border-theme-outline/10 mx-auto" {...props} alt={props.alt || 'Artifact Image'} />,
                    hr: ({...props}) => <hr className="border-t border-theme-outline/20 my-10" {...props} />
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
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
          {/* we dont support analytics yet! */}
          {/* <TexturedCard patternId={3} className="bg-theme-parchment rounded-2xl p-6 border border-theme-outline/20 shadow-sm">
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
          </TexturedCard> */}

          {/* Contributors List */}
          <div id="contributors-list">
            <TexturedCard patternId={1} className="bg-theme-surface-low rounded-2xl p-6 border border-theme-outline/20">
              <h3 className="font-sans uppercase tracking-widest text-xs font-bold text-theme-accent mb-6 flex items-center gap-2">
                <Users size={16} /> Contributors
              </h3>
  
              <div className="space-y-4">
                {contributors.map((c) => (
                  <div key={c.userId} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-theme-outline/10 shadow-sm">
                    <div className="w-10 h-10 rounded-full border-2 border-theme-parchment bg-theme-clay flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                      {c.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-theme-forest truncate">{c.name}</h4>
                      <p className="text-xs text-theme-on-surface/60 truncate">{c.role} • {c.weight}%</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-theme-outline/10">
                <p className="text-xs text-theme-on-surface/70 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  Cryptographically signed and verified by all contributors on the blockchain.
                </p>
              </div>
            </TexturedCard>
          </div>

        </div>
      </div>
    </AppPageContainer>
  );
}
