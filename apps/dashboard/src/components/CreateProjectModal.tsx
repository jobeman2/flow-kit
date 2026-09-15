'use client';

import React, { useState } from 'react';
import { X, Plus, FolderDot, Globe2, Sparkles, Layers, ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch, setActiveProjectId, getActiveProjectId } from '@/lib/api';
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
  const router = useRouter();
  const toast = useToast();

  // Step 1: Project details
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdProject, setCreatedProject] = useState<any>(null);

  // Step 2: First walkthrough
  const [tourTitle, setTourTitle] = useState('');
  const [tourUrl, setTourUrl] = useState('*');
  const [creatingTour, setCreatingTour] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setName('');
    setDomain('');
    setCreatedProject(null);
    setTourTitle('');
    setTourUrl('*');
    onClose();
  };

  // STEP 1: Create the project
  const handleCreateProject = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ name: name.trim(), domains }),
      });

      if (newProj && newProj.id) {
        setActiveProjectId(newProj.id);
        setCreatedProject(newProj);
        onProjectCreated(newProj);
        setTourTitle(`${name.trim()} Welcome Tour`);
        setStep(2); // Move to step 2
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Create the first walkthrough
  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdProject || !tourTitle.trim()) return;

    setCreatingTour(true);
    try {
      const newTour = await apiFetch(`/v1/projects/${createdProject.id}/tours`, {
        method: 'POST',
        body: JSON.stringify({
          title: tourTitle.trim(),
          targetUrlPattern: tourUrl || '*',
          defaultLocale: 'en',
          steps: [
            {
              stepIndex: 1,
              targetSelector: 'body',
              placement: 'CENTER',
              i18n: {
                en: {
                  title: `Welcome to ${createdProject.name}!`,
                  content: 'This is your first step. Click Edit in Tour Studio to customize it.',
                  nextBtn: 'Next',
                },
              },
            },
          ],
        }),
      });

      toast.success(`Walkthrough "${tourTitle}" created!`, 'Tour Created');
      handleClose();
      // Navigate directly into the tour studio to start editing
      router.push(`/tours/${newTour.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create walkthrough', 'Error');
    } finally {
      setCreatingTour(false);
    }
  };

  // STEP 2: Skip tour creation, just go to dashboard
  const handleSkipTour = () => {
    toast.success(`Project "${createdProject?.name}" is ready!`, 'Project Created');
    handleClose();
    router.push('/tours');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-sm border border-slate-200 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-150">

        {/* Progress indicator */}
        <div className="flex items-center px-6 pt-5 pb-0 space-x-2">
          <div className={`flex items-center space-x-1.5 text-[11px] font-semibold ${step === 1 ? 'text-slate-900' : 'text-emerald-600'}`}>
            {step === 2 ? (
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-bold">1</div>
            )}
            <span>Create Project</span>
          </div>
          <div className="flex-1 h-px bg-slate-200" />
          <div className={`flex items-center space-x-1.5 text-[11px] font-semibold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${step === 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
            <span>Add Walkthrough</span>
          </div>
        </div>

        {/* ---- STEP 1: Create Project ---- */}
        {step === 1 && (
          <form onSubmit={handleCreateProject} className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center text-white">
                  <FolderDot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Create New Project</h3>
                  <p className="text-[11px] text-slate-500">One project per website or app.</p>
                </div>
              </div>
              <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Shop or Customer Portal"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-slate-800"
                autoFocus
              />
              <p className="text-[10px] text-slate-400 mt-1">A name to identify this website in your dashboard.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Allowed Domains <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. myapp.com, localhost:3000"
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono border border-slate-200 rounded-sm focus:outline-none focus:border-slate-800"
                />
                <Globe2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Comma-separated. Leave empty to allow all domains.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-sm border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-slate-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>What gets created automatically:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                <li>Unique <code className="text-slate-700">pk_live_*</code> and <code className="text-slate-700">pk_test_*</code> API keys</li>
                <li>Isolated tour & analytics configuration</li>
              </ul>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={handleClose} className="px-3.5 py-1.5 rounded-sm border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="px-4 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <span>{loading ? 'Creating...' : 'Continue'}</span>
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </form>
        )}

        {/* ---- STEP 2: Create First Walkthrough ---- */}
        {step === 2 && (
          <form onSubmit={handleCreateTour} className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-sm bg-emerald-500 flex items-center justify-center text-white">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Create First Walkthrough</h3>
                  <p className="text-[11px] text-slate-500">
                    For <span className="font-semibold text-slate-700">{createdProject?.name}</span>
                  </p>
                </div>
              </div>
              <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm text-[11px] text-emerald-800 flex items-center space-x-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
              <span>Project created! Now add your first walkthrough to guide users on your website.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Walkthrough Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={tourTitle}
                onChange={(e) => setTourTitle(e.target.value)}
                placeholder="e.g. Welcome Tour or Onboarding Guide"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-slate-800"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Show on which pages?
              </label>
              <input
                type="text"
                value={tourUrl}
                onChange={(e) => setTourUrl(e.target.value)}
                placeholder="* (all pages) or /dashboard or /checkout"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-sm focus:outline-none focus:border-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Use <code className="text-slate-600">*</code> for all pages, or a path like <code className="text-slate-600">/dashboard</code> for specific pages.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSkipTour}
                className="px-3 py-1.5 rounded-sm text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={creatingTour || !tourTitle.trim()}
                className="px-4 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{creatingTour ? 'Creating...' : 'Create & Open Studio'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
