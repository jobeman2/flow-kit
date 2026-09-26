'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Compass, ArrowLeft, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { setAuthTokens, getAuthToken } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/console';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getAuthToken()) {
      router.replace(redirectUrl);
    }
  }, [router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      if (data.accessToken) {
        setAuthTokens(data.accessToken, data.refreshToken);
        router.push(redirectUrl);
      } else {
        throw new Error('No access token returned from server.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate. Ensure the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@onboardflow.com');
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-900/5 p-6 sm:p-8">
      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Work Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@onboardflow.com"
              className="w-full rounded-xl border border-slate-200 text-xs py-2.5 pl-9 pr-3.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-slate-900"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 text-xs py-2.5 pl-9 pr-3.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-slate-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-3 transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Quick Demo Fill Helper */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col items-center">
        <button
          type="button"
          onClick={fillDemoAdmin}
          className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-[11px] font-medium transition-all flex items-center justify-center space-x-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fill Seeded Admin Credentials (admin@onboardflow.com)</span>
        </button>
      </div>

      <div className="mt-5 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link href="/register" className="font-semibold text-slate-900 hover:underline">
          Create workspace
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
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

        <Suspense fallback={<div className="text-xs text-slate-400">Loading form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
