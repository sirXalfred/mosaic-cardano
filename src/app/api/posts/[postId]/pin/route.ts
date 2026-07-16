import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { postService } from '@/services/backend/post.service';

export const runtime = 'nodejs';

export const POST = withAuth(async (request, { params }, userId) => {
  try {
    const { postId } = await params as { postId: string };
    const body = await request.json();
    const { isPinned } = body;

    if (typeof isPinned !== 'boolean') {
      return NextResponse.json({ error: 'isPinned must be a boolean' }, { status: 400 });
    }

    const post = await postService.pinPost(postId, userId, isPinned);

    if (!post) {
       return NextResponse.json({ error: 'Failed to pin post. Make sure you are an admin of this community.' }, { status: 403 });
    }

    return NextResponse.json({ item: post });
  } catch (error) {
    console.error('Error pinning post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
