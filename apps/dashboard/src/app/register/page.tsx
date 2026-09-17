'use client';

import React from 'react';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 font-sans">
      
      {/* Return Home */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-slate-500 hover:text-slate-900 transition-colors"
        >
          <span>&larr;</span>
          <span>RETURN TO FLOW-KIT HOME</span>
        </Link>
      </div>

      <div className="w-full max-w-[440px] flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-9 h-9 rounded-sm bg-slate-900 flex items-center justify-center text-white font-mono text-xs font-bold mb-3 shadow-xs">
            FK
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Create your Flow-Kit Workspace
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-1">
            // DEVELOPER ONBOARDING PLATFORM
          </p>
        </div>

        {/* Clerk Sign-Up Component */}
        <div className="w-full flex justify-center">
          <SignUp
            routing="hash"
            signInUrl="/login"
            fallbackRedirectUrl="/console"
            appearance={{
              variables: {
                colorPrimary: '#0F172A',
                colorBackground: '#FFFFFF',
                borderRadius: '0.125rem',
              },
              elements: {
                rootBox: 'w-full shadow-xl rounded-sm border border-slate-200 overflow-hidden',
                card: 'shadow-none p-6 sm:p-8 border-0 bg-white w-full rounded-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'rounded-sm border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 h-10 transition-colors shadow-none',
                dividerRow: 'my-5',
                dividerText: 'text-[10px] font-mono text-slate-400 uppercase tracking-wider',
                formFieldLabel: 'text-xs font-semibold text-slate-700 mb-1.5',
                formFieldInput: 'rounded-sm border border-slate-200 text-xs py-2 px-3 focus:outline-none focus:border-slate-800 transition-colors shadow-none',
                formButtonPrimary: 'w-full rounded-sm bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 h-auto transition-all shadow-xs cursor-pointer',
                footer: 'bg-slate-50/60 border-t border-slate-100 p-4',
                footerAction: 'text-xs text-slate-500',
                footerActionLink: 'font-semibold text-slate-900 hover:underline text-xs',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
