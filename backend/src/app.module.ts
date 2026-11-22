import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import typeorm from './config/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import cache, { CacheConfig } from './config/cache';
import { AuthModule } from './auth/auth.module';
import { SocialAccountModule } from './social_account/social_account.module';
import { StayModule } from './stay/stay.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm, cache],
    }),
    CacheModule.registerAsync({
      isGlobal: true, // 이 줄 추가!
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('cache') as CacheConfig;
        if (!config || !config.host || !config.port) {
          throw new Error('Cache 설정을 찾을 수 없습니다.');
        }

        return {
          stores: [createKeyv(`redis://${config.host}:${config.port}`)],
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('typeorm') as TypeOrmModuleOptions;
        if (!config) {
          throw new Error('TypeORM 설정을 찾을 수 없습니다.');
        }
        return config;
      },
    }),
    UserModule,
    AuthModule,
    SocialAccountModule,
    StayModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
