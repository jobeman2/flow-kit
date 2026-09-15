'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface DangerConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  /** The name the user must type to confirm */
  confirmName: string;
  title: string;
  description: React.ReactNode;
  /** Label on the confirm button */
  confirmLabel?: string;
  /** What the user is deleting (shown in instruction) */
  resourceType?: string;
}

export default function DangerConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  confirmName,
  title,
  description,
  confirmLabel = 'I understand, delete this',
  resourceType = 'resource',
}: DangerConfirmModalProps) {
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isMatch = typed === confirmName;

  const handleConfirm = async () => {
    if (!isMatch) return;
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      setTyped('');
    }
  };

  const handleClose = () => {
    setTyped('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-sm border border-slate-200 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-sm bg-rose-100 flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-sm hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Warning banner */}
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-sm text-[11px] text-rose-800 leading-relaxed">
            <span className="font-bold block mb-0.5">This action cannot be undone.</span>
            {description}
          </div>

          {/* Confirmation input */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              To confirm, type{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-rose-700 font-mono text-[11px] font-semibold select-all">
                {confirmName}
              </code>{' '}
              below:
            </label>
            <input
              type="text"
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isMatch && handleConfirm()}
              placeholder={confirmName}
              className={`w-full px-3 py-2 text-xs font-mono border rounded-sm focus:outline-none transition-colors ${
                typed.length > 0 && !isMatch
                  ? 'border-rose-300 bg-rose-50 text-rose-900 focus:border-rose-500'
                  : isMatch
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-900 focus:border-emerald-500'
                  : 'border-slate-200 focus:border-slate-400'
              }`}
            />
            {typed.length > 0 && !isMatch && (
              <p className="text-[10px] text-rose-600 mt-1">
                Name doesn&apos;t match. Please type exactly: <strong>{confirmName}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 px-5 pb-5">
          <button
            onClick={handleClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-sm cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isMatch || loading}
            className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-sm flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Deleting...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
