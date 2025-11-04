import { useEffect, useState } from 'react';
import { AdminLayout, AdminPageWrap } from '@/components/admin/common';
import { toast } from 'sonner';

interface LogFile {
  filename: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  context: string;
  message: string;
  metadata?: any;
}

interface LogFileContent {
  filename: string;
  size: number;
  lines: number;
  entries: LogEntry[];
}

export default function SystemLogPage() {
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [logContent, setLogContent] = useState<LogFileContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // 로그 파일 목록 로드
  useEffect(() => {
    fetchLogFiles();
  }, []);

  const fetchLogFiles = async () => {
    try {
      const response = await fetch('/api/admin/system-log/files');
      if (response.ok) {
        const data = await response.json();
        setLogFiles(data);
      } else {
        toast.error('로그 파일 목록을 불러올 수 없습니다');
      }
    } catch (error) {
      console.error('Failed to fetch log files:', error);
      toast.error('로그 파일 목록을 불러오는 중 오류가 발생했습니다');
    }
  };

  // 로그 파일 내용 로드
  const fetchLogContent = async (filename: string) => {
    setLoading(true);
    setSelectedFile(filename);

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (levelFilter) params.append('level', levelFilter);
      params.append('limit', '1000'); // 최대 1000줄

      const response = await fetch(`/api/admin/system-log/files/${filename}?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogContent(data);
      } else {
        toast.error('로그 파일을 읽을 수 없습니다');
      }
    } catch (error) {
      console.error('Failed to fetch log content:', error);
      toast.error('로그 파일을 읽는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 검색/필터 적용
  const applyFilters = () => {
    if (selectedFile) {
      fetchLogContent(selectedFile);
    }
  };

  // 파일 크기 포맷
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 로그 레벨 색상
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600 bg-red-50';
      case 'WARN':
        return 'text-yellow-600 bg-yellow-50';
      case 'INFO':
        return 'text-blue-600 bg-blue-50';
      case 'DEBUG':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <AdminLayout>
      <AdminPageWrap
        title="시스템 로그"
        breadcrumbItems={[{ label: '시스템 로그', href: '/admin/system-log' }]}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* 파일 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">로그 파일</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {logFiles.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    로그 파일이 없습니다
                  </div>
                ) : (
                  logFiles.map((file) => (
                    <button
                      key={file.filename}
                      onClick={() => fetchLogContent(file.filename)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        selectedFile === file.filename ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {file.filename}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatSize(file.size)}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(file.modifiedAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 로그 내용 */}
          <div className="lg:col-span-3">
            {selectedFile ? (
              <div className="bg-white rounded-lg shadow">
                {/* 필터 */}
                <div className="px-4 py-3 border-b border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900">
                      {selectedFile}
                    </h2>
                    {logContent && (
                      <span className="text-xs text-gray-500">
                        {logContent.lines}줄 / {formatSize(logContent.size)}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="검색어 입력..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <select
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">모든 레벨</option>
                      <option value="ERROR">ERROR</option>
                      <option value="WARN">WARN</option>
                      <option value="INFO">INFO</option>
                      <option value="DEBUG">DEBUG</option>
                    </select>
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      필터 적용
                    </button>
                  </div>
                </div>

                {/* 로그 엔트리 */}
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      로딩 중...
                    </div>
                  ) : logContent && logContent.entries.length > 0 ? (
                    logContent.entries.map((entry, index) => (
                      <div key={index} className="px-4 py-3 hover:bg-gray-50 font-mono text-xs">
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 whitespace-nowrap">
                            {entry.timestamp}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-semibold whitespace-nowrap ${getLevelColor(
                              entry.level,
                            )}`}
                          >
                            {entry.level}
                          </span>
                          {entry.context && (
                            <span className="text-blue-600 whitespace-nowrap">
                              [{entry.context}]
                            </span>
                          )}
                          <span className="text-gray-900 break-all">
                            {entry.message}
                          </span>
                        </div>
                        {entry.metadata && (
                          <pre className="mt-1 text-gray-600 overflow-x-auto">
                            {JSON.stringify(entry.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      {searchTerm || levelFilter
                        ? '검색 결과가 없습니다'
                        : '로그가 비어있습니다'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow px-4 py-16 text-center text-gray-500">
                왼쪽에서 로그 파일을 선택하세요
              </div>
            )}
          </div>
        </div>
      </AdminPageWrap>
    </AdminLayout>
  );
}
