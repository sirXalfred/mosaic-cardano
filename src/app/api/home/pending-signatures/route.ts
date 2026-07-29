import { NextResponse } from 'next/server';

import { withAuth } from '@/lib/backend/request';
import { homeService } from '@/services/backend/home.service';

export const runtime = 'nodejs';

export const GET = withAuth(async (request, context, userId) => {
  try {
    const items = await homeService.listPendingSignatures(userId);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Failed to fetch pending signatures:', error);
    return NextResponse.json({ items: [] });
  }
});
