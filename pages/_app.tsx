import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { Toaster } from 'sonner';
// import { appWithTranslation } from "next-i18next";
// import ChangePasswordModal from '@/components/ChangePasswordModal';

// 상수 정의
const AUTH_TOKEN_NAME = 'auth-token';
const LOGIN_PAGE_PATH = '/login';
const ADMIN_ROLE = 'ADMIN';
const MANAGER_ROLE = 'MANAGER';
const ASSISTANT_ROLE = 'ASSISTANT';

// ⭐ 라우트 권한 설정
const PROTECTED_ROUTES = ['/admin']; // 인증이 필요한 라우트
const ADMIN_MANAGER_ROUTES = ['/admin'];         // ADMIN, MANAGER만 접근 가능 (ASSISTANT 불가)
const ADMIN_ONLY_ROUTES = [                      // ADMIN 전용 라우트
  '/admin/page',
  '/admin/preference',
];

interface DecodedToken {
  role?: string;
  exp?: number;
}

/**
 * JWT 토큰을 디코드하는 함수
 */
function decodeJwt(token: string): DecodedToken {
  try {
    // JWT는 header.payload.signature 형식
    const base64Url = token.split('.')[1];
    // Base64Url을 Base64로 변환
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Base64 디코드
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('토큰 디코드 중 오류:', error);
    return {};
  }
}

/**
 * 애플리케이션의 메인 컴포넌트
 *
 * 주요 기능:
 * 1. 전역 레이아웃 설정
 * 2. 라우트 변경 이벤트 처리
 * 3. 배열 기반 라우트 권한 관리
 *
 * 라우트 권한 설정:
 * - PROTECTED_ROUTES: 로그인이 필요한 모든 라우트
 * - ADMIN_ONLY_ROUTES: 관리자(ADMIN) 권한이 필요한 라우트
 *
 * 인증 흐름:
 * 1. 인증이 필요한 페이지 접근 시 토큰 존재 여부 확인
 * 2. 토큰이 있으면 디코드하여 만료 여부 확인
 * 3. 관리자 전용 라우트는 추가로 ADMIN 권한 확인
 * 4. 권한이 없거나 토큰이 만료된 경우 로그인 페이지로 리다이렉트
 * 5. 인증 완료 전까지 로딩 화면 표시 (깜빡임 방지)
 */
function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  // ⭐ 배열 기반 라우트 체크
  const requiresAuth = PROTECTED_ROUTES.some(route => router.pathname.startsWith(route));
  const requiresAdminOnly = ADMIN_ONLY_ROUTES.some(route => router.pathname.startsWith(route));
  const requiresAdminOrManager = ADMIN_MANAGER_ROUTES.some(route => router.pathname.startsWith(route));

  // 글로벌 401 에러 처리 함수
  const handle401Error = useCallback((currentPath?: string) => {
    const path = currentPath || router.asPath;
    const returnUrl = encodeURIComponent(path);
    router.replace(`${LOGIN_PAGE_PATH}?returnUrl=${returnUrl}`);
  }, [router]);

  // 글로벌 fetch 인터셉터 설정
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 원본 fetch 저장
    const originalFetch = window.fetch;

    // fetch 오버라이드
    window.fetch = async (...args) => {
      try {
        // Authorization 헤더 자동 추가
        const [url, options = {}] = args;
        const token = localStorage.getItem(AUTH_TOKEN_NAME);

        if (token) {
          const headers = new Headers(options.headers);
          // Authorization 헤더가 없으면 자동으로 추가
          if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
          }
          options.headers = headers;
        }

        const response = await originalFetch(url, options);

        // 401 에러 처리
        if (response.status === 401) {
          handle401Error();

          // 401 응답을 그대로 반환 (컴포넌트에서도 처리할 수 있도록)
          return response;
        }

        // 403 에러 처리 (접근 제한) - 커스텀 이벤트 발생
        if (response.status === 403) {
          response.clone().json().then((data) => {
            const event = new CustomEvent('access-denied', {
              detail: { message: data.message || '접근 권한이 없습니다.' }
            });
            window.dispatchEvent(event);
          }).catch(() => {
            const event = new CustomEvent('access-denied', {
              detail: { message: '접근 권한이 없습니다.' }
            });
            window.dispatchEvent(event);
          });
        }

        return response;
      } catch (error) {
        throw error;
      }
    };

    // 언마운트 시 원본 fetch 복원
    return () => {
      window.fetch = originalFetch;
    };
  }, [handle401Error]);

  // 글로벌 에러 이벤트 리스너
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;

      // 401 에러 처리
      if (error?.status === 401 || error?.statusCode === 401 ||
          (error?.response && error.response.status === 401)) {
        handle401Error();
      }
    };

    const handleError = (event: ErrorEvent) => {
      const error = event.error;

      // 401 에러 처리
      if (error?.status === 401 || error?.statusCode === 401) {
        handle401Error();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [handle401Error]);

  // 인증이 필요한 페이지 체크
  useEffect(() => {
    const checkAuth = async () => {
      // 인증이 필요 없는 페이지는 바로 렌더링
      if (!requiresAuth) {
        setIsLoading(false);
        return;
      }

      try {
        // localStorage에서 토큰 읽기
        const token = localStorage.getItem(AUTH_TOKEN_NAME);

        // 토큰이 없으면 로그인 페이지로
        if (!token) {
          handle401Error();
          return;
        }

        const decodedToken = decodeJwt(token);

        // exp 필드가 있는 경우에만 만료시간 체크
        if (decodedToken.exp) {
          if (decodedToken.exp * 1000 < Date.now()) {
            handle401Error();
            return;
          }
        }

        // ADMIN 전용 페이지는 ADMIN 권한만 허용
        if (requiresAdminOnly && decodedToken.role !== ADMIN_ROLE) {
          router.replace('/admin');
          return;
        }

        // ADMIN/MANAGER 페이지는 둘 중 하나의 권한 필요
        if (requiresAdminOrManager && !requiresAdminOnly) {
          if (decodedToken.role !== ADMIN_ROLE && decodedToken.role !== MANAGER_ROLE) {
            router.replace('/');
            return;
          }
        }

        // 인증 완료
        setIsLoading(false);
      } catch (error) {
        handle401Error();
      }
    };

    checkAuth();
  }, [requiresAuth, requiresAdminOnly, requiresAdminOrManager, router, handle401Error]);

  // mustChangePassword 체크 (로그인 후)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mustChange = localStorage.getItem('mustChangePassword');
    if (mustChange === 'true') {
      setMustChangePassword(true);
      setShowPasswordModal(true);
    }
  }, []);

  // 로딩 화면 렌더링
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  // 비밀번호 변경 성공 핸들러
  const handlePasswordChangeSuccess = () => {
    localStorage.removeItem('mustChangePassword');
    setShowPasswordModal(false);
    setMustChangePassword(false);
    router.reload(); // 페이지 새로고침
  };

  // 페이지 컴포넌트 렌더링
  return (
    <>
      <Toaster position="top-right" richColors />
      <Component {...pageProps} />
      {/* i18n과 ChangePasswordModal은 필요시 주석 해제 */}
      {/* <ChangePasswordModal
        isOpen={showPasswordModal}
        mustChange={mustChangePassword}
        onClose={() => !mustChangePassword && setShowPasswordModal(false)}
        onSuccess={handlePasswordChangeSuccess}
      /> */}
    </>
  );
}

// i18n 사용시 주석 해제
// export default appWithTranslation(MyApp);
export default MyApp;
