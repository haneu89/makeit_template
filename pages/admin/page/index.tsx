import { AdminLayout, AdminPageWrap } from "@/components/admin/common";
import { ColumnDef, DataGridClient } from "@/components/admin/common/datagrid";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CreateModal from "./create-modal";

interface Page {
  route: string;
  domain: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  data: Page[];
  total: number;
}

export default function PageIndex() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchPages = async () => {
    const response = await fetch('/api/admin/page');
    const result: ApiResponse = await response.json();
    setPages(result.data);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handlePageCreated = () => {
    fetchPages();
  };

  const columns: ColumnDef<Page>[] = [
    {
      key: 'route',
      header: '경로',
    },
    {
      key: 'title',
      header: '제목',
    },
    {
      key: 'domain',
      header: '도메인',
    },
    {
      key: 'updatedAt',
      header: '수정일',
      cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '관리',
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/admin/page/${row.original.route}`)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          수정하기
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <AdminPageWrap 
        title="페이지 관리" 
        breadcrumbItems={[{ label: '페이지 관리', href: '/admin/page' }]} 
        actions={[{ label: '페이지 추가', onClick: handleCreateClick }]}
      >
        <div className="bg-white shadow-sm rounded-lg">
          <DataGridClient columns={columns} data={pages} />
        </div>
        <CreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPageCreated={handlePageCreated}
        />
      </AdminPageWrap>
    </AdminLayout>
  );
}