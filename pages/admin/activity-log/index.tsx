import { AdminLayout, AdminPageWrap } from '@/components/admin/common';
import { useState, useEffect, useMemo } from 'react';
import { DataGridClient, ColumnDef } from '@/components/admin/common/datagrid';
import { toast } from 'sonner';

interface ActivityLogData {
  id: number;
  action: string;
  userId: number | null;
  userEmail: string | null;
  userName: string | null;
  targetType: string | null;
  targetId: number | null;
  targetName: string | null;
  ip: string | null;
  message: string | null;
  createdAt: string;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  } | null;
}

interface ActivityLogResponse {
  data: ActivityLogData[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// 활동 유형 한글 변환
const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    USER_REGISTER: '회원 가입',
    USER_LOGIN: '로그인',
    USER_LOGOUT: '로그아웃',
    USER_UPDATE: '회원정보 수정',
    USER_DELETE: '회원 삭제',
    SECTION_CREATE: '섹션 생성',
    SECTION_UPDATE: '섹션 수정',
    SECTION_DELETE: '섹션 삭제',
    DIRECTORY_CREATE: '디렉토리 생성',
    DIRECTORY_UPDATE: '디렉토리 수정',
    DIRECTORY_DELETE: '디렉토리 삭제',
    DIRECTORY_MOVE: '디렉토리 이동',
    FILE_UPLOAD: '파일 업로드',
    FILE_DOWNLOAD: '파일 다운로드',
    FILE_UPDATE: '파일 수정',
    FILE_DELETE: '파일 삭제',
    FILE_MOVE: '파일 이동',
    PERMISSION_CHANGE: '권한 변경',
    SETTING_UPDATE: '설정 변경',
  };
  return labels[action] || action;
};

// 활동 유형 색상
const getActionColor = (action: string) => {
  if (action.includes('CREATE') || action.includes('REGISTER') || action.includes('UPLOAD')) {
    return 'text-green-700 bg-green-100';
  }
  if (action.includes('DELETE')) {
    return 'text-red-700 bg-red-100';
  }
  if (action.includes('UPDATE') || action.includes('MOVE')) {
    return 'text-blue-700 bg-blue-100';
  }
  if (action.includes('LOGIN') || action.includes('DOWNLOAD')) {
    return 'text-gray-700 bg-gray-100';
  }
  return 'text-gray-700 bg-gray-100';
};

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/activity-log');
      if (!response.ok) {
        throw new Error('로그 조회 실패');
      }
      const data = await response.json();
      setLogs(data);
    } catch (error: any) {
      console.error('로그 조회 중 오류 발생:', error);
      toast.error(error.message || '로그 조회에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns: ColumnDef<ActivityLogData>[] = useMemo(
    () => [
      {
        header: 'ID',
        key: 'id',
        enableSorting: true,
        cell: ({ row }) => <div className="text-center text-sm text-gray-500">#{row.original.id}</div>,
      },
      {
        header: '활동',
        key: 'action',
        enableSorting: true,
        cell: ({ row }) => (
          <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(row.original.action)}`}>
            {getActionLabel(row.original.action)}
          </span>
        ),
      },
      {
        header: '사용자',
        key: 'userName',
        enableSorting: true,
        cell: ({ row }) => (
          <div>
            {row.original.user ? (
              <>
                <div className="font-medium">{row.original.user.name || '익명'}</div>
                <div className="text-xs text-gray-500">{row.original.user.email}</div>
              </>
            ) : (
              <div className="text-gray-400">-</div>
            )}
          </div>
        ),
      },
      {
        header: '대상',
        key: 'targetName',
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            {row.original.targetName ? (
              <>
                <div className="font-medium">{row.original.targetName}</div>
                {row.original.targetType && (
                  <div className="text-xs text-gray-500">
                    {row.original.targetType} #{row.original.targetId}
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-400">-</div>
            )}
          </div>
        ),
      },
      {
        header: 'IP 주소',
        key: 'ip',
        enableSorting: false,
        cell: ({ row }) => (
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            {row.original.ip || '-'}
          </code>
        ),
      },
      {
        header: '메시지',
        key: 'message',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-sm text-gray-600 max-w-xs truncate">
            {row.original.message || '-'}
          </div>
        ),
      },
      {
        header: '일시',
        key: 'createdAt',
        enableSorting: true,
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {new Date(row.original.createdAt).toLocaleString('ko-KR')}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminLayout>
      <AdminPageWrap
        title="활동 로그"
        breadcrumbItems={[{ label: '활동 로그', href: '/admin/activity-log' }]}
      >
        {isLoading ? (
          <div className="text-center py-4">로딩 중...</div>
        ) : logs ? (
          <DataGridClient
            data={logs.data}
            columns={columns}
          />
        ) : (
          <div className="text-center text-gray-500 py-12">데이터를 불러올 수 없습니다.</div>
        )}
      </AdminPageWrap>
    </AdminLayout>
  );
}
