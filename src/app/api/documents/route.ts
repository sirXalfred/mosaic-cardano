import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { documentService } from '@/services/backend/document.service';
import { z } from 'zod';

export const runtime = 'nodejs';

const CreateSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional().default('')
});


/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: POST documents
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
export const POST = withAuth(async (request, context, userId) => {
  try {
    const body = await request.json();
    const parseResult = CreateSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const { title, content } = parseResult.data;
    const documentId = await documentService.createDocument(userId, title, content);
    
    return NextResponse.json({ id: documentId });
  } catch (error: unknown) {
    console.error('Failed to create document:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
}
});


/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: GET documents
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
export const GET = withAuth(async (request, context, userId) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const documents = await documentService.getUserDocuments(userId, limit, offset);
    
    return NextResponse.json({
      data: documents,
      nextOffset: documents.length === limit ? offset + limit : null,
    });
  } catch (error: unknown) {
    console.error('Failed to get documents:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
}
});
