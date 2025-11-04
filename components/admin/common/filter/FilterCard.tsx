/**
 * 필터 카드 컴포넌트 (컨테이너)
 * @version 1.0.0
 * @date 2025-09-28
 * @author jinhyung
 */

import React from 'react';
import { FilterCardProps } from './types';

export const FilterCard: React.FC<FilterCardProps> = ({
  onFilter,
  onReset,
  initialFilters,
  children,
  title = '상세검색',
  hasActiveFilters = false,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="space-y-4">
        {/* 제목과 버튼 */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <button
                onClick={onReset}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                초기화
              </button>
            )}
          </div>
        </div>

        {/* 필터 섹션들 */}
        <div className="space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
};