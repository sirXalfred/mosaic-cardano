import { NextResponse } from 'next/server';
import { pieceService } from '@/services/backend/piece.service';
import { z } from 'zod';

export const runtime = 'nodejs';

const QuerySchema = z.object({
  filter: z.enum(['Pieces', 'Publications', 'Projects', 'All']).default('All'),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const { communityId } = await params;
    // userId is no longer needed since library is public pieces
    
    const { searchParams } = new URL(request.url);
    const parseResult = QuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    const { filter, limit, offset } = parseResult.data;

    let singularFilter: string | undefined = filter === 'All' ? undefined : filter;
    if (singularFilter && singularFilter.endsWith('s')) {
      singularFilter = singularFilter.slice(0, -1);
    }
    const pieces = await pieceService.listVillagePieces(communityId, limit, offset, singularFilter);

    return NextResponse.json({
      items: pieces,
      nextOffset: pieces.length === limit ? offset + limit : null,
    });
  } catch (error) {
    console.error('Error fetching library materials:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
