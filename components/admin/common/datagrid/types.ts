// types.ts
import { ColumnDef as TanStackColumnDef } from "@tanstack/react-table";

/**
 * @description TanStack Table의 컬럼 정의 타입
 * @example
 * ```ts
 * const columns: ColumnDef<User>[] = [
 *   {
 *     key: 'name',           // 데이터 객체의 속성 키
 *     header: '이름',        // 컬럼 헤더에 표시될 텍스트
 *     cell: ({ row }) => (   // 커스텀 셀 렌더링 (선택사항)
 *       <div>{row.original.name}</div>
 *     ),
 *   },
 *   {
 *     key: 'age',
 *     header: '나이',
 *   }
 * ];
 * ```
 */
export type ColumnDef<T> = Omit<TanStackColumnDef<T>, 'accessorKey'> & {
  key: string;
  accessorKey?: never;
  header: string;
  cell?: ({ row }: { row: { original: T; index: number } }) => React.ReactNode;
  width?: string;
};

export interface DataGridClientProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  overflow?: boolean;
}

export interface DataGridServerProps<T> {
  columns: ColumnDef<T>[];
  fetchData: (params: {
    pageIndex: number;
    perPage: number;
    sortBy?: {
      id: string;
      desc: boolean;
    };
  }) => Promise<{
    data: T[];
    total: number;
  }>;
  initialPageSize?: number;
  overflow?: boolean;
}