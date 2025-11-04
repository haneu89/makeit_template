# Log Module

기술 로깅 시스템 - 에러 추적, HTTP 성능 모니터링, 디버깅

## 개요

- **목적**: 시스템 로그 (에러, 디버그, HTTP 요청/응답)
- **ActivityLog와 구분**: ActivityLog는 사용자 행동 감사, Log는 기술 로깅
- **다중 Transport**: Console, File, Sentry 지원

## 주요 기능

### Transport 계층
- **ConsoleTransport**: 컬러 출력, 개발 환경
- **FileTransport**: 날짜별 rotation, 자동 정리
- **SentryTransport**: 에러만 외부 전송 (선택적)

### 자동 HTTP 로깅
- LogInterceptor가 모든 API 요청/응답 자동 기록
- 메서드, URL, 상태 코드, 응답 시간 포함
- 특정 경로 제외 가능 (`/health`, `/metrics` 등)

## 설치 및 설정

### AppModule 등록

```typescript
import { LogModule, LogLevel } from '@/shared/log';

@Module({
  imports: [
    LogModule.forRoot({
      level: LogLevel.INFO,
      transports: ['console', 'file'],
      logDir: './storage/logs',
      fileRotation: {
        maxFiles: 30,
        maxSize: '10m',
      },
      excludePaths: ['/health', '/api/metrics'],
      sentryDsn: process.env.SENTRY_DSN,
    }),
  ],
})
export class AppModule {}
```

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `level` | LogLevel | INFO | 최소 로그 레벨 (DEBUG, INFO, WARN, ERROR) |
| `transports` | string[] | ['console'] | 사용할 transport ('console', 'file', 'sentry') |
| `logDir` | string | './logs' | 로그 파일 저장 디렉토리 |
| `fileRotation.maxFiles` | number | 0 | 보관할 최대 파일 개수 (0 = 자동 삭제 안 함) |
| `fileRotation.maxSize` | string | '10m' | 파일당 최대 크기 |
| `excludePaths` | string[] | ['/health', '/metrics'] | HTTP 로깅 제외 경로 |
| `sentryDsn` | string | - | Sentry DSN (선택) |
| `enableColors` | boolean | true | 콘솔 컬러 출력 여부 |

## 사용법

### Service에서 사용

```typescript
import { LogService } from '@/shared/log';

@Injectable()
export class MyService {
  constructor(private readonly logService: LogService) {}

  async someMethod() {
    // 디버그
    this.logService.debug('상세 정보', 'MyService', { userId: 123 });

    // 정보
    this.logService.info('작업 시작', 'MyService');

    // 경고
    this.logService.warn('비정상 상태', 'MyService', { value: 999 });

    // 에러 (스택 트레이스 포함)
    try {
      throw new Error('실패');
    } catch (error) {
      this.logService.error(
        '작업 실패',
        error.stack,
        'MyService',
        { errorCode: 'E001' }
      );
    }
  }
}
```

### HTTP 로깅 (자동)

LogInterceptor가 전역으로 등록되어 자동 처리:

```
2025-01-29T12:34:56.789Z [INFO] [HTTP] GET /api/storage/sections 200 45ms
2025-01-29T12:35:10.123Z [WARN] [HTTP] POST /api/storage/upload 400 1234ms
2025-01-29T12:35:20.456Z [ERROR] [HTTP] GET /api/file/xxx 500 12ms
```

## 파일 구조

```
src/shared/log/
├── log.module.ts           # 모듈 정의
├── log.service.ts          # 핵심 로깅 서비스
├── log.interceptor.ts      # HTTP 자동 로깅
├── log.types.ts            # 타입 정의
├── transports/
│   ├── console.transport.ts
│   ├── file.transport.ts
│   └── sentry.transport.ts
├── index.ts                # Barrel export
└── README.md
```

## 로그 파일

- **위치**: `storage/logs/YYYY-MM-DD.log`
- **Rotation**: 자정마다 새 파일 생성
- **정리**: 환경 변수로 설정 (기본: 자동 삭제 안 함)

### 환경 변수

```env
# 로그 파일 저장 위치
LOG_DIR=./storage/logs

# 로그 파일 자동 삭제 설정 (일 단위)
# 0 = 자동 삭제 안 함 (기본값)
# 30 = 30일 이상 된 파일 자동 삭제
# 90 = 90일 이상 된 파일 자동 삭제
LOG_MAX_FILES=0

# 로그 파일 최대 크기
LOG_MAX_SIZE=10m

# Sentry (선택적)
SENTRY_DSN=https://xxx@sentry.io/xxx
```

## Sentry 연동 (선택)

```bash
npm install @sentry/node
```

```typescript
LogModule.forRoot({
  transports: ['console', 'file', 'sentry'],
  sentryDsn: process.env.SENTRY_DSN,
})
```

- ERROR, WARN만 Sentry로 전송
- `@sentry/node` 미설치 시 경고만 출력

## 주의사항

1. **ActivityLog와 구분**
   - 사용자 행동 → ActivityLog
   - 시스템 로그 → Log 모듈

2. **로그 레벨**
   - 개발: DEBUG
   - 운영: INFO 이상

3. **파일 저장 및 정리**
   - 운영 환경에서만 file transport 활성화 권장
   - **자동 삭제**: `LOG_MAX_FILES` 환경 변수로 설정
     - `LOG_MAX_FILES=0`: 자동 삭제 안 함 (기본값, 수동 관리)
     - `LOG_MAX_FILES=30`: 30일 이상 된 로그 자동 삭제
     - `LOG_MAX_FILES=90`: 90일 이상 된 로그 자동 삭제
   - **수동 정리**: cron 사용 (`find storage/logs -type f -mtime +90 -delete`)

4. **성능**
   - excludePaths로 불필요한 경로 제외
   - 과도한 debug 로그 주의
