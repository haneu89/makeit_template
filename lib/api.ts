/**
 * API 호출 Wrapper
 * localStorage 기반 인증 처리 (Authorization 헤더 자동 추가)
 */

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * 인증이 필요한 API 호출
 * @param url API 엔드포인트
 * @param options fetch 옵션
 * @returns fetch Response
 */
export async function apiFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const token = localStorage.getItem('auth-token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 토큰이 있으면 Authorization 헤더 추가
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 401 Unauthorized 시 자동 로그아웃
  if (response.status === 401) {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('refresh-token');

    // 로그인 페이지로 리다이렉트 (현재 URL은 returnUrl로 저장)
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
    }
  }

  return response;
}

/**
 * 로그아웃 처리
 */
export function logout() {
  // localStorage 토큰 삭제
  localStorage.removeItem('auth-token');
  localStorage.removeItem('refresh-token');

  // 로그인 페이지로 이동
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * 토큰 존재 여부 확인
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth-token');
}

/**
 * 현재 사용자 정보 가져오기 (JWT 디코딩)
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('auth-token');
  if (!token) return null;

  try {
    const tokenParts = token.split('.');
    const payload = JSON.parse(atob(tokenParts[1]));
    return {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      username: payload.username,
      name: payload.name ? atob(payload.name) : null,
    };
  } catch (error) {
    console.error('토큰 디코딩 실패:', error);
    return null;
  }
}
