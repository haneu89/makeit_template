import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { DeviceInfo, extractDeviceInfo } from '../shared/device/device-detector.util';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateFcmToken(userId: number, fcmToken: string) {
    const device = await this.prisma.device.findFirst({
      where: { userId, platform: 'unknown' }
    });

    if (device) {
      return this.prisma.device.update({
        where: { id: device.id },
        data: { fcmToken, lastActiveAt: new Date() }
      });
    } else {
      return this.prisma.device.create({
        data: {
          userId,
          platform: 'unknown',
          domain: 'default',
          uuid: `temp_${userId}_${Date.now()}`,
          fcmToken,
          lastActiveAt: new Date()
        }
      });
    }
  }

  async updateDeviceWithInfo(userId: number, fcmToken: string, headers: Record<string, string>, deviceData?: Partial<DeviceInfo & { uuid?: string }>) {
    const deviceInfo = extractDeviceInfo(headers);

    // Body 데이터로 덮어쓰기
    if (deviceData?.platform) deviceInfo.platform = deviceData.platform;
    if (deviceData?.domain) deviceInfo.domain = deviceData.domain;
    if (deviceData?.appVersion) deviceInfo.appVersion = deviceData.appVersion;
    if (deviceData?.osVersion) deviceInfo.osVersion = deviceData.osVersion;
    if (deviceData?.deviceModel) deviceInfo.deviceModel = deviceData.deviceModel;

    const uuid = deviceData?.uuid || `temp_${userId}_${deviceInfo.platform}_${Date.now()}`;

    const existingDevice = await this.prisma.device.findUnique({
      where: {
        userId_platform_uuid: {
          userId,
          platform: deviceInfo.platform,
          uuid
        }
      }
    });

    const deviceUpdateData = {
      fcmToken,
      appVersion: deviceInfo.appVersion,
      osVersion: deviceInfo.osVersion,
      deviceModel: deviceInfo.deviceModel,
      userAgent: deviceInfo.userAgent,
      lastActiveAt: new Date()
    };

    if (existingDevice) {
      return this.prisma.device.update({
        where: { id: existingDevice.id },
        data: deviceUpdateData
      });
    } else {
      return this.prisma.device.create({
        data: {
          userId,
          platform: deviceInfo.platform,
          domain: deviceInfo.domain,
          uuid,
          ...deviceUpdateData
        }
      });
    }
  }

  async findOrCreate(socialData: {
    provider: string;
    providerUserId: string;
    name?: string;
    email?: string;
  }) {
    // 기존 소셜 계정 찾기
    const socialAccount = await this.prisma.socialAccount.findFirst({
      where: {
        provider: socialData.provider,
        providerUserId: socialData.providerUserId,
      },
      include: { user: true },
    });

    if (socialAccount) {
      return socialAccount.user;
    }

    // 이메일로 기존 사용자 찾기 (이메일이 있는 경우)
    let existingUser: any = null;
    if (socialData.email) {
      existingUser = await this.prisma.user.findUnique({
        where: { email: socialData.email },
      });
    }

    if (existingUser) {
      // 기존 사용자에 소셜 계정 연결
      await this.prisma.socialAccount.create({
        data: {
          userId: existingUser.id,
          provider: socialData.provider,
          providerUserId: socialData.providerUserId,
        },
      });
      return existingUser;
    }

    // 새 사용자 생성
    const newUser = await this.prisma.user.create({
      data: {
        email: socialData.email,
        name: socialData.name || '익명',
      },
    });

    // 소셜 계정 연결
    await this.prisma.socialAccount.create({
      data: {
        userId: newUser.id,
        provider: socialData.provider,
        providerUserId: socialData.providerUserId,
      },
    });

    return newUser;
  }

  async findOrCreateDevice(deviceData: {
    userId: number;
    platform: string;
    domain: string;
    uuid: string;
  }) {
    const existing = await this.prisma.device.findUnique({
      where: {
        userId_platform_uuid: {
          userId: deviceData.userId,
          platform: deviceData.platform,
          uuid: deviceData.uuid,
        },
      },
    });

    if (existing) {
      return this.prisma.device.update({
        where: { id: existing.id },
        data: { lastActiveAt: new Date() },
      });
    }

    return this.prisma.device.create({
      data: {
        ...deviceData,
        userId: deviceData.userId,
        lastActiveAt: new Date(),
      },
    });
  }
}
