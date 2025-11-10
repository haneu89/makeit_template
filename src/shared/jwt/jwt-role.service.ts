// jwt-role.service.ts
// JWT 토큰을 생성하는 서비스 (로그인 등에서 사용)

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtRoleService {
  constructor(private jwtService: JwtService) {}

  /**
   * 사용자 정보를 기반으로 JWT 토큰을 생성합니다.
   * @param user 사용자 정보
   * @returns 생성된 JWT 토큰
   */
  async generateToken(user: any): Promise<string> {
    const payload = {
      sub: user.sub,
      role: user.role,
      roles: user.roles || [user.role],
      domain: user.domain,
      ...(user.email ? { email: user.email } : {}),
      ...(user.username ? { username: user.username } : {}),
      ...(user.name ? { name: Buffer.from(user.name).toString('base64') } : {}),
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Refresh Token 생성 (긴 만료 시간)
   * @param user 사용자 정보
   * @returns 생성된 Refresh Token
   */
  async generateRefreshToken(user: any): Promise<string> {
    const payload = {
      sub: user.sub,
      role: user.role,
      type: 'refresh', // Refresh Token 표시
      deviceId: user.deviceId,
      ...(user.email ? { email: user.email } : {}),
      ...(user.username ? { username: user.username } : {}),
    };

    // Refresh Token은 환경 변수의 만료 시간 사용
    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '90d',
    });
  }

  /**
   * JWT 토큰을 검증하고 페이로드를 반환합니다.
   * @param token 검증할 JWT 토큰
   * @returns 토큰의 페이로드
   */
  async verifyToken(token: string): Promise<any> {
    return this.jwtService.verify(token);
  }
}