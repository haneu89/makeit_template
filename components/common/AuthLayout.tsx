/**
 * @version 1.0.0
 * @date 2025-09-24
 * @author jinhyung
 *
 * AuthLayout - 인증 페이지 레이아웃 컴포넌트
 * 로그인/회원가입 페이지에 사용되는 시각적으로 매력적인 레이아웃을 제공합니다.
 */

import { ReactNode, useState, useEffect } from 'react';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
  formPosition?: 'left' | 'right';
  width?: string;
  title: string;
  subtitle: ReactNode;
  error?: string;
}

const AuthLayout = ({ 
  children, 
  formPosition = 'left',
  width = 'w-[450px]',
  title,
  subtitle,
  error
}: AuthLayoutProps) => {
  const [backgroundImage, setBackgroundImage] = useState('/shared/login-back1.jpg');

  useEffect(() => {
    // 클라이언트 사이드에서만 랜덤 이미지 설정
    const randomImage = `/shared/login-back${Math.floor(Math.random() * 7) + 1}.jpg`;
    setBackgroundImage(randomImage);
  }, []);

  // 폼 너비에 따른 패딩 클래스 결정
  const getPaddingClasses = () => {
    const widthValue = parseInt(width.match(/\d+/)?.[0] || '450');
    return widthValue <= 450 
      ? 'sm:pl-[100px] lg:pl-[150px] xl:pl-[200px] 2xl:pl-[250px]' 
      : 'sm:pl-[80px] lg:pl-[120px] xl:pl-[160px] l:pl-[200px]';
  };

  return (
    <div className="flex min-h-screen relative">
      {/* 배경 이미지 */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${backgroundImage}")` }}
      />
      {/* 검은색 오버레이 */}
      <div className="absolute inset-0 z-0 bg-black/30 sm:bg-black/10" />
      
      {/* 컨테이너 */}
      <div className="relative z-10 w-full flex">
        {/* 왼쪽 섹션 */}
        <div className={`
          w-full flex items-center min-h-screen
          ${formPosition === 'left' 
            ? `justify-center sm:justify-start ${getPaddingClasses()}` 
            : 'hidden'
          }
        `}>
          {/* Auth Card */}
          <div className={`
            bg-white rounded-lg 
            ${width}
            p-4 sm:p-8
            shadow-2xl shadow-black/50
            max-w-[95%] sm:max-w-none
            mx-4 sm:mx-0
          `}>
            {/* 로고 */}
            <div className="flex items-center mb-4">
              <div className="w-full flex select-none">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-2">
                  <Image src="/shared/logo.svg" alt="로고" width={34} height={34} />
                </div>
                <span className="text-xl font-semibold">MAKE IT</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <p className="text-gray-600 mb-8 text-sm sm:text-base">{subtitle}</p>

            {error && (
              <div className="mb-4 text-sm text-center text-red-500">
                {error}
              </div>
            )}

            {children}
          </div>
        </div>

        {/* 오른쪽 섹션 */}
        <div className={`
          w-full flex items-center min-h-screen
          ${formPosition === 'right' 
            ? `justify-center sm:justify-start ${getPaddingClasses()}` 
            : 'hidden'
          }
        `}>
          {/* Auth Card */}
          <div className={`
            bg-white rounded-lg 
            ${width}
            p-4 sm:p-8
            shadow-2xl shadow-black/50
            max-w-[95%] sm:max-w-none
            mx-4 sm:mx-0
          `}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 