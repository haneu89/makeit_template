import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityLogDto, ActivityLogFilterDto } from './activity-log.dto';
import { ActivityAction } from '../../types/activity-action';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  /**
   * 활동 로그 생성
   */
  async create(dto: CreateActivityLogDto) {
    return await this.prisma.activityLog.create({
      data: {
        action: dto.action,
        userId: dto.userId,
        userEmail: dto.userEmail,
        userName: dto.userName,
        targetType: dto.targetType,
        targetId: dto.targetId,
        targetName: dto.targetName,
        ip: dto.ip,
        userAgent: dto.userAgent,
        method: dto.method,
        path: dto.path,
        metadata: dto.metadata,
        message: dto.message,
      },
    });
  }

  /**
   * 헬퍼: 요청 객체에서 자동으로 로그 생성
   */
  async log(
    action: ActivityAction,
    request: any,
    options?: {
      targetType?: string;
      targetId?: number;
      targetName?: string;
      metadata?: any;
      message?: string;
    },
  ) {
    const user = request.user;
    const ip = this.extractIp(request);
    const userAgent = request.headers['user-agent'];

    return await this.create({
      action,
      userId: user?.id,
      userEmail: user?.email,
      userName: user?.name,
      targetType: options?.targetType,
      targetId: options?.targetId,
      targetName: options?.targetName,
      ip,
      userAgent,
      method: request.method,
      path: request.url,
      metadata: options?.metadata,
      message: options?.message,
    });
  }

  /**
   * IP 주소 추출 (프록시 고려)
   */
  private extractIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.ip
    );
  }

  /**
   * 활동 로그 목록 조회
   */
  async findAll(filter?: ActivityLogFilterDto, page = 1, perPage = 50) {
    const where: any = {};

    if (filter?.action) {
      where.action = filter.action;
    }

    if (filter?.userId) {
      where.userId = filter.userId;
    }

    if (filter?.targetType) {
      where.targetType = filter.targetType;
    }

    if (filter?.targetId) {
      where.targetId = filter.targetId;
    }

    if (filter?.ip) {
      where.ip = { contains: filter.ip };
    }

    // 날짜 범위 필터
    if (filter?.startDate || filter?.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.createdAt.lte = new Date(filter.endDate);
      }
    }

    // 검색 (이메일, 이름, 메시지)
    if (filter?.search) {
      where.OR = [
        { userEmail: { contains: filter.search } },
        { userName: { contains: filter.search } },
        { message: { contains: filter.search } },
      ];
    }

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  /**
   * 특정 사용자의 활동 로그 조회
   */
  async findByUser(userId: number, page = 1, perPage = 20) {
    return await this.findAll({ userId }, page, perPage);
  }

  /**
   * 특정 대상의 활동 로그 조회
   */
  async findByTarget(targetType: string, targetId: number, page = 1, perPage = 20) {
    return await this.findAll({ targetType, targetId }, page, perPage);
  }

  /**
   * 최근 활동 로그 조회
   */
  async getRecent(limit = 10) {
    return await this.prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * 활동 통계
   */
  async getStats(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [totalLogs, actionStats, userStats] = await Promise.all([
      // 전체 로그 수
      this.prisma.activityLog.count({ where }),

      // 활동 유형별 통계
      this.prisma.activityLog.groupBy({
        by: ['action'],
        where,
        _count: true,
        orderBy: { _count: { action: 'desc' } },
      }),

      // 사용자별 활동 수 (상위 10명)
      this.prisma.activityLog.groupBy({
        by: ['userId'],
        where: { ...where, userId: { not: null } },
        _count: true,
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
    ]);

    // 사용자 정보 가져오기
    const userIds = userStats.map((stat) => stat.userId).filter((id): id is number => id !== null);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, name: true },
    });

    const userStatsWithInfo = userStats.map((stat) => {
      const user = users.find((u) => u.id === stat.userId);
      return {
        userId: stat.userId,
        email: user?.email,
        name: user?.name,
        count: stat._count,
      };
    });

    return {
      totalLogs,
      actionStats: actionStats.map((stat) => ({
        action: stat.action,
        count: stat._count,
      })),
      topUsers: userStatsWithInfo,
    };
  }
}
