import { NextResponse } from 'next/server';

import { getRequestUserId } from '@/lib/backend/request';
import { villageService } from '@/services/backend/village.service';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params;
  const userId = await getRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ isMember: false, role: null });
  }

  const membership = await villageService.checkCommunityMembership(userId, communityId);
  return NextResponse.json(membership);
}

export async function POST(request: Request, { params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params;
  const userId = await getRequestUserId(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
}

export async function DELETE(request: Request, { params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params;
  const userId = await getRequestUserId(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
}