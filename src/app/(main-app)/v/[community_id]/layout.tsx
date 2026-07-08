import React from 'react';
import { Metadata } from 'next';
import VillageLayout from '@/components/village/VillageLayout';
import { villageService } from '@/services/backend/village.service';


export async function generateMetadata({ params }: { params: { community_id: string } }): Promise<Metadata> {
  const { community_id } = await params;
  const communityData = await villageService.getCommunityByIdOrSlug(community_id);
  const communityName = communityData?.name || "Community";
  const image = communityData?.profileImageUrl || "/assets/images/banner-image.png";
  const descr = communityData?.description || "A community on Mosaic";

  return {
    title: {
      default: communityName,
      template: `%s - ${communityName} | Mosaic`,
    },
    description: `${descr} | Mosaic`,

    openGraph: {
      images: image ? [{ url: image }] : undefined,
    },
    twitter: image ? {
      card: 'summary_large_image',
      images: [{ url: image }],
    } : undefined
  };
}


export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <VillageLayout>{children}</VillageLayout>;
}
