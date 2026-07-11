import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { notificationService } from '@/services/backend/notification.service';
import { z } from 'zod';


/**
 * @swagger
 * /api/notifications/[notificationId]/read:
 *   put:
 *     summary: PUT read
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
export const PUT = withAuth(async (req: Request, context: { params: Record<string, string> }, userId: string) => {
  const notificationId = context.params.notificationId;
  try {
    await notificationService.markNotificationRead(userId, notificationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.issues }, { status: 400 });
    }
    console.error('Failed to mark notification as read:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
