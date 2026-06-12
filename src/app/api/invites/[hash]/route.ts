import { NextResponse } from 'next/server';
import { inviteService } from '@/services/backend/invite.service';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { hash: string } }
) {
  try {
    const inviteData = await inviteService.getInviteByHash(params.hash);

    if (!inviteData) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    return NextResponse.json(inviteData);
  } catch (error) {
    console.error('Error fetching invite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
