'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle2, RefreshCw, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { apiFetch, setAuthTokens } from '@/lib/api';
import { useToast } from '@/components/Toast';

function VerifyEmailContent() {
  const { error: toastError, success: toastSuccess } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const rawEmailParam = searchParams.get('email') || '';
  // Support both encoded and unencoded emails safely
  const emailParam = rawEmailParam.includes('%') ? decodeURIComponent(rawEmailParam) : rawEmailParam;

  // OTP inputs state: 6 separate character slots
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [email, setEmail] = useState(emailParam);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendCountdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => {
      setResendCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Handle URL token verification fallback (if user clicked an email link directly)
  useEffect(() => {
    if (!token) return;

    setVerifying(true);
    apiFetch('/v1/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        setVerified(true);
        if (res.accessToken) {
          setAuthTokens(res.accessToken, res.refreshToken);
        }
      })
      .catch((err) => {
        setError(err.message || 'Verification link is invalid or has expired.');
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [token]);

  // Auto-focus first input on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);
    setError(null);

    // Auto-advance to next input
    if (char && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits are entered
    const completeCode = updated.join('');
    if (completeCode.length === 6) {
      submitOtp(completeCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || '';
    }
    setOtpDigits(updated);

    const targetFocus = Math.min(pasted.length, 5);
    inputRefs.current[targetFocus]?.focus();

    if (pasted.length === 6) {
      submitOtp(pasted);
    }
  };

  const submitOtp = async (code: string) => {
    if (!email) {
      setError('Please provide your account email address.');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const res = await apiFetch('/v1/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          otp: code,
        }),
      });

      setVerified(true);
      toastSuccess('Identity verified successfully. Welcome to GuideLayer!', 'Verified');
      if (res.accessToken) {
        setAuthTokens(res.accessToken, res.refreshToken);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Invalid or expired 6-digit confirmation code.';
      setError(errMsg);
      toastError(errMsg, 'Verification Failed');
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || !canResend) return;

    setResending(true);
    setResendMessage(null);
    setError(null);

    try {
      const res = await apiFetch('/v1/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      const successMsg = res.message || 'Fresh 6-digit code has been dispatched to your email.';
      setResendMessage(successMsg);
      toastSuccess(successMsg, 'Code Dispatched');
      setCanResend(false);
      setResendCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const errMsg = err.message || 'Unable to resend confirmation code.';
      setError(errMsg);
      toastError(errMsg, 'Resend Failed');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 font-sans">
      
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-slate-500 hover:text-column-navy transition-colors"
        >
          <span>&larr;</span>
          <span>RETURN TO GUIDELAYER HOME</span>
        </Link>
      </div>

      <div className="max-w-md w-full bg-white rounded-sm shadow-xl border border-slate-200 p-8">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-9 h-9 rounded-sm bg-column-navy flex items-center justify-center text-white font-mono text-xs font-bold mb-3 shadow-xs">
            GL
          </div>
          <h1 className="text-xl font-bold tracking-tight text-column-navy">
            Confirmation Code
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-1">
            // IDENTITY VERIFICATION PROTOCOL
          </p>
        </div>

        {/* State 1: Verification Successful */}
        {verified ? (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-column-navy mb-2">
              Identity Verified Successfully
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Your account is fully activated. You can now configure walkthroughs, provision API keys, and monitor retention.
            </p>
            <Link
              href="/console"
              className="w-full inline-flex items-center justify-center space-x-2 text-xs font-semibold text-white bg-column-navy hover:bg-slate-800 py-2.5 px-4 rounded-sm transition-colors shadow-xs"
            >
              <span>Continue to Workspace Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-xs text-slate-600 leading-relaxed text-center mb-6">
              We dispatched a 6-digit confirmation code to{' '}
              <span className="font-semibold text-column-navy font-mono">
                {email || 'your email'}
              </span>
              . Enter the code below to activate your workspace.
            </p>

            {/* Email Address Confirmation Input (if not passed in params) */}
            {!emailParam && (
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 rounded-sm border border-slate-200 focus:outline-none focus:border-column-navy text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* 6-Digit OTP Box Grid */}
            <div className="mb-6">
              <label className="block text-[11px] font-semibold text-slate-700 text-center mb-2">
                ENTER 6-DIGIT CODE
              </label>
              <div className="flex items-center justify-between gap-2">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    disabled={verifying}
                    className="w-11 h-13 text-center font-mono text-xl font-bold rounded-sm border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-column-navy focus:outline-none transition-all text-column-navy shadow-inner"
                  />
                ))}
              </div>
            </div>



            {/* Manual Verify Button */}
            <button
              type="button"
              onClick={() => submitOtp(otpDigits.join(''))}
              disabled={verifying || otpDigits.join('').length < 6}
              className="w-full py-2.5 px-4 rounded-sm bg-column-navy hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-40 cursor-pointer shadow-xs"
            >
              {verifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Confirm Code & Sign In</span>
                </>
              )}
            </button>

            {/* Resend OTP Section */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Didn&apos;t receive the code?</span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="font-semibold text-column-navy hover:underline cursor-pointer"
                >
                  {resending ? 'Sending...' : 'Resend Code'}
                </button>
              ) : (
                <span className="font-mono text-slate-400">
                  Resend in {resendCountdown}s
                </span>
              )}
            </div>

            {/* Developer Notice for Local Testing */}
            <div className="mt-5 p-3 bg-slate-50 rounded-sm border border-slate-200 text-[11px] text-slate-600 font-mono">
              <div className="flex items-center space-x-1.5 font-bold text-slate-700 mb-1">
                <KeyRound className="w-3 h-3 text-slate-600" />
                <span>LOCAL DEV ENVIRONMENT</span>
              </div>
              <p className="leading-normal text-slate-500">
                Check terminal logs for <code className="text-slate-800 font-bold">[VERIFICATION OTP]</code> to copy the live 6-digit code.
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/login" className="text-xs text-slate-500 hover:text-column-navy underline">
                Return to sign in
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-mono text-slate-500">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
