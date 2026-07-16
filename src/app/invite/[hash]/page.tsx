import { Metadata } from 'next';
import { InvitePageContent } from '@/components/village/InvitePageContent';
import { inviteService } from '@/services/backend/invite.service';
import { cache } from "react";

const getInviteByHash = cache(async (hash: string) => {
  return inviteService.getInviteByHash(hash);
});

export async function generateMetadata({ params }: { params: Promise<{ hash: string }> }): Promise<Metadata> {
  const { hash } = await params;
  const inviteData = await getInviteByHash(hash);

  if (!inviteData) {
    return {
      title: 'Invite Not Found',
      description: 'The invitation is invalid or has expired.',
    };
  }

  const communityName = inviteData.community.name;
  const image = inviteData.community.profileImageUrl;

  return {
    title: `Invite to ${communityName}`,
    description: `You are being invited to ${inviteData.community.name} | Mosaic`,
    openGraph: {
      images: image? [{url: image}] : undefined,
    },
    twitter: image? {
      card: 'summary_large_image',
      images: [{url: image}],
    } : undefined
  };
}

export default async function InvitePage({ params }: { params: Promise<{ hash: string }> } ) {
  const { hash } = await params;
  const inviteData = await getInviteByHash(hash);

  return (
    <InvitePageContent hash={hash} villageId={inviteData?.community?.id}/>
  );
}
