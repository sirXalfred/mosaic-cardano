import { NextResponse } from 'next/server';
import { generateNonce } from '@meshsdk/core';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const nonce = generateNonce('Sign in to Mosaic');
    
    const response = NextResponse.json({ nonce });
    
    // Set cookie valid for 5 minutes
    response.cookies.set('mosaic_wallet_nonce', nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 5 * 60, 
    });

    return response;
  } catch (error) {
    console.error('Error generating nonce:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
