'use client';

import React, { useEffect } from 'react';
import { useGetNotifications } from '@/services/notifications';
import NotificationItem from '@/components/notifications/NotificationItem';
import { StatePanel } from '@/components/ui/StatePanel';
import AppPageContainer from '@/components/layout/AppPageContainer';
import { useInView } from 'react-intersection-observer';
import { Bell } from 'lucide-react';

export default function InboxView() {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetNotifications(20);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = data?.pages.flatMap(p => p.items) || [];

  return (
    <AppPageContainer title={<>
      <div className='flex items-center gap-2'>
        <Bell /> Inbox
      </div></>} description="Catch up on what you&apos;ve missed.">

      <main className="bg-theme-surface-high border border-theme-outline/10 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <StatePanel variant="loading" title="Loading your inbox..." description="" />
        ) : isError ? (
          <StatePanel variant="error" title="Failed to load inbox" errorMessage={error?.message} description="" />
        ) : items.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-theme-surface-low rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="font-bold text-lg text-theme-forest mb-1">You&apos;re all caught up!</h3>
            <p className="text-theme-on-surface/60">No new notifications in your inbox.</p>
          </div>
        ) : (
          <div className="divide-y divide-theme-outline/10">
            {items.map(notification => (
              <div key={notification.id} className="p-2">
                <NotificationItem notification={notification} />
              </div>
            ))}

            {hasNextPage && (
              <div ref={ref} className="p-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-theme-accent/30 border-t-theme-accent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </main>
    </AppPageContainer>
  );
}
