import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import React from 'react';
import { DM_Sans } from 'next/font/google';
import AppShell from '@/components/AppShell';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: 'Flow-Kit | Developer-First Onboarding & Universal Walkthrough SDK',
  description: 'Interactive spotlight walkthroughs, tooltips, and product guides with just 2 lines of code. Ultra-lightweight, multilingual-first, Cloud & Self-Hosted.',
};

import { ToastProvider } from '@/components/Toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={`${dmSans.className} min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white`}>
        <ClerkProvider>
          <ToastProvider>
          <AppShell>
          {children}
          </AppShell>
          </ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}