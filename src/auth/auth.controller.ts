import { Body, Controller, Post, Get, Req, Res, UseGuards, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, LogoutDto } from './auth.dto';
import { Public } from '../shared/jwt';
import { JwtRoleGuard } from '../shared/jwt/jwt-role.guard';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);

    // 쿠키에 Access Token 설정
    res.cookie('auth-token', result.access_token, {
      httpOnly: false, // 클라이언트에서 읽을 수 있도록
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: result.expires_in * 1000, // 플랫폼별 만료 시간
    });

    // Refresh Token은 httpOnly 쿠키에 저장 (보안)
    if (result.refresh_token) {
      res.cookie('refresh-token', result.refresh_token, {
        httpOnly: true, // 클라이언트 JS에서 접근 불가 (보안)
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: result.refresh_expires_in * 1000,
      });
    }

    return result;
  }

  @Get('verify')
  async verifyToken(@Req() req: Request) {
    return this.authService.verifyToken(req);
  }

  /**
   * Refresh Token으로 Access Token 갱신
   */
  @Public()
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.refreshToken(refreshTokenDto);

    // 새로운 Access Token을 쿠키에 설정
    res.cookie('auth-token', result.access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: result.expires_in * 1000,
    });

    return result;
  }

  /**
   * 로그아웃 (디바이스 토큰 무효화)
   */
  @UseGuards(JwtRoleGuard)
  @Post('logout')
  async logout(@Req() req: any, @Body() logoutDto: LogoutDto, @Res({ passthrough: true }) res: Response) {
    const userId = req.user.sub;
    const result = await this.authService.logout(userId, logoutDto);

    // 쿠키 삭제
    res.clearCookie('auth-token');
    res.clearCookie('refresh-token');

    return result;
  }

  /**
   * 사용자의 활성 디바이스 목록 조회
   */
  @UseGuards(JwtRoleGuard)
  @Get('devices')
  async getDevices(@Req() req: any) {
    const userId = req.user.sub;
    return this.authService.getActiveDevices(userId);
  }

  /**
   * 특정 디바이스 로그아웃
   */
  @UseGuards(JwtRoleGuard)
  @Post('logout-device/:deviceId')
  async logoutDevice(@Req() req: any, @Param('deviceId') deviceId: string) {
    const userId = req.user.sub;
    return this.authService.logout(userId, { deviceId });
  }
}