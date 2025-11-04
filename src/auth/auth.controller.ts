import { Body, Controller, Post, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { Public } from '../shared/jwt';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);
    
    // 쿠키에 토큰 설정 (클라이언트에서 접근 가능하도록 httpOnly: false)
    res.cookie('auth-token', result.access_token, {
      httpOnly: false, // 클라이언트에서 읽을 수 있도록 변경
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });
    
    return result;
  }

  @Get('verify')
  async verifyToken(@Req() req: Request) {
    return this.authService.verifyToken(req);
  }
}