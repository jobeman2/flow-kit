'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Globe2,
  Eye,
  Sliders,
  Sparkles,
  Layers,
  HelpCircle,
  Play,
  Copy,
  ExternalLink,
  Crosshair,
  MousePointerClick,
  Check,
} from 'lucide-react';
import { apiFetch, getActiveProjectId } from '@/lib/api';

export default function TourStudioPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.id as string;

  const [tour, setTour] = useState<any>(null);
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(0);
  const [activeLocale, setActiveLocale] = useState<string>('en');
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showInspectorModal, setShowInspectorModal] = useState(false);
  const [copiedInspector, setCopiedInspector] = useState(false);

  const loadTour = async () => {
    try {
      const activeProjectId = getActiveProjectId();
      if (!activeProjectId) return;
      const data = await apiFetch(`/v1/projects/${activeProjectId}/tours/${tourId}`);
      setTour(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTour();
  }, [tourId]);

  const inspectorSnippet = `(() => {
  if (window.__flowkit_inspector) return;
  window.__flowkit_inspector = true;
  const o = document.createElement('div');
  o.style.cssText = 'position:fixed;pointer-events:none;z-index:999999;border:2px dashed #2563eb;background:rgba(37,99,235,0.12);transition:all 0.05s ease;display:none;';
  const b = document.createElement('div');
  b.style.cssText = 'position:fixed;z-index:1000000;background:#0f172a;color:#fff;font-family:monospace;font-size:11px;padding:3px 8px;border-radius:4px;box-shadow:0 4px 6px rgba(0,0,0,0.3);pointer-events:none;display:none;';
  document.body.appendChild(o);
  document.body.appendChild(b);
  function getSel(el) {
    if (el.id) return '#' + el.id;
    for (const a of ['data-tour', 'data-testid', 'data-id', 'role']) {
      if (el.getAttribute(a)) return '[' + a + '="' + el.getAttribute(a) + '"]';
    }
    let s = el.tagName.toLowerCase();
    if (el.className && typeof el.className === 'string') {
      const c = el.className.trim().split(/\\s+/).filter(x => !x.includes(':') && x.length < 20)[0];
      if (c) s += '.' + c;
    }
    return s;
  }
  function onMove(e) {
    const el = e.target;
    if (el === o || el === b) return;
    const r = el.getBoundingClientRect();
    o.style.display = 'block'; o.style.top = r.top + 'px'; o.style.left = r.left + 'px';
    o.style.width = r.width + 'px'; o.style.height = r.height + 'px';
    const sel = getSel(el);
    b.style.display = 'block'; b.style.top = Math.max(4, r.top - 26) + 'px'; b.style.left = Math.max(4, r.left) + 'px';
    b.innerText = sel + ' (Click to copy)';
  }
  function onClick(e) {
    e.preventDefault(); e.stopPropagation();
    const sel = getSel(e.target);
    navigator.clipboard.writeText(sel);
    b.innerText = 'Copied: ' + sel;
    setTimeout(() => {
      o.remove(); b.remove();
      window.__flowkit_inspector = false;
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClick, true);
    }, 600);
  }
  document.addEventListener('mousemove', onMove, true);
  document.addEventListener('click', onClick, true);
  console.log('[Flow-Kit] Element Inspector active. Click any element on page.');
})();`;

  if (!tour) {
    return (
      <div className="p-12 text-center text-xs text-stone-500 font-medium">
        Loading Tour Studio...
      </div>
    );
  }

  const currentStep = tour.steps[selectedStepIdx] || null;

  const handleUpdateStep = (key: string, value: any) => {
    const updatedSteps = [...tour.steps];
    updatedSteps[selectedStepIdx] = {
      ...updatedSteps[selectedStepIdx],
      [key]: value,
    };
    setTour({ ...tour, steps: updatedSteps });
    setHasUnsavedChanges(true);
  };

  const handleUpdateI18n = (field: string, value: string) => {
    const updatedSteps = [...tour.steps];
    const currentI18n = updatedSteps[selectedStepIdx].i18n || {};
    const localeI18n = currentI18n[activeLocale] || {};

    updatedSteps[selectedStepIdx].i18n = {
      ...currentI18n,
      [activeLocale]: {
        ...localeI18n,
        [field]: value,
      },
    };
    setTour({ ...tour, steps: updatedSteps });
    setHasUnsavedChanges(true);
  };

  const handleAddStep = () => {
    const newIndex = tour.steps.length + 1;
    const newStep = {
      stepIndex: newIndex,
      targetSelector: '#action-button',
      placement: 'BOTTOM',
      i18n: {
        en: {
          title: `Step ${newIndex} Title`,
          content: 'Describe what action the user should take here.',
          nextBtn: 'Next',
          backBtn: 'Back',
        },
        am: {
          title: `ደረጃ ${newIndex} ርዕስ`,
          content: 'ተጠቃሚው እዚህ ምን አይነት እርምጃ መውሰድ እንዳለበት ያብራሩ።',
          nextBtn: 'ቀጣይ',
          backBtn: 'ተመለስ',
        },
        om: {
          title: `Sadarkaa ${newIndex}`,
          content: 'Fayyadamaan tarkaanfii akkamii akka fudhatu asitti ibsaa.',
          nextBtn: 'Itti Aana',
          backBtn: 'Duubatti',
        },
      },
    };
    setTour({ ...tour, steps: [...tour.steps, newStep] });
    setSelectedStepIdx(tour.steps.length);
    setHasUnsavedChanges(true);
  };

  const handleDeleteStep = (idx: number) => {
    if (tour.steps.length <= 1) {
      alert('A walkthrough must contain at least 1 step.');
      return;
    }
    const updatedSteps = tour.steps.filter((_: any, i: number) => i !== idx);
    const reindexed = updatedSteps.map((s: any, i: number) => ({ ...s, stepIndex: i + 1 }));
    setTour({ ...tour, steps: reindexed });
    setSelectedStepIdx(Math.max(0, idx - 1));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const activeProjectId = getActiveProjectId();
      if (!activeProjectId) return;
      await apiFetch(`/v1/projects/${activeProjectId}/tours/${tourId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: tour.title,
          targetUrlPattern: tour.targetUrlPattern,
          defaultLocale: tour.defaultLocale,
          isDismissable: tour.isDismissable,
          allowBackdropClick: tour.allowBackdropClick,
          steps: tour.steps,
        }),
      });
      setHasUnsavedChanges(false);
      loadTour();
    } catch (err: any) {
      alert(err.message || 'Error saving walkthrough');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const activeProjectId = getActiveProjectId();
    if (!activeProjectId) return;
    await apiFetch(`/v1/projects/${activeProjectId}/tours/${tourId}/publish`, {
      method: 'POST',
    });
    loadTour();
  };

  const stepI18n =
    currentStep?.i18n?.[activeLocale] ||
    currentStep?.i18n?.[tour.defaultLocale] ||
    currentStep?.i18n?.en ||
    {};

  return (
    <div className="space-y-5">
      
      {/* 1. STUDIO HEADER */}
      <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/tours"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tour.title}
                onChange={(e) => {
                  setTour({ ...tour, title: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="font-bold text-slate-900 text-base border-b border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none transition-colors"
              />
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                  tour.status === 'PUBLISHED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {tour.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Slug: <span className="text-slate-700">{tour.slug}</span> • URL Pattern:{' '}
              <input
                type="text"
                value={tour.targetUrlPattern}
                onChange={(e) => {
                  setTour({ ...tour, targetUrlPattern: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="text-[11px] text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded-sm font-mono border border-slate-200 focus:outline-none"
              />
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {tour.status !== 'PUBLISHED' && (
            <button
              onClick={handlePublish}
              className="px-3 py-1.5 rounded-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border border-emerald-200"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Publish Live</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
          </button>
        </div>
      </div>

      {/* 2. THREE-PANEL STUDIO WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Panel: Step Timeline (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-sm border border-slate-200 shadow-xs p-4 h-fit">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Steps ({tour.steps.length})
            </span>
            <button
              onClick={handleAddStep}
              className="px-2 py-1 rounded-sm bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer border border-slate-200"
            >
              <Plus className="w-3 h-3" />
              <span>Add Step</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {tour.steps.map((step: any, idx: number) => {
              const isSelected = idx === selectedStepIdx;
              const title = step.i18n?.[activeLocale]?.title || step.i18n?.en?.title || `Step ${idx + 1}`;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedStepIdx(idx)}
                  className={`p-2.5 rounded-sm cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-slate-100 border border-slate-300 text-slate-900 font-medium'
                      : 'hover:bg-slate-50 border border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs truncate">{title}</span>
                  </div>

                  {tour.steps.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStep(idx);
                      }}
                      className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                      title="Delete step"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Panel: Target & Multilingual Workbench (5 cols) */}
        {currentStep && (
          <div className="lg:col-span-5 space-y-4">
            
            {/* Step Target & Positioning */}
            <div className="bg-white rounded-sm border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Target Element & Placement</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInspectorModal(true)}
                  className="px-2 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium flex items-center space-x-1 transition-colors border border-slate-200 cursor-pointer"
                  title="Open visual element inspector tool"
                >
                  <Crosshair className="w-3 h-3 text-slate-600" />
                  <span>Point & Click Inspector</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  DOM Query Selector
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={currentStep.targetSelector}
                    onChange={(e) => handleUpdateStep('targetSelector', e.target.value)}
                    placeholder="#global-search-bar or [data-tour='...']"
                    className="w-full px-3 py-1.5 font-mono text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-slate-800"
                  />
                </div>

                {/* Quick Target Presets */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium mr-0.5">Presets:</span>
                  {[
                    { label: 'Search Bar', sel: '#global-search-bar' },
                    { label: 'Language Switcher', sel: '#language-switcher' },
                    { label: 'Navigation', sel: 'nav, header' },
                    { label: 'CTA Button', sel: 'button[type="submit"]' },
                    { label: 'Profile', sel: '[data-tour="profile"]' },
                  ].map((p) => (
                    <button
                      key={p.sel}
                      type="button"
                      onClick={() => handleUpdateStep('targetSelector', p.sel)}
                      className={`text-[10px] px-1.5 py-0.5 rounded-sm border transition-colors cursor-pointer ${
                        currentStep.targetSelector === p.sel
                          ? 'bg-slate-900 text-white border-slate-900 font-medium'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 mt-1.5">
                  Flow-Kit locates this element dynamically and renders an SVG spotlight cutout over it.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Placement
                  </label>
                  <select
                    value={currentStep.placement}
                    onChange={(e) => handleUpdateStep('placement', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none bg-white text-slate-800"
                  >
                    <option value="BOTTOM">Bottom</option>
                    <option value="TOP">Top</option>
                    <option value="LEFT">Left</option>
                    <option value="RIGHT">Right</option>
                    <option value="CENTER">Center (Modal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Backdrop Dim
                  </label>
                  <select
                    value={currentStep.backdropConfig?.dimOpacity ?? 0.65}
                    onChange={(e) =>
                      handleUpdateStep('backdropConfig', {
                        ...currentStep.backdropConfig,
                        dimOpacity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none bg-white text-slate-800"
                  >
                    <option value="0.75">Dark (75%)</option>
                    <option value="0.65">Standard (65%)</option>
                    <option value="0.4">Subtle (40%)</option>
                    <option value="0">Transparent (0%)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Multilingual Localization Studio */}
            <div className="bg-white rounded-sm border border-slate-200 shadow-xs p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Globe2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Multilingual Copy Studio</span>
                </div>

                {/* Language Switcher Tabs */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-sm space-x-0.5 border border-slate-200">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'am', label: 'አማርኛ' },
                    { code: 'om', label: 'Oromoo' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setActiveLocale(lang.code)}
                      className={`px-2 py-1 rounded-sm text-xs font-medium transition-all cursor-pointer ${
                        activeLocale === lang.code
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Title ({activeLocale.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={stepI18n.title || ''}
                  onChange={(e) => handleUpdateI18n('title', e.target.value)}
                  placeholder="Enter step title"
                  className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-sm focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Body Content ({activeLocale.toUpperCase()})
                </label>
                <textarea
                  rows={3}
                  value={stepI18n.content || ''}
                  onChange={(e) => handleUpdateI18n('content', e.target.value)}
                  placeholder="Provide concise instructions or overview"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-sm focus:outline-none focus:border-slate-800 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Next Button Label
                  </label>
                  <input
                    type="text"
                    value={stepI18n.nextBtn || ''}
                    onChange={(e) => handleUpdateI18n('nextBtn', e.target.value)}
                    placeholder="Next"
                    className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Back Button Label
                  </label>
                  <input
                    type="text"
                    value={stepI18n.backBtn || ''}
                    onChange={(e) => handleUpdateI18n('backBtn', e.target.value)}
                    placeholder="Back"
                    className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Panel: Live Spotlight Simulator (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 rounded-sm p-5 text-white flex flex-col justify-between shadow-xs min-h-[480px] border border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Live Spotlight Simulator
                </span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-sm border border-slate-700">
                {activeLocale.toUpperCase()}
              </span>
            </div>

            {/* Simulated Canvas with Spotlight Mask */}
            <div className="bg-slate-950 rounded-sm p-4 border border-slate-800 relative min-h-[340px] flex flex-col justify-between overflow-hidden">
              {/* Highlight Target Element Box */}
              <div
                className="p-3 rounded-sm border border-slate-600 bg-slate-800/40 ring-2 ring-slate-600/30 text-xs transition-all"
              >
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>Target: {currentStep?.targetSelector}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Spotlight Cutout</span>
                </div>
              </div>

              {/* Tooltip Overlay Mock */}
              <div className="my-auto mx-auto w-full max-w-[280px] bg-white text-slate-900 rounded-sm p-4 shadow-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                    Step {selectedStepIdx + 1} of {tour.steps.length}
                  </span>
                  <span className="text-slate-400 text-xs font-bold cursor-pointer">✕</span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 mb-1 leading-snug">
                  {stepI18n.title || 'Step Title'}
                </h4>
                <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                  {stepI18n.content || 'Step description content.'}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button className="text-[10px] text-slate-500 font-medium hover:text-slate-700">
                    {stepI18n.backBtn || 'Back'}
                  </button>
                  <button className="text-[10px] font-semibold bg-slate-900 text-white px-2.5 py-1 rounded-sm shadow-xs hover:bg-slate-800">
                    {stepI18n.nextBtn || 'Next'}
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 text-center font-mono">
                Rendered with SVG cutout mask & collision engine
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-center text-[11px] text-slate-400">
            Switch tabs in the copy studio to live preview Amharic, Oromo, or English.
          </div>
        </div>

      </div>

      {/* Visual Inspector Tool Modal */}
      {showInspectorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Crosshair className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-sm text-slate-900">In-App Visual Element Inspector</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInspectorModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Activate Flow-Kit's live element inspector on your web application. Hover over any button, input, or container to highlight it, and click to automatically copy its optimal CSS selector.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span>Inspector Console Snippet</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(inspectorSnippet);
                    setCopiedInspector(true);
                    setTimeout(() => setCopiedInspector(false), 2000);
                  }}
                  className="px-2 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium flex items-center space-x-1 transition-colors border border-slate-200 cursor-pointer"
                >
                  {copiedInspector ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-slate-950 p-3 rounded-sm text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800 max-h-36">
                {inspectorSnippet}
              </pre>
            </div>

            <div className="p-3 bg-slate-50 rounded-sm border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="font-semibold text-slate-800">How to use:</div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-500">
                <li>Copy the snippet above.</li>
                <li>Open your target web app (e.g. <code className="text-slate-700">http://localhost:5173</code>).</li>
                <li>Open Browser DevTools Console (<kbd className="font-mono bg-white px-1 border border-slate-200 rounded">F12</kbd>) and paste it.</li>
                <li>Click any element on the page to copy its selector, then paste it here into <strong>DOM Query Selector</strong>.</li>
              </ol>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowInspectorModal(false)}
                className="px-4 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
