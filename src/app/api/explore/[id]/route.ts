import { NextResponse } from 'next/server';
import { exploreService } from '@/services/backend/explore.service';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) return NextResponse.json({ item: null }, { status: 400 });

  const item = await exploreService.getExploreItem(id);
  if (!item) return NextResponse.json({ item: null }, { status: 404 });
  return NextResponse.json({ item });
}
