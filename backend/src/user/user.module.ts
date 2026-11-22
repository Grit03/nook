import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // UserRepository를 자유롭게 사용하기 위해서 설정
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // Auth 모듈에서 사용할 예정
})
export class UserModule {}
