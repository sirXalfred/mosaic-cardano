"use client";

import { useGetAuthState, useLogout } from "@/services/auth";
import { createContext, useContext, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { registerLogout } from "@/lib/logout-handler";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

const AuthContext = createContext<{
    userId: string | null;
    isLoaded: boolean;
    logout: () => Promise<void>;
    refetchAuthState: () => void;
}>({
    userId: null,
    isLoaded: false,
    logout: () => Promise.resolve(),
    refetchAuthState: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: authState, refetch, isLoaded } = useGetAuthState();
    const userId = authState?.user?.id || null;
    const logoutMutation = useLogout();
    const router = useRouter();
    
    const isLogOutTriggeredRef = useRef(false);

    const logout = useCallback(async (isForced = false) => {
        if (isLogOutTriggeredRef.current) return;
        if (!authState?.isAuthenticated) {
            return
        };

        isLogOutTriggeredRef.current = true;
        
        // Add to cookie so middleware knows we are logging out
        document.cookie = "mosaic_logging_out=true; path=/; max-age=10";
        
        // Clear wallet persistence
        if (typeof window !== 'undefined') {
            localStorage.removeItem('mosaic_connected_wallet');
            localStorage.removeItem('walletconnect');
            // MeshSDK sometimes stores in other keys but mosaic_connected_wallet is what we use to auto-connect
        }

        const loadingId = toast.loading("Logging out...");

        try {
            await logoutMutation.mutateAsync();
        } catch (err) {
            console.error("Failed to call logout API", err);
            // Even if API fails, delete the token to prevent being stuck
            document.cookie = "mosaic_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }

        toast.dismiss(loadingId);

        if (isForced) {
            toast.info("Your session has expired, please log back in to continue");
        } else {
            router.push(ROUTES.AUTH)
            toast.success("You have been logged out successfully");
            
        }
    }, [logoutMutation, router, authState?.isAuthenticated]);

    useEffect(() => {
        registerLogout(logout);
    }, [logout]);

    useEffect(() => {
        if (authState?.isAuthenticated) {
            isLogOutTriggeredRef.current = false;
        }
    }, [authState?.isAuthenticated])

    return (
        <AuthContext.Provider value={{ userId, isLoaded, logout, refetchAuthState: refetch }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}