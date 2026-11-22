import { registerAs } from '@nestjs/config';
import { DataSource } from 'typeorm';

const getConfig = () => ({
  type: 'mysql' as const,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['dist/**/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false,
  autoLoadEntities: true,
  logging: true, // 모든 쿼리 로깅
  // 또는 특정 타입만 로깅
  // logging: ['query', 'error', 'schema', 'warn', 'info', 'log'],
});

export const connectionSource = new DataSource(getConfig());

export default registerAs('typeorm', () => getConfig());
