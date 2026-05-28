"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Tent } from 'lucide-react';
import { useGetUserProfile, useGetUserPublishedWorks, useGetUserContributions, useGetUserReputation } from '@/services/users';
import { Button } from '@/components/ui/button';

// Components
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ContributionRecord } from '@/components/profile/ContributionRecord';
import { PublishedWorks } from '@/components/profile/PublishedWorks';
import { ReputationSidebar } from '@/components/profile/ReputationSidebar';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export const ProfilePageContent = ({ username }: { username: string }) => {
    const [showFullPassport, setShowFullPassport] = useState(false);

    const { data: works, isLoading: isLoadingWorks } = useGetUserPublishedWorks(username);
    const { data: profile, isLoading: isLoadingProfile } = useGetUserProfile(username);
    const { data: contributions, isLoading: isLoadingContributions } = useGetUserContributions(username);
    const { data: reputation, isLoading: isLoadingReputation } = useGetUserReputation(username);

    return (
        <div className="flex-1 space-y-16">
            <div className="border border-theme-outline/10 rounded-3xl p-8 md:p-12">
                <ProfileHeader profile={profile} isLoading={isLoadingProfile} />

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
                                    <Link key={comm.id} href={ROUTES.VILLAGE.HOME(comm.id)} className="flex items-center gap-1.5 px-3 py-2 bg-theme-surface hover:bg-theme-outline/5 border border-theme-outline/20 rounded-xl transition-colors">
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

        </div>
    )
}
