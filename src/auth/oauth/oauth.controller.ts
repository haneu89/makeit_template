import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Public } from '../../shared/jwt';
import { OAuthDto } from './oauth.dto';
import type { Response } from 'express';

@Controller('oauth')
@Public()
export class OAuthController {
  constructor(
    private authService: AuthService,
  ) { }

  /**
   * OAuth 로그인/회원가입 API
   * @param oAuthDto - OAuth 정보 (provider, providerUserId)
   * @param res - 응답 객체 (쿠키 설정용)
   * @returns 로그인/회원가입 결과 (access_token, user 정보)
   */
  @Post()
  async oauth(@Body() oAuthDto: OAuthDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.oauth(oAuthDto);

    // 쿠키에 토큰 설정
    res.cookie('auth-token', result.access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    return result;
  }
}