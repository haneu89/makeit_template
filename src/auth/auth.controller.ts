import { Body, Controller, Post, Get, Req, UseGuards, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, LogoutDto } from './auth.dto';
import { Public } from '../shared/jwt';
import { JwtRoleGuard } from '../shared/jwt/jwt-role.guard';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // localStorage 기반 인증으로 변경 (포트별 완전 격리)
    const result = await this.authService.login(loginDto);
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
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshTokenDto);
    return result;
  }

  /**
   * 로그아웃 (디바이스 토큰 무효화)
   */
  @UseGuards(JwtRoleGuard)
  @Post('logout')
  async logout(@Req() req: any, @Body() logoutDto: LogoutDto) {
    const userId = req.user.sub;
    const result = await this.authService.logout(userId, logoutDto);
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