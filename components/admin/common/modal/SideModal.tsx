/**
 * @version 1.0.2
 * @date 2025-10-09
 * @author jinhyung
 *
 * SideModal - 재사용 가능한 사이드 모달 컴포넌트
 * 오른쪽에서 슬라이드되어 나타나는 모달로, 다양한 옵션을 제공합니다.
 * 모바일 반응형: 768px 이하에서 전체 너비로 표시됩니다.
 */

import { ReactNode, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface SideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number | string; // 30, 40, 50, 60 (%) 또는 '400px' 같은 고정값
  headerActions?: ReactNode;
  closeOnOverlayClick?: boolean; // 오버레이 클릭으로 닫기 여부
  closeOnEsc?: boolean; // ESC 키로 닫기 여부
  showCloseButton?: boolean; // 닫기 버튼 표시 여부
  className?: string; // 추가 클래스명
  contentClassName?: string; // 컨텐츠 영역 추가 클래스명
  headerClassName?: string; // 헤더 영역 추가 클래스명
  position?: 'right' | 'left'; // 모달 위치
  animationDuration?: number; // 애니메이션 지속시간 (ms)
}

export default function SideModal({
  isOpen,
  onClose,
  title,
  children,
  width = 40,
  headerActions,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
  contentClassName = '',
  headerClassName = '',
  position = 'right',
  animationDuration = 300
}: SideModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // 오버레이 클릭 핸들러
  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlayClick) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEsc]);

  if (!isOpen) return null;

  // width 처리 (숫자면 %, 문자열이면 그대로 사용)
  const modalWidth = typeof width === 'number' ? `${width}%` : width;

  // position에 따른 클래스
  const positionClasses = position === 'left' ? 'left-0' : 'right-0';
  const slideClasses = position === 'left'
    ? (isOpen ? 'translate-x-0' : '-translate-x-full')
    : (isOpen ? 'translate-x-0' : 'translate-x-full');

  return createPortal(
    <div className={`fixed inset-0 z-50 flex ${position === 'left' ? 'flex-row-reverse' : ''}`}>
      {/* 배경 오버레이 */}
      <div
        className={`flex-1 bg-black/50 transition-opacity duration-${animationDuration}`}
        onClick={handleOverlayClick}
        style={{ transitionDuration: `${animationDuration}ms` }}
      />

      {/* 사이드 모달 */}
      <div
        ref={modalRef}
        className={`
          ${positionClasses}
          fixed top-0 h-full
          bg-white shadow-xl
          transform ${slideClasses}
          transition-transform ease-out
          flex flex-col
          max-md:!w-full
          ${className}
        `}
        style={{
          width: modalWidth,
          transitionDuration: `${animationDuration}ms`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        {(title || headerActions || showCloseButton) && (
          <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${headerClassName}`}>
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {!title && <div />} {/* 스페이서 */}
            <div className="flex items-center gap-2">
              {headerActions && (
                <div className="flex items-center gap-2">
                  {headerActions}
                </div>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="닫기"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 내용 */}
        <div className={`flex-1 overflow-y-auto ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}