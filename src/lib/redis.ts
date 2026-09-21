import Redis from 'ioredis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  totalLimit: number;
  degraded?: boolean;
  reason?: string;
}

export interface RateLimitOptions {
  isSecuritySensitive?: boolean;
  failClosed?: boolean;
}

export interface ICacheService {
  isRedisConnected: boolean;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
    options?: RateLimitOptions
  ): Promise<RateLimitResult>;
}

function sanitizeRedisUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  let cleaned = raw.trim();
  if (cleaned.startsWith('REDIS_URL=')) {
    cleaned = cleaned.substring('REDIS_URL='.length);
  }
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

class RedisCacheService implements ICacheService {
  public isRedisConnected: boolean = false;
  private redis: Redis | null = null;
  private localFallback: Map<string, { value: string; expiresAt: number }> = new Map();
  private localRateLimits: Map<string, { count: number; resetAt: number }> = new Map();

  constructor() {
    const redisUrl = sanitizeRedisUrl(process.env.REDIS_URL);
    if (redisUrl) {
      try {
        const isTls = redisUrl.startsWith('rediss://');
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 2,
          connectTimeout: 5000,
          tls: isTls ? { rejectUnauthorized: false } : undefined,
          retryStrategy(times) {
            if (times > 5) return null;
            return Math.min(times * 150, 1500);
          },
        });
        this.redis.on('connect', () => {
          this.isRedisConnected = true;
          console.log('[Redis] Connected to Upstash Redis cluster');
        });
        this.redis.on('ready', () => {
          this.isRedisConnected = true;
        });
        this.redis.on('error', (err) => {
          this.isRedisConnected = false;
          console.warn('[Redis] Connection degraded, local secure fallback active:', err.message);
        });
      } catch (e: any) {
        console.warn('[Redis] Initialization notice, using secure in-memory cache:', e.message);
      }
    } else {
      this.isRedisConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isRedisConnected && this.redis) {
      try {
        return await this.redis.get(key);
      } catch {
        // Fall back to local
      }
    }
    const item = this.localFallback.get(key);
    if (!item) return null;
    if (item.expiresAt < Date.now()) {
      this.localFallback.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.set(key, value, 'EX', ttlSeconds);
        return;
      } catch {
        // Fall back to local
      }
    }
    this.localFallback.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.del(key);
      } catch {}
    }
    this.localFallback.delete(key);
  }

  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
    options?: RateLimitOptions
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const isSecuritySensitive = options?.isSecuritySensitive ?? false;
    const failClosed = options?.failClosed ?? false;

    if (this.isRedisConnected && this.redis) {
      try {
        const fullKey = `rl:${key}`;
        const current = await this.redis.incr(fullKey);
        if (current === 1) {
          await this.redis.expire(fullKey, windowSeconds);
        }
        const ttl = await this.redis.ttl(fullKey);
        return {
          allowed: current <= limit,
          remaining: Math.max(0, limit - current),
          resetSeconds: Math.max(1, ttl),
          totalLimit: limit,
        };
      } catch (err: any) {
        console.warn(`[RateLimiter] Distributed Redis rate-limiting check failed: ${err.message}`);
        // If security-sensitive and failClosed policy is active, fail closed to prevent distributed brute force
        if (isSecuritySensitive && failClosed) {
          return {
            allowed: false,
            remaining: 0,
            resetSeconds: windowSeconds,
            totalLimit: limit,
            degraded: true,
            reason: 'SECURITY_RATE_LIMITER_UNAVAILABLE',
          };
        }
      }
    } else if (isSecuritySensitive && failClosed && process.env.NODE_ENV === 'production') {
      // In production, security-sensitive operations without connected Redis fail closed
      return {
        allowed: false,
        remaining: 0,
        resetSeconds: windowSeconds,
        totalLimit: limit,
        degraded: true,
        reason: 'SECURITY_RATE_LIMITER_DISCONNECTED',
      };
    }

    // Safely bounded local rate limit fallback
    // For security-sensitive requests falling back to memory, apply a stricter defensive bound
    const effectiveLimit = isSecuritySensitive ? Math.min(limit, 5) : limit;

    let record = this.localRateLimits.get(key);
    if (!record || record.resetAt <= now) {
      record = { count: 1, resetAt: now + windowSeconds * 1000 };
      this.localRateLimits.set(key, record);
      return {
        allowed: true,
        remaining: effectiveLimit - 1,
        resetSeconds: windowSeconds,
        totalLimit: effectiveLimit,
        degraded: isSecuritySensitive,
      };
    }

    record.count += 1;
    const remaining = Math.max(0, effectiveLimit - record.count);
    const resetSeconds = Math.ceil((record.resetAt - now) / 1000);

    return {
      allowed: record.count <= effectiveLimit,
      remaining,
      resetSeconds,
      totalLimit: effectiveLimit,
      degraded: isSecuritySensitive,
    };
  }
}

export const cacheService = new RedisCacheService();
