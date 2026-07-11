import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { notificationService } from '@/services/backend/notification.service';
import { z } from 'zod';


/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: GET notifications
 *     tags: [api]
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
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
