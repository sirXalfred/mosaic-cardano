import { NextResponse } from 'next/server';
import { checkSignature } from '@meshsdk/core';
import { authCookieOptions, createAuthSession, sessionCookieName } from '@/lib/backend/session';
import { AuthStateResponseSchema } from '@/types/api';
import { runRead } from '@/services/backend/shared';

export const runtime = 'nodejs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toAuthState = (user: any) => {
  if (!user) {
    return { isAuthenticated: false, user: null };
  }

  return {
    isAuthenticated: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.displayName,
      initials: user.displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 3),
      avatarUrl: null,
      isOnboarded: user.isOnboarded
    },
  };
};

export async function POST(request: Request) {
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

    // Find user by wallet address
    const rows = await runRead(
      `
        MATCH (u:Mosaic_User {walletAddress: $walletAddress})
        RETURN u AS user
        LIMIT 1
      `,
      { walletAddress: address },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      row => row.user as any
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json({ error: 'No user account found linked to this wallet. Please log in with email and link your wallet first.' }, { status: 404 });
    }

    const token = await createAuthSession(user.id);
    const response = NextResponse.json(AuthStateResponseSchema.parse(toAuthState(user)));
    response.cookies.set(sessionCookieName, token, authCookieOptions);
    response.cookies.delete('mosaic_wallet_nonce');
    return response;

  } catch (error) {
    console.error('Error logging in with wallet:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
