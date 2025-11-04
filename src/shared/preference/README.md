# Preference Module

데이터베이스의 Preference 테이블 데이터를 메모리에 캐싱하여 빠른 조회 성능을 제공하는 NestJS 모듈입니다.

## 버전
- **Version**: 1.0.0
- **Date**: 2024-12-26
- **Author**: jinhyung

## 특징

- 🚀 **고성능 메모리 캐싱**: 서버 시작 시 전체 데이터 로드
- 🔄 **자동 새로고침**: 설정 가능한 주기적 캐시 갱신
- 📦 **타입 안전성**: TypeScript 타입 지원
- 🗂️ **카테고리/도메인별 그룹핑**: 효율적인 데이터 구조
- 🎯 **다양한 타입 지원**: string, number, boolean, json, array, text

## 설치

```typescript
// app.module.ts
import { PreferenceModule } from '@/shared/preference/preference.module';

@Module({
  imports: [
    // 기본 설정으로 사용
    PreferenceModule.forRoot(),

    // 또는 커스텀 옵션 사용
    PreferenceModule.forRootAsync({
      autoLoad: true,
      autoRefreshInterval: 60000, // 1분마다 자동 새로고침
      enableLogging: true,
    }),
  ],
})
export class AppModule {}
```

## 테이블 구조

```sql
CREATE TABLE Preference (
  domain   VARCHAR(255) DEFAULT 'default',
  category VARCHAR(255) DEFAULT 'system',
  key      VARCHAR(255),
  value    TEXT,
  type     VARCHAR(50), -- string, number, boolean, json, array, text
  name     VARCHAR(255),
  sort     INT DEFAULT 0,
  comment  TEXT,
  PRIMARY KEY (key, domain)
);
```

## 사용 방법

### 기본 사용

```typescript
import { PreferenceService } from '@/shared/preference/preference.service';

@Injectable()
export class MyService {
  constructor(private preference: PreferenceService) {}

  async example() {
    // 문자열 값 조회
    const apiUrl = this.preference.getString('api_url');

    // 숫자 값 조회 (기본값 지정)
    const timeout = this.preference.getNumber('timeout', 'default', 5000);

    // 불린 값 조회
    const isEnabled = this.preference.getBoolean('feature_enabled');

    // 배열 값 조회 (콤마로 구분된 문자열)
    const allowedDomains = this.preference.getArray('allowed_domains');
    // "domain1.com,domain2.com" -> ["domain1.com", "domain2.com"]

    // JSON 객체 조회
    const config = this.preference.getJson<ConfigType>('app_config');
  }
}
```

### 카테고리별 조회

```typescript
// 특정 카테고리의 모든 설정값 조회
const certSettings = this.preference.getByCategory('certi');

// 예시: 인증서 발급 조건 체크
const requiredChapters = certSettings.get('certi_chapter_cat1');
const requiredScore = certSettings.get('certi_score_cat1');
```

### 도메인별 조회

```typescript
// 특정 도메인의 모든 설정값 조회
const domainSettings = this.preference.getByDomain('tenant1');

// 멀티테넌트 환경에서 유용
const siteName = this.preference.getString('site_name', 'tenant1');
```

### 캐시 관리

```typescript
// 캐시 수동 새로고침
await this.preference.refresh();

// 설정값 업데이트 (DB + 캐시)
await this.preference.update('api_url', 'https://new-api.com');

// 일괄 업데이트
await this.preference.updateMany([
  { key: 'timeout', value: '10000' },
  { key: 'retry_count', value: '3' },
]);

// 캐시 통계 조회
const stats = this.preference.getStats();
// { totalItems: 50, categories: 5, categoryList: [...], domains: [...] }
```

## 타입 정의

### 지원하는 타입

| Type | 설명 | 예시 값 | 조회 메서드 |
|------|------|---------|------------|
| `string` | 일반 문자열 | `"Hello"` | `getString()` |
| `text` | 긴 텍스트 (textarea) | `"Long text..."` | `getString()` |
| `number` | 숫자 | `"123"` | `getNumber()` |
| `boolean` | 불린 | `"true"` or `"false"` | `getBoolean()` |
| `array` | 콤마 구분 배열 | `"a,b,c"` | `getArray()` |
| `json` | JSON 객체 | `'{"key":"value"}'` | `getJson()` |

## 실제 사용 예시

### LMS 인증서 발급 시스템

```typescript
@Injectable()
export class CertificateService {
  constructor(private preference: PreferenceService) {}

  async canIssueCertificate(userId: string, categoryId: number) {
    // 카테고리별 인증 조건 조회
    const requiredChapters = this.preference.getNumber(
      `certi_chapter_cat${categoryId}`,
      'default',
      30
    );

    const requiredScore = this.preference.getNumber(
      `certi_score_cat${categoryId}`,
      'default',
      80
    );

    const certText = this.preference.getString(
      `certi_text_cat${categoryId}`,
      'default',
      '기본 인증서 텍스트'
    );

    // 사용자 진행도 체크
    const userProgress = await this.getUserProgress(userId);

    return {
      eligible: userProgress.chapters >= requiredChapters &&
                userProgress.score >= requiredScore,
      certText,
    };
  }
}
```

### 시스템 설정 관리

```typescript
@Injectable()
export class SystemService {
  constructor(private preference: PreferenceService) {}

  getSystemConfig() {
    // 직책 목록 (콤마로 구분)
    const grades = this.preference.getArray('grades');
    // ["학부생", "대학원생", "연구원", "회사원"]

    // 관리 기관 목록
    const organizations = this.preference.getArray('orgs');
    // ["한국수소연합", "한국공학대학교", ...]

    // API 설정
    const apiConfig = {
      baseUrl: this.preference.getString('api_base_url'),
      timeout: this.preference.getNumber('api_timeout', 'default', 5000),
      retryEnabled: this.preference.getBoolean('api_retry_enabled'),
    };

    return { grades, organizations, apiConfig };
  }
}
```

## 관리자 페이지 연동

```typescript
// admin/preference/preference.controller.ts
@Controller('admin/preference')
export class AdminPreferenceController {
  constructor(
    private preferenceService: PreferenceService,
    private adminService: AdminPreferenceService,
  ) {}

  @Put(':key')
  async update(@Param('key') key: string, @Body() dto: UpdateDto) {
    // DB 업데이트
    await this.adminService.update(key, dto.value, dto.domain);

    // 캐시 새로고침
    await this.preferenceService.refresh();

    return { success: true };
  }
}
```

## 주의사항

- 서버 시작 시 데이터베이스 연결이 필요합니다
- 대용량 설정 데이터(수만 개 이상)의 경우 Redis 캐시 사용을 고려하세요
- `text` 타입은 긴 텍스트용이며, 관리자 폼에서 textarea로 표시됩니다
- 캐시 새로고침은 모든 데이터를 다시 로드하므로 자주 호출하지 마세요
- 멀티 인스턴스 환경에서는 캐시 동기화 전략이 필요합니다

## 마이그레이션

다른 프로젝트로 이식 시:
1. `src/shared/preference` 디렉토리 전체 복사
2. `Preference` 테이블 생성 (Prisma 스키마 참조)
3. `AppModule`에 `PreferenceModule.forRoot()` 추가
4. 필요한 설정값을 데이터베이스에 삽입

## 성능

- **초기 로드**: 설정 개수에 따라 10-100ms
- **조회 성능**: < 0.001ms (메모리 직접 접근)
- **메모리 사용**: 설정값 개수 × 평균 100 bytes
- **예시**: 1000개 설정 ≈ 100KB 메모리