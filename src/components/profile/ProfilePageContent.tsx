"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, Tent } from 'lucide-react';
import { useGetUserProfile, useGetUserPublishedWorks, useGetUserContributions, useGetUserReputation } from '@/services/users';
import MosaicBrand from '@/components/ui/icons/MosaicBrand';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

// Components
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ContributionRecord } from '@/components/profile/ContributionRecord';
import { PublishedWorks } from '@/components/profile/PublishedWorks';
import { ReputationSidebar } from '@/components/profile/ReputationSidebar';

export const ProfilePageContent = ({ username }: { username: string }) => {
    const [showFullPassport, setShowFullPassport] = useState(false);

    const { data: works, isLoading: isLoadingWorks } = useGetUserPublishedWorks(username);
    const { data: profile, isLoading: isLoadingProfile } = useGetUserProfile(username);
    const { data: contributions, isLoading: isLoadingContributions } = useGetUserContributions(username);
    const { data: reputation, isLoading: isLoadingReputation } = useGetUserReputation(username);

    return (
        <div className="min-h-screen bg-theme-parchment text-theme-forest flex flex-col font-sans">

            {/* Navbar */}
            <nav className="w-full z-[60] px-6 py-6 flex justify-between items-center bg-theme-parchment/80 backdrop-blur-md border-b border-theme-outline/10 sticky top-0">
                <div className="flex items-center gap-6">
                    <MosaicBrand size="medium" />
                    <Link href="/" className="flex items-center gap-2 text-theme-forest/60 hover:text-theme-forest transition-colors text-xs font-bold uppercase tracking-widest hidden sm:flex">
                        <ArrowLeft size={16} /> Return Home
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 md:py-24 space-y-16">

                {/* Core Overview (Visual Hierarchy: High Impact, Low Text) */}
                <div className="bg-theme-surface-high/50 border border-theme-outline/10 rounded-3xl p-8 md:p-12 shadow-sm">
                    <ProfileHeader profile={profile} isLoading={isLoadingProfile} />

                    {/* Quick Glances: Top Badges & Communities */}
                    {!isLoadingReputation && reputation && (
                        <div className="mt-12 pt-8 border-t border-theme-outline/10 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-theme-on-surface/50 mb-4">Latest Honors</h4>
                                <div className="flex gap-3">
                                    {reputation.badges.slice(0, 3).map((badge) => (
                                        <div key={badge.id} className="flex items-center gap-2 bg-theme-surface px-3 py-2 rounded-xl border border-theme-outline/20" title={badge.name}>
                                            <span className="text-2xl">{badge.icon}</span>
                                            <span className="font-serif font-bold text-sm">{badge.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-theme-on-surface/50 mb-4">Active In</h4>
                                <div className="flex flex-wrap gap-2">
                                    {reputation.communities.slice(0, 3).map((comm) => (
                                        <Link key={comm.id} href={`/v/${comm.id}`} className="flex items-center gap-1.5 px-3 py-2 bg-theme-surface hover:bg-theme-outline/5 border border-theme-outline/20 rounded-xl transition-colors">
                                            <Tent size={14} className="text-theme-clay" />
                                            <span className="font-sans text-sm font-bold">{comm.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Expand Toggle */}
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        size="lg"
                        className="font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-theme-outline/5"
                        onClick={() => setShowFullPassport(!showFullPassport)}
                    >
                        {showFullPassport ? (
                            <><ChevronUp size={16} /> Close Passport Archive</>
                        ) : (
                            <><ChevronDown size={16} /> View Full Passport</>
                        )}
                    </Button>
                </div>

                {/* Expanded Full Passport */}
                {showFullPassport && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-top-4 duration-500 pb-20">
                        <div className="lg:col-span-8 space-y-16">
                            <PublishedWorks works={works} isLoading={isLoadingWorks} />
                            <ContributionRecord contributions={contributions} isLoading={isLoadingContributions} />
                        </div>
                        <div className="lg:col-span-4">
                            <ReputationSidebar reputation={reputation} isLoading={isLoadingReputation} />
                        </div>
                    </div>
                )}

            </main>

            <Footer />
        </div>
    )
}
