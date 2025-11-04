import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

export interface DashboardStats {
  totalUsers: number;
  totalFiles: number;
  totalStorageGB: number;
  todayActivities: number;
}

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStats> {
    // 병렬로 실행
    const [totalUsers, totalFiles, attachments, todayActivities] = await Promise.all([
      // 전체 사용자 수
      this.prisma.user.count(),

      // 전체 파일 수 (Attachment)
      this.prisma.attachment.count(),

      // 전체 파일 용량 계산 (Attachment의 fileSize 합계)
      this.prisma.attachment.aggregate({
        _sum: {
          fileSize: true,
        },
      }),

      // 오늘 활동 로그 수
      this.prisma.activityLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // 오늘 00:00:00
          },
        },
      }),
    ]);

    // 바이트 → GB 변환
    const totalBytes = attachments._sum.fileSize || 0;
    const totalStorageGB = Math.round((totalBytes / (1024 * 1024 * 1024)) * 100) / 100;

    return {
      totalUsers,
      totalFiles,
      totalStorageGB,
      todayActivities,
    };
  }
}
