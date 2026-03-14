import { createClient, RedisClientType } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://default:1hPNpVjXcSy22D0NWn5Z8JFgXdOMgD7p@redis-18251.crce283.ap-south-1-2.ec2.cloud.redislabs.com:18251';

let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (client && client.isOpen) {
    return client;
  }

  client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          return new Error('Redis reconnection failed');
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });

  client.on('error', (err) => {
    console.error('Redis error:', err);
  });

  client.on('connect', () => {
    console.log('Connected to Redis');
  });

  await client.connect();
  return client;
}

export async function closeRedis(): Promise<void> {
  if (client && client.isOpen) {
    await client.quit();
    client = null;
    console.log('Redis connection closed');
  }
}

export const CACHE_KEYS = {
  session: (sessionId: string) => `session:${sessionId}`,
  settings: (userId: string) => `settings:${userId}`,
  analytics: (date: string) => `analytics:${date}`,
  rateLimit: (ip: string) => `ratelimit:${ip}`,
};

export const CACHE_TTL = {
  session: 86400 * 7,
  settings: 86400,
  analytics: 3600,
  rateLimit: 60,
};
