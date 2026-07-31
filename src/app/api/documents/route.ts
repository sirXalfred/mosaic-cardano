import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { documentService } from '@/services/backend/document.service';
import { validatePayload, sanitizeString } from '@/lib/backend/api-validation';
import { z } from 'zod';

export const runtime = 'nodejs';

const CreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().optional().default('')
});

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Create a new document
 *     tags: [Documents]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My Document"
 *               content:
 *                 type: string
 *                 example: "Document content here"
 *     responses:
 *       200:
 *         description: Document successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *       400:
 *         description: Bad request / Invalid input schema
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const POST = withAuth(async (request, context, userId) => {
  try {
    const body = await request.json();
    const validation = await validatePayload(CreateSchema, body);
    
    if (!validation.success) {
      return validation.response;
    }

    const title = sanitizeString(validation.data.title);
    const content = sanitizeString(validation.data.content);

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
 *     summary: Get user documents list
 *     tags: [Documents]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items to return (1-100)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset pagination start index
 *     responses:
 *       200:
 *         description: List of documents
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const GET = withAuth(async (request, context, userId) => {
  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = await validatePayload(QuerySchema, {
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    if (!queryValidation.success) {
      return queryValidation.response;
    }

    const { limit, offset } = queryValidation.data;
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
