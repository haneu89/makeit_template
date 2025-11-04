/**
 * @version 1.0.0
 * @date 2025-09-24
 * @author jinhyung
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Aside from '../../Aside';  // 새로운 Aside 컴포넌트 import
import { Toaster } from "sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
  authToken?: string | null;  // authToken을 선택적 prop으로 추가
}

// JWT 페이로드 타입 정의
interface JwtPayload {
  name: string;
  email: string;
  role: string;
  sub: number;
}

// 쿠키 관련 유틸리티 함수들
const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

const setCookie = (name: string, value: string, days: number = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

/**
 * HeaderNavLink 컴포넌트 - 상단 헤더의 네비게이션 링크를 렌더링합니다.
 *
 * @component
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.href - 링크의 목적지 URL
 * @param {React.ReactNode} props.children - 링크의 내부 컨텐츠
 * @returns {JSX.Element} 스타일이 적용된 헤더 네비게이션 링크
 */
const HeaderNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const router = useRouter();
  const isCurrentPath = router.pathname === href;

  return (
    <Link
      href={href}
      className={`text-gray-700 hover:text-blue-600 h-[60px] flex items-center px-4 relative ${isCurrentPath ? 'text-blue-600' : ''}`}
    >
      {children}
      <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-transparent ${isCurrentPath ? 'bg-blue-600' : ''} hover:bg-blue-600`} />
    </Link>
  );
};

/**
 * AdminLayout 컴포넌트 - 관리자 페이지의 기본 레이아웃을 구성합니다.
 * 사이드바, 헤더, 메인 컨텐츠 영역을 포함합니다.
 *
 * @component
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 레이아웃 내부에 렌더링될 컨텐츠
 * @param {string} [props.authToken] - JWT 토큰 (선택사항)
 * @returns {JSX.Element} 관리자 페이지 레이아웃
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children, authToken }) => {
  const router = useRouter();

  /**
   * 사이드바의 접힘/펼침 상태를 관리합니다.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userData, setUserData] = useState<JwtPayload | null>(null);

  useEffect(() => {
    const token = getCookie('auth-token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
        setUserData({
          ...payload,
          name: payload.name ? Buffer.from(payload.name, 'base64').toString() : '', // 한글 디코딩
        });
      } catch (error) {
        console.error('Failed to decode JWT:', error);
      }
    }
  }, []);

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1025); // 1025px 미만을 모바일로 간주
    };

    handleResize(); // 초기 실행
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    removeCookie('auth-token');
    setIsDrawerOpen(false);
    router.push('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Toaster position="top-right" richColors />
      {/* Sidebar - 모바일에서는 드로어로 전환 */}
      <aside
        className={`
          ${isMobile
            ? `fixed inset-y-0 left-0 z-50 transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} w-[320px] max-w-[60%]`
            : isSidebarCollapsed ? 'w-0' : 'w-64 max-w-[40%]'
          }
          transition-all duration-300 bg-white border-r border-gray-200
          ${isMobile ? 'shadow-lg' : ''}
        `}
      >
        <Aside />
      </aside>

      {/* Drawer Backdrop */}
      {isMobile && isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Main Content - overflow-auto 추가 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white h-[60px] flex-shrink-0">
          <div className="flex items-center justify-between h-full border-b border-gray-200">
            <div className="flex items-center space-x-6 h-full">
              <button
                onClick={() => isMobile ? setIsDrawerOpen(!isDrawerOpen) : setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="px-4 h-[60px] flex items-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <nav className={`flex items-center space-x-6 h-full ${isMobile ? 'hidden' : ''}`}>
                <HeaderNavLink href="/">
                  <span>홈</span>
                </HeaderNavLink>
              </nav>
            </div>
            <div className="flex items-center space-x-4 px-4 h-[60px]">
              <span className="text-sm text-gray-600 hidden sm:inline">
                {userData ? `${userData.name} (${userData.email})` : '로딩 중...'}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-1 text-sm text-white bg-blue-600 rounded-full hover:bg-blue-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </header>

        {/* Page Content - overflow-auto 추가 */}
        <main className="flex-1 overflow-auto">
          <div className="lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;