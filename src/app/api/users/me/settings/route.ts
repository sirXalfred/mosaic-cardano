import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { authService } from '@/services/backend/auth.service';

export const runtime = 'nodejs';

export const GET = withAuth(async (request, context, userId) => {
  try {
    const settings = await authService.getUserSettings(userId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
