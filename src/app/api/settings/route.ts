import { NextResponse } from 'next/server';
import { z } from 'zod';
import { settingsService } from '@/services/backend/settings.service';
import { withAuth } from '@/lib/backend/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: GET settings
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
export const GET = withAuth(async (request, context, userId) => {
  try {
    const settings = await settingsService.getSettings(userId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});


/**
 * @swagger
 * /api/settings:
 *   patch:
 *     summary: PATCH settings
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
export const PATCH = withAuth(async (request, context, userId) => {
  try {
    const body = await request.json();
    
    // We expect a DeepPartial<UserSettings>
    const updated = await settingsService.updateSettings(userId, body);
    
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
