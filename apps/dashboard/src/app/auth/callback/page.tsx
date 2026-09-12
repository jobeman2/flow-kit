'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, setAuthTokens } from '@/lib/api';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(errorParam);

  useEffect(() => {
    if (errorParam) {
      setError(`Google authorization failed: ${errorParam}`);
      setLoading(false);
      return;
    }

    if (!code) {
      setError('No authorization code provided in callback.');
      setLoading(false);
      return;
    }

    apiFetch('/v1/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
      .then((res) => {
        if (res.accessToken) {
          setAuthTokens(res.accessToken, res.refreshToken);
          router.push('/console');
        } else {
          setError('Session tokens not returned.');
          setLoading(false);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to complete Google authentication.');
        setLoading(false);
      });
  }, [code, errorParam, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-sm shadow-xl border border-slate-200 p-8 text-center">
        <div className="w-9 h-9 rounded-sm bg-column-navy flex items-center justify-center text-white font-mono text-xs font-bold mb-4 mx-auto shadow-xs">
          GL
        </div>

        {loading && (
          <div className="py-6">
            <RefreshCw className="w-8 h-8 text-column-navy animate-spin mx-auto mb-4" />
            <h2 className="text-sm font-semibold text-slate-800 mb-1">
              Authenticating with Google...
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              // VALIDATING OAUTH BEARER CREDENTIALS
            </p>
          </div>
        )}

        {error && (
          <div className="py-4">
            <div className="p-3 rounded-sm bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2 text-left mb-6">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <Link
              href="/login"
              className="inline-block w-full py-2.5 px-4 rounded-sm bg-column-navy text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-mono text-slate-500">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
