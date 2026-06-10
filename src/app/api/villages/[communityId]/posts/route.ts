import { NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/backend/request';
import { postService } from '@/services/backend/post.service';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const { communityId } = await params;
    const userId = await getRequestUserId(request);
    
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 50;
    const offset = url.searchParams.get('offset') ? Number(url.searchParams.get('offset')) : 0;
    const filter = url.searchParams.get('filter') || undefined;

    const posts = await postService.listPosts(communityId, userId, limit, offset, filter);

    return NextResponse.json({ items: posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const { communityId } = await params;
    const userId = await getRequestUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, replyToId } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const post = await postService.createPost(communityId, userId, content, replyToId);

    if (!post) {
       return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    return NextResponse.json({ item: post });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
