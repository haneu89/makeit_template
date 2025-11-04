# Admin Components Library

> 재사용 가능한 관리자 UI 컴포넌트 라이브러리
>
> **Version**: 1.0.0
> **Date**: 2025-09-28
> **Author**: jinhyung

## 📋 개요

이 라이브러리는 관리자 패널 구축을 위한 표준화된 React 컴포넌트 세트를 제공합니다. Next.js 프로젝트에서 재사용 가능하도록 설계되었으며, 일관된 디자인과 기능을 보장합니다.

## 🚀 특징

- ✅ **즉시 사용 가능**: 복사하여 바로 프로젝트에 적용 가능
- 📱 **반응형 디자인**: 모든 디바이스에서 완벽하게 작동
- 🎨 **TailwindCSS**: 커스터마이징이 용이한 스타일링
- 📊 **데이터 테이블**: 서버사이드/클라이언트사이드 페이징 지원
- 🔒 **인증 통합**: JWT 기반 인증 시스템과 완벽 호환

## 📦 컴포넌트 목록

### 핵심 컴포넌트

#### 1. AdminLayout `v1.0.0` (2025-09-24)
메인 관리자 레이아웃 컴포넌트
- 반응형 사이드바 (데스크톱: 축소가능, 모바일: 드로어)
- JWT 사용자 정보 표시
- 쿠키 기반 인증 처리
- Sonner 토스트 알림 통합

```tsx
import { AdminLayout } from '@/components/admin/common';

export default function AdminPage() {
  return (
    <AdminLayout>
      {/* 페이지 콘텐츠 */}
    </AdminLayout>
  );
}
```

#### 2. AdminPageWrap `v1.0.1` (2025-10-09)
페이지 래퍼 컴포넌트
- 자동 브레드크럼 생성
- 페이지 타이틀 및 설명
- 액션 버튼 (primary/secondary/danger)
- 필터 슬롯 지원

```tsx
<AdminPageWrap
  title="사용자 관리"
  description="시스템 사용자를 관리합니다"
  actions={[
    { label: '새 사용자', onClick: handleAdd, variant: 'primary' }
  ]}
  filter={<SearchFilter options={filterOptions} />}
>
  {/* 페이지 콘텐츠 */}
</AdminPageWrap>
```

### 데이터 그리드 컴포넌트

#### 3. DataGridServer `v1.0.1` (2025-10-09)
서버사이드 페이징/정렬 테이블
- 대용량 데이터 처리 최적화
- 페이지 크기 조절 (25/50/100)
- 고급 페이징 네비게이션
- 기본 정렬: createdAt DESC

```tsx
<DataGridServer
  columns={columns}
  apiUrl="/api/admin/users"
  pageSize={25}
  defaultSort={{ id: 'createdAt', desc: true }}
/>
```

#### 4. DataGridClient `v1.0.1` (2025-10-09)
클라이언트사이드 정렬 테이블
- @tanstack/react-table 기반
- 컬럼별 정렬
- 커스텀 셀 렌더링
- 반응형 테이블

```tsx
<DataGridClient
  columns={columns}
  data={data}
  enableSorting={true}
/>
```

### 모달 컴포넌트

#### 5. Modal `v1.0.1` (2025-10-09)
표준 중앙 정렬 모달
- 다양한 크기 옵션 (sm/md/lg/xl/full)
- 백드롭 클릭으로 닫기
- 타이틀 및 설명 지원

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="사용자 편집"
  maxWidth="lg"
>
  {/* 모달 콘텐츠 */}
</Modal>
```

#### 6. SideModal `v1.0.1`
사이드 슬라이드 모달
- 좌/우 위치 설정
- 너비 조절 (% 또는 px)
- ESC 키 및 오버레이 클릭 닫기
- 헤더 액션 버튼 지원
- 애니메이션 시간 조절

```tsx
<SideModal
  isOpen={isOpen}
  onClose={handleClose}
  title="상세 정보"
  width={40}
  position="right"
  closeOnEsc={true}
>
  {/* 모달 콘텐츠 */}
</SideModal>
```

### 기타 컴포넌트

#### 7. Breadcrumb `v1.0.0` (2025-09-24)
경로 네비게이션
- 자동 경로 감지
- 홈 아이콘 표시
- 현재 위치 하이라이트

#### 8. WsywygEditor `v1.0.0` (2025-09-24)
WYSIWYG 에디터
- React Quill 기반
- 이미지 업로드 지원
- 풍부한 텍스트 포맷팅
- SSR 호환

#### 9. Aside
관리자 사이드바
- 네비게이션 메뉴
- FontAwesome 아이콘
- 활성 상태 표시

### UI 요소

#### SearchFilter
검색 필터 컴포넌트
```tsx
const options = [
  { value: 'name', label: '이름' },
  { value: 'email', label: '이메일' }
];

<SearchFilter
  options={options}
  onSearch={(field, value) => console.log(field, value)}
/>
```

#### ActionButton
액션 버튼 컴포넌트
```tsx
<ActionButton
  label="저장"
  onClick={handleSave}
  variant="primary"
  icon="fa-save"
/>
```

## 🔧 설치 방법

### 1. 디렉토리 복사
```bash
cp -r components/admin/common your-project/components/admin/
```

### 2. 의존성 설치
```json
{
  "dependencies": {
    "@tanstack/react-table": "^8.x",
    "react-quill-new": "^3.x",
    "@fortawesome/react-fontawesome": "^0.2.x",
    "sonner": "^1.x"
  }
}
```

### 3. TailwindCSS 설정
```js
// tailwind.config.js
module.exports = {
  content: [
    "./components/admin/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
}
```

## 📁 디렉토리 구조

```
components/admin/
├── common/
│   ├── datagrid/
│   │   ├── DataGridClient.tsx   [v1.0.1] (2025-10-09)
│   │   ├── DataGridServer.tsx   [v1.0.1] (2025-10-09)
│   │   ├── types.ts
│   │   └── ui-element/
│   │       ├── ActionButton.tsx
│   │       └── SearchFilter.tsx
│   ├── layout/
│   │   ├── AdminLayout.tsx      [v1.0.0] (2025-09-24)
│   │   ├── AdminPageWrap.tsx    [v1.0.1] (2025-10-09)
│   │   └── Breadcrumb.tsx       [v1.0.0] (2025-09-24)
│   ├── modal/
│   │   ├── Modal.tsx            [v1.0.1] (2025-10-09)
│   │   ├── SideModal.tsx        [v1.0.1] (2025-09-26)
│   │   └── SidePanel.tsx        [v1.0.0] (2025-09-29)
│   ├── wsywig/
│   │   └── WsywygEditor.tsx     [v1.0.0] (2025-09-24)
│   └── index.ts
└── Aside.tsx
```

## 🎯 사용 예제

### 완전한 관리자 페이지 예제

```tsx
import {
  AdminLayout,
  AdminPageWrap,
  DataGridServer,
  Modal,
  SearchFilter
} from '@/components/admin/common';

export default function UsersPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const columns = [
    {
      accessorKey: 'name',
      header: '이름',
      size: 150
    },
    {
      accessorKey: 'email',
      header: '이메일',
      size: 200
    },
    {
      accessorKey: 'role',
      header: '역할',
      size: 100
    }
  ];

  const filterOptions = [
    { value: 'name', label: '이름' },
    { value: 'email', label: '이메일' }
  ];

  return (
    <AdminLayout>
      <AdminPageWrap
        title="사용자 관리"
        description="시스템 사용자를 관리합니다"
        actions={[
          {
            label: '새 사용자',
            onClick: () => setModalOpen(true),
            variant: 'primary',
            icon: 'fa-plus'
          }
        ]}
        filter={
          <SearchFilter
            options={filterOptions}
            placeholder="검색어를 입력하세요"
          />
        }
      >
        <DataGridServer
          columns={columns}
          apiUrl="/api/admin/users"
          pageSize={25}
        />
      </AdminPageWrap>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="새 사용자 추가"
        maxWidth="md"
      >
        {/* 사용자 추가 폼 */}
      </Modal>
    </AdminLayout>
  );
}
```

## 🔄 버전 관리

각 컴포넌트는 독립적인 버전을 가지며, 파일 상단에 다음 형식으로 명시됩니다:

```tsx
/**
 * @version x.y.z
 * @date YYYY-MM-DD
 * @author jinhyung
 */
```

### 버전 정책
- **Major (x)**: 호환성이 깨지는 변경
- **Minor (y)**: 새로운 기능 추가
- **Patch (z)**: 버그 수정

## 📝 타입 정의

주요 타입은 `types.ts` 파일에서 export됩니다:

```tsx
import type {
  ColumnDef,
  DataGridClientProps,
  DataGridServerProps,
  SearchFilterOption
} from '@/components/admin/common';
```

## 🤝 기여 가이드

1. 새로운 컴포넌트 추가 시 버전 정보 필수 기재
2. 컴포넌트는 독립적으로 작동 가능해야 함
3. 프로젝트 특화 코드는 포함하지 않음
4. TypeScript 타입 정의 필수
5. 주요 변경사항은 README 업데이트

## 📄 라이선스

MIT License - 자유롭게 사용 및 수정 가능

---

**최종 업데이트**: 2025-10-09
**관리자**: jinhyung