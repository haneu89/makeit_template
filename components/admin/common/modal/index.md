# SideModal vs SidePanel 컴포넌트 비교 분석

## 개요

이 문서는 `components/admin/common/modal/` 디렉토리의 SideModal과 SidePanel 컴포넌트를 비교 분석한 결과입니다.

## 컴포넌트 관계

```
SidePanel (래퍼)
    ↓ 내부적으로 사용
SideModal (기본 컴포넌트)
```

**SidePanel은 SideModal을 래핑한 간편한 인터페이스**입니다.

## 상세 비교

### SideModal (기본 컴포넌트)

**파일**: `components/admin/common/modal/SideModal.tsx`
**버전**: 1.0.2 (2025-10-09)
**라인 수**: 149라인

#### 주요 특징
- ✅ **완전한 기능**: 모든 옵션을 세밀하게 제어 가능
- ✅ **양방향 위치**: `position: 'right' | 'left'` 지원
- ✅ **유연한 너비**: 숫자(%) 또는 문자열(px) 모두 지원
- ✅ **애니메이션 제어**: `animationDuration` 커스터마이징
- ✅ **고급 옵션**: 오버레이/ESC 닫기, body 스크롤 방지
- ✅ **Portal 렌더링**: `createPortal`로 DOM 루트에 렌더링

#### Props 인터페이스
```typescript
interface SideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number | string;        // 유연한 너비 설정
  headerActions?: ReactNode;
  closeOnOverlayClick?: boolean;  // 오버레이 클릭 닫기
  closeOnEsc?: boolean;           // ESC 키 닫기
  showCloseButton?: boolean;      // 닫기 버튼 표시
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  position?: 'right' | 'left';   // 위치 선택
  animationDuration?: number;     // 애니메이션 시간
}
```

### SidePanel (래퍼 컴포넌트)

**파일**: `components/admin/common/modal/SidePanel.tsx`
**버전**: 1.0.0 (2025-09-29)
**라인 수**: 67라인

#### 주요 특징
- ✅ **간단한 API**: 최소한의 props로 쉬운 사용
- ✅ **프리셋 너비**: `sm/md/lg/xl` → `30%/40%/50%/60%`
- ✅ **폼 통합**: `FormConfig`로 폼 요소 자동 래핑
- ✅ **기본 스타일**: `contentClassName="p-6"` 자동 적용
- ❌ **우측 고정**: position 옵션 없음 (항상 right)
- ❌ **제한된 옵션**: 애니메이션, 닫기 동작 등 커스터마이징 불가

#### Props 인터페이스
```typescript
interface SidePanelProps {
  title: string;                  // 필수
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl'; // 프리셋만 지원
  headerActions?: ReactNode;
  form?: FormConfig;              // 폼 통합 기능
  className?: string;
}

interface FormConfig {
  id: string;
  onSubmit: (e: React.FormEvent) => void;
}
```

## 사용 시나리오별 선택 가이드

### SideModal을 사용해야 하는 경우

```typescript
// 1. 좌측 위치가 필요한 경우
<SideModal
  position="left"
  isOpen={isOpen}
  onClose={onClose}
  title="좌측 패널"
>
  <LeftContent />
</SideModal>

// 2. 고정 픽셀 너비가 필요한 경우
<SideModal
  width="400px"
  isOpen={isOpen}
  onClose={onClose}
>
  <FixedWidthContent />
</SideModal>

// 3. 애니메이션 커스터마이징이 필요한 경우
<SideModal
  animationDuration={500}
  closeOnOverlayClick={false}
  closeOnEsc={false}
  isOpen={isOpen}
  onClose={onClose}
>
  <CustomContent />
</SideModal>
```

### SidePanel을 사용해야 하는 경우

```typescript
// 1. 일반적인 관리자 페이지 편집 폼
<SidePanel
  title="사용자 편집"
  isOpen={isEditOpen}
  onClose={() => setEditOpen(false)}
  width="lg"
  form={{
    id: 'user-form',
    onSubmit: handleUserSubmit
  }}
>
  <UserEditForm />
</SidePanel>

// 2. 빠른 상세보기 패널
<SidePanel
  title="주문 상세"
  isOpen={isDetailOpen}
  onClose={() => setDetailOpen(false)}
  width="md"
>
  <OrderDetail orderId={selectedId} />
</SidePanel>

// 3. 단순한 설정 패널
<SidePanel
  title="설정"
  isOpen={isSettingOpen}
  onClose={() => setSettingOpen(false)}
  width="sm"
>
  <SettingsForm />
</SidePanel>
```

## 너비 매핑

| SidePanel | SideModal | 실제 너비 |
|-----------|-----------|-----------|
| `sm`      | `30`      | 30%       |
| `md`      | `40`      | 40%       |
| `lg`      | `50`      | 50%       |
| `xl`      | `60`      | 60%       |

## 내부 구현 차이점

### SideModal
- `createPortal`로 body에 직접 렌더링
- 복잡한 상태 관리 (ESC 키, 오버레이 클릭, body 스크롤)
- 위치별 CSS 클래스 동적 생성
- 애니메이션 타이밍 커스터마이징

### SidePanel
- SideModal을 래핑하여 간단한 인터페이스 제공
- `FormConfig`가 있으면 `<form>` 태그로 자동 래핑
- 고정된 기본값들 (`contentClassName="p-6"`)
- 너비 프리셋을 숫자로 변환하는 매핑 로직

## 폼 통합 기능 (SidePanel 전용)

```typescript
// SidePanel의 form 기능 활용
<SidePanel
  title="새 게시물"
  isOpen={isOpen}
  onClose={onClose}
  form={{
    id: 'post-form',
    onSubmit: (e) => {
      e.preventDefault();
      // 폼 제출 로직
    }
  }}
  headerActions={
    <button type="submit" form="post-form">
      저장
    </button>
  }
>
  <div className="space-y-4">
    <input name="title" placeholder="제목" />
    <textarea name="content" placeholder="내용" />
  </div>
</SidePanel>
```

## 권장사항

### 개발 지침

1. **일반적인 관리자 기능**: SidePanel 사용
   - 사용자/게시물/주문 등의 CRUD 작업
   - 표준적인 폼 기반 인터페이스

2. **특수한 요구사항**: SideModal 사용
   - 좌측 위치, 고정 픽셀 너비
   - 커스텀 애니메이션, 특별한 닫기 동작

3. **API 일관성**: 같은 프로젝트 내에서는 하나의 패턴으로 통일

### 확장성 고려사항

- SidePanel에 새로운 기능이 필요하면 SideModal에 먼저 추가
- SideModal의 기능이 안정화되면 SidePanel에 간편한 인터페이스로 노출
- 두 컴포넌트 모두 버전 관리로 호환성 유지

## 결론

- **SideModal**: 모든 기능을 제공하는 기본 컴포넌트 (Low-level API)
- **SidePanel**: 관리자 페이지에 최적화된 간편 인터페이스 (High-level API)

적절한 추상화 레벨을 선택하여 개발 생산성과 유지보수성을 모두 확보할 수 있습니다.

---

**작성일**: 2025-09-29
**작성자**: Claude Code Analysis