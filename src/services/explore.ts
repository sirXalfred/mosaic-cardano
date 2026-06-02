import { API } from '@/lib/api-routes';
import { useXQuery } from '@/lib/extended-react-query';
import { fetchAPI } from './api';
import { parseExploreItem, parseExploreList, type ExplorePageResponse, type NormalizedExploreItem } from '@/lib/explore';

export type ExploreItem = NormalizedExploreItem;

export type ExploreQueryFilters = {
  search?: string;
  topic?: string;
  location?: string;
  visibility?: string;
  activityLevel?: string;
};

const fetchExplorePage = async (queryString = ''): Promise<ExplorePageResponse> => {
  const url = queryString ? `${API.EXPLORE.LIST}?${queryString}` : API.EXPLORE.LIST;
  const response = await fetchAPI(url);
  const items = parseExploreList(response as unknown);
  const meta = typeof response === 'object' && response && 'meta' in response
    ? (response as ExplorePageResponse).meta
    : { hasMore: false, nextOffset: items.length, pageSize: items.length };

  return { items, meta };
};

export const useGetExploreListings = () => {
  return useXQuery({
    queryKey: ['exploreListings'],
    queryFn: async () => (await fetchExplorePage()).items,
  });
};

export const useGetExploreItems = (filters: ExploreQueryFilters = {}, tab: string = 'all', offset = 0) => {
  return useXQuery({
    queryKey: ['exploreItems', filters, tab, offset],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
      });
      if (tab && tab !== 'all') {
        params.set('tab', tab);
      }
      if (offset > 0) {
        params.set('offset', String(offset));
      }
      return fetchExplorePage(params.toString());
    }
  });
};

export const useGetCuratedExplore = () => {
  return useXQuery({
    queryKey: ['exploreCurated'],
    queryFn: async () => {
      return (await fetchExplorePage('curated=true')).items;
    }
  });
};

export const useGetExploreItem = (id: string | null) => {
  return useXQuery({
    queryKey: ['exploreItem', id],
    queryFn: async () => {
      if (!id) return null;
      const resp = await fetchAPI(`${API.EXPLORE.LIST}/${id}`);
      const item = (resp as { item?: unknown })?.item;
      return item ? parseExploreItem(item as Record<string, string>) : null;
    },
    enabled: !!id
  });
};
