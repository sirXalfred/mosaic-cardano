import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationsResponse } from '@/types/api';

export const useGetNotifications = (limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: ['notifications', limit],
    queryFn: async ({ pageParam }) => {
      const url = new URL('/api/notifications', window.location.origin);
      url.searchParams.set('limit', limit.toString());
      if (pageParam) {
        url.searchParams.set('cursor', pageParam);
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json() as Promise<NotificationsResponse>;
    },
    getNextPageParam: (lastPage) => lastPage.meta.hasMore ? lastPage.meta.cursor : undefined,
    initialPageParam: undefined as string | undefined,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error('Failed to mark read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};
