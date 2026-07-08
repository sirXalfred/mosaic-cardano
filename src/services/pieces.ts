import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from './api';
import { MOCK_FEATURED_ARTIFACTS } from '@/data/mock';

export interface FeaturedPiece {
  id: string;
  title: string;
  type: string;
  community: string;
  description: string;
}

import { PieceDetails } from '@/types/mosaic';
export type { PieceDetails };

export const useGetFeaturedPieces = (limit = 5) => {
  return useQuery({
    queryKey: ['featuredPieces', limit],
    queryFn: async () => {
      const data = await fetchAPI(`/api/explore/featured-pieces?limit=${limit}`) as unknown as { items: FeaturedPiece[] };
      return data.items;
    },
    select: (data) => {
      if (!data?.length) return MOCK_FEATURED_ARTIFACTS
      return data;
    },
  });
};

export const useGetPieceDetails = (id: string) => {
  return useQuery({
    queryKey: ['pieceDetails', id],
    queryFn: async () => {
      const data = await fetchAPI(`/api/pieces/${id}`) as unknown as { piece: PieceDetails };
      return data.piece;
    },
    enabled: !!id,
  });
};
