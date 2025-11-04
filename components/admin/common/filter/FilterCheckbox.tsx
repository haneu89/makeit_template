/**
 * 필터 체크박스 컴포넌트
 * @version 1.0.0
 * @date 2025-09-28
 * @author jinhyung
 */

import React from 'react';
import { FilterCheckboxProps } from './types';

export const FilterCheckbox: React.FC<FilterCheckboxProps> = ({
  value,
  label,
  checked,
  onChange,
  className = '',
}) => {
  return (
    <label className={`flex items-center whitespace-nowrap ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(value, e.target.checked)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <span className="ml-2 text-sm text-gray-700">{label}</span>
    </label>
  );
};