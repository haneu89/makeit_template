/**
 * 필터 검색 컴포넌트
 * @version 1.0.0
 * @date 2025-09-28
 * @author jinhyung
 */

import React, { useState, useRef, useEffect } from 'react';
import { FilterSearchProps } from './types';

export const FilterSearch: React.FC<FilterSearchProps> = ({
  value,
  onChange,
  placeholder = '검색...',
  debounceMs = 300,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // value prop이 변경될 때 local state 업데이트
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // 컴포넌트 언마운트 시 타이머 클리어
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // 기존 타이머 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 디바운스 적용
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">검색</label>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 min-w-0 max-w-md px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};