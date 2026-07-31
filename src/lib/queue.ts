import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import {noRetryRedis} from './backend/redis';

export function getQueueRedisConnection(): Redis {
  return noRetryRedis
}

// Global queue singletons to avoid creating multiple instances in Next.js dev hot-reloads
const globalForQueues = globalThis as unknown as {
  notificationQueue?: Queue;
  systemQueue?: Queue;
  badgeQueue?: Queue;
  paymentQueue?: Queue;
};

export const notificationQueue =
  globalForQueues.notificationQueue ??
  new Queue('notifications', {
    connection: getQueueRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: { age: 3600, count: 100 },
      removeOnFail: { age: 86400, count: 500 },
    },
  });

export const systemQueue =
  globalForQueues.systemQueue ??
  new Queue('system-tasks', {
    connection: getQueueRedisConnection(),
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 2000,
      },
      removeOnComplete: { age: 3600, count: 100 },
      removeOnFail: { age: 86400, count: 500 },
    },
  });

export const badgeQueue =
  globalForQueues.badgeQueue ??
  new Queue('badge-minting', {
    connection: getQueueRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: { age: 3600, count: 100 },
      removeOnFail: { age: 86400, count: 500 },
    },
  });

export const paymentQueue =
  globalForQueues.paymentQueue ??
  new Queue('payment-verification', {
    connection: getQueueRedisConnection(),
    defaultJobOptions: {
      attempts: 10,
      backoff: {
        type: 'fixed',
        delay: 5000, // retry every 5s to allow Blockfrost indexing
      },
      removeOnComplete: { age: 3600, count: 100 },
      removeOnFail: { age: 86400, count: 500 },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForQueues.notificationQueue = notificationQueue;
  globalForQueues.systemQueue = systemQueue;
  globalForQueues.badgeQueue = badgeQueue;
  globalForQueues.paymentQueue = paymentQueue;
}
