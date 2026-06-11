import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { inviteService } from '@/services/backend/invite.service';
import { villageService } from '@/services/backend/village.service';

export const runtime = 'nodejs';

export const POST = withAuth(async (request, context, userId) => {
  try {
    const body = await request.json();
    const { communityId } = body;

    if (!communityId) {
      return NextResponse.json({ error: 'Community ID is required' }, { status: 400 });
    }
    
    // Verify user is member of community
    const membership = await villageService.checkCommunityMembership(userId, communityId);
    if (!membership.isMember) {
        return NextResponse.json({ error: 'Not a member of this community' }, { status: 403 });
    }

    const invite = await inviteService.createInvite(userId, communityId);

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
