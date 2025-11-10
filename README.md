# Next.js + NestJS Template

Next.js (Pages Router)와 NestJS를 통합한 풀스택 프로젝트 템플릿입니다.

## 주요 기능

- **프론트엔드**: Next.js 16 (Pages Router) + React 19 + TailwindCSS
- **백엔드**: NestJS + Express
- **데이터베이스**: MySQL + Prisma ORM
- **인증**: JWT + OAuth (Google/Kakao/Naver)
- **파일 업로드**: Multer 기반 커스텀 스토리지
- **실시간 통신**: Socket.IO
- **UI 컴포넌트**: DataGrid, WYSIWYG Editor, Drag & Drop

## 프로젝트 구조

```
.
├── src/                    # NestJS 백엔드 코드
│   ├── main.ts            # 서버 엔트리 포인트
│   └── app.module.ts      # 루트 모듈
├── pages/                 # Next.js 페이지
├── components/            # React 컴포넌트
├── prisma/               # Prisma 스키마 및 마이그레이션
├── public/               # 정적 파일
├── styles/               # 전역 스타일
└── dist/                 # 빌드 출력 (생성됨)
```

## 빠른 시작

### 1. 프로젝트 생성

이 템플릿을 사용하여 새 프로젝트를 시작하세요:

```bash
# 방법 1: GitHub 웹사이트에서 "Use this template" 버튼 클릭 후 클론
git clone https://github.com/YOUR_USERNAME/my-new-project.git
cd my-new-project

# 방법 2: degit 사용 (권장 - git 히스토리 없이 깔끔하게 시작)
npx degit haneu89/makeit_template my-new-project
cd my-new-project
git init
git add .
git commit -m "Initial commit from template"

# 방법 3: 템플릿 직접 클론 (git 히스토리 포함)
git clone https://github.com/haneu89/makeit_template.git my-new-project
cd my-new-project
rm -rf .git
git init
git add .
git commit -m "Initial commit from template"
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일을 열어 아래 설정을 완료하세요:

#### 3-1. JWT 시크릿 키 생성

```bash
# 방법 1: 512비트 hex (권장)
openssl rand -hex 64

# 방법 2: 256비트 base64
openssl rand -base64 32

# 방법 3: Node.js 사용
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

생성된 키를 `.env` 파일에 설정:
```
JWT_ACCESS_TOKEN_SECRET=<생성된 키 1>
JWT_REFRESH_TOKEN_SECRET=<생성된 키 2>
```

#### 3-2. 데이터베이스 설정

개발 환경에서는 SQLite를 사용하므로 별도 설정이 필요 없습니다.

**운영 환경 (MySQL):**
```bash
# .env 파일 수정
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# Prisma 스키마 수정 (prisma/schema.prisma)
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**운영 환경 (PostgreSQL - 권장):**
```bash
# .env 파일 수정
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"

# Prisma 스키마 수정 (prisma/schema.prisma)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. 데이터베이스 초기화

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션 (SQLite 자동 생성)
npx prisma db push

# 시드 데이터 생성 (관리자 계정, 기본 페이지)
npm run seed
```

### 5. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

**기본 관리자 계정:**
- 이메일: `.env` 파일의 `ADMIN_ACCOUNT` 값
- 비밀번호: `.env` 파일의 `ADMIN_PASSWORD` 값
- 로그인 페이지: `http://localhost:3000/login`
- 관리자 페이지: `http://localhost:3000/admin`

## 스크립트

- `npm run dev` - 개발 서버 시작 (nodemon + ts-node)
- `npm run build` - 프로덕션 빌드 (백엔드 + 프론트엔드)
- `npm run build:server` - 백엔드만 빌드
- `npm run start` - 프로덕션 서버 시작
- `npm run start:dev` - ts-node로 프로덕션 모드 실행
- `npm run lint` - ESLint 실행
- `npm run seed` - 데이터베이스 시드
- `npm test` - 테스트 실행 (Jest)
- `npm run test:watch` - 테스트 Watch 모드
- `npm run test:cov` - 테스트 커버리지 확인

## 아키텍처

### 통합 서버

하나의 서버에서 Next.js와 NestJS를 동시에 실행합니다:

- `/api/*` - NestJS가 처리하는 API 엔드포인트
- `/*` - Next.js가 처리하는 페이지 및 정적 파일

### 백엔드 패턴

NestJS는 Controller/Service/Module 패턴을 따릅니다:

- **Controller**: 라우팅, DTO 검증, 가드 적용
- **Service**: 비즈니스 로직, 트랜잭션 처리
- **Module**: 의존성 주입 설정

### 인증

JWT 기반 인증 시스템:

```typescript
// 가드 사용 예시
@UseGuards(JwtRoleGuard)
@Roles(Role.ADMIN)
@Get('admin-only')
async adminOnly() {
  return { message: 'Admin only endpoint' };
}
```

## Prisma 사용

### 스키마 수정

`prisma/schema.prisma` 파일에서 모델을 정의합니다:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

### 마이그레이션

```bash
# 마이그레이션 생성 및 적용
npx prisma migrate dev --name add_user_model

# 프로덕션 마이그레이션 적용
npx prisma migrate deploy
```

### 클라이언트 사용

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = await prisma.user.findMany();
```

## Docker 배포

### Docker 이미지 빌드

```bash
docker build -t my-app .
```

### Docker Compose 사용

```bash
docker-compose up -d
```

## 환경 변수

주요 환경 변수는 `.env.example` 파일을 참고하세요.

### 필수 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NODE_ENV` | 실행 환경 | `development`, `production` |
| `PORT` | 서버 포트 | `3000` |
| `DATABASE_URL` | 데이터베이스 연결 문자열 | 아래 참고 |
| `JWT_ACCESS_TOKEN_SECRET` | JWT 액세스 토큰 시크릿 | `openssl rand -hex 64` |
| `JWT_REFRESH_TOKEN_SECRET` | JWT 리프레시 토큰 시크릿 | `openssl rand -hex 64` |
| `ADMIN_ACCOUNT` | 관리자 계정 (이메일/사용자명) | `admin@example.com` |
| `ADMIN_PASSWORD` | 관리자 비밀번호 | `secure-password` |

### 데이터베이스 URL 예시

**SQLite (개발용):**
```
DATABASE_URL="file:./storage/database.db"
```

**MySQL:**
```
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

**PostgreSQL:**
```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

**SSL 연결:**
```
DATABASE_URL="mysql://user:pass@host:3306/db?ssl=true"
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&sslmode=require"
```

### 선택 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `CORS_ALLOWED_ORIGINS` | CORS 허용 도메인 (쉼표 구분) | 개발: 모든 도메인 허용 |
| `UPLOAD_MAX_SIZE` | 최대 파일 크기 (바이트) | `10485760` (10MB) |
| `LOG_DIR` | 로그 저장 디렉토리 | `./storage/logs` |
| `LOG_MAX_FILES` | 로그 파일 최대 개수 | `30` |
| `SENTRY_DSN` | Sentry 에러 트래킹 | - |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID | - |
| `KAKAO_CLIENT_ID` | Kakao OAuth 클라이언트 ID | - |
| `NAVER_CLIENT_ID` | Naver OAuth 클라이언트 ID | - |

## 데이터베이스 전환 가이드

### SQLite → MySQL 전환

**1. MySQL 설치 및 데이터베이스 생성:**
```bash
# MySQL 설치 (macOS)
brew install mysql
brew services start mysql

# MySQL 접속
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE myapp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'myuser'@'localhost' IDENTIFIED BY 'mypassword';
GRANT ALL PRIVILEGES ON myapp_db.* TO 'myuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**2. Prisma 스키마 수정:**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**3. 환경 변수 수정:**
```bash
# .env
DATABASE_URL="mysql://myuser:mypassword@localhost:3306/myapp_db"
```

**4. 마이그레이션:**
```bash
npx prisma generate
npx prisma db push
npm run seed
```

### SQLite → PostgreSQL 전환

**1. PostgreSQL 설치 및 데이터베이스 생성:**
```bash
# PostgreSQL 설치 (macOS)
brew install postgresql
brew services start postgresql

# 데이터베이스 생성
createdb myapp_db

# 사용자 생성 (선택사항)
psql postgres
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE myapp_db TO myuser;
\q
```

**2. Prisma 스키마 수정:**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**3. 환경 변수 수정:**
```bash
# .env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/myapp_db?schema=public"
```

**4. 마이그레이션:**
```bash
npx prisma generate
npx prisma db push
npm run seed
```

## 테스트

이 프로젝트는 Jest 기반 테스트를 지원합니다.

### 테스트 실행

```bash
# 전체 테스트 실행
npm test

# Watch 모드 (파일 변경 감지)
npm run test:watch

# 커버리지 리포트 생성
npm run test:cov
```

### 테스트 파일 작성

테스트 파일은 `.spec.ts` 확장자를 사용합니다:

```typescript
// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### 테스트 제외 방법

**다른 프로젝트로 복사 시 테스트 파일 제외:**

1. `.spec.ts` 파일만 삭제하면 됨
2. `tsconfig.build.json`에서 자동으로 제외됨
3. 프로덕션 빌드에는 포함되지 않음

**Git에서 테스트 파일 제외 (선택사항):**
```bash
# .gitignore에 추가
**/*.spec.ts
coverage/
```

### 테스트 구조

현재 구현된 테스트:

- `src/auth/auth.service.spec.ts` - AuthService 테스트
  - Remember Me 기능 (30일 vs 세션 쿠키)
  - 로그인/로그아웃 로직
  - 플랫폼별 토큰 만료 시간

- `src/auth/auth.controller.spec.ts` - AuthController 테스트
  - 쿠키 설정 테스트 (maxAge 처리)
  - API 엔드포인트 동작 확인
  - 토큰 갱신 로직

## 프로젝트 확장

### 새 API 모듈 추가

```bash
# NestJS CLI로 모듈 생성
npx nest generate module users
npx nest generate controller users
npx nest generate service users
```

### 새 페이지 추가

`pages/` 디렉토리에 파일을 추가하면 자동으로 라우팅됩니다:

```tsx
// pages/about.tsx
export default function About() {
  return <div>About Page</div>;
}
```

## 라이선스

MIT

## 기여

이슈와 PR은 언제나 환영합니다!
