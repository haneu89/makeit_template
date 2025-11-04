/**
 * @version 1.0.0
 * @date 2025-09-24
 * @author jinhyung
 *
 * Aside - 관리자 사이드바 컴포넌트
 * 관리자 페이지의 네비게이션 메뉴를 제공하는 사이드바입니다.
 */

import Link from "next/link";
import { useRouter } from "next/router";
import Image from 'next/image';

/**
 * Aside 컴포넌트 - 관리자 페이지의 사이드바를 렌더링합니다.
 * 
 * @component
 * @returns {JSX.Element} 관리자 사이드바
 */
export default function Aside() {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="h-[60px] relative">
        <Link href="/admin" className="h-[60px] flex items-center justify-center">
          <Image src="/shared/logo.svg" alt="로고" width={24} height={24} className="mr-2" />
          <span className="text-xl font-bold text-gray-800">MAKE IT</span>
        </Link>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gray-200" />
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="py-4 space-y-1">
          <li>
            <NavLink href="/admin" icon="fas fa-tachometer-alt">
              <span>대시보드</span>
            </NavLink>
          </li>
          <li>
            <NavLink href="/admin/user" icon="fas fa-users">
              <span>회원 관리</span>
            </NavLink>
          </li>
          <li>
            <NavLink href="/admin/attachment" icon="far fa-save">
              <span>파일 관리</span>
            </NavLink>
          </li>
          <li>
            <NavLink href="/admin/activity-log" icon="fas fa-history">
              <span>활동 로그</span>
            </NavLink>
          </li>
          <li className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200 mt-4">시스템 관리</li>
          <li>
            <NavLink href="/admin/page" icon="far fa-newspaper">
              <span>페이지 관리</span>
            </NavLink>
          </li>
          <li>
            <NavLink href="/admin/system-log" icon="fas fa-file-alt">
              <span>시스템 로그</span>
            </NavLink>
          </li>
          <li>
            <NavLink href="/admin/preference" icon="fas fa-cog">
              <span>설정</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}
/**
 * NavLink 컴포넌트 - 사이드바의 네비게이션 링크를 렌더링합니다.
 * 
 * @component
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.href - 링크의 목적지 URL
 * @param {React.ReactNode} props.children - 링크의 내부 컨텐츠
 * @param {string} [props.icon] - Font Awesome 아이콘 클래스명 (선택사항)
 * @returns {JSX.Element} 스타일이 적용된 네비게이션 링크
 */
const NavLink = ({ href, children, icon }: { href: string; children: React.ReactNode; icon?: string }) => {
  const router = useRouter();
  const isCurrentPath = router.pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${isCurrentPath ? 'bg-blue-50' : ''
        }`}
    >
      {icon && <i className={`${icon} w-5 h-5 mr-2`}></i>}
      {children}
    </Link>
  );
};