import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/backend/request';
import { adminService } from '@/services/backend/admin.service';


/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: GET users
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
export const GET = withAdminAuth(async (req: Request) => {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  
  try {
    const data = await adminService.listUsers(page);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to list users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
