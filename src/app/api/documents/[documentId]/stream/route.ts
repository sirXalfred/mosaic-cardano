import { NextResponse } from 'next/server';
import redis from '@/lib/backend/redis';
import { withAuth } from '@/lib/backend/request';

export const runtime = 'nodejs';

/**
 * @swagger
 * /api/documents/{documentId}/stream:
 *   get:
 *     summary: Real-time Server-Sent Events (SSE) stream for document updates
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
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
export const GET = withAuth(async (request: Request, context: { params: Record<string, string> }) => {
  const documentId = context.params.documentId;
  const channel = `doc:events:${documentId}`;

  const subClient = redis.duplicate();
  await subClient.connect().catch(() => {});

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'connected', documentId })}\n\n`));

      const messageHandler = (ch: string, message: string) => {
        if (ch === channel) {
          try {
            controller.enqueue(encoder.encode(`data: ${message}\n\n`));
          } catch (e) {
            console.error('Error writing to SSE stream:', e);
          }
        }
      };

      await subClient.subscribe(channel);
      subClient.on('message', messageHandler);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
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
