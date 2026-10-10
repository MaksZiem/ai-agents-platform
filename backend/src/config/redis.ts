import type { ConnectionOptions } from 'bullmq';

export function parseRedisUrl(url: string): ConnectionOptions {
  const redisUrl = new URL(url);

  return {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || 6379),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    db: Number(redisUrl.pathname.slice(1) || 0),
  };
}
