import { NextResponse } from 'next/server';

import { getRequestUserId } from '@/lib/backend/request';
import { exploreService } from '@/services/backend/explore.service';

export const runtime = 'nodejs';

const EXPLORE_PAGE_SIZE = 20;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const userId = await getRequestUserId(request);

  const filters: Record<string, string | number | null> = {};
  if (params.get('search')) filters.search = params.get('search');
  if (params.get('topic')) filters.topic = params.get('topic');
  if (params.get('location')) filters.location = params.get('location');
  if (params.get('size')) filters.size = params.get('size');
  if (params.get('visibility')) filters.visibility = params.get('visibility');
  if (params.get('activityLevel')) filters.activityLevel = params.get('activityLevel');
  if (params.get('tab')) filters.tab = params.get('tab');

  const offset = params.get('offset') ? Number(params.get('offset')) : 0;

  const page = await exploreService.listExplore(filters, userId, EXPLORE_PAGE_SIZE, offset);
  return NextResponse.json(page);
}