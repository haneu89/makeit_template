/**
 * 필터 셀렉트 컴포넌트
 * @version 1.0.0
 * @date 2025-09-28
 * @author jinhyung
 */

import React from 'react';
import { FilterSelectProps } from './types';

export const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = '선택하세요',
  className = '',
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    >
      {placeholder && (
        <option value="">{placeholder}</option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};