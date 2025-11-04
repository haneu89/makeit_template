/**
 * 사용자 역할 상수
 * SQLite는 ENUM을 지원하지 않으므로 TypeScript enum과 상수로 관리
 */

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

/**
 * 역할 값 배열
 */
export const ROLES = Object.values(Role);

/**
 * 역할 검증 함수
 */
export function isValidRole(role: string): role is Role {
  return ROLES.includes(role as Role);
}

/**
 * 역할 우선순위 (높을수록 강한 권한)
 */
export const ROLE_PRIORITY: Record<Role, number> = {
  [Role.USER]: 1,
  [Role.MANAGER]: 2,
  [Role.ADMIN]: 3,
};

/**
 * 특정 역할 이상인지 확인
 * @param userRole 사용자 역할
 * @param requiredRole 필요한 역할
 * @returns userRole >= requiredRole
 */
export function hasRoleOrHigher(userRole: string, requiredRole: Role): boolean {
  if (!isValidRole(userRole)) return false;
  return ROLE_PRIORITY[userRole] >= ROLE_PRIORITY[requiredRole];
}
