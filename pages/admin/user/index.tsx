import { AdminLayout, AdminPageWrap } from "@/components/admin/common";
import { useState, useEffect, useCallback, useMemo } from "react";
import EditModal from "./edit-modal";
import { ColumnDef, DataGridClient } from "@/components/admin/common/datagrid";
import { toast } from "sonner";

interface UserData {
  id: number;
  email: string | null;
  username: string | null;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  providers: string[];
  firstLoginAt: string | null;
}

export default function AdminUser() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [rowData, setRowData] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/user');
      const data = await response.json();
      setRowData(data.data || []);
    } catch (error) {
      console.error('데이터 로딩 중 오류 발생:', error);
      setRowData([]);
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback((user: UserData) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까? 해당 사용자의 파일이 있으면 삭제할 수 없습니다.')) return;

    try {
      const response = await fetch(`/api/admin/user/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '삭제 실패');
      }

      toast.success('사용자가 삭제되었습니다.');
      fetchData();
    } catch (error: any) {
      console.error('삭제 중 오류 발생:', error);
      toast.error(error.message || '삭제에 실패했습니다.');
    }
  }, [fetchData]);

  const columns: ColumnDef<UserData>[] = useMemo(() => [
    {
      header: 'ID',
      key: 'id',
      enableSorting: true,
      cell: ({ row }) => <div className="text-center">{row.original.id}</div>
    },
    {
      header: '계정',
      key: 'account',
      enableSorting: true,
      width: '250px',
      cell: ({ row }) => (
        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
          {row.original.email || row.original.username || '-'}
        </code>
      )
    },
    {
      header: '이름',
      key: 'name',
      enableSorting: true,
      cell: ({ row }) => (
        <div>
          {row.original.name || '-'}
        </div>
      )
    },
    {
      header: '역할',
      key: 'role',
      enableSorting: true,
      cell: ({ row }) => {
        const roleColors: Record<string, string> = {
          ADMIN: 'bg-red-100 text-red-800',
          MANAGER: 'bg-yellow-100 text-yellow-800',
          USER: 'bg-blue-100 text-blue-800',
        };
        const roleLabels: Record<string, string> = {
          ADMIN: '관리자',
          MANAGER: '매니저',
          USER: '사용자',
        };
        return (
          <span className={`px-2 py-0.5 text-xs rounded ${roleColors[row.original.role] || 'bg-gray-100 text-gray-800'}`}>
            {roleLabels[row.original.role] || row.original.role}
          </span>
        );
      }
    },
    {
      header: '상태',
      key: 'isActive',
      enableSorting: true,
      cell: ({ row }) => (
        <span className={`px-2 py-1 text-xs rounded ${
          row.original.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {row.original.isActive ? '활성' : '비활성'}
        </span>
      )
    },
    {
      header: 'OAuth',
      key: 'providers',
      enableSorting: false,
      width: '120px',
      cell: ({ row }) => (
        <div className="flex gap-1 flex-wrap">
          {row.original.providers.length > 0 ? (
            row.original.providers.map((provider: string) => {
              const providerLabels: Record<string, string> = {
                google: 'Google',
                kakao: 'Kakao',
                naver: 'Naver',
              };
              return (
                <span key={provider} className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                  {providerLabels[provider] || provider}
                </span>
              );
            })
          ) : (
            <span className="text-xs text-gray-500">이메일</span>
          )}
        </div>
      )
    },
    {
      header: '가입일',
      key: 'createdAt',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">
          {new Date(row.original.createdAt).toLocaleDateString('ko-KR')}
        </div>
      )
    },
    {
      header: '관리',
      key: 'actions',
      enableSorting: false,
      width: '100px',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="text-blue-600 hover:text-blue-800"
          >
            수정
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="text-red-600 hover:text-red-800"
          >
            삭제
          </button>
        </div>
      ),
    },
  ], [handleEdit, handleDelete]);

  return (
    <AdminLayout>
      <AdminPageWrap
        title="회원 관리"
        breadcrumbItems={[{ label: '회원 관리', href: '/admin/user' }]}
      >
        {isLoading ? (
          <div className="text-center py-4">로딩 중...</div>
        ) : rowData.length === 0 ? (
          <div className="text-center py-4 text-gray-500">회원이 없습니다.</div>
        ) : (
          <DataGridClient
            columns={columns}
            data={rowData}
          />
        )}

        <EditModal
          isOpen={isEditModalOpen}
          user={editingUser}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingUser(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setEditingUser(null);
            toast.success('회원 정보가 수정되었습니다.');
            fetchData();
          }}
        />
      </AdminPageWrap>
    </AdminLayout>
  );
}
