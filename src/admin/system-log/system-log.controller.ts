import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtRoleGuard, Roles } from '../../shared/jwt/jwt-role.guard';
import { Role } from '../../shared/jwt/roles.enum';
import { SystemLogService } from './system-log.service';

/**
 * 시스템 로그 관리 컨트롤러
 * storage/logs 디렉토리의 로그 파일 조회
 */
@Controller('admin/system-log')
@UseGuards(JwtRoleGuard)
@Roles(Role.ADMIN)
export class SystemLogController {
  constructor(private readonly systemLogService: SystemLogService) {}

  /**
   * 로그 파일 목록 조회
   */
  @Get('files')
  async getLogFiles() {
    return await this.systemLogService.getLogFiles();
  }

  /**
   * 특정 로그 파일 내용 조회
   */
  @Get('files/:filename')
  async getLogFileContent(
    @Param('filename') filename: string,
    @Query('search') search?: string,
    @Query('level') level?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.systemLogService.getLogFileContent(filename, {
      search,
      level,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
