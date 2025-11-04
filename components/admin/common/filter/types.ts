/**
 * 필터 시스템 공통 타입 정의
 * @version 1.0.0
 * @date 2025-09-28
 * @author jinhyung
 */

export interface FilterOption {
  value: string | number;
  label: string;
}

export interface FilterCheckboxProps {
  value: string | number;
  label: string;
  checked: boolean;
  onChange: (value: string | number, checked: boolean) => void;
  className?: string;
}

export interface FilterSectionProps {
  label: string;
  allOption?: boolean;
  allChecked?: boolean;
  onAllChange?: (checked: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export interface FilterSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export interface FilterSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
}

export interface FilterCardProps {
  onFilter: (filters: Record<string, any>) => void;
  onReset: () => void;
  initialFilters?: Record<string, any>;
  children: React.ReactNode;
  title?: string;
  hasActiveFilters?: boolean;
}

export interface UseFilterConfig {
  initialFilters?: Record<string, any>;
  onFilter: (filters: Record<string, any>) => void;
  onReset: () => void;
  debounceMs?: number;
  autoApply?: boolean;
}

export interface UseFilterReturn {
  filters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  setFilters: (filters: Record<string, any>) => void;
  toggleFilter: (key: string, value: any) => void;
  toggleAllFilter: (key: string, allValues: any[]) => void;
  resetFilters: () => void;
  applyFilters: (customFilters?: Record<string, any>) => void;
  hasActiveFilters: boolean;
}