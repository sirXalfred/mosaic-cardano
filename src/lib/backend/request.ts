import { getAuthSessionByToken, getSessionTokenFromRequest, invalidateRequestSession } from './session';
import { NextResponse } from 'next/server';

export const getRequestUserId = async (request: Request): Promise<string | null> => {
  const token = getSessionTokenFromRequest(request);
  const session = await getAuthSessionByToken(token);
  return session?.userId ?? null;
};

type ApiHandlerContext = { params: Record<string, string> };
type AuthenticatedApiHandler = (request: Request, context: ApiHandlerContext, userId: string) => Promise<NextResponse> | NextResponse;

export const withAuth = (handler: AuthenticatedApiHandler) => {
  return async (request: Request, context: ApiHandlerContext) => {
    const userId = await getRequestUserId(request);
    if (!userId) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      await invalidateRequestSession(request, response);
      return response;
    }
    return handler(request, context, userId);
  };
};

import { runRead } from '@/services/backend/shared';

export const getRequestUserRole = async (userId: string): Promise<string> => {
  const result = await runRead(
    `MATCH (u:Mosaic_User {id: $userId}) RETURN u.role AS role`,
    { userId },
    (row) => row.role as string | null
  );
  return result[0] || 'USER';
};

export const withAdminAuth = (handler: AuthenticatedApiHandler) => {
  return async (request: Request, context: ApiHandlerContext) => {
    const userId = await getRequestUserId(request);
    if (!userId) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      await invalidateRequestSession(request, response);
      return response;
    }

    const role = await getRequestUserRole(userId);
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    return handler(request, context, userId);
  };
};