/**
 * @version 1.0.1
 * @date 2025-10-09
 * @author jinhyung
 *
 * DataGridServer - 서버 사이드 데이터 그리드 컴포넌트
 * 페이징과 정렬을 서버에서 처리하는 대용량 데이터용 테이블 컴포넌트입니다.
 */

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnDef as TanStackColumnDef,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { DataGridServerProps, ColumnDef } from "./types";

/**
 * @description 서버 사이드 데이터 그리드 컴포넌트
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
 * const fetchData = async ({ pageIndex, pageSize, sortBy }) => {
 *   const response = await fetch(
 *     `/api/users?page=${pageIndex}&size=${pageSize}&sort=${sortBy?.id}&order=${sortBy?.desc ? 'desc' : 'asc'}`
 *   );
 *   return response.json();
 * };
 * 
 * <DataGridServer 
 *   columns={columns} 
 *   fetchData={fetchData}
 *   initialPageSize={10}
 * />
 * ```
 */
export default function DataGridServer<T extends object>({
  columns,
  fetchData,
  initialPageSize = 25,
  overflow = false,
}: DataGridServerProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true }
  ]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchData({
        pageIndex,
        perPage: pageSize,
        sortBy: sorting[0] ? { id: sorting[0].id, desc: sorting[0].desc } : undefined,
      });
      setData(result.data);
      setTotal(result.total);
    };
    loadData();
  }, [pageIndex, pageSize, sorting, fetchData]);

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
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    },
    pageCount: Math.ceil(total / pageSize),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const renderPagination = () => {
    const totalPages = table.getPageCount();
    const currentPage = pageIndex + 1;
    const startItem = pageIndex * pageSize + 1;
    const endItem = Math.min((pageIndex + 1) * pageSize, total);

    // 페이지 번호 생성 로직
    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        // 전체 페이지가 maxVisiblePages 이하면 모든 페이지 표시
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 현재 페이지 주변의 페이지들 표시
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisiblePages - 1);
        
        if (end - start + 1 < maxVisiblePages) {
          start = Math.max(1, end - maxVisiblePages + 1);
        }
        
        if (start > 1) {
          pages.push(1);
          if (start > 2) pages.push('...');
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        
        if (end < totalPages) {
          if (end < totalPages - 1) pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-700">
              총 <span className="font-medium">{total}</span>개 중{" "}
              <span className="font-medium">{startItem}</span>부터{" "}
              <span className="font-medium">{endItem}</span>까지 표시
            </p>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageIndex(0); // 페이지 크기가 변경되면 첫 페이지로 이동
                }}
                className="block w-32 appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm leading-6 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {[25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size} 개씩 보기
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">이전</span>
                <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.414l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
              </button>
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 ring-inset focus:outline-offset-0"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => table.setPageIndex(Number(page) - 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      page === currentPage
                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                        : 'text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">다음</span>
                <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="overflow-y-auto overflow-x-auto">
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
      {renderPagination()}
    </div>
  );
}