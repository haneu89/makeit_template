import { Modal } from '@/components/admin/common';
import { useState } from 'react';

interface PreferenceCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PreferenceCreate({ isOpen, onClose, onSuccess }: PreferenceCreateProps) {
  const [formData, setFormData] = useState({
    domain: 'default',
    category: 'system',
    key: '',
    value: '',
    type: 'string',
    name: '',
    sort: 0,
    comment: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('설정 생성 실패');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('설정 생성 중 오류 발생:', error);
      alert('설정 생성에 실패했습니다.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="설정 생성" maxWidth="3xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 2열 그리드 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="key" className="block text-sm font-medium text-gray-700">키 *</label>
            <input
              type="text"
              id="key"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="예: site_name"
              required
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="예: 사이트 이름"
            />
          </div>

          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700">값 *</label>
            <input
              type="text"
              id="value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">타입</label>
            <div className="mt-2 flex gap-4">
              {['string', 'number', 'boolean'].map((type) => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">카테고리</label>
            <input
              type="text"
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="기본: system"
            />
          </div>

          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700">정렬 순서</label>
            <input
              type="number"
              id="sort"
              value={formData.sort}
              onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* 전체 너비 필드 */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">설명</label>
          <textarea
            id="comment"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            rows={2}
            className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="설정에 대한 설명"
          />
        </div>

        {/* domain은 숨김 처리 (기본값 사용) */}
        <input type="hidden" value={formData.domain} />

        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
          >
            생성
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
          >
            취소
          </button>
        </div>
      </form>
    </Modal>
  );
}