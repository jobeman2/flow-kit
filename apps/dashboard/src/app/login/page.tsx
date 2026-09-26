'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignIn, useUser } from '@clerk/nextjs';
import { Compass, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/console');
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen bg-slate-50 bg-grid-hairline flex flex-col justify-center items-center px-4 py-12 font-sans relative">
      
      {/* Return Home Pill */}
      <div className="mb-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-all bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs hover:border-slate-300"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Return to Flow-Kit Home</span>
        </Link>
      </div>

      <div className="w-full max-w-[440px] flex flex-col items-center z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-white mb-3 shadow-md shadow-slate-900/10 relative">
            <Compass className="w-5 h-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign in to Flow-Kit
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            // DEVELOPER ONBOARDING CONSOLE
          </p>
        </div>

        {/* Clerk Sign-In Component with clean container */}
        <div className="w-full flex justify-center">
          <SignIn
            routing="hash"
            signUpUrl="/register"
            fallbackRedirectUrl="/console"
            appearance={{
              variables: {
                colorPrimary: '#0F172A',
                colorBackground: '#FFFFFF',
                borderRadius: '0.75rem',
              },
              elements: {
                rootBox: 'w-full flex justify-center',
                cardBox: 'w-full shadow-xl shadow-slate-900/5 rounded-2xl border border-slate-200/80 bg-white overflow-hidden',
                card: 'shadow-none p-6 sm:p-8 border-0 bg-white w-full',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 h-10 transition-all shadow-xs',
                socialButtonsBlockButtonText: 'font-medium text-xs text-slate-700',
                dividerRow: 'my-5',
                dividerText: 'text-[11px] font-mono text-slate-400 uppercase tracking-wider',
                formFieldLabel: 'text-xs font-semibold text-slate-700 mb-1.5',
                formFieldInput: 'rounded-xl border border-slate-200 text-xs py-2.5 px-3.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-none',
                formButtonPrimary: 'w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 h-10 transition-all shadow-sm cursor-pointer',
                footer: 'bg-slate-50/60 border-t border-slate-100 p-4 rounded-b-2xl',
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
