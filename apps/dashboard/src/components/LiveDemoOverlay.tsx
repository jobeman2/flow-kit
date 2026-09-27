'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';

export interface TourDemoStep {
  targetSelector: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  badge?: string;
  langTag?: string;
}

interface LiveDemoOverlayProps {
  isOpen: boolean;
  steps: TourDemoStep[];
  tourTitle?: string;
  onClose: () => void;
  showProgressDots?: boolean;
}

export default function LiveDemoOverlay({
  isOpen,
  steps,
  tourTitle = 'Interactive Demo',
  onClose,
  showProgressDots = true,
}: LiveDemoOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; placement: string }>({
    top: 0,
    left: 0,
    placement: 'bottom',
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStepIndex];

  // Update target bounding box and position popover
  const updatePosition = useCallback(() => {
    if (!isOpen || !step) return;

    const el = document.querySelector(step.targetSelector);
    if (!el) {
      // If target selector not found, fallback to viewport center
      setTargetRect(null);
      setPopoverPos({
        top: window.innerHeight / 2 - 120,
        left: Math.max(16, window.innerWidth / 2 - 180),
        placement: 'center',
      });
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect(rect);

    // Scroll element into view smoothly if out of viewport
    const isInView =
      rect.top >= 60 &&
      rect.bottom <= window.innerHeight - 60 &&
      rect.left >= 0 &&
      rect.right <= window.innerWidth;

    if (!isInView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Determine best placement
    const popoverWidth = 340;
    const popoverHeight = 180;
    const padding = 14;

    let placement = step.placement || 'bottom';
    let top = 0;
    let left = 0;

    if (placement === 'bottom') {
      top = rect.bottom + padding;
      left = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, rect.left + rect.width / 2 - popoverWidth / 2));
      // Flip to top if overflowing bottom
      if (top + popoverHeight > window.innerHeight && rect.top > popoverHeight + padding) {
        placement = 'top';
        top = rect.top - popoverHeight - padding;
      }
    } else if (placement === 'top') {
      top = rect.top - popoverHeight - padding;
      left = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, rect.left + rect.width / 2 - popoverWidth / 2));
      if (top < 16 && rect.bottom + popoverHeight + padding < window.innerHeight) {
        placement = 'bottom';
        top = rect.bottom + padding;
      }
    } else if (placement === 'right') {
      top = Math.max(16, Math.min(window.innerHeight - popoverHeight - 16, rect.top + rect.height / 2 - popoverHeight / 2));
      left = rect.right + padding;
      if (left + popoverWidth > window.innerWidth) {
        placement = 'bottom';
        top = rect.bottom + padding;
        left = Math.max(16, rect.left);
      }
    } else {
      // left
      top = Math.max(16, Math.min(window.innerHeight - popoverHeight - 16, rect.top + rect.height / 2 - popoverHeight / 2));
      left = rect.left - popoverWidth - padding;
      if (left < 16) {
        placement = 'bottom';
        top = rect.bottom + padding;
        left = Math.max(16, rect.left);
      }
    }

    setPopoverPos({ top, left, placement });
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setTargetRect(null);
      return;
    }

    updatePosition();

    const handleScrollOrResize = () => {
      requestAnimationFrame(updatePosition);
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize);
    };
  }, [isOpen, currentStepIndex, updatePosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, steps.length, onClose]);

  if (!isOpen || !step) return null;

  const totalSteps = steps.length;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  // Spotlight Cutout calculation with 6px padding
  const pad = 6;
  const cutX = targetRect ? Math.max(0, targetRect.left - pad) : 0;
  const cutY = targetRect ? Math.max(0, targetRect.top - pad) : 0;
  const cutW = targetRect ? targetRect.width + pad * 2 : 0;
  const cutH = targetRect ? targetRect.height + pad * 2 : 0;

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-auto">
      {/* SVG Mask Spotlight */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="fk-spotlight-mask">
            {/* White backdrop */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout over target element */}
            {targetRect && (
              <rect
                x={cutX}
                y={cutY}
                width={cutW}
                height={cutH}
                rx="8"
                ry="8"
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>

        {/* Dimmed backdrop layer with mask */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(11, 27, 52, 0.68)"
          mask="url(#fk-spotlight-mask)"
          onClick={onClose}
          className="cursor-pointer"
        />

        {/* Target highlight ring */}
        {targetRect && (
          <rect
            x={cutX}
            y={cutY}
            width={cutW}
            height={cutH}
            rx="8"
            ry="8"
            fill="none"
            stroke="#00D4B2"
            strokeWidth="2"
            className="transition-all duration-300 ease-out"
          />
        )}
      </svg>

      {/* Popover Card */}
      <div
        ref={popoverRef}
        style={{
          position: 'fixed',
          top: `${popoverPos.top}px`,
          left: `${popoverPos.left}px`,
          width: '340px',
        }}
        className="z-[100000] bg-white rounded-xl shadow-2xl border border-slate-200/90 p-5 text-slate-800 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-column-navy border border-slate-200">
              {step.badge || `${currentStepIndex + 1} of ${totalSteps}`}
            </span>
            {step.langTag && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {step.langTag}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close demo (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Title */}
        <h4 className="text-sm font-bold text-column-navy tracking-tight mb-1.5">
          {step.title}
        </h4>

        {/* Step Description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          {step.description}
        </p>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {/* Dots Indicator */}
          {showProgressDots && totalSteps > 1 ? (
            <div className="flex items-center space-x-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStepIndex(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === currentStepIndex
                      ? 'w-5 bg-column-navy'
                      : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          ) : (
            <span className="text-[10px] font-mono text-slate-400">Esc to close</span>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {!isFirst && (
              <button
                onClick={() => setCurrentStepIndex((i) => Math.max(0, i - 1))}
                className="inline-flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-column-navy px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={() => {
                if (isLast) {
                  onClose();
                } else {
                  setCurrentStepIndex((i) => i + 1);
                }
              }}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-white bg-column-navy hover:bg-slate-800 px-3.5 py-1.5 rounded-md shadow-xs transition-all cursor-pointer"
            >
              <span>{isLast ? 'Finish Tour' : 'Next'}</span>
              {isLast ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
