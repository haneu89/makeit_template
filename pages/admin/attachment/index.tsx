import { AdminLayout, AdminPageWrap } from "@/components/admin/common";
import { ColumnDef, DataGridServer } from "@/components/admin/common/datagrid";
import { useState } from "react";
import { useRouter } from "next/router";
import CreateModal from "./create-modal";
import ShowModal from "./show-modal";
import Image from "next/image";

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mime: string;
  createdAt: string;
  viewRole: 'ADMIN' | 'MANAGER' | 'USER' | null;
  savedName: string;
}

interface ApiResponse {
  data: Attachment[];
  total: number;
}

export default function AttachmentIndex() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/admin/attachment/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // 삭제 후 데이터 새로고침을 위해 페이지 새로고침
        window.location.reload();
      } else {
        alert('삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleUploadComplete = async () => {
    // 파일 목록 새로고침
    window.location.reload();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderPreview = (row: Attachment) => {
    const fileUrl = `/api/file/${row.savedName}`;

    if (row.mime.startsWith('image/')) {
      return (
        <div className="w-16 h-16 relative">
          <Image
            src={fileUrl}
            alt={row.fileName}
            fill
            className="object-cover rounded"
            unoptimized
          />
        </div>
      );
    }

    if (row.mime.startsWith('video/')) {
      return (
        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
          <i className="fas fa-video text-gray-400"></i>
        </div>
      );
    }

    if (row.mime.startsWith('audio/')) {
      return (
        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
          <i className="fas fa-music text-gray-400"></i>
        </div>
      );
    }

    if (row.mime === 'application/pdf') {
      return (
        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
          <i className="fas fa-file-pdf text-gray-400"></i>
        </div>
      );
    }

    return (
      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
        <i className="fas fa-file text-gray-400"></i>
      </div>
    );
  };

  const columns: ColumnDef<Attachment>[] = [
    {
      key: 'preview',
      header: '미리보기',
      width: '10%',
      cell: ({ row }: { row: { original: Attachment } }) => renderPreview(row.original),
    },
    {
      key: 'id',
      header: 'ID',
    },
    {
      key: 'fileName',
      header: '파일명',
      cell: ({ row }: { row: { original: Attachment } }) => (
        <button
          onClick={() => setSelectedFileId(row.original.id)}
          className="text-blue-600 hover:text-blue-800 hover:underline w-full break-words text-left"
        >
          {row.original.fileName}
        </button>
      ),
    },
    {
      key: 'fileSize',
      header: '크기',
      width: '8%',
      cell: ({ row }: { row: { original: Attachment } }) => formatFileSize(row.original.fileSize),
    },
    {
      key: 'mime',
      header: '타입',
      width: '8%',
    },
    {
      key: 'viewRole',
      header: '조회 권한',
      width: '8%',

      cell: ({ row }: { row: { original: Attachment } }) => {
        const role = row.original.viewRole;
        if (!role) return '모든 사용자';
        return role === 'ADMIN' ? '관리자' : role === 'MANAGER' ? '매니저' : '일반 사용자';
      },
    },
    {
      key: 'createdAt',
      header: '등록일',
      width: '15%',
      cell: ({ row }: { row: { original: Attachment } }) => new Date(row.original.createdAt).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
    },
    {
      key: 'actions',
      header: '관리',
      width: '7%',
      cell: ({ row }: { row: { original: Attachment } }) => (
        <button
          onClick={() => handleDelete(row.original.id)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          삭제
        </button>
      ),
    },
  ];

  const fetchData = async ({ pageIndex, perPage, sortBy }: {
    pageIndex: number;
    perPage: number;
    sortBy?: {
      id: string;
      desc: boolean;
    };
  }) => {
    const response = await fetch(
      `/api/admin/attachment?page=${pageIndex + 1}&perPage=${perPage}&sortField=${sortBy?.id || 'id'}&sortOrder=${sortBy?.desc ? 'desc' : 'asc'}`
    );
    const result: ApiResponse = await response.json();
    return {
      data: result.data,
      total: result.total,
    };
  };

  return (
    <AdminLayout>
      <AdminPageWrap 
        title="파일 관리" 
        breadcrumbItems={[{ label: '파일 관리', href: '/admin/attachment' }]}
        actions={[{ label: '파일 업로드', onClick: handleCreateClick }]}
      >
        <div className="bg-white shadow-sm rounded-lg">
          <DataGridServer 
            columns={columns} 
            fetchData={fetchData}
          />
        </div>
        <CreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onUploadComplete={handleUploadComplete}
        />
        <ShowModal
          isOpen={!!selectedFileId}
          onClose={() => setSelectedFileId(null)}
          fileId={selectedFileId}
        />
      </AdminPageWrap>
    </AdminLayout>
  );
}