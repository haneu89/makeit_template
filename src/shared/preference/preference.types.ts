/**
 * Preference 모듈 타입 정의
 */

export interface PreferenceItem {
  domain: string;
  category: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'text';
  name?: string;
  sort: number;
  comment?: string;
}

export interface PreferenceOptions {
  /**
   * 캐시 자동 새로고침 주기 (ms)
   * 0으로 설정하면 자동 새로고침 비활성화
   * @default 0
   */
  autoRefreshInterval?: number;

  /**
   * 서버 시작 시 자동 로드 여부
   * @default true
   */
  autoLoad?: boolean;

  /**
   * 로그 출력 여부
   * @default true
   */
  enableLogging?: boolean;
}

export type PreferenceValue = string | number | boolean | any[] | object | null;