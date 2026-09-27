'use client';

import React, { useState } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';

interface ContextualBeaconProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  badge?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export default function ContextualBeacon({
  title,
  description,
  actionLabel = 'Learn more',
  onAction,
  badge = 'New Feature',
  placement = 'bottom',
}: ContextualBeaconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="relative inline-flex items-center">
      {/* Pulsing Beacon Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-5 h-5 rounded-full cursor-pointer focus:outline-none"
        title="Click to view hint"
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-column-cyan opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-column-cyan border-2 border-white shadow-xs" />
      </button>

      {/* Floating Micro-Card Popover */}
      {isOpen && (
        <div
          className={`absolute z-[1000] w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 text-slate-800 animate-in fade-in zoom-in-95 duration-150 ${
            placement === 'bottom'
              ? 'top-7 left-1/2 -translate-x-1/2'
              : placement === 'top'
              ? 'bottom-7 left-1/2 -translate-x-1/2'
              : placement === 'left'
              ? 'right-7 top-1/2 -translate-y-1/2'
              : 'left-7 top-1/2 -translate-y-1/2'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-50 text-column-navy border border-cyan-200">
              <Sparkles className="w-2.5 h-2.5 text-column-cyan" />
              <span>{badge}</span>
            </span>

            <button
              onClick={() => {
                setIsOpen(false);
                setIsDismissed(true);
              }}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
              title="Dismiss hint"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Content */}
          <h5 className="text-xs font-bold text-column-navy mb-1">{title}</h5>
          <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
            {description}
          </p>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              Dismiss
            </button>

            {onAction && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onAction();
                }}
                className="inline-flex items-center space-x-1 text-[11px] font-semibold text-column-navy hover:text-slate-900 transition-colors cursor-pointer"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
