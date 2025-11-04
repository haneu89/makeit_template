import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AdminUserService } from './user.service';
import { UpdateUserDto, CreateUserDto } from './user.dto';
import { JwtRoleGuard, Roles } from '../../shared/jwt/jwt-role.guard';
import { Role } from '../../shared/jwt/roles.enum';
import { ActivityLogService } from '../../shared/activity-log/activity-log.service';
import { ActivityAction } from '../../types/activity-action';

@Controller('admin/user')
@UseGuards(JwtRoleGuard)
@Roles(Role.ADMIN, Role.MANAGER) // ADMIN, MANAGER 모두 접근 가능
export class AdminUserController {
  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  /**
   * 회원 목록 조회
   * GET /api/admin/user
   */
  @Get()
  async findAll() {
    return await this.adminUserService.findAll();
  }

  /**
   * 회원 통계
   * GET /api/admin/user/stats
   */
  @Get('stats')
  async getStats() {
    return await this.adminUserService.getStats();
  }

  /**
   * 회원 상세 조회
   * GET /api/admin/user/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.adminUserService.findOne(+id);
  }

  /**
   * 회원 생성
   * POST /api/admin/user
   */
  @Post()
  async create(@Req() request: any, @Body() dto: CreateUserDto) {
    const result = await this.adminUserService.create(dto);

    // 로그 기록
    await this.activityLogService.log(ActivityAction.USER_REGISTER, request, {
      targetType: 'User',
      targetId: result.id,
      targetName: result.email || result.name || `User#${result.id}` || undefined,
      metadata: {
        role: dto.role,
        mustChangePassword: dto.mustChangePassword,
      },
      message: `관리자가 회원 생성: ${result.email || result.name || `User#${result.id}`}`,
    });

    return result;
  }

  /**
   * 회원 정보 수정
   * PUT /api/admin/user/:id
   */
  @Put(':id')
  async update(@Req() request: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    // 현재 사용자의 역할 추출
    const currentUserRole = request.user?.role;

    const result = await this.adminUserService.update(+id, dto, currentUserRole);

    // 로그 기록
    await this.activityLogService.log(ActivityAction.USER_UPDATE, request, {
      targetType: 'User',
      targetId: +id,
      targetName: result.email || result.name || `User#${id}` || undefined,
      metadata: {
        changes: dto,
      },
      message: `회원 정보 수정: ${result.email || result.name || `User#${id}`}`,
    });

    return result;
  }

  /**
   * 회원 삭제
   * DELETE /api/admin/user/:id
   */
  @Delete(':id')
  async remove(@Req() request: any, @Param('id') id: string) {
    // 삭제 전 사용자 정보 가져오기
    const user = await this.adminUserService.findOne(+id);
    const result = await this.adminUserService.remove(+id);

    // 로그 기록
    await this.activityLogService.log(ActivityAction.USER_DELETE, request, {
      targetType: 'User',
      targetId: +id,
      targetName: user.email || user.name || `User#${id}` || undefined,
      message: `회원 삭제: ${user.email || user.name || `User#${id}`}`,
    });

    return result;
  }
}
