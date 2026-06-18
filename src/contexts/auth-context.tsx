"use client";

import { useGetAuthState, useLogout } from "@/services/auth";
import { createContext, useContext, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { registerLogout } from "@/lib/logout-handler";

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
    
    const isLogOutTriggeredRef = useRef(false);

    const logout = useCallback(async (isForced = false) => {
        if (isLogOutTriggeredRef.current) return;

        isLogOutTriggeredRef.current = true;

        try {
            await logoutMutation.mutateAsync();
        } catch (err) {
            console.error("Failed to call logout API", err);
        }

        if (isForced) {
            toast.info("Your session has expired, please log back in to continue");
        } else {
            toast.success("You have been logged out successfully");
        }
    }, [logoutMutation]);

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