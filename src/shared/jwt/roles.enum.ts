// roles.enum.ts
// 사용자 역할 정의 열거형(enum)으로 권한 체계를 통일
export enum Role {
  ADMIN = 'ADMIN',         // 시스템 관리자, 모든 권한 보유
  MANAGER = 'MANAGER',     // 관리자, 관리자 페이지 + 파일 관리 권한
  ASSISTANT = 'ASSISTANT', // 조교, 파일 관리 권한만 (관리자 페이지 접근 불가)
  USER = 'USER',           // 일반 사용자 권한
}