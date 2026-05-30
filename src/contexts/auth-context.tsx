"use client";

import { useGetAuthState, useLogout } from "@/services/auth";
import { createContext, useContext } from "react";


const AuthContext = createContext<{
    userId: string | null;
    isLoaded: boolean;
    logout: () => Promise<void>;
    refetchAuthState: () => void;
}>({
    userId: null,
    isLoaded: false,
    logout: () => Promise.resolve(),
    refetchAuthState: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: authState, refetch, isLoaded } = useGetAuthState();
    const userId = authState?.user?.id || null;
    const logoutMutation = useLogout();

    const logout = async () => {
        await logoutMutation.mutateAsync();
    };

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