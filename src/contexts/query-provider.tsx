"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { ReactNode, useState, useEffect } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 15, // 15 minutes: serve cached data instantly
            gcTime: 1000 * 60 * 60 * 24, // 24 hours: persist in memory/storage
            refetchOnMount: true, // Perform background revalidation if data is stale
            refetchOnWindowFocus: false,
            retry: 2,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  const [persister, setPersister] = useState<ReturnType<typeof createAsyncStoragePersister> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = createAsyncStoragePersister({
        storage: window.localStorage,
        key: 'MOSAIC_QUERY_CACHE',
      });
      setPersister(p);
    }
  }, []);

  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        buster: 'v1',
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

