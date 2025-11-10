import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtRoleService } from '../shared/jwt';
import { PrismaService } from '../shared/prisma/prisma.service';
import { LoginDto } from './auth.dto';
import * as bcrypt from 'bcrypt';

// Bcrypt mock
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtRoleService: JwtRoleService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    password: '$2b$10$hashedpassword',
    name: 'Test User',
    role: 'USER',
    profileImage: null,
    provider: 'local',
    providerUserId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockJwtRoleService = {
    generateToken: jest.fn().mockResolvedValue('mock-access-token'),
    generateRefreshToken: jest.fn().mockResolvedValue('mock-refresh-token'),
    verifyToken: jest.fn(),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    findOrCreate: jest.fn(),
    findOrCreateDevice: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    device: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtRoleService, useValue: mockJwtRoleService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtRoleService = module.get<JwtRoleService>(JwtRoleService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('login', () => {
    describe('Remember Me 기능 테스트', () => {
      it('Remember Me 체크 시 30일 refresh token 만료 시간 설정', async () => {
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'password123',
          rememberMe: true,
          platform: 'web',
          deviceId: 'device-123',
        };

        mockUserService.findByEmail.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockPrismaService.device.upsert.mockResolvedValue({
          id: 1,
          userId: 1,
          platform: 'web',
          uuid: 'device-123',
        });

        const result = await service.login(loginDto);

        // Refresh token 만료 시간이 30일 (2,592,000초)인지 확인
        expect(result.refresh_expires_in).toBe(30 * 24 * 60 * 60);
        expect(result.refresh_token).toBe('mock-refresh-token');

        // Device upsert 호출 시 tokenExpiry가 30일 후로 설정되었는지 확인
        const upsertCall = mockPrismaService.device.upsert.mock.calls[0][0];
        const tokenExpiry = upsertCall.create.tokenExpiry;
        const now = new Date();
        const expectedExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // 시간 차이가 1초 이내인지 확인 (테스트 실행 시간 고려)
        expect(Math.abs(tokenExpiry.getTime() - expectedExpiry.getTime())).toBeLessThan(1000);
      });

      it('Remember Me 미체크 시 세션 쿠키 (0초) 설정', async () => {
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
          platform: 'web',
          deviceId: 'device-123',
        };

        mockUserService.findByEmail.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockPrismaService.device.upsert.mockResolvedValue({
          id: 1,
          userId: 1,
          platform: 'web',
          uuid: 'device-123',
        });

        const result = await service.login(loginDto);

        // Refresh token 만료 시간이 0초 (세션 쿠키)인지 확인
        expect(result.refresh_expires_in).toBe(0);
        expect(result.refresh_token).toBe('mock-refresh-token');
      });

      it('Remember Me 미설정 시 기본값 false로 동작', async () => {
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'password123',
          platform: 'web',
          deviceId: 'device-123',
        };

        mockUserService.findByEmail.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockPrismaService.device.upsert.mockResolvedValue({
          id: 1,
          userId: 1,
          platform: 'web',
          uuid: 'device-123',
        });

        const result = await service.login(loginDto);

        // rememberMe가 undefined이면 기본값 false로 세션 쿠키
        expect(result.refresh_expires_in).toBe(0);
      });
    });

    describe('일반 로그인 테스트', () => {
      it('이메일과 비밀번호가 올바르면 로그인 성공', async () => {
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'password123',
        };

        mockUserService.findByEmail.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const result = await service.login(loginDto);

        expect(result.access_token).toBe('mock-access-token');
        expect(result.user.email).toBe('test@example.com');
        expect(mockJwtRoleService.generateToken).toHaveBeenCalled();
      });

      it('존재하지 않는 이메일로 로그인 시도 시 예외 발생', async () => {
        const loginDto: LoginDto = {
          email: 'notfound@example.com',
          password: 'password123',
        };

        mockUserService.findByEmail.mockResolvedValue(null);

        await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      });

      it('비밀번호가 틀리면 예외 발생', async () => {
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'wrongpassword',
        };

        mockUserService.findByEmail.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      });

      it('비밀번호가 설정되지 않은 계정 (OAuth 전용)으로 로그인 시도 시 예외 발생', async () => {
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'password123',
        };

        const userWithoutPassword = { ...mockUser, password: null };
        mockUserService.findByEmail.mockResolvedValue(userWithoutPassword);

        await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('플랫폼별 토큰 만료 시간 테스트', () => {
      it('모바일 플랫폼은 Remember Me와 관계없이 90일 설정', async () => {
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false, // false여도 모바일은 90일
          platform: 'android',
          deviceId: 'device-123',
        };

        mockUserService.findByEmail.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockPrismaService.device.upsert.mockResolvedValue({
          id: 1,
          userId: 1,
          platform: 'android',
          uuid: 'device-123',
        });

        const result = await service.login(loginDto);

        // 모바일은 90일
        expect(result.refresh_expires_in).toBe(90 * 24 * 60 * 60);
      });
    });
  });

  describe('logout', () => {
    it('특정 디바이스 로그아웃 시 해당 디바이스만 토큰 무효화', async () => {
      const userId = 1;
      const deviceId = 'device-123';

      mockPrismaService.device.findFirst.mockResolvedValue({
        id: 1,
        userId,
        uuid: deviceId,
        refreshToken: 'mock-refresh-token',
      });

      mockPrismaService.device.update.mockResolvedValue({
        id: 1,
        refreshToken: null,
        tokenExpiry: null,
      });

      const result = await service.logout(userId, { deviceId });

      expect(result.message).toBe('로그아웃되었습니다.');
      expect(mockPrismaService.device.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          refreshToken: null,
          tokenExpiry: null,
        },
      });
    });

    it('모든 디바이스 로그아웃 시 전체 토큰 무효화', async () => {
      const userId = 1;

      mockPrismaService.device.updateMany.mockResolvedValue({ count: 3 });
      mockPrismaService.device.count.mockResolvedValue(3);

      const result = await service.logout(userId, { allDevices: 'true' });

      expect(result.message).toBe('모든 디바이스에서 로그아웃되었습니다.');
      expect(result.deviceCount).toBe(3);
      expect(mockPrismaService.device.updateMany).toHaveBeenCalledWith({
        where: { userId },
        data: {
          refreshToken: null,
          tokenExpiry: null,
        },
      });
    });
  });
});
