import { NextResponse } from 'next/server';

import { withAuth } from '@/lib/backend/request';
import { homeService } from '@/services/backend/home.service';

export const runtime = 'nodejs';

export const GET = withAuth(async (request, context, userId) => {
  const items = await homeService.listActionItems(userId);
  return NextResponse.json({ items });
})