import redis from '@/lib/backend/redis';

const DEFAULT_CACHE_TTL_SECONDS = 90;

export const cacheKey = (...segments: Array<string | number>): string => {
  return segments.join(':');
};

export const getCacheJSON = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const setCacheJSON = async <T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_CACHE_TTL_SECONDS,
): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // Swallow cache write failure to keep primary path healthy.
  }
};

export const cacheAside = async <T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlSeconds: number = DEFAULT_CACHE_TTL_SECONDS,
): Promise<T> => {
  const cached = await getCacheJSON<T>(key);
  if (cached !== null) return cached;

  const fresh = await queryFn();
  await setCacheJSON(key, fresh, ttlSeconds);
  return fresh;
};

export const cacheAsideWithLock = async <T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlSeconds: number = DEFAULT_CACHE_TTL_SECONDS,
): Promise<T> => {
  const cached = await getCacheJSON<T>(key);
  if (cached !== null) return cached;

  // Try to acquire lock
  const lockKey = `lock:${key}`;
  const acquired = await redis.set(lockKey, '1', 'EX', 15, 'NX');

  if (acquired) {
    try {
      const fresh = await queryFn();
      await setCacheJSON(key, fresh, ttlSeconds);
      return fresh;
    } finally {
      await redis.del(lockKey);
    }
  }

  // Lock not acquired, someone else is fetching. Wait briefly and retry reading from cache.
  for (let i = 0; i < 15; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newlyCached = await getCacheJSON<T>(key);
    if (newlyCached !== null) return newlyCached;
  }

  // Fallback if the other request failed to populate cache
  const fresh = await queryFn();
  await setCacheJSON(key, fresh, ttlSeconds);
  return fresh;
};

export const invalidateCacheKey = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch {
    // Best-effort invalidation.
  }
};

export const invalidateCachePattern = async (pattern: string): Promise<void> => {
  try {
    let cursor = '0';

    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch {
    // Best-effort invalidation.
  }
};

export const getCounter = async (key: string): Promise<number> => {
  try {
    const value = await redis.get(key);
    return value ? Number(value) : 0;
  } catch {
    return 0;
  }
};

export const incrementWithWindow = async (key: string, ttlSeconds: number): Promise<number> => {
  try {
    const next = await redis.incr(key);
    if (next === 1) {
      await redis.expire(key, ttlSeconds);
    }
    return next;
  } catch {
    return 0;
  }
};
