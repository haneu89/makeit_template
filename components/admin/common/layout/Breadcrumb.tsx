/**
 * @version 1.0.0
 * @date 2025-09-24
 * @author jinhyung
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드에서만 현재 경로를 설정
  useEffect(() => {
    setIsClient(true);
    setCurrentPath(router.asPath);
  }, [router.asPath]);

  return (
    <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
      <Link href="/admin" className="hover:text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 12l9-9 9 9-1.5 1.5L12 4.5 4.5 13.5 3 12z" />
          <path d="M4 10v10h5v-6h6v6h5V10l-8-8-8 8z" />
        </svg>
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="text-gray-400">&gt;</span>
          {isClient && item.href && item.href === currentPath ? (
            <span className="text-gray-800">{item.label}</span>
          ) : item.href ? (
            <Link href={item.href} className="hover:text-blue-600">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}