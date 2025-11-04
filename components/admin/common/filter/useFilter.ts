/**
 * 필터 시스템 공통 훅
 * @version 1.0.0
 * @date 2025-09-28
 * @author jinhyung
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { UseFilterConfig, UseFilterReturn } from './types';

export const useFilter = ({
  initialFilters = {},
  onFilter,
  onReset,
  debounceMs = 300,
  autoApply = true,
}: UseFilterConfig): UseFilterReturn => {
  const [filters, setFiltersState] = useState(initialFilters);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 언마운트 시 타이머 클리어
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // 필터 값이 활성화되어 있는지 확인
  const hasActiveFilters = useCallback(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== '' && value !== null && value !== undefined;
    });
  }, [filters]);

  // 디바운스된 필터 적용
  const debouncedApplyFilters = useCallback((filtersToApply: Record<string, any>) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      // 빈 값들 제거
      const cleanFilters = Object.entries(filtersToApply).reduce((acc, [key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            acc[key] = value.join(',');
          }
        } else if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      onFilter(cleanFilters);
    }, debounceMs);
  }, [onFilter, debounceMs]);

  // 즉시 필터 적용
  const applyFilters = useCallback((customFilters?: Record<string, any>) => {
    const filtersToApply = customFilters || filters;

    // 빈 값들 제거
    const cleanFilters = Object.entries(filtersToApply).reduce((acc, [key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          acc[key] = value.join(',');
        }
      } else if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    onFilter(cleanFilters);
  }, [filters, onFilter]);

  // 단일 필터 값 설정
  const setFilter = useCallback((key: string, value: any) => {
    setFiltersState(prev => {
      const updatedFilters = { ...prev, [key]: value };

      if (autoApply) {
        // 검색어 등은 디바운스 적용, 나머지는 즉시 적용
        if (key === 'search' || key === 'searchKeyword') {
          debouncedApplyFilters(updatedFilters);
        } else {
          setTimeout(() => applyFilters(updatedFilters), 0);
        }
      }

      return updatedFilters;
    });
  }, [autoApply, debouncedApplyFilters, applyFilters]);

  // 여러 필터 값 한번에 설정
  const setFilters = useCallback((newFilters: Record<string, any>) => {
    setFiltersState(prev => {
      const updatedFilters = { ...prev, ...newFilters };

      if (autoApply) {
        setTimeout(() => applyFilters(updatedFilters), 0);
      }

      return updatedFilters;
    });
  }, [autoApply, applyFilters]);

  // 배열 필터 토글 (체크박스용)
  const toggleFilter = useCallback((key: string, value: any) => {
    setFiltersState(prev => {
      const currentArray = prev[key] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item: any) => item !== value)
        : [...currentArray, value];

      const updatedFilters = { ...prev, [key]: newArray };

      if (autoApply) {
        setTimeout(() => applyFilters(updatedFilters), 0);
      }

      return updatedFilters;
    });
  }, [autoApply, applyFilters]);

  // 전체 선택/해제 토글
  const toggleAllFilter = useCallback((key: string, allValues: any[]) => {
    setFiltersState(prev => {
      const currentArray = prev[key] || [];
      const isAllSelected = currentArray.length === 0 || currentArray.length === allValues.length;
      const newArray = isAllSelected ? [] : [...allValues];

      const updatedFilters = { ...prev, [key]: newArray };

      if (autoApply) {
        setTimeout(() => applyFilters(updatedFilters), 0);
      }

      return updatedFilters;
    });
  }, [autoApply, applyFilters]);

  // 필터 초기화
  const resetFilters = useCallback(() => {
    setFiltersState({});
    onReset();
  }, [onReset]);

  return {
    filters,
    setFilter,
    setFilters,
    toggleFilter,
    toggleAllFilter,
    resetFilters,
    applyFilters,
    hasActiveFilters: hasActiveFilters(),
  };
};