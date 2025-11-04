import { AdminLayout, AdminPageWrap } from "@/components/admin/common";
import { Wsywyg } from "@/components/admin/common/wsywig";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Page {
  route: string;
  domain: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function PageEdit() {
  const router = useRouter();
  const { route } = router.query;
  const [page, setPage] = useState<Page | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (route) {
      const fetchPage = async () => {
        const response = await fetch(`/api/admin/page/${route}`);
        const data = await response.json();
        setPage(data);
        setTitle(data.title);
        setContent(data.content);
      };
      fetchPage();
    }
  }, [route]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/admin/page/${route}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (response.ok) {
        alert('페이지가 수정되었습니다.');
        router.push('/admin/page');
      } else {
        alert('페이지 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating page:', error);
      alert('페이지 수정 중 오류가 발생했습니다.');
    }
  };

  if (!page) {
    return (
      <AdminLayout>
        <AdminPageWrap 
          title="페이지 수정" 
          breadcrumbItems={[
            { label: '페이지 관리', href: '/admin/page' },
            { label: '페이지 수정', href: `/admin/page/${route}` }
          ]}
        >
          <div className="p-4">로딩 중...</div>
        </AdminPageWrap>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminPageWrap 
        title="페이지 수정" 
        breadcrumbItems={[
          { label: '페이지 관리', href: '/admin/page' },
          { label: '페이지 수정', href: `/admin/page/${route}` }
        ]}
      >
        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                onClick={() => router.push('/admin/page')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                취소
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                저장
              </button>
            </div>
          </form>
        </div>
      </AdminPageWrap>
    </AdminLayout>
  );
}
