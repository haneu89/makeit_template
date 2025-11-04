/**
 * @version 1.0.1
 * @date 2025-10-09
 * @author jinhyung
 */

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  description?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth,
  size,
  description
}: ModalProps) {
  const finalSize = size || maxWidth || '2xl';
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    'full': 'max-w-full'
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-lg w-full ${maxWidthClasses[finalSize]} my-8 max-h-[calc(100vh-4rem)] flex flex-col`}>
        <div className="flex justify-between items-start p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg sm:text-xl font-bold truncate">{title}</h2>
            {description && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}