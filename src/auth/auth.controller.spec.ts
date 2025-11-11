import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';

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
    it('로그인 성공 시 AuthService.login 호출 및 토큰 반환', async () => {
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
          username: 'testuser',
          name: 'Test User',
          role: 'USER',
          profileImage: null,
        },
      };

      mockAuthService.login.mockResolvedValue(mockLoginResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockLoginResult);
      // localStorage 기반 인증: 토큰은 응답 본문으로 반환되어 클라이언트가 localStorage에 저장
    });
  });

  describe('logout', () => {
    it('로그아웃 시 AuthService.logout 호출', async () => {
      const mockRequest = {
        user: { sub: 1 },
      };

      mockAuthService.logout.mockResolvedValue({
        message: '로그아웃되었습니다.',
      });

      await controller.logout(mockRequest, {});

      expect(authService.logout).toHaveBeenCalledWith(1, {});
      // localStorage 기반 인증: 클라이언트가 localStorage에서 토큰 삭제
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

      const result = await controller.logout(mockRequest, logoutDto);

      expect(authService.logout).toHaveBeenCalledWith(1, logoutDto);
      expect(result.deviceCount).toBe(3);
    });
  });

  describe('refresh', () => {
    it('토큰 갱신 성공 시 새로운 access token 반환', async () => {
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

      const result = await controller.refresh(refreshTokenDto);

      expect(result).toEqual(mockRefreshResult);
      // localStorage 기반 인증: 새 토큰은 응답 본문으로 반환되어 클라이언트가 localStorage에 저장
    });
  });
});
