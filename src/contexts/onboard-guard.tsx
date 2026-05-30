"use client";

import { ROUTES } from "@/lib/routes";
import { AuthGuard } from "./auth-guard";
import { useRouter } from "next/navigation";
import { useGetAuthState } from "@/services/auth";
import { useEffect } from "react";


export const OnboardedGuard = ({ awaitUser, children, loader }: { awaitUser?: boolean; children: React.ReactNode; loader?: React.ReactNode }) => {
    const {data, isLoaded: isLoadedAuthState} = useGetAuthState();
    const router = useRouter();

    useEffect(() => {
        if (isLoadedAuthState && data?.user && !data.user.isOnboarded) {
            router.push(ROUTES.ONBOARDING);
        }
    }, [isLoadedAuthState, data, router]);


    return <AuthGuard awaitUser={awaitUser} loader={loader}> {children} </AuthGuard>;
}