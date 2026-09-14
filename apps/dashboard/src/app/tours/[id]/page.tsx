'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
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
  Palette,
  Maximize2,
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

  const handleUpdateTheme = (key: string, value: any) => {
    const currentTheme = tour.themeConfig || {
      primaryColor: '#2563eb',
      borderRadius: '12px',
      cardStyle: 'clean',
      backdropOpacity: 0.65,
    };
    setTour({
      ...tour,
      themeConfig: {
        ...currentTheme,
        [key]: value,
      },
    });
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
          themeConfig: tour.themeConfig || {
            primaryColor: '#2563eb',
            borderRadius: '12px',
            cardStyle: 'clean',
            backdropOpacity: 0.65,
          },
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

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Card Placement Relative to Target
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'TOP', label: 'Top', icon: ArrowUp },
                    { id: 'BOTTOM', label: 'Bottom', icon: ArrowDown },
                    { id: 'LEFT', label: 'Left', icon: ArrowLeft },
                    { id: 'RIGHT', label: 'Right', icon: ArrowRight },
                    { id: 'CENTER', label: 'Center (Modal)', icon: Maximize2 },
                  ].map((p) => {
                    const Icon = p.icon;
                    const active = (currentStep.placement || 'BOTTOM').toUpperCase() === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleUpdateStep('placement', p.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-sm border text-[11px] font-medium transition-all cursor-pointer ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 mb-1" />
                        <span className="truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Step Backdrop Focus
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { value: 0, label: 'Transparent (0%)' },
                    { value: 0.35, label: 'Subtle (35%)' },
                    { value: 0.65, label: 'Standard (65%)' },
                    { value: 0.85, label: 'Deep (85%)' },
                  ].map((d) => {
                    const active = (currentStep.backdropConfig?.dimOpacity ?? 0.65) === d.value;
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() =>
                          handleUpdateStep('backdropConfig', {
                            ...currentStep.backdropConfig,
                            dimOpacity: d.value,
                          })
                        }
                        className={`p-1.5 text-center rounded-sm border text-[11px] font-medium transition-all cursor-pointer ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tour Appearance & Card Styling */}
            <div className="bg-white rounded-sm border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Palette className="w-3.5 h-3.5 text-slate-500" />
                  <span>Appearance & Card Styling</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Global Theme</span>
              </div>

              {/* 1. Primary Accent Color */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Primary Accent Color
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { name: 'Emerald', hex: '#0f766e' },
                    { name: 'Indigo', hex: '#4f46e5' },
                    { name: 'Royal Blue', hex: '#2563eb' },
                    { name: 'Violet', hex: '#7c3aed' },
                    { name: 'Rose', hex: '#e11d48' },
                    { name: 'Amber', hex: '#d97706' },
                    { name: 'Slate', hex: '#0f172a' },
                  ].map((c) => {
                    const active = (tour.themeConfig?.primaryColor || '#2563eb').toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => handleUpdateTheme('primaryColor', c.hex)}
                        title={c.name}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                          active ? 'scale-110 ring-2 ring-offset-2 ring-slate-800' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {active && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    );
                  })}
                  
                  {/* Custom Hex Color input */}
                  <div className="flex items-center space-x-1.5 ml-1 pl-2 border-l border-slate-200">
                    <input
                      type="color"
                      value={tour.themeConfig?.primaryColor || '#2563eb'}
                      onChange={(e) => handleUpdateTheme('primaryColor', e.target.value)}
                      className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={tour.themeConfig?.primaryColor || '#2563eb'}
                      onChange={(e) => handleUpdateTheme('primaryColor', e.target.value)}
                      className="w-20 px-2 py-1 text-xs font-mono border border-slate-200 rounded-sm focus:outline-none uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Card Theme / Type */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Card Style / Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'clean', label: 'Clean White', desc: 'Minimalist shadow' },
                    { id: 'glass', label: 'Glassmorphic', desc: 'Frosted blur' },
                    { id: 'dark', label: 'Dark Mode', desc: 'Deep slate tone' },
                    { id: 'elevated', label: 'Elevated Border', desc: 'Accent outline' },
                  ].map((s) => {
                    const active = (tour.themeConfig?.cardStyle || 'clean') === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleUpdateTheme('cardStyle', s.id)}
                        className={`p-2 rounded-sm border text-left transition-all cursor-pointer ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-semibold text-xs leading-none mb-1">{s.label}</div>
                        <div className={`text-[10px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                          {s.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Sharpness / Border Radius */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Card Sharpness / Corner Radius
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[
                    { val: '0px', label: 'Sharp' },
                    { val: '4px', label: 'Subtle' },
                    { val: '8px', label: 'Standard' },
                    { val: '12px', label: 'Smooth' },
                    { val: '18px', label: 'Curved' },
                    { val: '24px', label: 'Pill' },
                  ].map((r) => {
                    const active = (tour.themeConfig?.borderRadius || '12px') === r.val;
                    return (
                      <button
                        key={r.val}
                        type="button"
                        onClick={() => handleUpdateTheme('borderRadius', r.val)}
                        className={`p-1.5 text-center rounded-sm border text-[11px] font-medium transition-all cursor-pointer ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block font-semibold text-[10px] text-slate-400">{r.val}</span>
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
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
        {(() => {
          const simPlacement = (currentStep?.placement || 'BOTTOM').toUpperCase();
          const simPrimaryColor = tour.themeConfig?.primaryColor || '#2563eb';
          const simBorderRadius = tour.themeConfig?.borderRadius || '12px';
          const simCardStyle = tour.themeConfig?.cardStyle || 'clean';
          const simDimOpacity = currentStep?.backdropConfig?.dimOpacity ?? tour.themeConfig?.backdropOpacity ?? 0.65;

          const cardStyleClasses = {
            clean: 'bg-white text-slate-900 border border-slate-200 shadow-xl',
            glass: 'bg-slate-900/70 backdrop-blur-md text-white border border-white/20 shadow-2xl ring-1 ring-white/10',
            dark: 'bg-slate-900 text-white border border-slate-700 shadow-2xl',
            elevated: 'bg-white text-slate-900 border-2 shadow-2xl',
          }[simCardStyle as 'clean' | 'glass' | 'dark' | 'elevated'] || 'bg-white text-slate-900 border border-slate-200 shadow-xl';

          const isDarkish = simCardStyle === 'glass' || simCardStyle === 'dark';

          const renderTooltip = (isBanner = false) => (
            <div
              className={`p-4 transition-all duration-200 ${cardStyleClasses} ${isBanner ? 'w-full' : 'w-full max-w-[280px]'}`}
              style={{
                borderRadius: simBorderRadius,
                ...(simCardStyle === 'elevated' ? { borderColor: simPrimaryColor } : {}),
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm border ${
                    isDarkish
                      ? 'bg-white/10 text-slate-200 border-white/20'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Step {selectedStepIdx + 1} of {tour.steps.length}
                </span>
                <span className={`text-xs font-bold cursor-pointer ${isDarkish ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>
                  ✕
                </span>
              </div>

              <h4 className={`font-bold text-xs mb-1 leading-snug ${isDarkish ? 'text-white' : 'text-slate-900'}`}>
                {stepI18n.title || 'Step Title'}
              </h4>
              <p className={`text-[11px] mb-3 leading-relaxed ${isDarkish ? 'text-slate-300' : 'text-slate-600'}`}>
                {stepI18n.content || 'Step description content.'}
              </p>

              <div className={`flex items-center justify-between pt-2 border-t ${isDarkish ? 'border-white/10' : 'border-slate-100'}`}>
                <button className={`text-[10px] font-medium ${isDarkish ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                  {stepI18n.backBtn || 'Back'}
                </button>
                <button
                  className="text-[10px] font-semibold text-white px-2.5 py-1 shadow-xs transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: simPrimaryColor,
                    borderRadius: simBorderRadius,
                  }}
                >
                  {stepI18n.nextBtn || 'Next'}
                </button>
              </div>
            </div>
          );

          const renderTargetBox = () => (
            <div
              className="p-3 rounded-sm border-2 border-dashed border-emerald-400/80 bg-slate-800/80 text-xs shadow-sm transition-all"
              style={{ borderRadius: simBorderRadius }}
            >
              <div className="font-semibold text-slate-200 flex items-center justify-between">
                <span className="truncate max-w-[140px]">Target: {currentStep?.targetSelector || 'body'}</span>
                <span className="text-[10px] text-emerald-400 font-mono ml-2">Spotlight Cutout</span>
              </div>
            </div>
          );

          return (
            <div className="lg:col-span-4 bg-slate-900 rounded-sm p-5 text-white flex flex-col justify-between shadow-xs min-h-[480px] border border-slate-800">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      Live Spotlight Simulator
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] bg-slate-800 text-emerald-400 font-mono px-2 py-0.5 rounded-sm border border-slate-700">
                      {simPlacement}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-sm border border-slate-700">
                      {activeLocale.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Simulated Canvas with Dynamic Placement */}
                <div className="bg-slate-950 rounded-sm p-4 border border-slate-800 relative min-h-[360px] flex flex-col justify-between overflow-hidden">
                  {/* Real Dim Backdrop Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                    style={{ backgroundColor: `rgba(15, 23, 42, ${simDimOpacity})` }}
                  />

                  {/* Positioning Layout */}
                  <div className="relative z-10 w-full h-full flex flex-col justify-between flex-1 py-1">
                    {simPlacement === 'TOP' && (
                      <div className="flex flex-col justify-between h-full gap-4">
                        <div className="flex justify-center">{renderTooltip()}</div>
                        {renderTargetBox()}
                      </div>
                    )}

                    {simPlacement === 'BOTTOM' && (
                      <div className="flex flex-col justify-between h-full gap-4">
                        {renderTargetBox()}
                        <div className="flex justify-center">{renderTooltip()}</div>
                      </div>
                    )}

                    {simPlacement === 'LEFT' && (
                      <div className="flex items-center justify-between h-full gap-2">
                        <div className="w-[60%]">{renderTooltip()}</div>
                        <div className="w-[38%]">{renderTargetBox()}</div>
                      </div>
                    )}

                    {simPlacement === 'RIGHT' && (
                      <div className="flex items-center justify-between h-full gap-2">
                        <div className="w-[38%]">{renderTargetBox()}</div>
                        <div className="w-[60%]">{renderTooltip()}</div>
                      </div>
                    )}

                    {simPlacement === 'CENTER' && (
                      <div className="flex flex-col items-center justify-center h-full my-auto space-y-2">
                        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center space-x-1">
                          <Maximize2 className="w-3 h-3 text-slate-400" />
                          <span>Centered Modal Dialogue</span>
                        </div>
                        <div className="w-full flex justify-center">{renderTooltip()}</div>
                      </div>
                    )}

                    {simPlacement === 'BOTTOM-FULL' && (
                      <div className="flex flex-col justify-between h-full gap-4">
                        {renderTargetBox()}
                        <div className="w-full">{renderTooltip(true)}</div>
                      </div>
                    )}
                  </div>

                  <div className="relative z-10 mt-3 text-[10px] text-slate-500 text-center font-mono">
                    Rendered with SVG cutout mask & collision engine • Dim: {Math.round(simDimOpacity * 100)}%
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-center text-[11px] text-slate-400">
                Live preview reflects placement, theme color, card style, sharpness, and locale instantly.
              </div>
            </div>
          );
        })()}

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
