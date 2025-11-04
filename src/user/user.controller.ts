import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { JwtRoleGuard } from '../shared/jwt/jwt-role.guard';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    [key: string]: any;
  };
}

export class UpdateFcmTokenDto {
  fcmToken: string;
}

export class UpdateDeviceDto {
  fcmToken: string;
  platform?: string;
  domain?: string;
  uuid?: string;
  appVersion?: string;
  osVersion?: string;
  deviceModel?: string;
}

@Controller('api/user')
@UseGuards(JwtRoleGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('fcm-token')
  async updateFcmToken(@Body() body: UpdateFcmTokenDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new Error('사용자 ID가 없습니다.');
    }
    return this.userService.updateFcmToken(Number(userId), body.fcmToken);
  }

  @Post('fcm-token/device')
  async updateFcmTokenWithDevice(@Body() body: UpdateDeviceDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new Error('사용자 ID가 없습니다.');
    }
    const headers = req.headers as Record<string, string>;

    return this.userService.updateDeviceWithInfo(Number(userId), body.fcmToken, headers, body);
  }
}