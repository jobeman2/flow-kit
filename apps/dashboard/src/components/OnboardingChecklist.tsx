'use client';

import React, { useState, useEffect } from 'react';
import { Check, ChevronUp, ChevronDown, Sparkles, X, ArrowRight, Play, RotateCcw } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  title: string;
  duration?: string;
  action: () => void;
  completed?: boolean;
}

interface OnboardingChecklistProps {
  items: ChecklistItem[];
  title?: string;
  subtitle?: string;
  storageKey?: string;
}

export default function OnboardingChecklist({
  items,
  title = 'Getting Started with Flow-Kit',
  subtitle = 'Complete these quick steps to master product walkthroughs',
  storageKey = 'fk_checklist_progress',
}: OnboardingChecklistProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);

  // Load completed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCompletedIds(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
  }, [storageKey]);

  // Save completed state
  const markCompleted = (id: string) => {
    setCompletedIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const resetProgress = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedIds([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  };

  if (isDismissed) return null;

  const total = items.length;
  const completedCount = items.filter((item) => completedIds.includes(item.id)).length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const isAllCompleted = completedCount === total && total > 0;

  return (
    <div className="fixed bottom-5 right-5 z-[99998] font-sans antialiased">
      {/* Expanded Checklist Card */}
      {isOpen && (
        <div className="mb-3 w-[350px] max-w-[calc(100vw-32px)] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 text-slate-800">
          
          {/* Card Header */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-200">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-column-navy flex items-center justify-center text-column-cyan">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-column-navy tracking-tight leading-tight">
                    {title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {completedCount} of {total} completed ({percent}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                  title="Minimize"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsDismissed(true)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                  title="Dismiss checklist"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2.5">
              <div
                className="h-full bg-column-navy transition-all duration-500 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="p-2 divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {items.map((item, index) => {
              const done = completedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    markCompleted(item.id);
                    item.action();
                  }}
                  className={`group p-3 flex items-center justify-between rounded-lg transition-all cursor-pointer hover:bg-slate-50 ${
                    done ? 'opacity-70 bg-slate-50/50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    {/* Checkbox Icon */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                        done
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xs'
                          : 'border-slate-300 group-hover:border-column-navy bg-white'
                      }`}
                    >
                      {done ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-column-navy">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Item Title */}
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-medium tracking-tight truncate ${
                          done ? 'line-through text-slate-400' : 'text-slate-700 group-hover:text-column-navy'
                        }`}
                      >
                        {item.title}
                      </p>
                      {item.duration && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-slate-400 group-hover:text-column-navy transition-transform group-hover:translate-x-0.5">
                    {done ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Play className="w-3 h-3 text-slate-400 group-hover:text-column-navy" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
            {isAllCompleted ? (
              <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>All steps completed!</span>
              </span>
            ) : (
              <span>Click any step to launch tour</span>
            )}

            {completedCount > 0 && (
              <button
                onClick={resetProgress}
                className="text-slate-400 hover:text-slate-700 flex items-center space-x-1 transition-colors cursor-pointer"
                title="Reset completed items"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Pill Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center space-x-2.5 px-4 py-2.5 bg-column-navy hover:bg-slate-900 text-white rounded-full shadow-lg hover:shadow-xl border border-slate-700 transition-all duration-200 cursor-pointer"
      >
        <div className="relative">
          <div className="w-5 h-5 rounded-full bg-column-cyan/20 flex items-center justify-center text-column-cyan">
            <Sparkles className="w-3 h-3" />
          </div>
          {percent > 0 && percent < 100 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-column-cyan animate-pulse" />
          )}
        </div>

        <div className="flex items-baseline space-x-1.5 text-xs font-semibold tracking-tight">
          <span>Get Started</span>
          <span className="text-[11px] font-mono text-slate-300 font-normal">
            ({completedCount}/{total})
          </span>
        </div>

        <div className="text-slate-400 group-hover:text-white transition-colors">
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </div>
      </button>
    </div>
  );
}
