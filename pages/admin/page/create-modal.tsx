import { useState } from 'react';
import { Modal } from '@/components/admin/common';
import { Wsywyg } from '@/components/admin/common/wsywig';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPageCreated: () => void;
}

export default function CreateModal({ isOpen, onClose, onPageCreated }: CreateModalProps) {
  const [route, setRoute] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [domain, setDomain] = useState('default');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!route || !title || !content) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route,
          domain,
          title,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('페이지 생성에 실패했습니다.');
      }

      onPageCreated();
      onClose();
      // 폼 초기화
      setRoute('');
      setTitle('');
      setContent('');
      setDomain('default');
    } catch (error) {
      console.error('페이지 생성 중 오류 발생:', error);
      alert(error instanceof Error ? error.message : '페이지 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="페이지 생성"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        <div>
          <label htmlFor="route" className="block text-sm font-medium text-gray-700">
            경로
          </label>
          <input
            type="text"
            id="route"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="예: about-us"
            required
          />
        </div>

        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
            도메인
          </label>
          <input
            type="text"
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="default"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용
          </label>
          <Wsywyg
            value={content}
            onChange={setContent}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? '생성 중...' : '생성'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
