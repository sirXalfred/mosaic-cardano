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
