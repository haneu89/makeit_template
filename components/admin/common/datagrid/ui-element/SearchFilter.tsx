/**
 * @version 1.0.0
 * @date 2025-09-24
 * @author jinhyung
 *
 * SearchFilter - 검색 필터 컴포넌트
 * 드롭다운과 검색어 입력을 통한 데이터 필터링 기능을 제공합니다.
 */

import { ReactNode, useEffect } from 'react';

export interface SearchFilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  searchType: string;
  searchKeyword: string;
  onSearchTypeChange: (value: string) => void;
  onSearchKeywordChange: (value: string) => void;
  onSearch: () => void;
  options: SearchFilterOption[];
  placeholder?: string;
  additionalFilters?: ReactNode;
}

export default function SearchFilter({
  searchType,
  searchKeyword,
  onSearchTypeChange,
  onSearchKeywordChange,
  onSearch,
  options,
  placeholder = "검색어를 입력하세요",
  additionalFilters
}: SearchFilterProps) {
  // 검색 옵션/검색어가 바뀔 때마다 자동 검색
  useEffect(() => {
    onSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchType, searchKeyword]);

  return (
    <div className="flex flex-col gap-4">
      {additionalFilters && (
        <div className="flex items-center gap-6 mb-2">{additionalFilters}</div>
      )}
      <form className="flex items-center gap-4 w-full" onSubmit={e => e.preventDefault()}>
        <label className="text-gray-700 font-medium whitespace-nowrap">검색옵션</label>
        <div className="relative">
          <select
            value={searchType}
            onChange={(e) => onSearchTypeChange(e.target.value)}
            className="block w-28 appearance-none rounded-md border-none py-2 pl-3 pr-8 text-gray-900 focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </div>
        </div>
        <span className="text-gray-500">검색</span>
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => onSearchKeywordChange(e.target.value)}
          placeholder={placeholder}
          className="block w-64 rounded-md border-none py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </form>
    </div>
  );
}