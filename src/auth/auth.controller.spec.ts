import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    getActiveDevices: jest.fn(),
    verifyToken: jest.fn(),
  };

  // Mock Response 객체
  const mockResponse = () => {
    const res: Partial<Response> = {
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    describe('Remember Me 쿠키 설정 테스트', () => {
      it('Remember Me 체크 시 refresh token 쿠키에 maxAge 설정 (30일)', async () => {
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'password123',
          rememberMe: true,
        };

        const mockLoginResult = {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600, // 1시간
          refresh_expires_in: 30 * 24 * 60 * 60, // 30일
          user: {
            id: 1,
            email: 'test@example.com',
            username: 'testuser',
            name: 'Test User',
            role: 'USER',
            profileImage: null,
          },
        };

        mockAuthService.login.mockResolvedValue(mockLoginResult);

        const res = mockResponse();
        await controller.login(loginDto, res);

        // Access Token 쿠키 설정 확인
        expect(res.cookie).toHaveBeenCalledWith(
          'auth-token',
          'mock-access-token',
          expect.objectContaining({
            httpOnly: false,
            sameSite: 'lax',
            maxAge: 3600 * 1000,
          })
        );

        // Refresh Token 쿠키 설정 확인 (maxAge 포함)
        expect(res.cookie).toHaveBeenCalledWith(
          'refresh-token',
          'mock-refresh-token',
          expect.objectContaining({
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
          })
        );
      });

      it('Remember Me 미체크 시 refresh token 쿠키에 maxAge 미설정 (세션 쿠키)', async () => {
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        };

        const mockLoginResult = {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          refresh_expires_in: 0, // 세션 쿠키
          user: {
            id: 1,
            email: 'test@example.com',
            username: 'testuser',
            name: 'Test User',
            role: 'USER',
            profileImage: null,
          },
        };

        mockAuthService.login.mockResolvedValue(mockLoginResult);

        const res = mockResponse();
        await controller.login(loginDto, res);

        // Refresh Token 쿠키 설정 확인 (maxAge 없음 = 세션 쿠키)
        const refreshTokenCookieCall = (res.cookie as jest.Mock).mock.calls.find(
          (call) => call[0] === 'refresh-token'
        );

        expect(refreshTokenCookieCall).toBeDefined();
        expect(refreshTokenCookieCall[2]).toEqual(
          expect.objectContaining({
            httpOnly: true,
            sameSite: 'lax',
          })
        );
        // maxAge가 설정되지 않았는지 확인
        expect(refreshTokenCookieCall[2].maxAge).toBeUndefined();
      });

      it('디바이스 정보 없이 로그인 시 refresh token 없음', async () => {
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'password123',
        };

        const mockLoginResult = {
          access_token: 'mock-access-token',
          refresh_token: null, // 디바이스 정보 없으면 refresh token 없음
          expires_in: 3600,
          refresh_expires_in: 0,
          user: {
            id: 1,
            email: 'test@example.com',
            username: 'testuser',
            name: 'Test User',
            role: 'USER',
            profileImage: null,
          },
        };

        mockAuthService.login.mockResolvedValue(mockLoginResult);

        const res = mockResponse();
        await controller.login(loginDto, res);

        // Access Token만 설정됨
        expect(res.cookie).toHaveBeenCalledTimes(1);
        expect(res.cookie).toHaveBeenCalledWith(
          'auth-token',
          'mock-access-token',
          expect.any(Object)
        );
      });
    });

    describe('일반 로그인 테스트', () => {
      it('로그인 성공 시 AuthService.login 호출 및 결과 반환', async () => {
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'password123',
        };

        const mockLoginResult = {
          access_token: 'mock-access-token',
          refresh_token: null,
          expires_in: 3600,
          refresh_expires_in: 0,
          user: {
            id: 1,
            email: 'test@example.com',
            username: 'testuser',
            name: 'Test User',
            role: 'USER',
            profileImage: null,
          },
        };

        mockAuthService.login.mockResolvedValue(mockLoginResult);

        const res = mockResponse();
        const result = await controller.login(loginDto, res);

        expect(authService.login).toHaveBeenCalledWith(loginDto);
        expect(result).toEqual(mockLoginResult);
      });

      it('프로덕션 환경에서는 secure 쿠키 설정', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'password123',
        };

        const mockLoginResult = {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          refresh_expires_in: 30 * 24 * 60 * 60,
          user: {
            id: 1,
            email: 'test@example.com',
            username: null,
            name: 'Test User',
            role: 'USER',
            profileImage: null,
          },
        };

        mockAuthService.login.mockResolvedValue(mockLoginResult);

        const res = mockResponse();
        await controller.login(loginDto, res);

        // secure: true 확인
        expect(res.cookie).toHaveBeenCalledWith(
          'auth-token',
          'mock-access-token',
          expect.objectContaining({ secure: true })
        );

        expect(res.cookie).toHaveBeenCalledWith(
          'refresh-token',
          'mock-refresh-token',
          expect.objectContaining({ secure: true })
        );

        process.env.NODE_ENV = originalEnv;
      });
    });
  });

  describe('logout', () => {
    it('로그아웃 시 쿠키 삭제', async () => {
      const mockRequest = {
        user: { sub: 1 },
      };

      mockAuthService.logout.mockResolvedValue({
        message: '로그아웃되었습니다.',
      });

      const res = mockResponse();
      await controller.logout(mockRequest, {}, res);

      expect(res.clearCookie).toHaveBeenCalledWith('auth-token');
      expect(res.clearCookie).toHaveBeenCalledWith('refresh-token');
      expect(authService.logout).toHaveBeenCalledWith(1, {});
    });

    it('모든 디바이스 로그아웃', async () => {
      const mockRequest = {
        user: { sub: 1 },
      };

      const logoutDto = { allDevices: 'true' };

      mockAuthService.logout.mockResolvedValue({
        message: '모든 디바이스에서 로그아웃되었습니다.',
        deviceCount: 3,
      });

      const res = mockResponse();
      const result = await controller.logout(mockRequest, logoutDto, res);

      expect(authService.logout).toHaveBeenCalledWith(1, logoutDto);
      expect(result.deviceCount).toBe(3);
    });
  });

  describe('refresh', () => {
    it('토큰 갱신 성공 시 새로운 access token 쿠키 설정', async () => {
      const refreshTokenDto = { refreshToken: 'mock-refresh-token' };

      const mockRefreshResult = {
        access_token: 'new-access-token',
        expires_in: 3600,
        user: {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          name: 'Test User',
          role: 'USER',
        },
      };

      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResult);

      const res = mockResponse();
      const result = await controller.refresh(refreshTokenDto, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'auth-token',
        'new-access-token',
        expect.objectContaining({
          httpOnly: false,
          sameSite: 'lax',
          maxAge: 3600 * 1000,
        })
      );

      expect(result).toEqual(mockRefreshResult);
    });
  });
});
