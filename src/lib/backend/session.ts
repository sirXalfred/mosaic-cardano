import { createHmac, randomUUID, timingSafeEqual } from 'crypto';

import redis from './redis';

const SESSION_COOKIE_NAME = 'mosaic_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SESSION_SIGNING_SECRET = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'development-only-secret';

export const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};

type SessionPayload = {
  userId: string;
  createdAt: number;
};

const sessionKey = (sessionId: string): string => `session:${sessionId}`;

const sign = (sessionId: string): string => {
  return createHmac('sha256', SESSION_SIGNING_SECRET).update(sessionId).digest('hex');
};

const encodeSessionToken = (sessionId: string): string => {
  return `${sessionId}.${sign(sessionId)}`;
};

export const decodeSessionToken = (token: string): string | null => {
  const [sessionId, signature] = token.split('.');
  if (!sessionId || !signature) return null;

  const expected = sign(sessionId);
  const expectedBuffer = Buffer.from(expected, 'hex');
  const signatureBuffer = Buffer.from(signature, 'hex');

  if (expectedBuffer.length !== signatureBuffer.length) return null;
  if (!timingSafeEqual(expectedBuffer, signatureBuffer)) return null;

  return sessionId;
};

export const createAuthSession = async (userId: string): Promise<string> => {
  const sessionId = randomUUID();
  const payload: SessionPayload = {
    userId,
    createdAt: Date.now(),
  };

  await redis.set(sessionKey(sessionId), JSON.stringify(payload), 'EX', SESSION_TTL_SECONDS);
  return encodeSessionToken(sessionId);
};

export const getAuthSessionByToken = async (token: string | undefined): Promise<SessionPayload | null> => {
  if (!token) return null;

  const sessionId = decodeSessionToken(token);
  if (!sessionId) return null;

  const raw = await redis.get(sessionKey(sessionId));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
};

export const destroyAuthSessionByToken = async (token: string | undefined): Promise<void> => {
  if (!token) return;

  const sessionId = decodeSessionToken(token);
  if (!sessionId) return;

  await redis.del(sessionKey(sessionId));
};

export const sessionCookieName = SESSION_COOKIE_NAME;
export const sessionCookieValue = encodeSessionToken;
export type { SessionPayload };
