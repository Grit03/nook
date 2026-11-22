import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialAccount } from './social_account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SocialAccount])],
})
export class SocialAccountModule {}
