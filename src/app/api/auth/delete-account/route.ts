import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { authService } from '@/services/backend/auth.service';

export const runtime = 'nodejs';

export const DELETE = withAuth(async (req, context, userId) => {
  try {
    await authService.deleteAccount(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
