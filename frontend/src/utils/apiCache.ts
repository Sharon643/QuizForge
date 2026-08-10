type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 30 * 1000; // 30 seconds

export function getCached<T>(
  key: string,
  ttl = DEFAULT_TTL
): T | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  const expired =
    Date.now() - entry.timestamp > ttl;

  if (expired) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

export function setCached<T>(
  key: string,
  data: T
) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function invalidateCache(
  key: string
) {
  cache.delete(key);
}

export function clearCache() {
  cache.clear();
}