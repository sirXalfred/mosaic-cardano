import { NextResponse } from 'next/server';
import { documentService } from '@/services/backend/document.service';
import { withAuth } from '@/lib/backend/request';
import { z } from 'zod';

export const runtime = 'nodejs';

const InviteSchema = z.object({
  action: z.literal('invite'),
  username: z.string().min(1),
});

const ProposeSchema = z.object({
  action: z.literal('propose'),
  splits: z.array(z.object({
    userId: z.string(),
    role: z.string().min(1),
    weight: z.number().min(0).max(100),
  })).refine(splits => {
    const total = splits.reduce((sum, s) => sum + s.weight, 0);
    return Math.abs(total - 100) < 0.01;
  }, "Total weight must equal 100"),
});

const ActionSchema = z.discriminatedUnion('action', [InviteSchema, ProposeSchema]);

export const POST = withAuth(async (request, { params }, userId) => {
  try {
    const { documentId } = await params as { documentId: string };

    const body = await request.json();
    const parseResult = ActionSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }

    if (parseResult.data.action === 'invite') {
      await documentService.inviteContributor(documentId, userId, parseResult.data.username);
      return NextResponse.json({ success: true });
    }

    if (parseResult.data.action === 'propose') {
      await documentService.proposeSplits(documentId, userId, parseResult.data.splits);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error modifying contributors:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
