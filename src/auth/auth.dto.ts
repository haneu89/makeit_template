import { IsEmail, IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

// 로그인 DTO
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email: string; // email 또는 username (LOGIN_METHOD에 따라)

  @IsString()
  @IsNotEmpty()
  password: string;

  // 디바이스 정보 (선택)
  @IsString()
  @IsOptional()
  deviceId?: string; // 디바이스 고유 ID (UUID)

  @IsString()
  @IsOptional()
  platform?: string; // android, ios, web

  @IsString()
  @IsOptional()
  deviceModel?: string; // 기기 모델

  @IsString()
  @IsOptional()
  osVersion?: string; // OS 버전

  @IsString()
  @IsOptional()
  appVersion?: string; // 앱 버전

  @IsString()
  @IsOptional()
  userAgent?: string; // User-Agent
}

// Refresh Token DTO
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @IsString()
  @IsOptional()
  deviceId?: string; // 디바이스 고유 ID
}

// 로그아웃 DTO
export class LogoutDto {
  @IsString()
  @IsOptional()
  deviceId?: string; // 특정 디바이스만 로그아웃

  @IsString()
  @IsOptional()
  allDevices?: string; // 'true'면 모든 디바이스 로그아웃
}

// 회원가입 DTO
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsOptional()
  fcm_token?: string;

  @IsString()
  @IsOptional()
  platform?: string;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsNumber()
  @IsOptional()
  birth?: number;
}

// 회원가입 응답 DTO
export class RegisterResponseDto {
  access_token: string;
  refresh_token?: string;
  user_id: number;
}

// 로그인 응답 DTO
export class LoginResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in: number; // Access Token 만료 시간 (초)
  refresh_expires_in: number; // Refresh Token 만료 시간 (초)
  user: {
    id: number;
    email: string | null;
    username: string | null;
    name: string | null;
    role: string;
    profileImage: string | null;
  };
}
