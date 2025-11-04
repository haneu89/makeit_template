import { ActivityAction } from '../../types/activity-action';
import { IsEnum, IsOptional, IsString, IsInt, IsObject } from 'class-validator';

/**
 * 활동 로그 생성 DTO
 */
export class CreateActivityLogDto {
  @IsEnum(ActivityAction)
  action: ActivityAction;

  @IsInt()
  @IsOptional()
  userId?: number;

  @IsString()
  @IsOptional()
  userEmail?: string;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsString()
  @IsOptional()
  targetType?: string;

  @IsInt()
  @IsOptional()
  targetId?: number;

  @IsString()
  @IsOptional()
  targetName?: string;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  method?: string;

  @IsString()
  @IsOptional()
  path?: string;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsString()
  @IsOptional()
  message?: string;
}

/**
 * 활동 로그 조회 필터 DTO
 */
export class ActivityLogFilterDto {
  @IsEnum(ActivityAction)
  @IsOptional()
  action?: ActivityAction;

  @IsInt()
  @IsOptional()
  userId?: number;

  @IsString()
  @IsOptional()
  targetType?: string;

  @IsInt()
  @IsOptional()
  targetId?: number;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsString()
  @IsOptional()
  search?: string; // 이메일, 이름, 메시지 검색
}
