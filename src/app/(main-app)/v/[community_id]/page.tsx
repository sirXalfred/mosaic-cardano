"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams, usePathname, useRouter } from 'next/navigation';
import {
  ChevronRightIcon,
  CheckCircle
} from 'lucide-react';
import { useGetExploreItem } from '@/services/explore';
import {
  useGetVillageDetails,
  useGetVillageFeaturedWorks,
  useGetVillageMembers
} from '@/services/villages';
import { ROUTES } from '@/lib/routes';
import NotFound from '@/components/layout/NotFound';
import { PageError } from '@/components/ui/PageError';
import { Button } from '@/components/ui/button';
import { CloseButton } from '@/components/ui/close-button';

export default function CommunityPublicProfile() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const communityId = params?.community_id as string;
  const focusId = searchParams?.get('focus_id');

  // Load focused item using React Query hook
  const { data: focusedItem, isLoading: isLoadingFocusedItem } = useGetExploreItem(focusId);

  // Load village profile data using React Query hooks
  const { data: villageDetails, isError: isVillageError, is404Error: isVillage404Error, error: villageError, isLoading: isLoadingDetails } = useGetVillageDetails(communityId);
  const { data: featuredWorks, isLoading: isLoadingWorks } = useGetVillageFeaturedWorks(communityId);
  const { data: members, isLoading: isLoadingMembers } = useGetVillageMembers(communityId);

  // Function to dismiss the modal overlay
  const handleCloseModal = () => {
    router.push(pathname);
  };


  if (isVillage404Error) {
    return <NotFound />;
  }

  if (isVillageError) {
    return <PageError title="Error Loading Village" description="Failed to load village." errorMessage={villageError?.message} />;
  }


  return (
    <div className="w-full min-h-screen pb-24 relative">

      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[400px] flex flex-col items-center justify-center text-center px-6 border-b border-theme-outline/20">
        <div className="absolute inset-0 bg-theme-parchment/50 backdrop-blur-sm z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 w-full">
          {isLoadingDetails ? (
            <div className="space-y-6 animate-pulse flex flex-col items-center">
              <div className="w-24 h-24 rounded-xl bg-theme-outline/20"></div>
              <div className="h-12 w-64 bg-theme-outline/20 rounded"></div>
              <div className="h-6 w-96 bg-theme-outline/20 rounded"></div>
            </div>
          ) : (
            <>
              <div className="w-24 h-24 mx-auto rounded-xl flex items-center justify-center font-serif text-4xl text-theme-parchment shadow-2xl mb-8 transform rotate-3 overflow-hidden bg-theme-surface-high border border-theme-outline/20 relative">
                {villageDetails?.profileImageUrl ? (
                <Image
                    src={villageDetails.profileImageUrl} 
                    alt={villageDetails.name || 'Village'} 
                    fill 
                    className="object-cover" 
                    unoptimized 
                  />
                ) : (
                  <div className="w-full h-full bg-theme-clay flex items-center justify-center">
                    {villageDetails?.name ? villageDetails.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                )}
              </div>
              <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight capitalize">
                {villageDetails?.name || communityId.replace(/-/g, ' ')}
              </h1>
              <p className="font-sans text-lg md:text-xl text-theme-on-surface/80 max-w-2xl mx-auto leading-relaxed">
                {villageDetails?.description || 'A digital cultural institution dedicated to archiving local histories.'}
              </p>
            </>
          )}
          <div className="pt-8 flex items-center justify-center gap-6">
            {!villageDetails?.isMember && (
              <Button>
                Join
              </Button>
            )}

            <Button asChild variant="outline">
              <Link href={ROUTES.STUDIO}>
                View Open Works
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-20 grid grid-cols-1 md:grid-cols-12 gap-16">

        {/* Left Column: Works */}
        <div className="md:col-span-8">
            <div className="flex items-center justify-between border-b border-theme-outline/20 pb-4 mb-8">
              <h3 className="font-sans text-xs uppercase tracking-widest text-theme-accent font-bold">Featured Works</h3>

              <Link href={ROUTES.VILLAGE.LIBRARY(communityId)} className="text-theme-forest font-bold uppercase tracking-widest text-xs flex items-center gap-1 hover:underline underline-offset-4 transition-all">
                View Archive <ChevronRightIcon size={14} />
              </Link>
            </div>

            {isLoadingWorks ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-48 bg-theme-surface-low border border-theme-outline/20 rounded-xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {featuredWorks?.length === 0 ? (
                  <div className="col-span-1 sm:col-span-2 flex items-center justify-center py-12 border border-dashed border-theme-outline/20 rounded-xl text-theme-on-surface/50 text-sm italic">
                    No featured works have been archived yet.
                  </div>
                ) : (
                  featuredWorks?.map((work) => (
                    <div key={work.id} className="border border-theme-outline/30 p-6 rounded-xl hover:border-theme-clay/50 transition-all hover:shadow-xl hover:-translate-y-1 group flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-theme-forest rounded-full"></span>
                            <span className="text-[10px] uppercase tracking-widest font-sans font-bold">Featured</span>
                          </div>
                          <span className="font-sans text-[10px] text-theme-on-surface/70 bg-theme-surface-low px-2 py-1 rounded border border-theme-outline/20">
                            {work.tags[0]}
                          </span>
                        </div>

                        <h4 className="font-serif text-xl mb-3 group-hover:text-theme-clay transition-colors">{work.title}</h4>
                        <p className="font-sans text-sm leading-relaxed text-theme-on-surface/80 mb-6 line-clamp-3">{work.desc}</p>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full border border-theme-surface-low bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-700">1</div>
                          <div className="w-6 h-6 rounded-full border border-theme-surface-low bg-green-100 flex items-center justify-center text-[8px] font-bold text-green-700">2</div>
                          <div className="w-6 h-6 rounded-full border border-theme-surface-low bg-amber-100 flex items-center justify-center text-[8px] font-bold text-amber-700">3</div>
                          <div className="w-6 h-6 rounded-full border border-theme-surface-low bg-theme-outline/30 flex items-center justify-center text-[8px] font-bold text-theme-on-surface/70">
                            +{work.contributors - 3}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
        </div>

        {/* Right Column: Stats */}
        <div className="md:col-span-4 space-y-12">

          {isLoadingMembers ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-40 bg-theme-outline/20 rounded"></div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-theme-outline/20"></div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-sans text-xs uppercase tracking-widest text-theme-accent mb-6 font-bold">
                Stewards & Members ({villageDetails?.memberCount || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {members?.length === 0 ? (
                  <span className="text-xs text-theme-on-surface/50 italic">No members found.</span>
                ) : (
                  <>
                    {members?.slice(0, 12).map((member: { displayName?: string }, i: number) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-theme-outline/20 border-2 border-theme-surface flex items-center justify-center text-xs font-bold text-theme-forest/50" title={member.displayName}>
                        {member.displayName?.charAt(0).toUpperCase() || (i + 1)}
                      </div>
                    ))}
                    {(members?.length || 0) > 12 && (
                      <div className="w-10 h-10 rounded-full bg-theme-surface-high border-2 border-theme-outline/20 flex items-center justify-center text-xs font-bold text-theme-forest">
                        +{members!.length - 12}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

      </section>


      {/* ==================================================================== */}
      {/* 5. FOCUSED DETAIL OVERLAY MODAL */}
      {/* ==================================================================== */}
      {focusId && (
        <div className="fixed inset-0 bg-theme-forest/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div
            className="bg-theme-parchment border border-theme-outline/35 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoadingFocusedItem ? (
              <div className="p-8 space-y-6 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="h-4 w-20 bg-theme-surface-low rounded"></div>
                    <div className="h-8 w-3/4 bg-theme-surface-low rounded animate-pulse"></div>
                  </div>
                  <div className="h-8 w-8 bg-theme-surface-low rounded-lg"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-theme-surface-low rounded"></div>
                  <div className="h-4 bg-theme-surface-low rounded"></div>
                  <div className="h-4 w-5/6 bg-theme-surface-low rounded"></div>
                </div>
                <div className="h-32 bg-theme-surface-low rounded-xl"></div>
              </div>
            ) : focusedItem ? (
              <>
                {/* Modal Header */}
                <div className="p-6 md:p-8 border-b border-theme-outline/25 flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-theme-clay/15 text-theme-accent text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border border-theme-clay/25">
                        {focusedItem.type}
                      </span>
                      <span className="text-theme-on-surface/50 text-[10px] uppercase font-sans tracking-widest font-bold">
                        {focusedItem.topic}
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl md:text-3xl text-theme-forest leading-tight">
                      {focusedItem.title}
                    </h2>
                    <p className="text-xs text-theme-on-surface/60 font-sans mt-2">
                      Originates from <span className="font-semibold text-theme-forest">{focusedItem.communityName}</span> • Located in <span className="font-semibold">{focusedItem.location}</span>
                    </p>
                  </div>
                  <CloseButton onClick={handleCloseModal} />
                </div>

                {/* Modal Body */}
                <div className="p-6 md:p-8 space-y-6">

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold font-sans text-theme-accent">
                      About this {focusedItem.type}
                    </h4>
                    <p className="font-serif text-base text-theme-on-surface/90 leading-relaxed italic">
                      &quot;{focusedItem.description}&quot;
                    </p>
                  </div>

                  {/* Type-Specific Meta Details */}
                  <div className="bg-theme-surface-low rounded-xl p-5 border border-theme-outline/20 space-y-3 font-sans text-sm">
                    <h5 className="font-sans text-[10px] uppercase tracking-widest font-bold text-theme-forest/70 mb-1">
                      Metadata & Parameters
                    </h5>

                    {focusedItem.type === 'collaboration' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Partner Guilds</p>
                          <p className="font-medium text-theme-forest">{String((focusedItem.details?.partners as string[] | undefined)?.join(' and ') ?? '')}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Timeline</p>
                          <p className="font-medium text-theme-forest">{String(focusedItem.details?.duration ?? '')}</p>
                        </div>
                      </div>
                    )}

                    {focusedItem.type === 'publication' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Author</p>
                          <p className="font-medium text-theme-forest">{String(focusedItem.details?.author ?? '')}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Date Published</p>
                          <p className="font-medium text-theme-forest">{String(focusedItem.details?.publishedDate ?? '')}</p>
                        </div>
                      </div>
                    )}

                    {focusedItem.type === 'community' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Member Count</p>
                          <p className="font-medium text-theme-forest">{String(focusedItem.details?.membersCount ?? '')} active contributors</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Established</p>
                          <p className="font-medium text-theme-forest">{String(focusedItem.details?.activeSince ?? '')}</p>
                        </div>
                      </div>
                    )}

                    {focusedItem.type === 'project' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Stewards Needed</p>
                          <p className="font-medium text-theme-forest">{String((focusedItem.details?.rolesNeeded as string[] | undefined)?.join(', ') ?? '')}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Application Deadline</p>
                          <p className="font-medium text-theme-forest">{String(focusedItem.details?.deadline ?? '')}</p>
                        </div>
                      </div>
                    )}

                    {focusedItem.type === 'residency' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Stipend Allocation</p>
                          <p className="font-medium text-theme-forest font-mono">{String(focusedItem.details?.stipend ?? '')}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Program Duration</p>
                          <p className="font-medium text-theme-forest">{String(focusedItem.details?.duration ?? '')}</p>
                        </div>
                      </div>
                    )}

                    {focusedItem.type === 'collection' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Curator / Steward</p>
                          <p className="font-medium text-theme-forest">{String(focusedItem.details?.curator ?? '')}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Archived Materials</p>
                          <p className="font-medium text-theme-forest">{String(focusedItem.details?.totalArtifacts ?? '')} records</p>
                        </div>
                      </div>
                    )}

                    {focusedItem.type === 'funded' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Funding Disbursed</p>
                          <p className="font-medium text-theme-forest font-mono">{String(focusedItem.details?.fundingAmount ?? '')}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Consensus Date</p>
                          <p className="font-medium text-theme-forest">{String(focusedItem.details?.dateApproved ?? '')}</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Visibility Level</p>
                        <p className="font-medium text-theme-forest">{String(focusedItem.visibility ?? '')}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-theme-on-surface/60 uppercase tracking-wider">Format</p>
                        <p className="font-medium text-theme-forest">{String(focusedItem.format ?? '')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Jargon-free Verification & Trust Details */}
                  <div className="border border-theme-outline/25 rounded-xl p-4 bg-theme-parchment space-y-2.5">
                    <h5 className="text-[10px] uppercase tracking-widest font-bold text-theme-accent">
                      Security & Integrity Record
                    </h5>
                    <div className="space-y-1.5 text-xs text-theme-on-surface/75">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-700 shrink-0" />
                        <span>Verified Author Credentials: Securely signed by the author&apos;s key.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-700 shrink-0" />
                        <span>Communal Consensus: Approved by community steward review.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-700 shrink-0" />
                        <span>Permanent History: Immutable record written to the public registry.</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Modal Actions */}
                <div className="p-6 md:p-8 bg-theme-surface-low border-t border-theme-outline/25 rounded-b-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <span className="text-[10px] text-theme-on-surface/50 font-sans tracking-tight">
                    * Note: Action details will be securely logged in your local history logs.
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCloseModal}
                      className="bg-transparent border border-theme-outline/30 text-theme-forest px-5 py-3 rounded-lg text-xs uppercase tracking-widest font-bold font-sans hover:bg-theme-surface-high transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => alert(`Simulating action: Joining/Contributing to "${focusedItem.title}"`)}
                      className="bg-theme-forest text-theme-parchment px-6 py-3 rounded-lg text-xs uppercase tracking-widest font-bold font-sans hover:opacity-90 transition-opacity shadow-md cursor-pointer"
                    >
                      {focusedItem.type === 'project' ? 'Submit Contribution' :
                        focusedItem.type === 'residency' ? 'Submit Application' :
                          focusedItem.type === 'publication' ? 'Read Document' : 'Join Action'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center space-y-4">
                <h3 className="font-serif text-lg text-theme-forest">Collection Item Not Found</h3>
                <p className="text-sm text-theme-on-surface/60">The item could not be retrieved from the commons registry.</p>
                <button
                  onClick={handleCloseModal}
                  className="bg-theme-forest text-theme-parchment px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-bold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
