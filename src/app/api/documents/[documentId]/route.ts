import { NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/backend/request';
import { documentService } from '@/services/backend/document.service';
import { z } from 'zod';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;
    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const document = await documentService.getDocument(documentId, userId);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error: unknown) {
    console.error('Failed to get document:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

const UpdateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  status: z.string().optional()
});

export async function PUT(
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
    
    const parseResult = UpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    await documentService.updateDocument(documentId, userId, parseResult.data);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Failed to update document:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
