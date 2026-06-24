import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { authService } from '@/services/backend/auth.service';
import { checkSignature } from '@meshsdk/core';

export const runtime = 'nodejs';

export const POST = withAuth(async (request, context, userId) => {
  try {
    const { signature, payload, address } = await request.json();

    if (!signature || !payload || !address) {
      return NextResponse.json({ error: 'Missing signature data' }, { status: 400 });
    }

    const cookieNonce = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('mosaic_wallet_nonce='))?.split('=')[1];
    if (!cookieNonce) {
      return NextResponse.json({ error: 'Nonce expired or missing. Please try again.' }, { status: 400 });
    }

    const isValid = checkSignature(cookieNonce, signature, address);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Save wallet address to user
    await authService.linkWallet(userId, address);

    const response = NextResponse.json({ success: true });
    response.cookies.delete('mosaic_wallet_nonce');
    return response;
  } catch (error) {
    console.error('Error linking wallet:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
