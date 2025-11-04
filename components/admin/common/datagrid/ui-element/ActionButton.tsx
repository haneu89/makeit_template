/**
 * @version 1.0.0
 * @date 2025-09-24
 * @author jinhyung
 *
 * ActionButton - 액션 버튼 컴포넌트
 * 아이콘과 텍스트를 포함한 다양한 색상의 액션 버튼을 제공합니다.
 */

import { ReactNode } from "react";

interface ActionButtonProps {
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  color?: "blue" | "green" | "red" | "gray";
}

export default function ActionButton({
  icon,
  children,
  onClick,
  className = "",
  color = "blue",
}: ActionButtonProps) {
  const colorClass =
    color === "blue"
      ? "border-blue-600 text-blue-600 hover:bg-blue-50"
      : color === "green"
      ? "border-green-600 text-green-600 hover:bg-green-50"
      : color === "red"
      ? "border-red-600 text-red-600 hover:bg-red-50"
      : "border-gray-400 text-gray-600 hover:bg-gray-50";

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-2 min-w-[50px] h-8 rounded border bg-white text-xs font-medium gap-1 whitespace-nowrap ${colorClass} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}