import { NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/backend/request';
import { documentService } from '@/services/backend/document.service';
import { z } from 'zod';

export const runtime = 'nodejs';

const PublishSchema = z.object({
  communityId: z.string().min(1)
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;
    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    
    const parseResult = PublishSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid data: communityId is required' }, { status: 400 });
    }

    const pieceId = await documentService.publishDocumentToPiece(documentId, userId, parseResult.data.communityId);
    
    return NextResponse.json({ success: true, pieceId });
  } catch (error: unknown) {
    console.error('Failed to publish document:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
