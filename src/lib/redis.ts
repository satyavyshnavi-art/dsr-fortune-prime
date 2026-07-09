import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export { redis };

const PREFIX = "sw:";
// Per-namespace index of live cache keys, so invalidate() can target a
// namespace directly instead of scanning the whole keyspace with KEYS.
const INDEX_PREFIX = "sw:idx:";

// Namespace = the segment before the first ":" of a cache key or pattern.
// e.g. "tasks:all:all" -> "tasks", "dashboard:*" -> "dashboard".
function namespaceOf(keyOrPattern: string): string {
  const colon = keyOrPattern.indexOf(":");
  return colon === -1 ? keyOrPattern : keyOrPattern.slice(0, colon);
}

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  if (!redis) return fn();

  try {
    const hit = await redis.get<T>(PREFIX + key);
    if (hit !== null && hit !== undefined) return hit;
  } catch {
    return fn();
  }

  const result = await fn();

  try {
    await redis.set(PREFIX + key, JSON.stringify(result), { ex: ttlSeconds });
    // Record the key under its namespace so it can be invalidated by name.
    await redis.sadd(INDEX_PREFIX + namespaceOf(key), key);
  } catch {}

  return result;
}

export async function invalidate(...patterns: string[]) {
  if (!redis) return;

  try {
    for (const pattern of patterns) {
      const indexKey = INDEX_PREFIX + namespaceOf(pattern);
      const keys = await redis.smembers(indexKey);
      if (keys.length > 0) {
        await redis.del(...keys.map((k) => PREFIX + k));
      }
      await redis.del(indexKey);
    }
  } catch {}
}
