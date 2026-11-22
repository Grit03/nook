import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import express from 'express';
import { AccessTokenGuard } from './guard/access-token.guard';
import { RefreshTokenGuard } from './guard/refresh-token.guard';
import { User } from './decorator/user.decorator';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.signUp(signUpDto);

    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('signin')
  async signin(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.signIn(signInDto);

    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @Get('signout')
  @UseGuards(AccessTokenGuard)
  signout(@User('sub') userId: string) {
    return this.authService.logout(userId);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @User('sub') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const refreshToken = req.cookies?.refreshToken as string;

    const tokens = await this.authService.refreshAllTokens(
      userId,
      refreshToken,
    );

    // 새로운 refresh token을 쿠키에 저장
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }

  // refresh token을 쿠키에 저장하는 메서드
  private setRefreshTokenCookie(res: express.Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/auth/refresh',
    });
  }
}
