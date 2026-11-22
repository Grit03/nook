import { registerAs } from '@nestjs/config';

export interface CacheConfig {
  host: string;
  port: number;
}

export default registerAs('cache', () => ({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
}));
