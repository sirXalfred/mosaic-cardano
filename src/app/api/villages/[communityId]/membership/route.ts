import { NextResponse } from 'next/server';
import { withAuth, getRequestUserId } from '@/lib/backend/request';
import { villageService } from '@/services/backend/village.service';

export async function GET(request: Request, { params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params;
  const userId = await getRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ isMember: false, role: null });
  }

  try {
    const membership = await villageService.checkCommunityMembership(userId, communityId);
    return NextResponse.json(membership);

  } catch (err: unknown) {
    const error = err as Error;
    console.error('Failed to check community membership:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withAuth(async (request, { params }, userId) => {
  const { communityId } = await params as { communityId: string };

  try {
    await villageService.joinCommunity({
      userId,
      communityId,
    });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Failed to join community:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: error.message?.includes('VILLAGE_FULL') ? 400 : 500 });
  }
});

export const DELETE = withAuth(async (request, { params }, userId) => {
  const { communityId } = await params as { communityId: string };

  try {
    await villageService.leaveCommunity({
      userId,
      communityId,
    });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Failed to leave community:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});