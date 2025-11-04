// jwt-role.guard.ts
// Nest의 AuthGuard('jwt')를 확장하여 역할 기반 접근 제어까지 담당하는 커스텀 Guard

import { ExecutionContext, Injectable, SetMetadata, UnauthorizedException, CustomDecorator } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum';

// 데코레이터 키 정의
export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

// 데코레이터 정의
export const Public = (): CustomDecorator<string> => SetMetadata(IS_PUBLIC_KEY, true);
export const Roles = (...roles: Role[]): CustomDecorator<string> => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class JwtRoleGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // Nest의 API 경로가 아닌 경우 인증 패스
    if (!url.startsWith('/api')) {
      return true;
    }

    // @Public 데코레이터가 붙은 경우 인증 패스
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // 기본 JWT 인증 수행
    const isAuthenticated = await super.canActivate(context) as boolean;
    if (!isAuthenticated) {
      return false;
    }

    // 역할 체크 시작
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const user = request.user;
    const userRoles: string[] = user.roles || [user.role]; // roles 배열 우선 사용

    // 역할 지정이 없으면 인증만 확인
    if (!requiredRoles) {
      return true;
    }

    // ADMIN은 항상 통과
    if (userRoles.includes(Role.ADMIN)) {
      return true;
    }

    // 지정된 역할 중 하나라도 포함되면 통과
    return requiredRoles.some(role => userRoles.includes(role));
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException(info?.message || '인증이 필요합니다');
    }
    return user;
  }
}