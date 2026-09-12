'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiFetch('/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Unable to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 font-sans">
      
      <div className="mb-6">
        <Link
          href="/login"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-slate-500 hover:text-column-navy transition-colors"
        >
          <span>&larr;</span>
          <span>RETURN TO SIGN IN</span>
        </Link>
      </div>

      <div className="max-w-md w-full bg-white rounded-sm shadow-xl border border-slate-200 p-8">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-9 h-9 rounded-sm bg-column-navy flex items-center justify-center text-white font-mono text-xs font-bold mb-3 shadow-xs">
            GL
          </div>
          <h1 className="text-xl font-bold tracking-tight text-column-navy">
            Reset Password
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-1">
            // ACCOUNT CREDENTIAL RECOVERY
          </p>
        </div>

        {submitted ? (
          <div className="py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-column-navy mb-2">
              Instructions Dispatched
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              If an active account exists for <span className="font-semibold text-column-navy font-mono">{email}</span>, a cryptographic reset link has been dispatched to your inbox.
            </p>
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center space-x-2 text-xs font-semibold text-white bg-column-navy hover:bg-slate-800 py-2.5 px-4 rounded-sm transition-colors shadow-xs"
            >
              <span>Return to Sign In</span>
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6 text-center">
              Enter the work email associated with your GuideLayer account and we will dispatch a secure 1-hour reset link.
            </p>

            {error && (
              <div className="mb-5 p-3 rounded-sm bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-sm border border-slate-200 focus:outline-none focus:border-column-navy text-xs font-mono"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-sm bg-column-navy hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <span>{loading ? 'Dispatching...' : 'Send Reset Link'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-500">
                Remember your password?{' '}
                <Link href="/login" className="font-semibold text-column-navy hover:underline">
                  Sign in
                </Link>
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
