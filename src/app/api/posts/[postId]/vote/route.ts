import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { postService } from '@/services/backend/post.service';

export const runtime = 'nodejs';

export const POST = withAuth(async (request, { params }, userId) => {
  try {
    const { postId } = await params as { postId: string };
    const body = await request.json();
    const { direction } = body;

    if (!['UP', 'DOWN', 'NONE'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid vote direction' }, { status: 400 });
    }

    const result = await postService.voteOnPost(postId, userId, direction as 'UP' | 'DOWN' | 'NONE');

    if (!result) {
       return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
    }

    return NextResponse.json({ score: result.score, viewerVote: result.viewerVote });
  } catch (error) {
    console.error('Error voting on post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
