import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignUpDto } from './dto/sign-up.dto';
import { hash, verify } from 'argon2';
import { User } from 'src/user/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager'; // @nestjs/cache-manager의 Cache와 사실상 동일
import { SignInDto } from './dto/sign-in.dto';
import { JwtPayload } from './types/jwt-payload';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {}

  // 회원가입
  async signUp(signUpDto: SignUpDto): Promise<Tokens> {
    const isExist = await this.userService.findByEmail(signUpDto.email);
    if (isExist) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 암호화
    const hashedPassword = await hash(signUpDto.password);
    // 새 유저 생성
    const newUser = await this.userService.create({
      ...signUpDto,
      password: hashedPassword,
    });

    // 토큰 발급
    const tokens = await this.getTokens(newUser);

    // refresh token을 캐시(레디스)에 저장
    await this.updateRefreshTokenInCache(newUser.id, tokens.refreshToken);

    // user 대신 token들을 반환
    return tokens;
  }

  // 일반 로그인
  async signIn(signInDto: SignInDto): Promise<Tokens> {
    const user = await this.userService.findByEmail(signInDto.email);

    if (!user) {
      throw new BadRequestException('존재하지 않는 이메일입니다.');
    }

    // 일반 로그인 경우만 처리
    // TODO: 소셜 로그인과의 관계 고려해서 재설계
    if (!user.password) {
      throw new BadRequestException('비밀번호를 입력해주세요.');
    }

    const isPasswordValid = await verify(user.password, signInDto.password);
    if (!isPasswordValid) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    const tokens = await this.getTokens(user);
    await this.updateRefreshTokenInCache(user.id, tokens.refreshToken);

    return tokens;
  }

  // 로그아웃
  // 브라우저 상의 access-token 등을 날리는 작업을 서버에서 하긴 어렵다.
  // 서버에서 할 수 있는 작업은, 캐시(레디스)에 있는 유저의 refresh-token을 날리는 것
  async logout(userId: string) {
    await this.cacheService.del(userId);
  }

  // refresh token을 사용하여 새로운 토큰(access token, refresh token)을 발급
  async refreshAllTokens(userId: string, refreshToken: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    const cachedRefreshToken = await this.cacheService.get<string>(userId);
    if (!cachedRefreshToken) {
      throw new ForbiddenException('refresh 토큰이 존재하지 않습니다.');
    }

    const isRefreshTokenValid = await verify(cachedRefreshToken, refreshToken);

    if (!isRefreshTokenValid) {
      throw new ForbiddenException('refresh 토큰이 일치하지 않습니다.');
    }

    // 새로운 토큰(access token, refresh token) 발급
    const tokens = await this.getTokens(user);
    // 새로운 refresh token을 캐시(레디스)에 저장
    await this.updateRefreshTokenInCache(user.id, tokens.refreshToken);

    return tokens;
  }
  // refresh token을 캐시(레디스)에 저장
  private async updateRefreshTokenInCache(
    userId: string,
    refreshToken: string,
  ) {
    const SEVEN_DAYS_IN_MILLISECONDS = 60 * 60 * 24 * 7 * 1000;

    const hashedRefreshToken = await hash(refreshToken);
    await this.cacheService.set<string>(
      userId,
      hashedRefreshToken,
      SEVEN_DAYS_IN_MILLISECONDS,
    );
  }

  // 토큰 발급 메서드
  private async getTokens(user: User): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync<JwtPayload>(
        { sub: user.id, email: user.email, name: user.name } as JwtPayload,
        {
          expiresIn: '15m',
          secret: this.configService.get('JWT_ACCESS_SECRET'),
        },
      ),
      this.jwtService.signAsync<JwtPayload>(
        { sub: user.id, email: user.email, name: user.name },
        {
          expiresIn: '7d',
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }
}
