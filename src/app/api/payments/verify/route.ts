import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentAndUpdatePlan } from '@/services/backend/payment.service';
import { getRequestUserId } from '@/lib/backend/request';

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const userId = await getRequestUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { txHash, planType } = body;

    if (!txHash || !planType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 3. Verify payment and update plan
    const success = await verifyPaymentAndUpdatePlan(userId, txHash, planType);

    if (success) {
      return NextResponse.json({ success: true, message: 'Plan upgraded successfully' });
    } else {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

  } catch (error) {
    console.error('API Error /payments/verify:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 }
    );
  }
}
