import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/backend/request';
import { adminService } from '@/services/backend/admin.service';

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
