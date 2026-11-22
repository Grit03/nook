import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stay } from 'src/stay/stay.entity';
import { StayService } from 'src/stay/stay.service';

@Module({
  imports: [TypeOrmModule.forFeature([Stay])],
  providers: [StayService],
  exports: [StayService],
})
export class StayModule {}
