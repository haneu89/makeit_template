/**
 * @module AdminCommonDto
 * @version 1.0.0
 * @date 2025-01-22
 * @author jinhyung
 * @description 관리자 DataGrid용 공통 DTO 및 유틸리티
 * @changelog
 * - 1.0.0 (2025-01-22): 초기 버전, DataGrid 표준 패턴 정의
 */

import { IsOptional, IsString, IsNumberString, IsIn } from 'class-validator';

/**
 * @description DataGrid용 공통 쿼리 파라미터 DTO
 * @usage 모든 관리자 목록 API에서 표준으로 사용
 * @example
 * ```typescript
 * @Controller('admin/users')
 * class UserController {
 *   @Get()
 *   async getUsers(@Query() query: DataGridQueryDto) {
 *     const params = transformDataGridQuery(query);
 *     return this.userService.getDataGridUsers(params);
 *   }
 * }
 * ```
 */
export class DataGridQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  perPage?: string;

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsString()
  searchType?: string;
}

/**
 * @description DataGrid용 공통 응답 인터페이스
 * @usage components/admin/common/datagrid/DataGridServer와 호환
 */
export interface DataGridResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * @description DataGrid용 공통 파라미터 인터페이스
 */
export interface DataGridParams {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  searchKeyword?: string;
  searchType?: string;
}

/**
 * @description DataGrid 쿼리를 파라미터로 변환하는 유틸리티 함수
 * @usage Controller에서 DTO를 Service 파라미터로 변환할 때 사용
 * @note 문자열 타입의 page, perPage를 숫자로 안전하게 변환
 */
export function transformDataGridQuery(query: DataGridQueryDto): DataGridParams {
  return {
    page: query.page ? parseInt(query.page, 10) : undefined,
    perPage: query.perPage ? parseInt(query.perPage, 10) : undefined,
    sortField: query.sortField,
    sortOrder: query.sortOrder,
    searchTerm: query.searchTerm,
    searchType: query.searchType,
  };
} 