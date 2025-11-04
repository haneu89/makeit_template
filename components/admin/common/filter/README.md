# Filter 시스템

재사용 가능한 모듈화된 필터 시스템입니다. 일관된 UI와 동작으로 여러 페이지에서 사용할 수 있습니다.

## 📁 구조

```
components/admin/common/filter/
├── types.ts              # 타입 정의
├── useFilter.ts          # 필터 로직 훅
├── FilterCard.tsx        # 필터 카드 컨테이너
├── FilterSection.tsx     # 필터 섹션 (라벨 + 체크박스들)
├── FilterCheckbox.tsx    # 개별 체크박스
├── FilterSearch.tsx      # 검색 입력
├── FilterSelect.tsx      # 드롭다운 선택
├── index.ts              # 통합 export
└── README.md             # 이 문서
```

## 🎯 주요 기능

### ✅ 자동 필터 적용
- 체크박스 클릭 시 즉시 필터 적용
- 검색어는 300ms 디바운스 적용

### ✅ 전체 선택/해제
- "전체" 체크박스로 모든 옵션 토글
- 개별 선택 상태에 따라 전체 상태 자동 업데이트

### ✅ URL 쿼리 연동
- 필터 상태를 URL 쿼리로 저장
- 페이지 새로고침 시에도 필터 상태 유지

### ✅ 타입 안전성
- TypeScript로 완전한 타입 정의
- 제네릭 지원으로 확장성 확보

## 🚀 사용법

### 기본 사용 예시

```tsx
import {
  useFilter,
  FilterCard,
  FilterSection,
  FilterCheckbox,
  FilterSearch,
} from '@/components/admin/common/filter';

const MyFilterCard = ({ onFilter, onReset, initialFilters }) => {
  const {
    filters,
    toggleFilter,
    toggleAllFilter,
    setFilter,
    resetFilters,
    hasActiveFilters,
  } = useFilter({
    initialFilters,
    onFilter,
    onReset,
    autoApply: true, // 즉시 필터 적용
  });

  return (
    <FilterCard
      onFilter={onFilter}
      onReset={resetFilters}
      hasActiveFilters={hasActiveFilters}
    >
      {/* 체크박스 섹션 */}
      <FilterSection
        label="카테고리"
        allOption
        allChecked={filters.categories?.length === 0}
        onAllChange={() => toggleAllFilter('categories', allCategories)}
      >
        {categories.map((category) => (
          <FilterCheckbox
            key={category.id}
            value={category.id}
            label={category.name}
            checked={filters.categories?.includes(category.id) || false}
            onChange={(value) => toggleFilter('categories', value)}
          />
        ))}
      </FilterSection>

      {/* 검색 */}
      <FilterSearch
        value={filters.search || ''}
        onChange={(value) => setFilter('search', value)}
        placeholder="검색어 입력..."
      />
    </FilterCard>
  );
};
```

### useFilter 훅 옵션

```tsx
const filterOptions = {
  initialFilters: {}, // 초기 필터 값
  onFilter: (filters) => {}, // 필터 적용 콜백
  onReset: () => {}, // 필터 초기화 콜백
  debounceMs: 300, // 디바운스 시간 (ms)
  autoApply: true, // 자동 필터 적용 여부
};

const {
  filters, // 현재 필터 상태
  setFilter, // 단일 필터 설정
  setFilters, // 여러 필터 한번에 설정
  toggleFilter, // 배열 필터 토글 (체크박스용)
  toggleAllFilter, // 전체 선택/해제 토글
  resetFilters, // 필터 초기화
  applyFilters, // 수동 필터 적용
  hasActiveFilters, // 활성 필터 여부
} = useFilter(filterOptions);
```

## 🧩 컴포넌트 상세

### FilterCard
필터의 최상위 컨테이너

```tsx
<FilterCard
  onFilter={(filters) => console.log(filters)}
  onReset={() => console.log('reset')}
  hasActiveFilters={true}
  title="상세검색" // 기본값
>
  {/* 필터 내용 */}
</FilterCard>
```

### FilterSection
라벨과 체크박스 그룹

```tsx
<FilterSection
  label="창고"
  allOption={true} // 전체 선택 옵션 표시
  allChecked={false} // 전체 선택 상태
  onAllChange={(checked) => {}} // 전체 선택 변경 콜백
>
  {/* FilterCheckbox 컴포넌트들 */}
</FilterSection>
```

### FilterCheckbox
개별 체크박스

```tsx
<FilterCheckbox
  value="warehouse1"
  label="1번 창고"
  checked={true}
  onChange={(value, checked) => {}}
/>
```

### FilterSearch
검색 입력 (디바운스 지원)

```tsx
<FilterSearch
  value=""
  onChange={(value) => {}}
  placeholder="검색..."
  debounceMs={300} // 기본값
/>
```

### FilterSelect
드롭다운 선택

```tsx
<FilterSelect
  value=""
  onChange={(value) => {}}
  options={[
    { value: 'option1', label: '옵션1' },
    { value: 'option2', label: '옵션2' },
  ]}
  placeholder="선택하세요"
/>
```

## 📝 기존 필터와 비교

| 기능 | 기존 CaskFilterCard | 기존 SpiritFilterCard | 새로운 Filter 시스템 |
|------|---------------------|----------------------|---------------------|
| 즉시 적용 | ✅ | ❌ (수동 버튼) | ✅ |
| 디바운스 | ✅ | ❌ | ✅ |
| 전체 선택 | ✅ | ✅ | ✅ |
| 재사용성 | ❌ | ❌ | ✅ |
| 타입 안전성 | 부분 | 부분 | ✅ |
| 코드 중복 | 많음 | 많음 | 없음 |

## 🛠️ 마이그레이션 가이드

### 1단계: 기존 필터 분석
기존 필터의 상태 구조와 옵션들을 파악합니다.

### 2단계: useFilter 적용
기존의 useState와 핸들러들을 useFilter로 교체합니다.

```tsx
// 기존
const [filters, setFilters] = useState({});
const handleCheckboxChange = (key, value) => { /* ... */ };

// 새로운 방식
const { filters, toggleFilter, setFilter } = useFilter({
  initialFilters,
  onFilter,
  onReset,
});
```

### 3단계: UI 컴포넌트 교체
기존의 JSX를 새로운 컴포넌트들로 교체합니다.

```tsx
// 기존
<div className="flex items-center">
  <label>창고</label>
  <div>
    {warehouses.map(w => (
      <label key={w.id}>
        <input type="checkbox" {...} />
        {w.name}
      </label>
    ))}
  </div>
</div>

// 새로운 방식
<FilterSection label="창고" allOption>
  {warehouses.map(w => (
    <FilterCheckbox
      key={w.id}
      value={w.id}
      label={w.name}
      checked={filters.warehouseIds?.includes(w.id)}
      onChange={(value) => toggleFilter('warehouseIds', value)}
    />
  ))}
</FilterSection>
```

## 🎨 스타일링

모든 컴포넌트는 TailwindCSS를 사용하며, 일관된 디자인 시스템을 따릅니다:

- **색상**: blue-600 (주요), gray-700 (텍스트), gray-300 (테두리)
- **간격**: gap-x-4 gap-y-2 (체크박스), p-4 (카드), space-y-3 (섹션)
- **크기**: h-4 w-4 (체크박스), text-sm (라벨), w-20 (라벨 너비)

## 🔧 확장하기

새로운 필터 타입이 필요한 경우:

1. `types.ts`에 새로운 인터페이스 추가
2. 새로운 컴포넌트 생성 (`FilterDateRange.tsx` 등)
3. `index.ts`에 export 추가
4. 필요에 따라 `useFilter` 훅 확장

## 📚 실제 구현 예시

### CaskFilterCard.tsx (✅ 적용 완료)
캐스크 필터에서 공통 컴포넌트를 사용한 예시:

```tsx
import { FilterSection, FilterCheckbox, FilterSearch } from '@/components/admin/common/filter';

const CaskFilterCard = ({ onFilter, onReset, initialFilters }) => {
  // 필터 상태 관리
  const [filters, setFilters] = useState({
    warehouseIds: [],
    locations: [],
    caskTypes: [],
    spiritTypes: [],
    isActive: [],
    search: '',
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-medium text-gray-900">상세검색</h3>
          {hasActiveFilters && (
            <button onClick={handleReset}>초기화</button>
          )}
        </div>

        <div className="space-y-3">
          {/* 창고 필터 */}
          <FilterSection
            label="창고"
            allOption={true}
            allChecked={filters.warehouseIds.length === 0 || filters.warehouseIds.length === warehouses.length}
            onAllChange={(checked) => {
              const newFilters = checked
                ? { ...filters, warehouseIds: [] }
                : { ...filters, warehouseIds: warehouses.map(w => w.id) };
              setFilters(newFilters);
              setTimeout(() => applyFilters(newFilters), 0);
            }}
          >
            {warehouses.map((warehouse) => (
              <FilterCheckbox
                key={warehouse.id}
                value={warehouse.id}
                label={warehouse.name}
                checked={filters.warehouseIds.includes(warehouse.id)}
                onChange={(value) => handleCheckboxChange('warehouseIds', value)}
              />
            ))}
          </FilterSection>

          {/* 타입 필터 */}
          <FilterSection label="타입" allOption={true}>
            {caskTypeOptions.map((type) => (
              <FilterCheckbox
                key={type}
                value={type}
                label={type}
                checked={filters.caskTypes.includes(type)}
                onChange={(value) => handleCheckboxChange('caskTypes', value)}
              />
            ))}
          </FilterSection>

          {/* 검색 */}
          <FilterSearch
            value={filters.search}
            onChange={(value) => {
              setFilters(prev => ({ ...prev, search: value }));
              setTimeout(() => applyFilters({ ...filters, search: value }), 0);
            }}
            placeholder="캐스크번호, 타입, 메모..."
            debounceMs={300}
          />
        </div>
      </div>
    </div>
  );
};
```

### 개선 효과
- **코드 길이**: 430줄 → 342줄 (20% 감소)
- **중복 코드**: 체크박스 HTML 5번 반복 → 재사용 컴포넌트로 통합
- **일관성**: 모든 필터 섹션이 동일한 UI/UX 패턴 사용
- **유지보수**: 필터 로직 변경 시 공통 컴포넌트만 수정하면 됨

### 적용 현황
- ✅ **CaskFilterCard**: 공통 컴포넌트 적용 완료
- ⏳ **SpiritFilterCard**: 적용 예정
- ⏳ **UserFilterCard**: 적용 예정

### 모바일 반응형 대응
Tailwind CSS v4 환경에서 모바일 여백 최적화:

```tsx
// AdminPageWrap 컴포넌트에서
<main className="py-6 px-4 md:px-6 xl:p-8">
  <div className="md:px-0">
    {/* 브레드크럼, 제목 등 */}
  </div>
  {children} {/* 필터카드, 데이터그리드 */}
</main>
```

**반응형 동작:**
- 모바일 (< 768px): 좌우 16px 여백
- 태블릿 (≥ 768px): 좌우 24px 여백
- XL 화면 (≥ 1280px): 32px 전체 패딩