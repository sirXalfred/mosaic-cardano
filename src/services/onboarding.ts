import { OnboardingRequest } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "./api";
import { API } from "@/lib/api-routes";
import { NICHES } from '@/lib/data';


type OnboardingPayload = Omit<OnboardingRequest, 'userId'>;

const setOnboardingInfo = async (data: OnboardingPayload) => {
    return fetchAPI(API.ONBOARDING.SET_INFO, {
        data,
        method: 'POST'
    });
}

export const useSetOnboardingInfo = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: setOnboardingInfo,
        onSuccess: () => {
            // optimistic update
            queryClient.setQueryData(['authState'], (old: unknown) => {
                const oldState = old as { user?: { isOnboarded?: boolean } };
                if (!oldState) return oldState;
                return {
                    ...oldState,
                    user: {
                        ...oldState.user,
                        isOnboarded: true
                    }
                };
            });
            // invalidate authstate
            queryClient.invalidateQueries({
                queryKey: ['authState']
            });
        }
    });
}

export const getAIOnboardingInsights = async (text: string) => {
    const res = await fetchAPI(API.ONBOARDING.INSIGHTS, {
        method: 'POST',
        data: { text }
    });

    // normalize to the shape expected by OnboardingView
    // existing UI expects { suggested_niche_ids?: string[] }
    const insights: { suggested_niche_ids?: string[]; skills?: string[] } = res ?? {};
    if (insights.suggested_niche_ids) return insights;

    // if backend returned skills, map them into suggested_niche_ids (best-effort)
    if (insights.skills && Array.isArray(insights.skills)) {
        // try to map skill tokens to NICHES ids by label matching
        const n = NICHES ?? [];
        const found: string[] = [];
        for (const s of insights.skills) {
            const match = n.find((x: { id: string; label?: string }) => x.id === s || x.label?.toLowerCase().includes(s));
            if (match) found.push(match.id);
        }
        return { suggested_niche_ids: found };
    }

    return {};
}