import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { villageService } from '@/services/backend/village.service';

export const runtime = 'nodejs';

export async function GET() {
  const items = await villageService.listFeaturedVillages(5);
  return NextResponse.json({ items });
}

export const POST = withAuth(async (request, context, userId) => {
  try {
    const body = await request.json();
    const { name, description, tags, profileImageUrl } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const community = await villageService.createCommunity(userId, { name, description, tags, profileImageUrl });

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('PLAN_LIMIT')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error creating community:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});