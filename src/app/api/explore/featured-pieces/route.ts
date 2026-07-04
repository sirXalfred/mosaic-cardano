import { NextResponse } from 'next/server';
import { pieceService } from '@/services/backend/piece.service';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(5),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = QuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    const { limit } = parseResult.data;
    const pieces = await pieceService.getFeaturedPieces(limit);

    return NextResponse.json({ items: pieces });
  } catch (error) {
    console.error('Error fetching featured pieces:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
