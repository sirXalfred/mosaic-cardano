import React from 'react';
import { Metadata } from 'next';
import { MOCK_VILLAGE_DETAILS } from '@/data/mock';

export async function generateMetadata({ searchParams }: { searchParams: { villageId?: string } }): Promise<Metadata> {
  const villageId = searchParams.villageId;
  const community = villageId ? MOCK_VILLAGE_DETAILS[villageId] : null;
  
  if (community) {
    return {
      title: `Invite to ${community.name}`,
      description: `You are being invited to the ${community.name} | Mosaic`,
      openGraph: {
        images: [],
      }
    };
  }
  
  return {
    title: 'Mosaic Invitation',
    description: 'You have been invited to join a community on Mosaic.',
  };
}

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
