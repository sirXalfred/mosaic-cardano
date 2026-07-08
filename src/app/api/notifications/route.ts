import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { notificationService } from '@/services/backend/notification.service';
import { z } from 'zod';

export const GET = withAuth(async (req: Request, context: unknown, userId: string) => {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const cursor = url.searchParams.get('cursor') || undefined;

    const data = await notificationService.listUserNotifications(userId, { limit, cursor });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.issues }, { status: 400 });
    }
    console.error('Failed to get notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
