import { NextResponse } from 'next/server';
import redis from '@/lib/backend/redis';
import { runRead } from '@/services/backend/shared';
import { badgeQueue, paymentQueue, notificationQueue } from '@/lib/queue';
import { healthService } from '@/services/backend/health';

export const runtime = 'nodejs';

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: System health check endpoint for Redis, Neo4j, and BullMQ worker queues
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System operational
 *       503:
 *         description: Service unavailable
 */
export async function GET(request: Request) {
  const healthStatus: {
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    redis: boolean;
    database: boolean;
    preventDBSleep: boolean;
    queues: {
      badge: Record<string, number>;
      payment: Record<string, number>;
      notification: Record<string, number>;
    };
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    preventDBSleep: false,
    redis: false,
    database: false,
    queues: {
      badge: {},
      payment: {},
      notification: {},
    },
  };

  // If the request URL contains "withdb" as a query parameter, check the database connection
  const withDb = request.url.includes('withdb');
  const authHeader = request.headers.get('Authorization');

  try {
    if (withDb) {
      if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("With all due respect, you don't have the right to do this.", { status: 403 });
      }

      await healthService.keepDBActive();
      healthStatus.preventDBSleep = true;
      return NextResponse.json(healthStatus);
    }

    // 1. Check Redis Ping
    const pingRes = await redis.ping().catch(() => null);
    healthStatus.redis = pingRes === 'PONG';

    // 2. Check Neo4j Database
    const dbRes = await runRead('RETURN 1 AS alive', {}, (row) => row.alive).catch(() => null);
    healthStatus.database = dbRes?.[0] === 1;

    // 3. Inspect BullMQ Queue Job Counts
    const [badgeCounts, paymentCounts, notificationCounts] = await Promise.all([
      badgeQueue.getJobCounts('active', 'waiting', 'failed').catch(() => ({})),
      paymentQueue.getJobCounts('active', 'waiting', 'failed').catch(() => ({})),
      notificationQueue.getJobCounts('active', 'waiting', 'failed').catch(() => ({})),
    ]);

    healthStatus.queues.badge = badgeCounts as Record<string, number>;
    healthStatus.queues.payment = paymentCounts as Record<string, number>;
    healthStatus.queues.notification = notificationCounts as Record<string, number>;

    const isHealthy = healthStatus.redis && healthStatus.database;
    if (!isHealthy) {
      healthStatus.status = 'degraded';
      return NextResponse.json(healthStatus, { status: 503 });
    }

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (err: unknown) {
    healthStatus.status = 'error';
    return NextResponse.json(
      {
        ...healthStatus,
        error: err instanceof Error ? err.message : 'Health check failed',
      },
      { status: 500 }
    );
  }
}