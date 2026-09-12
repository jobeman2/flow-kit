'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import { apiFetch } from '@/lib/api';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(token ? null : 'Missing password reset token in URL.');

  const passwordMeetsLength = password.length >= 8;
  const passwordsMatch = password && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Password reset token is missing from your link.');
      return;
    }
    if (!passwordMeetsLength) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiFetch('/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Unable to reset password. The link may have expired.');
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
            Set New Password
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-1">
            // CREDENTIAL RESET PROTOCOL
          </p>
        </div>

        {success ? (
          <div className="py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-column-navy mb-2">
              Password Reset Complete
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Your new password has been updated and all previous sessions have been invalidated across all workstations for security.
            </p>
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center space-x-2 text-xs font-semibold text-white bg-column-navy hover:bg-slate-800 py-2.5 px-4 rounded-sm transition-colors shadow-xs"
            >
              <span>Sign In with New Password</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div>
            {error && (
              <div className="mb-5 p-3 rounded-sm bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-sm border border-slate-200 focus:outline-none focus:border-column-navy text-xs"
                    placeholder="At least 8 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-sm border border-slate-200 focus:outline-none focus:border-column-navy text-xs"
                    placeholder="Repeat your new password"
                  />
                </div>
              </div>

              {/* Requirement Checklist */}
              <div className="space-y-1 text-[11px] font-mono text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <span className={`w-3 h-3 flex items-center justify-center rounded-xs ${passwordMeetsLength ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {passwordMeetsLength ? <Check className="w-2.5 h-2.5" /> : '•'}
                  </span>
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className={`w-3 h-3 flex items-center justify-center rounded-xs ${passwordsMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {passwordsMatch ? <Check className="w-2.5 h-2.5" /> : '•'}
                  </span>
                  <span>Passwords match</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full mt-2 py-2.5 px-4 rounded-sm bg-column-navy hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-500">
                Cancel reset?{' '}
                <Link href="/login" className="font-semibold text-column-navy hover:underline">
                  Back to sign in
                </Link>
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-mono text-slate-500">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
