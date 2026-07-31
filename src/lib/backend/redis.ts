import dotenv from 'dotenv';
dotenv.config();

import { Redis } from 'ioredis';

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: isBuildPhase ? 0 : 3,
    enableOfflineQueue: !isBuildPhase,
  })
  : new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: isBuildPhase ? 0 : 3,
    enableOfflineQueue: !isBuildPhase,
  });

export const noRetryRedis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  })
  : new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  });
  

noRetryRedis.on('connect', () => {
  console.log('✅ Connected to Redis cache (no retry)');
});

noRetryRedis.on('error', (err) => {
  if (isBuildPhase) return;
  console.error('Redis connection error:', err);
});




redis.on('connect', () => {
  console.log('✅ Connected to Redis cache');
});

redis.on('error', (err) => {
  if (isBuildPhase) return;
  console.error('Redis connection error:', err);
});

export default redis;