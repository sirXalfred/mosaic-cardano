import { NextResponse } from 'next/server';
import { documentService } from '@/services/backend/document.service';
import { withAuth } from '@/lib/backend/request';
import { z } from 'zod';

export const runtime = 'nodejs';

const PostCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const GET = withAuth(async (request, { params }, userId) => {
  try {
    const { documentId } = await params as { documentId: string };
    
    // Check if user is authorized to view document (either creator or contributor)
    const doc = await documentService.getDocument(documentId, userId);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });
    }

    const comments = await documentService.getComments(documentId);
    return NextResponse.json({ items: comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = withAuth(async (request, { params }, userId) => {
  try {
    const { documentId } = await params as { documentId: string };
    
    const body = await request.json();
    const parseResult = PostCommentSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }

    // Check if user is authorized to comment (either creator or contributor)
    const doc = await documentService.getDocument(documentId, userId);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });
    }

    const commentId = await documentService.addComment(documentId, userId, parseResult.data.content);
    return NextResponse.json({ success: true, id: commentId });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
