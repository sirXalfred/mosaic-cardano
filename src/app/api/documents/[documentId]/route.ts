import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { documentService } from '@/services/backend/document.service';
import { z } from 'zod';

export const runtime = 'nodejs';


/**
 * @swagger
 * /api/documents/[documentId]:
 *   get:
 *     summary: GET [documentId]
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
export const GET = withAuth(async (request, { params }, userId) => {
  try {
    const { documentId } = await params as { documentId: string };
    
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
});

const UpdateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  status: z.string().optional()
});


/**
 * @swagger
 * /api/documents/[documentId]:
 *   put:
 *     summary: PUT [documentId]
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
export const PUT = withAuth(async (request, { params }, userId) => {
  try {
    const { documentId } = await params as { documentId: string };
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
});
