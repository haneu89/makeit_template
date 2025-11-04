/**
 * 필터 섹션 컴포넌트
 * @version 1.0.0
 * @date 2025-09-28
 * @author jinhyung
 */

import React from 'react';
import { FilterSectionProps } from './types';
import { FilterCheckbox } from './FilterCheckbox';

export const FilterSection: React.FC<FilterSectionProps> = ({
  label,
  allOption = false,
  allChecked = false,
  onAllChange,
  children,
  className = '',
}) => {
  return (
    <div className={`flex items-start ${className}`}>
      <label className="text-sm font-medium text-gray-700 w-20 pt-0.5 flex-shrink-0">{label}</label>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex gap-x-4 gap-y-2 min-w-fit pb-1 whitespace-nowrap">
          {allOption && onAllChange && (
            <FilterCheckbox
              value="all"
              label="전체"
              checked={allChecked}
              onChange={() => onAllChange(!allChecked)}
            />
          )}
          {children}
        </div>
      </div>
    </div>
  );
};