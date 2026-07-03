"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "./auth-guard";
import { useGetVillageMembership } from "@/services/auth";
import { ROUTES } from "@/lib/routes";
import Loading from "@/app/loading";
import { useAuth } from "./auth-context";

const MemberCheck = ({ children, communityId }: { children: React.ReactNode, communityId: string }) => {
    const router = useRouter();
    const { data: membership, isLoaded } = useGetVillageMembership(communityId);
    const { isLoaded: authLoaded } = useAuth();

    useEffect(() => {
        if (!isLoaded || !authLoaded) return;

        if (!membership?.isMember) {
            router.replace(ROUTES.VILLAGE.HOME(communityId));
        }
    }, [isLoaded, authLoaded, membership, router, communityId]);

    // Show loading state until membership check finishes, or if they are not a member (since we redirect)
    if (!isLoaded || !authLoaded || (isLoaded && !membership?.isMember)) {
        return <Loading />;
    }

    return <>{children}</>;
};

export const MemberGuard = ({ children, awaitUser = true }: { children: React.ReactNode, awaitUser?: boolean }) => {
    const params = useParams();
    const communityId = params?.community_id as string | undefined;

    // If there is no community_id in the URL params, just bypass the check
    if (!communityId) {
        return (
            <AuthGuard awaitUser={awaitUser}>
                {children}
            </AuthGuard>
        );
    }

    return (
        <MemberCheck communityId={communityId}>
            {children}
        </MemberCheck>
    );
};
