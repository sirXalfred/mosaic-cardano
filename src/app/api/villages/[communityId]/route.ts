import { NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/backend/request';
import { villageService } from '@/services/backend/village.service';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const { communityId } = await params;
    const userId = await getRequestUserId(request);
    
    const community = await villageService.getCommunityByIdOrSlug(communityId);
    
    if (!community) {
      return NextResponse.json({ error: 'Village not found' }, { status: 404 });
    }

    let isMember = false;
    let role = null;
    
    if (userId) {
      const membership = await villageService.checkCommunityMembership(userId, community.id);
      isMember = membership.isMember;
      role = membership.role;
    }

    // Members count is needed, fetch it manually for details if not part of community schema
    // In db, we can list members to get the count
    const members = await villageService.listCommunityMembers(communityId, 1000);

    return NextResponse.json({
      id: community.id,
      slug: community.slug,
      name: community.name,
      description: community.description || '',
      profileImageUrl: community.profileImageUrl,
      memberCount: members.length,
      treasuryBalance: '0 SCR', // placeholder, treasury not in schema
      isMember,
      role
    });
  } catch (error) {
    console.error('Error fetching village details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { withAuth } from '@/lib/backend/request';

export const DELETE = withAuth(async (request, context, userId) => {
  try {
    const { communityId } = await context.params;
    
    await villageService.deleteCommunity(userId, communityId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting village:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
