# Common Components Library

> 프로젝트 전반에서 재사용 가능한 공통 UI 컴포넌트 라이브러리
>
> **Version**: 1.0.0
> **Date**: 2025-09-28
> **Author**: jinhyung

## 📋 개요

이 라이브러리는 다양한 Next.js 프로젝트에서 재사용 가능한 범용 React 컴포넌트를 제공합니다. 인증, 레이아웃, UI 요소 등 핵심 기능을 포함하고 있으며, 프로젝트 독립적으로 설계되었습니다.

## 🚀 특징

- ✅ **프로젝트 독립적**: 특정 프로젝트에 종속되지 않은 범용 설계
- 🎨 **일관된 디자인**: TailwindCSS 기반 스타일링
- 📱 **반응형 레이아웃**: 모든 디바이스 지원
- 🔒 **인증 통합**: JWT 및 소셜 로그인 지원
- 🖼️ **시각적 효과**: 랜덤 배경 이미지 시스템

## 📦 컴포넌트 목록

### 1. AuthLayout

인증 페이지용 레이아웃 컴포넌트로, 로그인/회원가입 화면에 시각적으로 매력적인 배경과 폼을 제공합니다.

#### 주요 기능
- 7개의 랜덤 배경 이미지 자동 선택
- 좌/우 폼 위치 설정 가능
- 반응형 디자인 (모바일/태블릿/데스크톱)
- 에러 메시지 표시 지원
- 로고 및 브랜딩 통합
- 구글 폰트(Bebas Neue, Archivo Black) 지원

#### 사용 예제

```tsx
import { AuthLayout } from '@/components/common';

export default function LoginPage() {
  return (
    <AuthLayout
      formPosition="right"
      error={errorMessage}
    >
      <div className="max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          로그인
        </h2>

        <form className="space-y-6">
          <input
            type="email"
            placeholder="이메일"
            className="w-full px-4 py-3 border rounded-lg"
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full px-4 py-3 border rounded-lg"
          />
          <button className="w-full py-3 bg-blue-600 text-white rounded-lg">
            로그인
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/register">
            계정이 없으신가요? 회원가입
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | 폼 콘텐츠 |
| `formPosition` | 'left' \| 'right' | 'left' | 폼 위치 |
| `error` | string \| null | null | 에러 메시지 |

#### 배경 이미지
7개의 고품질 배경 이미지가 포함되어 있으며, 페이지 로드 시 랜덤하게 선택됩니다:
- `auth-bg-1.jpg` ~ `auth-bg-7.jpg`

#### 반응형 브레이크포인트
- **모바일** (< 768px): 전체 화면 폼, 배경 이미지 숨김
- **태블릿** (768px - 1024px): 좁은 폼 영역
- **데스크톱** (> 1024px): 50/50 분할 레이아웃

## 🔧 설치 방법

### 1. 디렉토리 복사
```bash
cp -r components/common your-project/components/
```

### 2. 의존성 설치
```json
{
  "dependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "next": "^14.0.0 || ^15.0.0"
  }
}
```

### 3. TailwindCSS 설정
```js
// tailwind.config.js
module.exports = {
  content: [
    "./components/common/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'bebas': ['Bebas Neue', 'cursive'],
        'archivo': ['Archivo Black', 'sans-serif'],
      }
    }
  }
}
```

### 4. 정적 자원 복사
AuthLayout을 사용하는 경우, 배경 이미지를 프로젝트의 public 디렉토리로 복사:
```bash
cp -r public/images/auth-bg-*.jpg your-project/public/images/
```

## 📁 디렉토리 구조

```
components/common/
├── AuthLayout.tsx     # 인증 페이지 레이아웃 [v1.0.0] (2025-09-24)
└── README.md          # 이 문서
```

## 🎯 실제 사용 사례

### 회원가입 페이지
```tsx
import { AuthLayout } from '@/components/common';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 회원가입 API 호출
      await registerUser(formData);
      router.push('/auth/login');
    } catch (err) {
      setError('회원가입에 실패했습니다.');
    }
  };

  return (
    <AuthLayout formPosition="left" error={error}>
      <div className="max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-8">회원가입</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 회원가입 폼 필드 */}
        </form>

        {/* 소셜 로그인 버튼 */}
        <div className="mt-6 space-y-3">
          <button className="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2">
            <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
            Google로 계속하기
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
```

### 비밀번호 찾기 페이지
```tsx
import { AuthLayout } from '@/components/common';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout formPosition="right">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">비밀번호 찾기</h2>
        <p className="text-gray-600 mb-8">
          가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="이메일 주소"
            className="w-full px-4 py-3 border rounded-lg"
            required
          />
          <button className="w-full py-3 bg-blue-600 text-white rounded-lg">
            재설정 링크 받기
          </button>
        </form>

        <div className="mt-6">
          <Link href="/auth/login" className="text-blue-600">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
```

## 🔄 버전 관리

컴포넌트는 프로젝트의 버전 관리 정책을 따릅니다:

```tsx
/**
 * @version x.y.z
 * @date YYYY-MM-DD
 * @author jinhyung
 */
```

### 버전 정책
- **Major (x)**: 호환성이 깨지는 변경
- **Minor (y)**: 새로운 기능 추가
- **Patch (z)**: 버그 수정

### 현재 컴포넌트 버전
- AuthLayout: v1.0.0 (2025-09-24)

## 🎨 커스터마이징

### 배경 이미지 변경
`public/images/` 디렉토리의 `auth-bg-*.jpg` 파일을 교체하여 커스텀 배경 이미지 사용 가능

### 색상 테마 변경
TailwindCSS 클래스를 활용하여 쉽게 색상 변경:
```tsx
<AuthLayout className="bg-gradient-to-br from-purple-600 to-blue-600">
  {/* 콘텐츠 */}
</AuthLayout>
```

### 폰트 변경
```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=YourFont&display=swap');

.auth-title {
  font-family: 'YourFont', sans-serif;
}
```

## 🤝 기여 가이드

1. 새 컴포넌트 추가 시 버전 정보 필수 기재
2. 프로젝트 독립적인 코드 작성
3. TypeScript 타입 정의 포함
4. 충분한 주석과 문서화
5. 반응형 디자인 고려

## 📝 로드맵

### 계획된 컴포넌트
- [ ] LoadingSpinner - 로딩 인디케이터
- [ ] ErrorBoundary - 에러 처리 컴포넌트
- [ ] Toast - 알림 메시지 컴포넌트
- [ ] Dropdown - 드롭다운 메뉴
- [ ] Pagination - 페이지네이션 컴포넌트
- [ ] Card - 카드 레이아웃 컴포넌트

### 개선 사항
- [x] AuthLayout에 버전 정보 추가
- [ ] 다크모드 지원
- [ ] 애니메이션 효과 추가
- [ ] 접근성(a11y) 개선

## 📄 라이선스

MIT License - 자유롭게 사용 및 수정 가능

---

**최종 업데이트**: 2025-10-09
**관리자**: jinhyung