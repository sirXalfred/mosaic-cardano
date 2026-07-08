import React from 'react';
import { useGetNotifications } from '@/services/notifications';
import NotificationItem from './NotificationItem';
import { Loader2 } from 'lucide-react';

export default function NotificationDropdownList() {
  const { data, isLoading, isError } = useGetNotifications(7);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader2 className="animate-spin text-theme-accent/50" size={24} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-xs text-red-500">Failed to load notifications</p>
      </div>
    );
  }

  const items = data?.pages.flatMap(p => p.items) || [];

  if (items.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center">
        <div className="w-12 h-12 bg-theme-surface-low rounded-full flex items-center justify-center mb-3">
          <span className="text-2xl">📭</span>
        </div>
        <p className="text-sm font-medium text-theme-on-surface/70">You are all caught up!</p>
        <p className="text-xs text-theme-on-surface/50 mt-1">No new notifications.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-theme-outline/5">
      {items.map(notification => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
