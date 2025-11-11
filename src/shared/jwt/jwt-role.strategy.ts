// jwt-role.strategy.ts
// JWT를 해석하는 Passport Strategy. 사용자 정보를 인증한 후 요청에 포함시킴.

import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtRoleStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const secretKey = process.env.JWT_ACCESS_TOKEN_SECRET || 'your-secret-key';

    super({
      // localStorage 기반 인증: Authorization 헤더에서만 토큰 추출
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(_req: Request, payload: any) {
    // 여기에선 역할 검사를 하지 않음 (인증만 담당)
    return {
      ...payload,
      id: payload.sub,
      roles: payload.roles || [payload.role],
    };
  }
}