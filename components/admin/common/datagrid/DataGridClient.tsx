/**
 * @version 1.0.1
 * @date 2025-10-09
 * @author jinhyung
 *
 * DataGridClient - 클라이언트 사이드 데이터 그리드 컴포넌트
 * @tanstack/react-table 기반의 정렬 가능한 테이블 컴포넌트입니다.
 */

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
  ColumnDef as TanStackColumnDef,
} from "@tanstack/react-table";
import { useState } from "react";
import { DataGridClientProps, ColumnDef } from "./types";

/**
 * @description 클라이언트 사이드 데이터 그리드 컴포넌트
 * @example
 * ```tsx
 * const columns: ColumnDef<User>[] = [
 *   {
 *     key: 'name',
 *     header: '이름',
 *   },
 *   {
 *     key: 'age',
 *     header: '나이',
 *   }
 * ];
 * 
 * const data = [
 *   { name: '홍길동', age: 20 },
 *   { name: '김철수', age: 25 },
 * ];
 * 
 * <DataGridClient columns={columns} data={data} />
 * ```
 */
export default function DataGridClient<T extends object>({
  data,
  columns,
  overflow = false,
}: DataGridClientProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // key를 accessorKey로 변환
  const tanstackColumns: TanStackColumnDef<T>[] = columns.map(({ key, ...rest }) => ({
    accessorKey: key,
    ...rest,
  }));

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full overflow-y-auto overflow-x-auto">
      <table className="divide-y divide-gray-200 min-w-full rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const column = columns.find(col => col.key === header.id);
                const width = column?.width;
                const style = width ? {
                  width: typeof width === 'number' ? `${width}px` : width
                } : undefined;

                return (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 bg-gray-50/80 backdrop-blur-sm"
                    style={style}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : '',
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
              {row.getVisibleCells().map((cell) => {
                const column = columns.find(col => col.key === cell.column.id);
                const width = column?.width;
                const style = width ? {
                  width: typeof width === 'number' ? `${width}px` : width
                } : undefined;

                return (
                  <td
                    key={cell.id}
                    className="px-3 py-4 text-sm text-gray-500 break-words"
                    style={{
                      ...style,
                      maxWidth: width || 'auto',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}