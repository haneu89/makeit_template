# DataGrid 컴포넌트

TanStack Table을 기반으로 한 재사용 가능한 데이터 그리드 컴포넌트입니다.

## 설치

```bash
npm install @tanstack/react-table
```

## 사용법

### DataGridClient (클라이언트 사이드)

클라이언트에서 데이터를 처리하는 경우 사용합니다.

```tsx
import { DataGridClient, ColumnDef } from "@/components/admin/common/datagrid";

interface User {
  name: string;
  age: number;
  email: string;
}

const columns: ColumnDef<User>[] = [
  {
    key: 'name',
    header: '이름',
  },
  {
    key: 'age',
    header: '나이',
  },
  {
    key: 'email',
    header: '이메일',
  },
  {
    key: 'actions',
    header: '관리',
    cell: ({ row }) => (
      <button onClick={() => handleEdit(row.original)}>
        수정하기
      </button>
    ),
  },
];

const data = [
  { name: '홍길동', age: 20, email: 'hong@example.com' },
  { name: '김철수', age: 25, email: 'kim@example.com' },
];

<DataGridClient columns={columns} data={data} />
```

### DataGridServer (서버 사이드)

서버에서 데이터를 가져오는 경우 사용합니다.

```tsx
import { DataGridServer, ColumnDef } from "@/components/admin/common/datagrid";

interface User {
  name: string;
  age: number;
  email: string;
}

const columns: ColumnDef<User>[] = [
  {
    key: 'name',
    header: '이름',
  },
  {
    key: 'age',
    header: '나이',
  },
  {
    key: 'email',
    header: '이메일',
  },
];

const fetchData = async ({ pageIndex, pageSize, sortBy }) => {
  const response = await fetch(
    `/api/users?page=${pageIndex}&size=${pageSize}&sort=${sortBy?.id}&order=${sortBy?.desc ? 'desc' : 'asc'}`
  );
  return response.json();
};

<DataGridServer 
  columns={columns} 
  fetchData={fetchData}
  initialPageSize={10}
/>
```

## 기능

- 컬럼별 정렬
- 커스텀 셀 렌더링
- 반응형 디자인
- Tailwind CSS 스타일링
- 서버 사이드 페이지네이션 (DataGridServer)

## Props

### DataGridClient

| Prop | 타입 | 설명 |
|------|------|------|
| columns | ColumnDef[] | 컬럼 정의 배열 |
| data | T[] | 표시할 데이터 배열 |

### DataGridServer

| Prop | 타입 | 설명 |
|------|------|------|
| columns | ColumnDef[] | 컬럼 정의 배열 |
| fetchData | Function | 데이터를 가져오는 함수 |
| initialPageSize | number | 초기 페이지 크기 (기본값: 10) |

## ColumnDef

```tsx
interface ColumnDef<T> {
  key: string;           // 데이터 객체의 속성 키
  header: string;        // 컬럼 헤더에 표시될 텍스트
  cell?: ({ row }) => React.ReactNode;  // 커스텀 셀 렌더링 (선택사항)
  width?: number | string;  // 컬럼 너비 (선택사항)
}
```

### width 속성

컬럼의 너비를 지정할 수 있습니다:

- `number` 타입: 픽셀(px) 단위로 자동 변환됩니다.
  ```tsx
  {
    key: 'name',
    header: '이름',
    width: 200  // 200px로 적용
  }
  ```

- `string` 타입: 퍼센트(%) 또는 픽셀(px) 단위를 직접 지정할 수 있습니다.
  ```tsx
  {
    key: 'email',
    header: '이메일',
    width: '50%'  // 전체 너비의 50%
  }
  {
    key: 'age',
    header: '나이',
    width: '100px'  // 100px로 고정
  }
  ```

width가 지정되지 않은 컬럼은 남은 공간을 자동으로 채웁니다.
