import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { inviteService } from '@/services/backend/invite.service';

export const runtime = 'nodejs';

export const POST = withAuth(async (request, context, userId) => {
  try {
    const { hash } = context.params as { hash: string };

    if (!hash) {
      return NextResponse.json({ error: 'Hash is required' }, { status: 400 });
    }

    // Verify invite exists
    const inviteData = await inviteService.getInviteByHash(hash);
    if (!inviteData) {
        return NextResponse.json({ error: 'Invite not found or expired' }, { status: 404 });
    }

    await inviteService.acceptInvite(userId, hash);

    return NextResponse.json({ success: true, communityId: inviteData.community.id }, { status: 200 });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
