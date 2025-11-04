import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PreferenceItem, PreferenceValue, PreferenceOptions } from './preference.types';

/**
 * Preference 캐시 서비스
 *
 * 데이터베이스의 Preference 테이블 데이터를 메모리에 캐싱하여
 * 빠른 조회 성능을 제공합니다.
 *
 * @version 1.0.0
 * @date 2024-12-26
 * @author jinhyung
 */
@Injectable()
export class PreferenceService implements OnModuleInit {
  private readonly logger = new Logger(PreferenceService.name);
  private preferences: Map<string, PreferenceValue> = new Map();
  private preferencesByCategory: Map<string, Map<string, PreferenceValue>> = new Map();
  private rawPreferences: Map<string, PreferenceItem> = new Map();
  private refreshTimer?: NodeJS.Timeout;
  private options: PreferenceOptions;

  constructor(private readonly prisma: PrismaService) {
    this.options = {
      autoRefreshInterval: 0,
      autoLoad: true,
      enableLogging: true,
    };
  }

  /**
   * 모듈 초기화 시 설정 데이터 로드
   */
  async onModuleInit() {
    if (this.options.autoLoad) {
      await this.load();
    }

    // 자동 새로고침 설정
    if (this.options.autoRefreshInterval && this.options.autoRefreshInterval > 0) {
      this.refreshTimer = setInterval(() => {
        this.refresh().catch(err => {
          this.logger.error('Auto refresh failed:', err);
        });
      }, this.options.autoRefreshInterval);
    }
  }

  /**
   * 모듈 종료 시 타이머 정리
   */
  onModuleDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  /**
   * 데이터베이스에서 모든 설정 로드
   */
  async load(): Promise<void> {
    try {
      if (this.options.enableLogging) {
        this.logger.log('Loading preference cache...');
      }

      const items = await this.prisma.preference.findMany({
        orderBy: [
          { category: 'asc' },
          { sort: 'asc' },
          { key: 'asc' },
        ],
      });

      // 캐시 초기화
      this.preferences.clear();
      this.preferencesByCategory.clear();
      this.rawPreferences.clear();

      // 데이터 캐싱
      for (const item of items) {
        const cacheKey = this.getCacheKey(item.key, item.domain);
        const value = this.parseValue(item.value, item.type);

        // 전체 캐시
        this.preferences.set(cacheKey, value);
        this.rawPreferences.set(cacheKey, item as PreferenceItem);

        // 카테고리별 캐시
        if (!this.preferencesByCategory.has(item.category)) {
          this.preferencesByCategory.set(item.category, new Map());
        }
        this.preferencesByCategory.get(item.category)!.set(item.key, value);
      }

      if (this.options.enableLogging) {
        this.logger.log(`✅ Loaded ${items.length} preferences into cache`);
      }
    } catch (error) {
      this.logger.error('Failed to load preferences:', error);
      throw error;
    }
  }

  /**
   * 캐시 새로고침
   */
  async refresh(): Promise<void> {
    await this.load();
  }

  /**
   * 값 타입에 따른 파싱
   */
  private parseValue(value: string, type: string): PreferenceValue {
    if (value === null || value === undefined) {
      return null;
    }

    try {
      switch (type) {
        case 'number':
          return Number(value);

        case 'boolean':
          return value === 'true' || value === '1';

        case 'json':
          return JSON.parse(value);

        case 'array':
          // 콤마로 구분된 문자열을 배열로 변환
          return value.split(',').map(v => v.trim()).filter(v => v);

        case 'text':
        case 'string':
        default:
          return value;
      }
    } catch (error) {
      this.logger.warn(`Failed to parse value for type ${type}: ${value}`);
      return value;
    }
  }

  /**
   * 캐시 키 생성
   */
  private getCacheKey(key: string, domain: string = 'default'): string {
    return `${domain}:${key}`;
  }

  /**
   * 설정값 조회
   */
  get(key: string, domain: string = 'default'): PreferenceValue | undefined {
    return this.preferences.get(this.getCacheKey(key, domain));
  }

  /**
   * 문자열 값 조회
   */
  getString(key: string, domain: string = 'default', defaultValue: string = ''): string {
    const value = this.get(key, domain);
    return value !== undefined ? String(value) : defaultValue;
  }

  /**
   * 숫자 값 조회
   */
  getNumber(key: string, domain: string = 'default', defaultValue: number = 0): number {
    const value = this.get(key, domain);
    return typeof value === 'number' ? value : defaultValue;
  }

  /**
   * 불린 값 조회
   */
  getBoolean(key: string, domain: string = 'default', defaultValue: boolean = false): boolean {
    const value = this.get(key, domain);
    return typeof value === 'boolean' ? value : defaultValue;
  }

  /**
   * 배열 값 조회
   */
  getArray(key: string, domain: string = 'default', defaultValue: string[] = []): string[] {
    const value = this.get(key, domain);

    if (Array.isArray(value)) {
      return value;
    }

    // 문자열인 경우 콤마로 분리
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim()).filter(v => v);
    }

    return defaultValue;
  }

  /**
   * JSON 값 조회
   */
  getJson<T = any>(key: string, domain: string = 'default', defaultValue?: T): T | null {
    const value = this.get(key, domain);
    return value !== undefined ? value as T : (defaultValue !== undefined ? defaultValue : null);
  }

  /**
   * 카테고리별 모든 설정 조회
   */
  getByCategory(category: string): Map<string, PreferenceValue> {
    return this.preferencesByCategory.get(category) || new Map();
  }

  /**
   * 모든 카테고리 목록 조회
   */
  getCategories(): string[] {
    return Array.from(this.preferencesByCategory.keys());
  }

  /**
   * 설정값 존재 여부 확인
   */
  has(key: string, domain: string = 'default'): boolean {
    return this.preferences.has(this.getCacheKey(key, domain));
  }

  /**
   * 원본 Preference 객체 조회
   */
  getRaw(key: string, domain: string = 'default'): PreferenceItem | undefined {
    return this.rawPreferences.get(this.getCacheKey(key, domain));
  }

  /**
   * 도메인별 모든 설정 조회
   */
  getByDomain(domain: string = 'default'): Map<string, PreferenceValue> {
    const result = new Map<string, PreferenceValue>();

    for (const [cacheKey, value] of this.preferences.entries()) {
      if (cacheKey.startsWith(`${domain}:`)) {
        const key = cacheKey.substring(domain.length + 1);
        result.set(key, value);
      }
    }

    return result;
  }

  /**
   * 설정값 업데이트 (DB + 캐시)
   */
  async update(key: string, value: string, domain: string = 'default'): Promise<void> {
    try {
      await this.prisma.preference.update({
        where: {
          key_domain: { key, domain },
        },
        data: { value },
      });

      // 캐시 새로고침
      await this.refresh();

      if (this.options.enableLogging) {
        this.logger.log(`Updated preference: ${domain}:${key}`);
      }
    } catch (error) {
      this.logger.error(`Failed to update preference ${domain}:${key}:`, error);
      throw error;
    }
  }

  /**
   * 여러 설정값 일괄 업데이트
   */
  async updateMany(updates: Array<{ key: string; value: string; domain?: string }>): Promise<void> {
    try {
      // 트랜잭션으로 일괄 업데이트
      await this.prisma.$transaction(
        updates.map(({ key, value, domain = 'default' }) =>
          this.prisma.preference.update({
            where: {
              key_domain: { key, domain },
            },
            data: { value },
          })
        )
      );

      // 캐시 새로고침
      await this.refresh();

      if (this.options.enableLogging) {
        this.logger.log(`Updated ${updates.length} preferences`);
      }
    } catch (error) {
      this.logger.error('Failed to update preferences:', error);
      throw error;
    }
  }

  /**
   * 캐시 상태 정보
   */
  getStats() {
    return {
      totalItems: this.preferences.size,
      categories: this.preferencesByCategory.size,
      categoryList: Array.from(this.preferencesByCategory.keys()),
      domains: Array.from(new Set(
        Array.from(this.rawPreferences.values()).map(item => item.domain)
      )),
    };
  }

  /**
   * 옵션 설정
   */
  setOptions(options: Partial<PreferenceOptions>): void {
    this.options = { ...this.options, ...options };

    // 자동 새로고침 재설정
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }

    if (this.options.autoRefreshInterval && this.options.autoRefreshInterval > 0) {
      this.refreshTimer = setInterval(() => {
        this.refresh().catch(err => {
          this.logger.error('Auto refresh failed:', err);
        });
      }, this.options.autoRefreshInterval);
    }
  }
}