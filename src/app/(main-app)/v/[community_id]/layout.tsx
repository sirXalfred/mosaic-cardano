import React from 'react';
import { Metadata } from 'next';
import VillageLayout from '@/components/village/VillageLayout';
import { villageService } from '@/services/backend/village.service';
import { notFound, redirect } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { cache } from "react";

const getCommunity = cache(async (id: string) => {
    return villageService.getCommunityByIdOrSlug(id);
});



export async function generateMetadata({ params }: { params: Promise<{ community_id: string }> }): Promise<Metadata> {
  const { community_id } = await params;
  const communityData = await getCommunity(community_id);
  if (!communityData) {
    return {
      title: 'Community Not Found',
      description: 'The requested community does not exist.',
    };
  }
  const communityName = communityData.name;
  const image = communityData.profileImageUrl;
  const descr = communityData.description || "A community on Mosaic";

  return {
    title: {
      default: communityName,
      template: `%s - ${communityName} | Mosaic`,
    },
    icons: image ?? undefined,
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

export async function generateStaticParams() {
  try {
    const villages = await villageService.listAllVillages();
    return villages.map(village => ({
      community_id: village.id,
    }));
  } catch (error) {
    console.warn('Skipping pre-rendering for communities during build (DB unreachable):', error instanceof Error ? error.message : error);
    return [];
  }
}


export default async function CommunityLayout({ 
  children,
  params
}: { 
  children: React.ReactNode;
  params: Promise<{ community_id: string }>;
}) {
  const { community_id } = await params;
  const communityData = await getCommunity(community_id);
  
  if (!communityData) {
    notFound();
  }

  if (communityData.id !== community_id) {
    redirect(ROUTES.VILLAGE.PROFILE(communityData.id));
  }

  return <VillageLayout>{children}</VillageLayout>;
}
