"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import { ROUTES } from "@/lib/routes";
import { useEffect } from "react";
import { useGetAuthState } from "@/services/auth";
import Loading from "@/app/loading";


export const AuthGuard = ({ awaitUser = true, children, loader }: { awaitUser?: boolean; children: React.ReactNode; loader?: React.ReactNode }) => {
    const { userId, isLoaded } = useAuth();
    const { data: authState } = useGetAuthState();
    const router = useRouter();
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith(ROUTES.AUTH);

    useEffect(() => {
        if (!isLoaded) return;

        if (userId && isAuthPage) {
            const isOnboarded = authState?.user?.isOnboarded;
            router.replace(isOnboarded ? ROUTES.HOME : ROUTES.ONBOARDING);
            return;
        }

        if (!userId && !isAuthPage) {
            router.replace(`${ROUTES.AUTH}?redirect=${pathname}`);
        }

    }, [userId, isAuthPage, pathname, router, isLoaded, authState?.user?.isOnboarded]);

    if (!isLoaded && awaitUser) {
        return loader || <Loading />;
    }

    return <>{children}</>;
}