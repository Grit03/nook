import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// 일반 회원가입 기준으로 작성된 DTO
// TODO: 소셜로그인 기준으로 DTO 추가 필요
export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  password: string;
}
