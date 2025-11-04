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
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Bearer 헤더에서 추출
        (request: Request) => {
          // 쿠키에서 직접 추출 (cookie-parser 없이)
          const cookieHeader = request.headers.cookie;
          
          if (!cookieHeader) return null;
          
          const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);
          
          const token = cookies['auth-token'];
          
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secretKey,
      passReqToCallback: true, // 요청 객체를 validate로 넘겨줌
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