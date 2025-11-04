import { useState, useEffect, useRef, useCallback } from 'react';
import { AttachmentResponseDto } from '@/src/attachment/attachment.dto';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { Modal } from '@/components/admin/common';

interface ShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string | number | null;
}

export default function ShowModal({ isOpen, onClose, fileId }: ShowModalProps) {
  const [file, setFile] = useState<AttachmentResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [jsonContent, setJsonContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewRole, setViewRole] = useState<'ADMIN' | 'MANAGER' | 'USER' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const loadFile = useCallback(async () => {
    if (!fileId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/attachment/${fileId}`);
      if (!response.ok) throw new Error('파일 로드 실패');
      const data = await response.json();
      setFile(data);
      setViewRole(data.viewRole);
    } catch (error) {
      console.error('파일 로드 중 오류 발생:', error);
      alert('파일 로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    loadFile();
  }, [loadFile]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadFile = acceptedFiles[0];
    if (!uploadFile || !uploadFile.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await fetch(`/api/admin/attachment/${file?.id}/replace`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('업로드 실패');

      await loadFile();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert('이미지 업데이트에 실패했습니다.');
    }
  }, [file, loadFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      setIsDragging(false);
      dragCounter.current = 0;

      if (!confirm('이미지를 대체하시겠습니까?')) {
        return;
      }

      await onDrop(acceptedFiles);
    },
    accept: {
      'image/*': []
    },
    multiple: false,
    noClick: true,
  });

  const renderPreview = () => {
    if (!file) return null;

    const fileUrl = `/api/file/${file.savedName}`;

    // 이미지 파일
    if (file.mime.startsWith('image/')) {
      return (
        <div 
          {...getRootProps()}
          className={`relative group ${isDragging ? 'bg-blue-100 bg-opacity-50' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
        >
          <Image
            src={fileUrl}
            alt={file.fileName}
            layout="responsive"
            width={500}
            height={300}
            className="max-h-[60vh] object-contain"
            unoptimized
          />
          <input {...getInputProps()} />
          {isHovered && (
            <label
              htmlFor="imageReplace"
              className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-lg cursor-pointer"
            >
              이미지 대체
            </label>
          )}
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-30 text-white text-lg font-semibold">
              이미지를 여기에 놓으세요
            </div>
          )}
        </div>
      );
    }

    // 오디오 파일
    if (file.mime.startsWith('audio/')) {
      return (
        <audio controls className="w-full">
          <source src={fileUrl} type={file.mime} />
          브라우저가 오디오 재생을 지원하지 않습니다.
        </audio>
      );
    }

    // 비디오 파일
    if (file.mime.startsWith('video/')) {
      return (
        <video controls className="max-w-full max-h-[60vh]">
          <source src={fileUrl} type={file.mime} />
          브라우저가 비디오 재생을 지원하지 않습니다.
        </video>
      );
    }

    // PDF 파일
    if (file.mime === 'application/pdf') {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-[60vh]"
          title={file.fileName}
        />
      );
    }

    // JSON 파일
    if (file.mime === 'application/json') {
      return (
        <div className="w-full">
          {isEditing ? (
            <textarea
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              className="w-full h-[60vh] font-mono text-sm p-4 border rounded"
            />
          ) : (
            <pre className="w-full h-[60vh] overflow-auto bg-gray-50 p-4 rounded font-mono text-sm">
              {jsonContent}
            </pre>
          )}
          <div className="mt-2 flex justify-end gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleJsonSave}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  저장
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  취소
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                수정
              </button>
            )}
          </div>
        </div>
      );
    }

    // 기타 파일
    return (
      <div className="text-center py-8">
        <p className="mb-4">미리보기를 지원하지 않는 파일 형식입니다.</p>
        <a
          href={fileUrl}
          download={file.fileName}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          다운로드
        </a>
      </div>
    );
  };

  // JSON 파일 내용 로드
  useEffect(() => {
    const loadJsonContent = async () => {
      if (file?.mime === 'application/json') {
        try {
          const response = await fetch(`/api/file/${file.savedName}`);
          const text = await response.text();
          // JSON 포맷팅
          const formatted = JSON.stringify(JSON.parse(text), null, 2);
          setJsonContent(formatted);
        } catch (error) {
          console.error('JSON 파일 로드 실패:', error);
          setJsonContent('JSON 파일을 로드할 수 없습니다.');
        }
      }
    };

    if (file) {
      loadJsonContent();
    }
  }, [file]);

  // JSON 파일 저장
  const handleJsonSave = async () => {
    if (!file) return;

    try {
      // JSON 유효성 검사
      JSON.parse(jsonContent);

      const response = await fetch(`/api/admin/attachment/${file.id}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: jsonContent }),
      });

      if (!response.ok) throw new Error('저장 실패');

      setIsEditing(false);
      alert('저장되었습니다.');
    } catch (error) {
      if (error instanceof SyntaxError) {
        alert('유효하지 않은 JSON 형식입니다.');
      } else {
        console.error('JSON 저장 중 오류 발생:', error);
        alert('저장에 실패했습니다.');
      }
    }
  };

  const handleViewRoleChange = async (newRole: 'ADMIN' | 'MANAGER' | 'USER' | null) => {
    if (!file) return;

    try {
      const response = await fetch(`/api/admin/attachment/${file.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ viewRole: newRole }),
      });

      if (!response.ok) throw new Error('권한 변경 실패');

      setViewRole(newRole);
      alert('권한이 변경되었습니다.');
    } catch (error) {
      console.error('권한 변경 중 오류 발생:', error);
      alert('권한 변경에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="파일 미리보기"
      maxWidth="4xl"
      description={file ? `${file.fileName} (${formatFileSize(file.fileSize)})` : undefined}
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          조회 권한
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="viewRole"
              value=""
              checked={viewRole === null}
              onChange={() => handleViewRoleChange(null)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">모든 사용자</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="viewRole"
              value="USER"
              checked={viewRole === 'USER'}
              onChange={() => handleViewRoleChange('USER')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">일반 사용자</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="viewRole"
              value="MANAGER"
              checked={viewRole === 'MANAGER'}
              onChange={() => handleViewRoleChange('MANAGER')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">매니저</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="viewRole"
              value="ADMIN"
              checked={viewRole === 'ADMIN'}
              onChange={() => handleViewRoleChange('ADMIN')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">관리자</span>
          </label>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 flex justify-center items-center">
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        ) : (
          renderPreview()
        )}
      </div>

      {file && (
        <div className="mt-4 text-sm text-gray-600">
          <p>MIME 타입: {file.mime}</p>
          <div className="flex items-center">
            <p>주소: {file.fileUrl} <button
              onClick={() => {
                const absoluteUrl = `${window.location.origin}/api/file/${file.savedName}`;
                navigator.clipboard.writeText(absoluteUrl);
              }}
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              <i className="far fa-copy"></i>
            </button></p>
          </div>
          <p>업로드 일시: {new Date(file.createdAt).toLocaleString('ko-KR')}</p>
        </div>
      )}
    </Modal>
  );
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 