import React from 'react';
import AppPageContainer from '@/components/layout/AppPageContainer';
import VillageLibraryClient from './VillageLibraryClient';
import { pieceService } from '@/services/backend/piece.service';

export const dynamic = 'force-dynamic';

export default async function VillageLibraryPage({ params, searchParams }: { params: Promise<{ community_id: string }>, searchParams: Promise<{ filter?: string }> }) {
  const { community_id } = await params;
  const { filter } = await searchParams;
  const activeFilter = filter || 'All';
  
  let singularFilter: string | undefined = activeFilter === 'All' ? undefined : activeFilter;
  if (singularFilter && singularFilter.endsWith('s')) {
    singularFilter = singularFilter.slice(0, -1);
  }

  // Pre-fetch the first page of items
  const initialItems = await pieceService.listVillagePieces(community_id, 50, 0, singularFilter);
  
  const initialData = {
    pages: [{
      items: initialItems,
      nextOffset: initialItems.length === 50 ? 50 : null
    }],
    pageParams: [0]
  };

  return (
    <AppPageContainer title="Community Library" description="The permanent archive of everything created and published by this community">
      <VillageLibraryClient communityId={community_id} initialData={initialData} />
    </AppPageContainer>
  );
}
