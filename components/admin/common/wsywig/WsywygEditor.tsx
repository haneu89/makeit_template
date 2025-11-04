/**
 * @version 1.0.0
 * @date 2025-09-24
 * @author jinhyung
 *
 * WsywygEditor - WYSIWYG 에디터 컴포넌트
 * React Quill 기반의 리치 텍스트 에디터로 이미지 업로드를 지원합니다.
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

/**
 * 이미지 업로드를 처리하는 커스텀 핸들러
 * 파일 선택 다이얼로그를 열고, 선택된 이미지를 서버에 업로드한 후 에디터에 삽입합니다.
 */
const ImageUpload = function (this: any) {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('files', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/file/upload');

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const data = JSON.parse(xhr.responseText);
          if (data && data[0]?.file_name) {
            const range = this.quill.getSelection(true);
            this.quill.insertEmbed(range.index, 'image', data[0].file_name);
            this.quill.setSelection(range.index + 1);
          } else {
            alert('이미지 업로드 실패');
          }
        } else {
          alert('업로드 실패');
        }
      };

      xhr.onerror = () => {
        alert('네트워크 오류');
      };

      xhr.send(formData);
    }
  };
};

/**
 * ReactQuill을 동적으로 임포트하여 SSR 이슈를 방지
 * 로딩 중에는 빈 에디터 영역을 표시
 */
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="w-full p-2 border rounded h-64" />,
});

interface WYSIWYGProps {
  /** 에디터의 현재 내용 */
  value: string;
  /** 내용이 변경될 때 호출되는 콜백 함수 */
  onChange: (content: string) => void;
}

/**
 * WYSIWYG 에디터 컴포넌트
 * React Quill을 기반으로 하며, 이미지 업로드 기능이 포함되어 있습니다.
 */
export default function WYSIWYGWrapper({ value, onChange }: WYSIWYGProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * 에디터 툴바 설정
   * - 제목 스타일 (H1, H2, H3)
   * - 텍스트 서식 (굵게, 기울임, 밑줄, 취소선)
   * - 글자 색상 및 배경색
   * - 목록 (순서 있는/없는)
   * - 링크 및 이미지 삽입
   * - 서식 지우기
   */
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: ImageUpload,
      },
    },
  };

  /**
   * 허용되는 서식 목록
   */
  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'list',
    'link',
    'image',
  ];

  // 클라이언트 사이드 렌더링을 위한 처리
  if (!mounted) {
    return <div className="h-[400px]"><div className="w-full p-2 border rounded h-64" /></div>;
  }

  return (
    <div className="h-[400px]">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        className="h-[350px]"
      />
    </div>
  );
}