import { NextResponse } from 'next/server';

import { withAuth } from '@/lib/backend/request';
import { homeService } from '@/services/backend/home.service';

export const runtime = 'nodejs';


/**
 * @swagger
 * /api/home/saved-items:
 *   get:
 *     summary: GET saved-items
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
  const items = await homeService.listSavedItems(userId);
  return NextResponse.json({ items });
})