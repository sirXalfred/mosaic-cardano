import { useMutation, useQueryClient, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchAPI } from './api';

import { DocumentDetails } from '@/types/mosaic';
import { resolveIPFSUri } from '@/lib/ipfs';
import { DocumentComment } from './projects';

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

export const useFreezeContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId, communityId }: { documentId: string, communityId: string }) => {
      const res = await fetchAPI(`/api/documents/${documentId}/freeze`, {
        method: 'POST',
        data: { communityId },
      });
      return res as { success: boolean, contentUrl: string };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentDetails', variables.documentId] });
      toast.success('Document content frozen to IPFS');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to freeze document');
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['userBadges'] });
      toast.success('Document published successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to publish document');
    }
  });
};

export const useInviteContributor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId, username }: { documentId: string, username: string }) => {
      await fetchAPI(`/api/documents/${documentId}/contributors`, {
        method: 'POST',
        data: { action: 'invite', username },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentDetails', variables.documentId] });
      toast.success('Contributor invited successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to invite contributor');
    }
  });
};

export const useProposeSplits = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId, splits }: { documentId: string, splits: { userId: string, role: string, weight: number }[] }) => {
      await fetchAPI(`/api/documents/${documentId}/contributors`, {
        method: 'POST',
        data: { action: 'propose', splits },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentDetails', variables.documentId] });
      toast.success('Splits proposed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to propose splits');
    }
  });
};

export const useSignContribution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId, signatureHash, walletAddress }: { documentId: string, signatureHash: string, walletAddress: string }) => {
      await fetchAPI(`/api/documents/${documentId}/sign`, {
        method: 'POST',
        data: { signatureHash, walletAddress },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentDetails', variables.documentId] });
      toast.success('Contribution signed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sign contribution');
    }
  });
};

export const useGetDocumentDetails = (documentId: string | null, initialData?: DocumentDetails | null) => {
  const docQuery = useQuery({
    queryKey: ['documentDetails', documentId],
    queryFn: async () => {
      if (!documentId || documentId === 'new') return null;
      return await fetchAPI(`/api/documents/${documentId}`) as DocumentDetails;
    },
    enabled: !!documentId && documentId !== 'new' && !initialData,
    initialData: initialData,
    staleTime: 10 * 1000 // 10 seconds to quickly reflect new status when waiting for others
  });

  const contentQuery = useQuery({
    queryKey: ['documentContent', docQuery.data?.contentUrl],
    queryFn: async () => {
      if (!docQuery.data?.contentUrl) return '';
      const resolvedUrl = resolveIPFSUri(docQuery.data.contentUrl);
      const contentRes = await fetch(resolvedUrl);
      if (!contentRes.ok) throw new Error("Failed to fetch content");
      return await contentRes.text();
    },
    enabled: !!docQuery.data?.contentUrl,
    staleTime: 1000 * 60 * 5 // Cache content for 5 minutes
  });

  const documentWithContent = docQuery.data ? {
    ...docQuery.data,
    contentRaw: contentQuery.data
  } : null;

  return {
    document: documentWithContent,
    isLoading: docQuery.isLoading && !initialData,
    isError: docQuery.isError,
    error: docQuery.error,
    
    isContentLoading: contentQuery.isLoading && contentQuery.fetchStatus !== 'idle',
    isContentLoaded: contentQuery.isSuccess,
    isContentError: contentQuery.isError,
    contentError: contentQuery.error,
    
    refetch: docQuery.refetch
  };
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

export const useGetDocumentComments = (documentId: string) => {
  return useQuery({
    queryKey: ['documentComments', documentId],
    queryFn: async () => {
      if (!documentId || documentId === 'new') return [];
      const res = await fetchAPI(`/api/documents/${documentId}/comments`);
      return (res as { items: DocumentComment[] }).items;
    },
    enabled: !!documentId && documentId !== 'new'
  });
};

export const useAddDocumentComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId, content }: { documentId: string, content: string }) => {
      await fetchAPI(`/api/documents/${documentId}/comments`, {
        method: 'POST',
        data: { content },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentComments', variables.documentId] });
      toast.success('Comment added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add comment');
    }
  });
};
