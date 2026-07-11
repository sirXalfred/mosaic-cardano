import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/backend/request';
import { adminService } from '@/services/backend/admin.service';


/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: GET stats
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
export const GET = withAdminAuth(async () => {
  try {
    const metrics = await adminService.getPlatformMetrics();
    const treasuryBalance = await adminService.getLiveTreasuryBalance();

    return NextResponse.json({
      ...metrics,
      treasuryBalance
    });
  } catch (error) {
    console.error('Failed to get admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
