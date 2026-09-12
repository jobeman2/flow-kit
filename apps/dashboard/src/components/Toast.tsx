'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: { type: ToastType; message: string; title?: string; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, message, title, duration = 5000 }: { type: ToastType; message: string; title?: string; duration?: number }) => {
      const id = 'toast_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      const newToast: ToastItem = { id, type, message, title, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback((message: string, title?: string) => toast({ type: 'success', message, title }), [toast]);
  const error = useCallback((message: string, title?: string) => toast({ type: 'error', message, title }), [toast]);
  const info = useCallback((message: string, title?: string) => toast({ type: 'info', message, title }), [toast]);
  const warning = useCallback((message: string, title?: string) => toast({ type: 'warning', message, title }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning, dismiss }}>
      {children}

      {/* Top-Right Notification Container */}
      <aside
        aria-live="polite"
        aria-atomic="true"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="alert"
            className="pointer-events-auto transform transition-all duration-300 ease-out animate-in slide-in-from-top-4 fade-in shadow-xl rounded-sm border bg-white overflow-hidden"
            style={{
              borderColor:
                item.type === 'error'
                  ? '#FECDD3'
                  : item.type === 'success'
                  ? '#A7F3D0'
                  : item.type === 'warning'
                  ? '#FED7AA'
                  : '#E2E8F0',
            }}
          >
            {/* Top Accent Line */}
            <div
              className={`h-0.5 w-full ${
                item.type === 'error'
                  ? 'bg-rose-500'
                  : item.type === 'success'
                  ? 'bg-emerald-500'
                  : item.type === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-column-navy'
              }`}
            />

            <div className="p-3.5 flex items-start space-x-3">
              <div className="shrink-0 mt-0.5">
                {item.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                {item.type === 'info' && <Info className="w-4 h-4 text-column-navy" />}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                {item.title && (
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight mb-0.5">
                    {item.title}
                  </h4>
                )}
                <p className="text-xs text-slate-600 leading-relaxed font-sans break-words">
                  {item.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
                aria-label="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
