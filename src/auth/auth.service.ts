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
    const { email, password, deviceId, platform, deviceModel, osVersion, appVersion, userAgent } = loginDto;

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
      username: user.username,
      name: user.name,
    };

    // Access Token 생성
    const accessToken = await this.jwtRoleService.generateToken(tokenPayload);

    // Refresh Token 생성 (디바이스 정보가 있는 경우)
    let refreshToken: string | null = null;
    let device: any = null;

    if (deviceId && platform) {
      // Refresh Token 생성 (긴 만료 시간)
      const refreshPayload = {
        ...tokenPayload,
        type: 'refresh',
        deviceId,
      };
      refreshToken = await this.jwtRoleService.generateRefreshToken(refreshPayload);

      // 디바이스 정보 저장 또는 업데이트
      const tokenExpiry = new Date();
      const platformConfig = this.getTokenExpiryByPlatform(platform);
      tokenExpiry.setDate(tokenExpiry.getDate() + platformConfig.refreshDays);

      device = await this.prisma.device.upsert({
        where: {
          userId_platform_uuid: {
            userId: user.id,
            platform: platform,
            uuid: deviceId,
          },
        },
        update: {
          refreshToken,
          tokenExpiry,
          deviceModel,
          osVersion,
          appVersion,
          userAgent,
          lastActiveAt: new Date(),
        },
        create: {
          userId: user.id,
          platform,
          uuid: deviceId,
          refreshToken,
          tokenExpiry,
          deviceModel,
          osVersion,
          appVersion,
          userAgent,
          lastActiveAt: new Date(),
        },
      });
    }

    const platformConfig = this.getTokenExpiryByPlatform(platform || 'web');

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: platformConfig.accessSeconds,
      refresh_expires_in: platformConfig.refreshSeconds,
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

  /**
   * 플랫폼별 토큰 만료 시간 설정
   */
  private getTokenExpiryByPlatform(platform: string) {
    const config = {
      web: {
        accessSeconds: 60 * 60, // 1시간
        accessDays: 0,
        refreshSeconds: 7 * 24 * 60 * 60, // 7일
        refreshDays: 7,
      },
      mobile: {
        accessSeconds: 90 * 24 * 60 * 60, // 90일
        accessDays: 90,
        refreshSeconds: 90 * 24 * 60 * 60, // 90일
        refreshDays: 90,
      },
      android: {
        accessSeconds: 90 * 24 * 60 * 60, // 90일
        accessDays: 90,
        refreshSeconds: 90 * 24 * 60 * 60, // 90일
        refreshDays: 90,
      },
      ios: {
        accessSeconds: 90 * 24 * 60 * 60, // 90일
        accessDays: 90,
        refreshSeconds: 90 * 24 * 60 * 60, // 90일
        refreshDays: 90,
      },
    };

    return config[platform] || config.web;
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
          username: payload.username,
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
      username: user.username,
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

  /**
   * Refresh Token으로 Access Token 갱신
   */
  async refreshToken(refreshTokenDto: { refreshToken: string; deviceId?: string }) {
    const { refreshToken, deviceId } = refreshTokenDto;

    try {
      // Refresh Token 검증
      const payload = await this.jwtRoleService.verifyToken(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('유효하지 않은 Refresh Token입니다.');
      }

      // DB에서 디바이스 확인
      const device = await this.prisma.device.findFirst({
        where: {
          userId: payload.sub,
          refreshToken,
          ...(deviceId && { uuid: deviceId }),
        },
        include: {
          user: true,
        },
      });

      if (!device) {
        throw new UnauthorizedException('유효하지 않은 Refresh Token입니다.');
      }

      // 토큰 만료 확인
      if (device.tokenExpiry && device.tokenExpiry < new Date()) {
        throw new UnauthorizedException('만료된 Refresh Token입니다.');
      }

      // 새로운 Access Token 생성
      const newTokenPayload = {
        sub: device.user.id,
        role: device.user.role || Role.USER,
        email: device.user.email,
        username: device.user.username,
        name: device.user.name,
      };

      const newAccessToken = await this.jwtRoleService.generateToken(newTokenPayload);

      // 디바이스 활동 시간 업데이트
      await this.prisma.device.update({
        where: { id: device.id },
        data: { lastActiveAt: new Date() },
      });

      const platformConfig = this.getTokenExpiryByPlatform(device.platform || 'web');

      return {
        access_token: newAccessToken,
        expires_in: platformConfig.accessSeconds,
        user: {
          id: device.user.id,
          email: device.user.email,
          username: device.user.username,
          name: device.user.name,
          role: device.user.role,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      throw new UnauthorizedException('Refresh Token 갱신 실패: ' + message);
    }
  }

  /**
   * 로그아웃 (디바이스 토큰 무효화)
   */
  async logout(userId: number, logoutDto: { deviceId?: string; allDevices?: string }) {
    const { deviceId, allDevices } = logoutDto;

    if (allDevices === 'true') {
      // 모든 디바이스 로그아웃
      await this.prisma.device.updateMany({
        where: { userId },
        data: {
          refreshToken: null,
          tokenExpiry: null,
        },
      });

      return {
        message: '모든 디바이스에서 로그아웃되었습니다.',
        deviceCount: await this.prisma.device.count({ where: { userId } }),
      };
    } else if (deviceId) {
      // 특정 디바이스만 로그아웃
      const device = await this.prisma.device.findFirst({
        where: {
          userId,
          uuid: deviceId,
        },
      });

      if (!device) {
        throw new UnauthorizedException('디바이스를 찾을 수 없습니다.');
      }

      await this.prisma.device.update({
        where: { id: device.id },
        data: {
          refreshToken: null,
          tokenExpiry: null,
        },
      });

      return {
        message: '로그아웃되었습니다.',
        deviceId,
      };
    } else {
      // deviceId 정보가 없으면 첫 번째 디바이스 로그아웃
      const device = await this.prisma.device.findFirst({
        where: { userId },
        orderBy: { lastActiveAt: 'desc' },
      });

      if (device) {
        await this.prisma.device.update({
          where: { id: device.id },
          data: {
            refreshToken: null,
            tokenExpiry: null,
          },
        });
      }

      return {
        message: '로그아웃되었습니다.',
      };
    }
  }

  /**
   * 사용자의 모든 활성 디바이스 조회
   */
  async getActiveDevices(userId: number) {
    const devices = await this.prisma.device.findMany({
      where: {
        userId,
        refreshToken: { not: null },
        tokenExpiry: { gte: new Date() },
      },
      select: {
        id: true,
        platform: true,
        uuid: true,
        deviceModel: true,
        osVersion: true,
        appVersion: true,
        lastActiveAt: true,
        tokenExpiry: true,
        createdAt: true,
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    return {
      devices,
      count: devices.length,
    };
  }
}
