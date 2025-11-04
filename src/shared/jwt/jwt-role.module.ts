// jwt-role.module.ts
// Jwt 관련 Strategy, Guard, Service를 전역에서 사용할 수 있도록 구성하는 모듈

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtRoleStrategy } from './jwt-role.strategy';
import { JwtRoleGuard } from './jwt-role.guard';
import { JwtRoleService } from './jwt-role.service';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'your-secret-key',
      signOptions: {
        // expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME || '7d', // 환경 변수에 설정된 값으로 설정, 기본값은 7일
      },
    }),
  ],
  providers: [
    JwtRoleStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtRoleGuard, // 전역 Guard로 등록
    },
    JwtRoleService,
  ],
  exports: [JwtRoleService],
})
export class JwtRoleModule {}