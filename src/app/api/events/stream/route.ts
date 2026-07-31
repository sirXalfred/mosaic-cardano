import { NextResponse } from 'next/server';
import redis from '@/lib/backend/redis';
import { withAuth } from '@/lib/backend/request';

export const runtime = 'nodejs';

/**
 * @swagger
 * /api/events/stream:
 *   get:
 *     summary: Real-time Server-Sent Events (SSE) stream for user notifications, badge minting, and plan updates
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Event stream established
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized
 */
export const GET = withAuth(async (request: Request, context: { params: Record<string, string> }, userId: string) => {
  const channel = `user:events:${userId}`;

  const subClient = redis.duplicate();
  await subClient.connect().catch(() => {});

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Initial connection ping
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'connected', userId })}\n\n`));

      const messageHandler = (ch: string, message: string) => {
        if (ch === channel) {
          try {
            controller.enqueue(encoder.encode(`data: ${message}\n\n`));
          } catch (e) {
            console.error('Error writing to user SSE stream:', e);
          }
        }
      };

      await subClient.subscribe(channel);
      subClient.on('message', messageHandler);

      // Periodic heartbeat ping to keep connection alive through reverse proxies
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 25000);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        subClient.unsubscribe(channel).catch(() => {});
        subClient.quit().catch(() => {});
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
});
