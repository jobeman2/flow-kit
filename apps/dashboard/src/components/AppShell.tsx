'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminLayout from './AdminLayout';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicRoutes = ['/', '/login', '/register', '/verify-email', '/forgot-password', '/reset-password', '/auth/callback', '/sign-in', '/sign-up'];
  const isPublicPage = publicRoutes.some((route) => pathname === route || pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up'));

  if (isPublicPage) {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
