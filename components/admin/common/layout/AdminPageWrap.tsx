/**
 * @version 1.0.1
 * @date 2025-10-09
 * @author jinhyung
 */

import Breadcrumb from "./Breadcrumb";
import { ReactNode } from "react";

interface Action {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string;  // FontAwesome 클래스명
  disabled?: boolean; // 버튼 비활성화 여부
  className?: string; // 추가 스타일링을 위한 클래스
}

interface AdminPageWrapProps {
  title?: string;
  breadcrumbItems?: { label: string; href: string }[];
  actions?: Action[];
  filterSlot?: ReactNode;
  children?: ReactNode;
}

export default function AdminPageWrap({
  title,
  breadcrumbItems,
  actions,
  filterSlot,
  children,
}: AdminPageWrapProps) {
  const getButtonClassName = (action: Action) => {
    const baseClass = "px-4 py-2 rounded-md";
    let variantClass = "";

    switch (action.variant) {
      case 'secondary':
        variantClass = action.disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-gray-500 text-white hover:bg-gray-600";
        break;
      case 'danger':
        variantClass = action.disabled
          ? "bg-red-300 text-white cursor-not-allowed"
          : "bg-red-600 text-white hover:bg-red-700";
        break;
      default:
        variantClass = action.disabled
          ? "bg-blue-300 text-white cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700";
    }

    return `${baseClass} ${variantClass} ${action.className || ''}`;
  };

  return (
    <main className="py-6 md:p-6 xl:p-8">
      {breadcrumbItems && (
        <div className="px-6 md:px-0">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      )}

      <div className="flex justify-between items-center mb-6 px-6 md:px-0">
        {title && <h1 className="text-3xl font-bold">{title}</h1>}
        {actions && actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action, index) => (
              action.href ? (
                <a
                  key={index}
                  href={action.href}
                  className={getButtonClassName(action)}
                >
                  {action.icon && <i className={`${action.icon} mr-2`} />}
                  {action.label}
                </a>
              ) : (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={getButtonClassName(action)}
                  disabled={action.disabled}
                >
                  {action.icon && <i className={`${action.icon} mr-2`} />}
                  {action.label}
                </button>
              )
            ))}
          </div>
        )}
      </div>

      {filterSlot && (
        <div className="bg-white shadow-md rounded-md p-6 mb-6">
          {filterSlot}
        </div>
      )}

      {children}
    </main>
  );
}