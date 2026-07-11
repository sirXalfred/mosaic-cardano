import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { notificationService } from '@/services/backend/notification.service';
import { z } from 'zod';

const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
});


/**
 * @swagger
 * /api/notifications/subscribe:
 *   post:
 *     summary: POST subscribe
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
export const POST = withAuth(async (req: Request, context: unknown, userId: string) => {
  try {
    const body = await req.json();
    const subscription = PushSubscriptionSchema.parse(body);

    await notificationService.savePushSubscription(userId, subscription);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.issues }, { status: 400 });
    }
    console.error('Failed to save push subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
