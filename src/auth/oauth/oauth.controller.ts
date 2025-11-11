import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Public } from '../../shared/jwt';
import { OAuthDto } from './oauth.dto';

@Controller('oauth')
@Public()
export class OAuthController {
  constructor(
    private authService: AuthService,
  ) { }

  /**
   * OAuth 로그인/회원가입 API
   * @param oAuthDto - OAuth 정보 (provider, providerUserId)
   * @returns 로그인/회원가입 결과 (access_token, user 정보)
   */
  @Post()
  async oauth(@Body() oAuthDto: OAuthDto) {
    // localStorage 기반 인증으로 변경 (포트별 완전 격리)
    const result = await this.authService.oauth(oAuthDto);
    return result;
  }
}