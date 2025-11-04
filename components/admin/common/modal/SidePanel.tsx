/**
 * SidePanel - SideModal을 래핑한 간편한 우측 패널 컴포넌트
 * @version 1.0.0
 * @date 2025-09-29
 * @author jinhyung
 */

import React, { ReactNode } from 'react';
import SideModal from './SideModal';

interface FormConfig {
  id: string;
  onSubmit: (e: React.FormEvent) => void;
}

interface SidePanelProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  headerActions?: ReactNode;
  form?: FormConfig;
  className?: string;
}

const widthMap = {
  sm: 30,
  md: 40,
  lg: 50,
  xl: 60,
};

export const SidePanel: React.FC<SidePanelProps> = ({
  title,
  isOpen,
  onClose,
  children,
  width = 'lg',
  headerActions,
  form,
  className = '',
}) => {
  const modalWidth = widthMap[width];

  const content = form ? (
    <form id={form.id} onSubmit={form.onSubmit} className="h-full flex flex-col">
      {children}
    </form>
  ) : (
    children
  );

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={modalWidth}
      headerActions={headerActions}
      className={className}
      contentClassName="p-6"
    >
      {content}
    </SideModal>
  );
};