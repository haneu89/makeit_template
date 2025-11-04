import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto, RegisterResponseDto } from './auth.dto';
import { OAuthDto } from './oauth/oauth.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtRoleService } from '../shared/jwt';
import { Role } from '../shared/jwt/roles.enum';
import { Request } from 'express';
import { PrismaService } from '../shared/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtRoleService: JwtRoleService,
    private readonly prisma: PrismaService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 로그인 방식 설정 확인 (email 또는 username)
    const loginMethod = process.env.NEXT_PUBLIC_LOGIN_METHOD || 'email';

    // loginMethod에 따라 사용자 찾기
    let user;
    if (loginMethod === 'username') {
      user = await this.prisma.user.findUnique({
        where: { username: email } // email 필드에 username이 입력됨
      });
    } else {
      user = await this.userService.findByEmail(email);
    }

    if (!user) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    if (!user.password) {
      throw new UnauthorizedException('비밀번호가 설정되지 않은 계정입니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    const tokenPayload = {
      sub: user.id,
      role: user.role || Role.USER,
      email: user.email,
      name: user.name,
    };

    return {
      access_token: await this.jwtRoleService.generateToken(tokenPayload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage,
      }
    };
  }

  async verifyToken(req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('인증 토큰이 없습니다.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('인증 토큰이 없습니다.');
    }

    try {
      const payload = await this.jwtRoleService.verifyToken(token);
      
      return {
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role,
        }
      };
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  async register(
    uuid: string,
    optionalField?: { platform?: string; domain?: string },
    userInfo?: { gender?: string; birth?: number; name?: string }
  ): Promise<RegisterResponseDto> {
    const platform = optionalField?.platform || 'aos';
    const domain = optionalField?.domain || 'localhost';

    // UserService의 create 함수를 호출하여 새 사용자를 생성하거나 기존 사용자를 검색
    const user = await this.userService.findOrCreate({
      provider: 'uuid',
      providerUserId: uuid,
    });

    // 사용자 정보 업데이트 (userInfo가 없으면 기본값 '익명' 사용)
    const defaultUserInfo = {
      name: '익명',
      gender: '',
      birth: 0,
    };

    const finalUserInfo = userInfo || defaultUserInfo;

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: finalUserInfo.name || '익명',
      },
    });

    // 디바이스 등록 또는 업데이트
    await this.userService.findOrCreateDevice({
      userId: user.id,
      platform,
      domain,
      uuid,
    });

    // JWT 토큰 생성
    const payload = { platform, domain, sub: user.id, uuid };

    const token = await this.jwtRoleService.generateToken(payload);

    return {
      access_token: token,
      user_id: user.id
    };
  }

  async oauth(oAuthDto: OAuthDto) {
    const { provider, providerUserId, name, email } = oAuthDto;

    // provider와 providerUserId로 기존 사용자 찾거나 새로 생성
    const user = await this.userService.findOrCreate({
      provider,
      providerUserId,
      name,
      email,
    });

    const tokenPayload = {
      sub: user.id,
      role: user.role || Role.USER,
      email: user.email,
      name: user.name,
      provider,
      providerUserId,
    };

    return {
      access_token: await this.jwtRoleService.generateToken(tokenPayload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage,
      }
    };
  }
}
