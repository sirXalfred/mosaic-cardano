import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/backend/request';
import { adminService } from '@/services/backend/admin.service';
import { z } from 'zod';

const BroadcastRequestSchema = z.object({
  audience: z.string(),
  title: z.string().min(1).max(140),
  body: z.string().min(1).max(1000),
  actionUrl: z.string().url().optional(),
});


/**
 * @swagger
 * /api/admin/broadcast:
 *   post:
 *     summary: POST broadcast
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
export const POST = withAdminAuth(async (req: Request) => {
  try {
    const json = await req.json();
    const parsed = BroadcastRequestSchema.parse(json);

    const result = await adminService.broadcastMessage(
      parsed.audience,
      parsed.title,
      parsed.body,
      parsed.actionUrl
    );

    return NextResponse.json({ success: true, sentCount: result.sentCount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.issues }, { status: 400 });
    }
    console.error('Failed to broadcast:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
