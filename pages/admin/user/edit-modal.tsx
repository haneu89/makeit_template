import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/admin/common';

interface UserData {
  id: number;
  email: string | null;
  username: string | null;
  name: string | null;
  role: string;
  isActive: boolean;
}

interface EditModalProps {
  isOpen: boolean;
  user: UserData | null;
  onClose: () => void;
  onSuccess: () => void;
}

// JWT 페이로드 타입
interface JwtPayload {
  role: string;
  [key: string]: any;
}

// 쿠키 유틸리티
const getCookie = (name: string): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

export default function EditModal({ isOpen, user, onClose, onSuccess }: EditModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    name: '',
    role: 'USER',
    isActive: true,
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('USER');

  // 현재 사용자의 역할 추출
  useEffect(() => {
    const token = getCookie('auth-token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
        setCurrentUserRole(payload.role || 'USER');
      } catch (error) {
        console.error('Failed to decode JWT:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        username: user.username || '',
        name: user.name || '',
        role: user.role || 'USER',
        isActive: user.isActive !== undefined ? user.isActive : true,
        password: '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsLoading(true);

    try {
      const requestData: any = {
        email: formData.email || null,
        username: formData.username || null,
        name: formData.name || null,
        role: formData.role,
        isActive: formData.isActive,
      };

      // 비밀번호가 입력된 경우에만 포함
      if (formData.password) {
        requestData.password = formData.password;
      }

      const response = await fetch(`/api/admin/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '수정 실패');
      }

      toast.success('회원 정보가 수정되었습니다.');
      onSuccess();
    } catch (error: any) {
      console.error('수정 중 오류 발생:', error);
      toast.error(error.message || '수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="회원 정보 수정" maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="user@example.com"
            />
          </div>

          {/* 아이디 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              아이디
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="username"
            />
          </div>

          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="홍길동"
            />
          </div>

          {/* 역할 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              역할 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="USER">사용자</option>
              <option value="MANAGER">매니저</option>
              {currentUserRole === 'ADMIN' && (
                <option value="ADMIN">관리자</option>
              )}
            </select>
          </div>
        </div>

        {/* 상태 */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">활성 상태</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            비활성화하면 로그인할 수 없습니다.
          </p>
        </div>

        {/* 비밀번호 변경 (선택) - ADMIN만 가능 */}
        {currentUserRole === 'ADMIN' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 변경 (선택)
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="변경 시에만 입력"
            />
            <p className="text-xs text-gray-500 mt-1">
              비밀번호를 변경하지 않으려면 비워두세요.
            </p>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-2 justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? '수정 중...' : '수정'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
