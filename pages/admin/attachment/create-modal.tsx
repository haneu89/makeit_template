import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Modal } from '@/components/admin/common';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export default function CreateModal({ isOpen, onClose, onUploadComplete }: CreateModalProps) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [viewRole, setViewRole] = useState<'ADMIN' | 'MANAGER' | 'USER' | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (viewRole) {
      formData.append('viewRole', viewRole);
    }

    try {
      const response = await fetch('/api/admin/attachment', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '업로드 실패');
      }
      
      const result = await response.json();
      console.log('업로드 성공:', result);
      
      onUploadComplete();
      onClose();
      setFiles([]);
      setViewRole(null);
    } catch (error) {
      console.error('업로드 중 오류 발생:', error);
      alert(error instanceof Error ? error.message : '파일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="파일 업로드"
      maxWidth="2xl"
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
              onChange={() => setViewRole(null)}
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
              onChange={() => setViewRole('USER')}
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
              onChange={() => setViewRole('MANAGER')}
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
              onChange={() => setViewRole('ADMIN')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">관리자</span>
          </label>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${files.length > 0 ? 'bg-gray-50' : ''}`}
      >
        <input {...getInputProps()} />
        {files.length > 0 ? (
          <div>
            <p className="mb-2">선택된 파일 {files.length}개</p>
            <ul className="text-sm text-gray-600">
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <p className="text-lg mb-2">
              {isDragActive ? '여기에 파일을 놓으세요' : '파일을 드래그하거나 클릭하여 업로드'}
            </p>
            <p className="text-sm text-gray-500">
              지원 형식: 이미지, 문서, 비디오 등
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded"
        >
          취소
        </button>
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700
            ${(files.length === 0 || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uploading ? '업로드 중...' : '업로드'}
        </button>
      </div>
    </Modal>
  );
} 