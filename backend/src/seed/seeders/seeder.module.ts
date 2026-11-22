import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';
import { SocialAccount } from 'src/social_account/social_account.entity';
import { Stay } from 'src/stay/stay.entity';
import { Booking } from 'src/booking/booking.entity';
import { Payment } from 'src/payment/payment.entity';
import { UserSeeder } from './user.seeder';
import { StaySeeder } from './stay.seeder';
// import { BookingSeeder } from './booking.seeder';
// import { PaymentSeeder } from './payment.seeder';
import { DatabaseSeeder } from './database.seeder';
import typeorm from 'src/config/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
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
    TypeOrmModule.forFeature([
      User,
      SocialAccount,
      Stay,
      Booking,
      Payment,
    ]),
  ],
  providers: [
    UserSeeder,
    StaySeeder,
    // BookingSeeder,
    // PaymentSeeder,
    DatabaseSeeder,
  ],
  exports: [DatabaseSeeder],
})
export class SeederModule {}
