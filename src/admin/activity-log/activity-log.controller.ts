import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityLogService } from '../../shared/activity-log/activity-log.service';
import { ActivityLogFilterDto } from '../../shared/activity-log/activity-log.dto';
import { JwtRoleGuard, Roles } from '../../shared/jwt/jwt-role.guard';
import { Role } from '../../shared/jwt/roles.enum';

@Controller('admin/activity-log')
@UseGuards(JwtRoleGuard)
@Roles(Role.ADMIN, Role.MANAGER) // ADMIN, MANAGER 모두 접근 가능
export class AdminActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  /**
   * 활동 로그 목록 조회
   * GET /api/admin/activity-log
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('targetType') targetType?: string,
    @Query('targetId') targetId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('ip') ip?: string,
    @Query('search') search?: string,
  ) {
    const filter: ActivityLogFilterDto = {
      action: action as any,
      userId: userId ? parseInt(userId, 10) : undefined,
      targetType,
      targetId: targetId ? parseInt(targetId, 10) : undefined,
      startDate,
      endDate,
      ip,
      search,
    };

    return await this.activityLogService.findAll(
      filter,
      page ? parseInt(page, 10) : 1,
      perPage ? parseInt(perPage, 10) : 50,
    );
  }

  /**
   * 최근 활동 로그
   * GET /api/admin/activity-log/recent
   */
  @Get('recent')
  async getRecent(@Query('limit') limit?: string) {
    return await this.activityLogService.getRecent(
      limit ? parseInt(limit, 10) : 10,
    );
  }

  /**
   * 활동 통계
   * GET /api/admin/activity-log/stats
   */
  @Get('stats')
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.activityLogService.getStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
