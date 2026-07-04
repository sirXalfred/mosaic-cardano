import { useMutation, useQueryClient, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchAPI } from './api';

export interface DocumentDetails {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  status: string;
}

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { title: string, content?: string }) => {
        const res = await fetchAPI('/api/documents', {
        method: 'POST',
        data
      });
      return res as { id: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDocuments'] });
    }
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId, updates }: { documentId: string, updates: Partial<DocumentDetails> }) => {
      await fetchAPI(`/api/documents/${documentId}`, {
        method: 'PUT',
        data: updates,
      });
      return documentId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentDetails', variables.documentId] });
      queryClient.invalidateQueries({ queryKey: ['userDocuments'] });
    }
  });
};

export const usePublishDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId, communityId }: { documentId: string, communityId: string }) => {
      const res = await fetchAPI(`/api/documents/${documentId}/publish`, {
        method: 'POST',
        data: { communityId },
      });
      return res as { success: boolean, pieceId: string };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentDetails', variables.documentId] });
      queryClient.invalidateQueries({ queryKey: ['userDocuments'] });
      // Invalidate badges as publishing a piece may award one!
      queryClient.invalidateQueries({ queryKey: ['userBadges'] });
    }
  });
};

export const useGetDocumentDetails = (documentId: string | null) => {
  return useQuery({
    queryKey: ['documentDetails', documentId],
    queryFn: async () => {
      if (!documentId || documentId === 'new') return null;
      const res = await fetchAPI(`/api/documents/${documentId}`);
      return res as DocumentDetails;
    },
    enabled: !!documentId && documentId !== 'new'
  });
};

export const useGetUserDocuments = () => {
  return useInfiniteQuery({
    queryKey: ['userDocuments'],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 20;
      const offset = pageParam;
      const data = await fetchAPI(`/api/documents?limit=${limit}&offset=${offset}`);
      return data as { data: DocumentDetails[], nextOffset: number | null };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
};
