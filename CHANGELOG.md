# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed - 2025-11-11

#### 🔐 인증 시스템 개선: 쿠키 → localStorage 마이그레이션

**배경**: 여러 포트(localhost:3000, localhost:3030 등)에서 동일 템플릿 기반 프로젝트를 동시 실행 시 쿠키 기반 인증으로 인한 세션 충돌 문제 해결

**주요 변경사항**:

##### Backend (NestJS)
- **인증 컨트롤러 수정**
  - `src/auth/auth.controller.ts`: 쿠키 설정/삭제 로직 제거, 토큰을 JSON 응답으로만 반환
  - `src/auth/oauth/oauth.controller.ts`: OAuth 로그인도 동일하게 수정
  - `src/shared/jwt/jwt-role.strategy.ts`: Authorization Bearer 헤더에서만 토큰 추출하도록 변경

- **파일 업로드 컨트롤러 수정**
  - `src/attachment/attachment.controller.ts`: 쿠키 체크 로직 제거, Authorization Bearer 헤더만 사용

- **테스트 코드 업데이트**
  - `src/auth/auth.controller.spec.ts`: 쿠키 관련 테스트를 localStorage 기반으로 재작성 (4개 테스트 통과 ✅)

##### Frontend (Next.js)
- **인증 유틸리티 추가**
  - `lib/api.ts`: 새로 생성
    - `apiFetch()`: localStorage에서 토큰을 읽어 Authorization 헤더에 자동 추가
    - `logout()`: localStorage 토큰 삭제 및 로그인 페이지 리다이렉트
    - `isAuthenticated()`: 토큰 존재 여부 확인
    - `getCurrentUser()`: JWT 토큰 디코딩하여 사용자 정보 반환

- **글로벌 설정**
  - `pages/_app.tsx`:
    - 토큰 읽기: `document.cookie` → `localStorage.getItem()` 변경
    - fetch 인터셉터에 Authorization 헤더 자동 추가 기능 구현
    - 401/403 에러 처리 및 자동 리다이렉트 유지

- **로그인 페이지**
  - `pages/login.tsx`:
    - 로그인 성공 시 토큰을 localStorage에 저장
    - 디버그 로그 추가 (응답 상태, 데이터 확인)
    - UI 텍스트 한글화 및 개선 (상세 내용은 아래 참조)

- **관리자 레이아웃**
  - `components/admin/common/layout/AdminLayout.tsx`:
    - 쿠키 유틸리티 함수 → localStorage 유틸리티로 변경
    - 로그아웃 시 localStorage 토큰 삭제
    - 로그아웃 후 `/login`으로 리다이렉트

- **기타 컴포넌트**
  - `pages/admin/user/edit-modal.tsx`: 쿠키 기반 토큰 읽기 → localStorage 기반으로 변경

##### 이점
- ✅ **포트별 완전 격리**: 각 포트(origin)마다 독립적인 localStorage 사용으로 세션 충돌 방지
- ✅ **표준 준수**: Authorization Bearer 토큰 방식은 REST API 표준 패턴
- ✅ **유연성**: 클라이언트가 토큰 관리 전권 보유
- ✅ **테스트 용이성**: 쿠키 Mock 불필요로 테스트 코드 간소화
- ✅ **자동화**: 글로벌 fetch 인터셉터로 모든 API 요청에 자동으로 Authorization 헤더 추가

---

#### 🎨 로그인 페이지 UI/UX 개선

**주요 변경사항**:

##### 사용자 친화적 입력 필드
- **입력 필드 라벨**:
  - `username` 모드: "Username" → "아이디"
  - `email` 모드: "Email" → "아이디 또는 이메일"
  - 비밀번호: "Password" → "비밀번호"

- **플레이스홀더**:
  - `username` 모드: "username" → "아이디를 입력하세요"
  - `email` 모드: "name@company.com" → "아이디 또는 이메일을 입력하세요"
  - 비밀번호: "••••••••" → "비밀번호를 입력하세요"

- **입력 타입 변경**:
  - 이메일/아이디 입력 필드: `type="email"` → `type="text"` 변경
  - 이메일 형식 검증 제거로 더 유연한 입력 허용

##### 버튼 및 링크 한글화
- 로그인 버튼: "Sign in to your account" → "로그인" / "Signing in..." → "로그인 중..."
- 체크박스: "Remember me" → "로그인 상태 유지"
- 링크: "Forgot password?" → "비밀번호 찾기"

##### 에러 메시지 개선
- "이메일과 비밀번호를 입력해주세요." → "아이디와 비밀번호를 입력해주세요."
- "이메일 또는 비밀번호가 올바르지 않습니다." → "아이디 또는 비밀번호가 올바르지 않습니다."
- "이미 등록된 이메일입니다." → "이미 등록된 계정입니다."

##### 이점
- ✅ 사용자가 이메일/아이디 구분 없이 편하게 입력 가능
- ✅ 한글 UI로 통일되어 직관적
- ✅ 입력 제약 완화로 사용성 향상

---

### Technical Details

#### 파일 변경 목록

**Backend**:
- `src/auth/auth.controller.ts`
- `src/auth/auth.controller.spec.ts`
- `src/auth/oauth/oauth.controller.ts`
- `src/shared/jwt/jwt-role.strategy.ts`
- `src/attachment/attachment.controller.ts`

**Frontend**:
- `lib/api.ts` (신규)
- `pages/_app.tsx`
- `pages/login.tsx`
- `components/admin/common/layout/AdminLayout.tsx`
- `pages/admin/user/edit-modal.tsx`

#### Breaking Changes
- ⚠️ 기존 쿠키 기반 인증 코드와 호환되지 않음
- ⚠️ 프론트엔드에서 수동으로 fetch 시 Authorization 헤더 추가 불필요 (글로벌 인터셉터 자동 처리)

#### Migration Guide
1. 기존 사용자는 자동으로 로그아웃됨 (쿠키 → localStorage 전환)
2. 재로그인 시 localStorage에 토큰 자동 저장
3. 별도 마이그레이션 작업 불필요

---

### 참고
- 이 변경사항은 parking-edge 프로젝트의 성공적인 구현을 참고하여 적용됨
- 모든 테스트 통과 확인 완료
