import React from 'react';
import { Metadata } from 'next';
import VillageLayout from '@/components/village/VillageLayout';
import { MOCK_VILLAGE_DETAILS } from '@/data/mock';

export async function generateMetadata({ params }: { params: { community_id: string } }): Promise<Metadata> {
  const community = MOCK_VILLAGE_DETAILS[params.community_id] || { name: 'Community', description: 'A creative community on Mosaic.' };
  return {
    title: {
      default: community.name,
      template: `%s - ${community.name} | Mosaic`,
    },
    description: `${community.description} | Mosaic`,
  };
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <VillageLayout>{children}</VillageLayout>;
}
