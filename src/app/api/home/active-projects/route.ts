import { NextResponse } from 'next/server';

import { withAuth } from '@/lib/backend/request';
import { homeService } from '@/services/backend/home.service';

export const runtime = 'nodejs';


/**
 * @swagger
 * /api/home/active-projects:
 *   get:
 *     summary: GET active-projects
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
    const items = await homeService.listActiveProjects(userId);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Failed to fetch home active projects:', error);
    return NextResponse.json({ items: [] });
  }
});