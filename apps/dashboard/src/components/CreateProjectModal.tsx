'use client';

import React, { useState } from 'react';
import { X, Plus, FolderDot, Globe2, Sparkles } from 'lucide-react';
import { apiFetch, setActiveProjectId } from '@/lib/api';
import { useToast } from '@/components/Toast';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (newProject: any) => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const domains = domain
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);

      const newProj = await apiFetch('/v1/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          domains,
        }),
      });

      if (newProj && newProj.id) {
        setActiveProjectId(newProj.id);
        toast.success(`Project "${newProj.name}" created successfully!`, 'Project Created');
        onProjectCreated(newProj);
        setName('');
        setDomain('');
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project', 'Creation Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-sm border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center text-white">
              <FolderDot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Create New Project</h3>
              <p className="text-[11px] text-slate-500">Each project gets its own API keys & walkthroughs.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Customer Portal or My Shop"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-slate-800"
              autoFocus
            />
            <p className="text-[10px] text-slate-400 mt-1">
              A friendly name to identify this website or web app in your dashboard.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Allowed Domains (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. app.mycompany.com, localhost:3000"
                className="w-full pl-8 pr-3 py-2 text-xs font-mono border border-slate-200 rounded-sm focus:outline-none focus:border-slate-800"
              />
              <Globe2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Comma-separated list of domains allowed to embed this project's walkthroughs.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-sm border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-slate-600" />
              <span>What happens next:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500 text-[10px]">
              <li>Generates dedicated <code className="text-slate-700">pk_live_*</code> and <code className="text-slate-700">pk_test_*</code> API keys.</li>
              <li>Provisions a multilingual starter onboarding guide.</li>
              <li>Isolates all analytics and tour configurations for this website.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-sm border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
