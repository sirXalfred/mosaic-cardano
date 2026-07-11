import { NextResponse } from 'next/server';
import { documentService } from '@/services/backend/document.service';
import { withAuth } from '@/lib/backend/request';
import { z } from 'zod';

export const runtime = 'nodejs';

const SignSchema = z.object({
  signatureHash: z.string().min(1),
  walletAddress: z.string().min(1),
});


/**
 * @swagger
 * /api/documents/[documentId]/sign:
 *   post:
 *     summary: POST sign
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
export const POST = withAuth(async (request, { params }, userId) => {
  try {
    const { documentId } = await params as { documentId: string };

    const body = await request.json();
    const parseResult = SignSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }

    await documentService.signContribution(documentId, userId, parseResult.data.signatureHash, parseResult.data.walletAddress);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error signing contribution:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
