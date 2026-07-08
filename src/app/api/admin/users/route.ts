import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/backend/request';
import { adminService } from '@/services/backend/admin.service';

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
