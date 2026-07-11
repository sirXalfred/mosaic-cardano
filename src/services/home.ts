import { API } from '@/lib/api-routes';
import {
  ACTION_ITEM_TYPE_LABELS,
  HOME_QUERY_KEYS,
  parseHomeActionItems,
  parseHomeActiveProjects,
  parseHomeCommunityUpdates,
  parseSavedItems,
} from '@/lib/home';
import { useXQuery } from '@/lib/extended-react-query';
import { fetchAPI } from './api';

export interface HomeActionItem {
  id: string;
  type: 'INVITE' | 'MENTION' | 'PROJECT_UPDATE';
  title: string;
  description: string;
  timestamp: string;
  source: string;
  link: string;
}

export interface HomeProjectSummary {
  id: string;
  title: string;
  community: string;
  description: string;
  progress: number;
  lastActivity: string;
  collaborators: string[];
  link: string;
}

export interface HomeCommunityUpdate {
  id: string;
  type: 'governance' | 'discussion' | 'treasury' | string;
  community: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
  link: string;
}

export interface SavedItemSummary {
  id: string;
  title: string;
  type: string;
  author: string;
  link: string;
}

type ApiListResponse<T> = {
  items?: T[];
  data?: T[];
  results?: T[];
};

const unwrapList = <T>(payload: unknown): T[] => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const typedPayload = payload as ApiListResponse<T>;
  return typedPayload.items ?? typedPayload.data ?? typedPayload.results ?? [];
};

const fetchHomeItems = async <T>(url: string): Promise<T[]> => {
  const res = await fetchAPI(url);
  return unwrapList<T>(res);
};

export const useGetActionItems = () => {
  return useXQuery({
    queryKey: HOME_QUERY_KEYS.ACTION_ITEMS,
    queryFn: async () => parseHomeActionItems({
      items: await fetchHomeItems(API.HOME.ACTION_ITEMS),
    }),
  });
};

export const getActionItemLabel = (type: HomeActionItem['type']) => {
  return ACTION_ITEM_TYPE_LABELS[type] ?? type;
};

export const useGetActiveProjects = () => {
  return useXQuery({
    queryKey: HOME_QUERY_KEYS.ACTIVE_PROJECTS,
    queryFn: async () => parseHomeActiveProjects({
      items: await fetchHomeItems(API.HOME.ACTIVE_PROJECTS),
    }),
  });
};

export const useGetCommunityUpdates = () => {
  return useXQuery({
    queryKey: HOME_QUERY_KEYS.COMMUNITY_UPDATES,
    queryFn: async () => parseHomeCommunityUpdates({
      items: await fetchHomeItems(API.HOME.COMMUNITY_UPDATES),
    }),
  });
};

export const useGetSavedItems = () => {
  return useXQuery({
    queryKey: HOME_QUERY_KEYS.SAVED_ITEMS,
    queryFn: async () => parseSavedItems({
      items: await fetchHomeItems(API.HOME.SAVED_ITEMS),
    }),
  });
};

export const useGetPendingSignatures = () => {
  return useXQuery({
    queryKey: HOME_QUERY_KEYS.PENDING_SIGNATURES,
    queryFn: async () => {
      return await fetchHomeItems<{ id: string, title: string, community: string, link: string }>(API.HOME.PENDING_SIGNATURES);
    },
  });
};
