/**
 * 활동 로그 액션 타입
 * SQLite는 ENUM을 지원하지 않으므로 TypeScript enum으로 관리
 */

export enum ActivityAction {
  // 사용자 관련
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTER = 'USER_REGISTER',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_PASSWORD_CHANGE = 'USER_PASSWORD_CHANGE',

  // 파일 관련
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DOWNLOAD = 'FILE_DOWNLOAD',
  FILE_DELETE = 'FILE_DELETE',

  // 페이지 관련
  PAGE_CREATE = 'PAGE_CREATE',
  PAGE_UPDATE = 'PAGE_UPDATE',
  PAGE_DELETE = 'PAGE_DELETE',
  PAGE_VIEW = 'PAGE_VIEW',

  // 설정 관련
  PREFERENCE_UPDATE = 'PREFERENCE_UPDATE',

  // 기타
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  ACCESS_DENIED = 'ACCESS_DENIED',
}

/**
 * 활동 액션 값 배열
 */
export const ACTIVITY_ACTIONS = Object.values(ActivityAction);

/**
 * 활동 액션 검증 함수
 */
export function isValidActivityAction(action: string): action is ActivityAction {
  return ACTIVITY_ACTIONS.includes(action as ActivityAction);
}
