import { useXQuery } from '@/lib/extended-react-query';
import { fetchAPI } from './api';
import { API } from '@/lib/api-routes';
import type { CommunityNode } from '@/types/schemas';

export const fetchCommunitiesForTopics = async (topics: string[] = [], limit = 10) => {
  const res = await fetchAPI(API.COMMUNITIES.SEARCH, { method: 'POST', data: { topics, limit } });
  return ((res as { communities?: CommunityNode[] } | null)?.communities ?? []) as CommunityNode[];
}

export const useGetCommunitiesForTopics = (topics: string[] | undefined, enabled = true, limit = 10) => {
  return useXQuery({
    queryKey: ['communitiesByTopics', ...(topics ?? []), limit],
    queryFn: () => fetchCommunitiesForTopics(topics ?? [], limit),
    enabled: enabled && Array.isArray(topics),
    staleTime: 120_000,
  });
}

export const useGetPopularCommunities = (limit = 5) => {
  return useXQuery({
    queryKey: ['popularCommunities', limit],
    queryFn: () => fetchCommunitiesForTopics([], limit),
    staleTime: 120_000,
  });
}
