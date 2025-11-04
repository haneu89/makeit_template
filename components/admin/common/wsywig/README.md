# WYSIWYG 에디터 컴포넌트

React Quill을 기반으로 한 WYSIWYG 에디터 컴포넌트입니다.

## 설치

```bash
npm install react-quill-new
```

## 사용법

```tsx
import { Wsywyg } from "@/components/admin/common/wsywig";

export default function Page() {
  const [content, setContent] = useState('');

  return (
    <Wsywyg
      value={content}
      onChange={(newContent) => setContent(newContent)}
    />
  );
}
```

## 기능

- 텍스트 서식 (굵게, 기울임, 밑줄, 취소선)
- 제목 스타일 (H1, H2, H3)
- 글자 색상 및 배경색
- 순서 있는/없는 목록
- 링크 삽입
- 이미지 업로드 및 삽입
- 반응형 디자인
- Tailwind CSS 스타일링

## Props

| Prop | 타입 | 설명 |
|------|------|------|
| value | string | 에디터의 현재 내용 |
| onChange | (content: string) => void | 내용이 변경될 때 호출되는 콜백 함수 |

## 이미지 업로드

이미지 업로드는 `/api/file` 엔드포인트를 통해 처리됩니다. 업로드된 이미지는 에디터에 자동으로 삽입됩니다.

## 주의사항

1. SSR(Server Side Rendering) 지원
   - 컴포넌트는 클라이언트 사이드에서만 렌더링됩니다.
   - 서버 사이드에서는 로딩 상태가 표시됩니다.

2. 이미지 업로드
   - 이미지 업로드 시 FormData를 사용합니다.
   - 업로드 실패 시 사용자에게 알림이 표시됩니다.

3. 스타일링
   - 기본 높이는 400px로 설정되어 있습니다.
   - 에디터 영역은 350px 높이를 가집니다.
   - Tailwind CSS 클래스를 사용하여 스타일링됩니다.
