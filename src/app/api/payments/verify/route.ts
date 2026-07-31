import { NextResponse } from 'next/server';
import { isTxHashConsumed } from '@/services/backend/payment.service';
import { withAuth } from '@/lib/backend/request';
import { validatePayload } from '@/lib/backend/api-validation';
import { paymentQueue } from '@/lib/queue';
import { z } from 'zod';

export const runtime = "nodejs";

const VerifySchema = z.object({
  txHash: z.string().min(10, 'Invalid transaction hash'),
  planType: z.enum(['BASIC', 'PRO', 'basic', 'pro']),
});

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify Cardano payment and upgrade user subscription plan (Queued)
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [txHash, planType]
 *             properties:
 *               txHash: { type: string, example: "a1b2c3..." }
 *               planType: { type: string, enum: [BASIC, PRO] }
 *     responses:
 *       202:
 *         description: Payment verification queued successfully
 *       400:
 *         description: Invalid input or transaction hash already consumed
 *       401:
 *         description: Unauthorized
 */
export const POST = withAuth(async (req, context, userId) => {
  try {
    const body = await req.json();
    const validation = await validatePayload(VerifySchema, body);
    if (!validation.success) return validation.response;

    const { txHash, planType } = validation.data;

    // Check if transaction was already consumed
    const consumed = await isTxHashConsumed(txHash);
    if (consumed) {
      return NextResponse.json({ error: 'Transaction hash has already been consumed.' }, { status: 400 });
    }

    // Enqueue verification job into paymentQueue
    await paymentQueue.add('verify-payment', {
      userId,
      txHash,
      planType: planType.toUpperCase(),
    });

    return NextResponse.json(
      { success: true, status: 'PENDING_VERIFICATION', message: 'Payment verification queued. You will be notified once confirmed.' },
      { status: 202 }
    );
  } catch (error: unknown) {
    console.error('API Error /payments/verify:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
});
