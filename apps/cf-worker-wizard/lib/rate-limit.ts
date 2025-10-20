type Bucket = { tokens: number; last: number };

const buckets = new Map<string, Bucket>();

// 简单令牌桶：每个 IP 每分钟最多 60 次，按秒回填
const CAPACITY = 60;
const REFILL_PER_SEC = CAPACITY / 60; // 每秒回填 1

export function rateLimit(key: string) {
  const now = Date.now();
  const bucket = buckets.get(key) || { tokens: CAPACITY, last: now };
  const elapsed = (now - bucket.last) / 1000;
  bucket.tokens = Math.min(CAPACITY, bucket.tokens + elapsed * REFILL_PER_SEC);
  bucket.last = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    return { allowed: false, retryAfter: Math.ceil((1 - bucket.tokens) / REFILL_PER_SEC) };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { allowed: true };
}
