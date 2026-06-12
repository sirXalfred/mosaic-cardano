import { API } from '@/lib/api-routes';
import {
  MOCK_FEATURED_ARTIFACTS,
  MOCK_VILLAGE_NEEDS,
  MOCK_VILLAGE_PROJECTS,
  MOCK_VILLAGE_STREAM,
  MOCK_VILLAGE_TIMELINE,
} from '@/data/mock';
import { useXQuery } from '@/lib/extended-react-query';
import { fetchAPI } from './api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export interface VillageDetail {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  treasuryBalance: string;
  isMember: boolean;
  isCreator?: boolean;
  role?: string;
  profileImageUrl?: string | null;
}

export interface VillageSettings extends VillageDetail {
  isPublic?: boolean;
}

export interface VillageActivity {
  id: string;
  type: string;
  description: string;
  createdAt: number;
  role?: string | null;
}

export interface VillageSummary {
  id: string;
  name: string;
  description?: string;
  profileImageUrl?: string | null;
  memberCount?: number;
  icon?: string;
}

export interface VillageFeaturedWork {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  contributors: number;
}

export interface VillageTreasury {
  balance: string;
  recentAllocations: { label: string; amount: string }[];
}

export interface VillageMember {
  id: string;
  displayName: string;
  role?: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const mapVillageToCard = (village: VillageSummary) => ({
  id: village.id,
  name: village.name,
  desc: village.description ?? '',
  members: village.memberCount ?? 0,
  icon: village.icon ?? '🏛️',
});

const unwrapVillageList = <T>(response: unknown): T[] => {
  if (!response || typeof response !== 'object') {
    return [];
  }

  const typedResponse = response as { items?: T[]; data?: T[]; results?: T[] };
  return typedResponse.items ?? typedResponse.data ?? typedResponse.results ?? [];
};

const fetchVillageList = async <T>(url: string): Promise<T[]> => {
  const response = await fetchAPI(url);
  return unwrapVillageList<T>(response);
};

const fetchFeaturedVillageCards = async () => {
  const items = await fetchVillageList<VillageSummary>(API.VILLAGE.LIST);
  return items.map(mapVillageToCard);
};

// --- Hooks ---
export const useGetVillageDetails = (id: string) => {
  return useXQuery<VillageDetail | null>({
    queryKey: ['villageDetails', id],
    queryFn: async () => {
      return fetchAPI(API.VILLAGE.DETAILS(id)) as Promise<VillageDetail | null>;
    }
  });
};

export const useGetVillageSettings = (id: string) => {
  return useXQuery<VillageSettings | null>({
    queryKey: ['villageSettings', id],
    queryFn: async () => {
      return fetchAPI(API.VILLAGE.SETTINGS(id)) as Promise<VillageSettings | null>;
    }
  });
};

export const useUpdateVillageSettings = (communityId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { description?: string; logoUrl?: string; isPublic?: boolean }) => {
      return fetchAPI(API.VILLAGE.SETTINGS(communityId), {
        method: 'PATCH',
        data: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['villageSettings', communityId] });
      queryClient.invalidateQueries({ queryKey: ['villageDetails', communityId] });
      queryClient.invalidateQueries({ queryKey: ['villageActivityLog', communityId] });
    }
  });
};

export const useGetVillageProjects = () => {
  return useXQuery({
    queryKey: ['villageProjects'],
    queryFn: async () => {
      await delay(800);
      return MOCK_VILLAGE_PROJECTS;
    }
  });
};

export const addMockVillageProject = (project: { id: string, title: string, description: string, progress: number, contributors: number }) => {
  MOCK_VILLAGE_PROJECTS.unshift(project);
};

export const useGetVillageStream = () => {
  return useXQuery({
    queryKey: ['villageStream'],
    queryFn: async () => {
      await delay(1000);
      return MOCK_VILLAGE_STREAM;
    }
  });
};

export const useGetVillageNeeds = () => {
  return useXQuery({
    queryKey: ['villageNeeds'],
    queryFn: async () => {
      await delay(600);
      return MOCK_VILLAGE_NEEDS;
    }
  });
};

export const useGetVillageTimeline = () => {
  return useXQuery({
    queryKey: ['villageTimeline'],
    queryFn: async () => {
      await delay(500);
      return MOCK_VILLAGE_TIMELINE;
    }
  });
};

export const useGetFeaturedVillages = () => {
  return useXQuery({
    queryKey: ['featuredVillages'],
    queryFn: fetchFeaturedVillageCards,
  });
}

export const useGetMyVillages = (enabled = true) => {
  return useXQuery({
    queryKey: ['myVillages'],
    queryFn: () => fetchVillageList<VillageSummary>(API.VILLAGE.MY),
    enabled,
  });
};

export const useCreateVillage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; description: string; tags: string[] }) => {
      return fetchAPI('/api/villages', {
        method: 'POST',
        data: data,
      }) as Promise<{ id: string }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featuredVillages'] });
      queryClient.invalidateQueries({ queryKey: ['myVillages'] });
    }
  });
};

export const useGetFeaturedArtifacts = () => {
  return useXQuery({
    queryKey: ['featuredArtifacts'],
    queryFn: async () => {
      await delay(700);
      return [...MOCK_FEATURED_ARTIFACTS];
    }
  });
};

export const useGetVillageFeaturedWorks = (villageId: string) => {
  return useXQuery<VillageFeaturedWork[]>({
    queryKey: ['villageFeaturedWorks', villageId],
    queryFn: async () => {
      return fetchAPI(`/api/villages/${villageId}/works`) as Promise<VillageFeaturedWork[]>;
    }
  });
};

export const useGetVillageTreasuryAllocations = (villageId: string) => {
  return useXQuery<VillageTreasury>({
    queryKey: ['villageTreasuryAllocations', villageId],
    queryFn: async () => {
      return fetchAPI(`/api/villages/${villageId}/treasury`) as Promise<VillageTreasury>;
    }
  });
};

export const useGetVillageMembers = (villageId: string) => {
  return useXQuery<VillageMember[]>({
    queryKey: ['villageMembers', villageId],
    queryFn: async () => {
      return fetchAPI(API.VILLAGE.MEMBERS(villageId)) as Promise<VillageMember[]>;
    }
  });
};

export const useGetVillageActivityLog = (villageId: string) => {
  return useXQuery<VillageActivity[]>({
    queryKey: ['villageActivityLog', villageId],
    queryFn: async () => {
      return fetchAPI(API.VILLAGE.ACTIVITY_LOG(villageId)) as Promise<VillageActivity[]>;
    }
  });
};


export const useShareInvite = (communityId: string) => {
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [error, setError] = useState('');
  const isError = !!error;

  const shareInvite = async () => {
    if (isGeneratingInvite) return;
    setIsGeneratingInvite(true);
    setError('');

    try {
      const res = await fetchAPI(API.INVITES.CREATE, {
        method: 'POST',
        data: { communityId },
      }) as { hash: string };

      const inviteUrl = `${window.location.origin}/invite/${res.hash}?villageId=${communityId}`;
      await navigator.clipboard.writeText(inviteUrl);

      return inviteUrl;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  return {
    shareInvite,
    isGeneratingInvite,
    error,
    isError
  }
};