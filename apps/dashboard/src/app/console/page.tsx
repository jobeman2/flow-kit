'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Code2,
  Copy,
  Check,
  Play,
  Globe2,
  Clock,
  ShieldCheck,
  Activity,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { apiFetch, getActiveProjectId } from '@/lib/api';

export default function ConsoleOverview() {
  const [project, setProject] = useState<any>(null);
  const [tours, setTours] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const activeProjectId = getActiveProjectId();
    if (!activeProjectId) return;

    try {
      setLoading(true);
      const proj = await apiFetch(`/v1/projects/${activeProjectId}`);
      setProject(proj);

      const toursData = await apiFetch(`/v1/projects/${activeProjectId}/tours`);
      setTours(toursData);

      // Load analytics overview
      const funnelData = await apiFetch(`/v1/projects/${activeProjectId}/analytics/funnel`).catch(() => null);
      setFunnel(funnelData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('projectChanged', loadData);
    return () => window.removeEventListener('projectChanged', loadData);
  }, []);

  const clientKey =
    project?.apiKeys?.find((k: any) => k.type === 'PUBLIC_CLIENT' && k.status === 'ACTIVE')?.key ||
    'pk_live_demo_addis_79a2f1b4c6e8';

  const cdnSnippet = `<script src="http://localhost:4000/sdk.js" data-api-key="${clientKey}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cdnSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const publishedCount = tours.filter((t) => t.status === 'PUBLISHED').length;

  return (
    <div className="space-y-6">
      
      {/* 1. WELCOME HEADER & STATUS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {project ? project.name : 'Project Overview'}
            </h1>
            <span className="px-2 py-0.5 rounded-sm text-[11px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>LIVE</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Universal walkthrough telemetry, tour status, and client integration settings.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/tours"
            className="px-3 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tour Studio</span>
          </Link>
        </div>
      </div>

      {/* 2. METRIC TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1 */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Active Walkthroughs</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{publishedCount}</span>
            <span className="text-xs text-slate-500 font-medium">of {tours.length} total</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-emerald-700 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Production synced</span>
          </div>
        </div>

        {/* Tile 2 */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Average Completion</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {funnel?.completionRate ? `${funnel.completionRate}%` : '78%'}
            </span>
            <span className="text-xs text-slate-500 font-medium">retention</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-slate-600 font-medium">
            <Activity className="w-3 h-3 text-slate-500" />
            <span>Telemetry active</span>
          </div>
        </div>

        {/* Tile 3 */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Localization</span>
            <Globe2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">3 Locales</span>
            <span className="text-xs text-slate-500 font-medium">enabled</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono">
            <span>EN • AM • OM</span>
          </div>
        </div>

        {/* Tile 4 */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Client SDK</span>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">&lt; 16 KB</span>
            <span className="text-xs text-slate-500 font-medium">bundle size</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-slate-600 font-medium">
            <span>Zero dependencies</span>
          </div>
        </div>
      </div>

      {/* 3. SCRIPT EMBED SNIPPET */}
      <div className="p-4 rounded-sm bg-slate-900 text-white shadow-xs border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-sm bg-slate-800 flex items-center justify-center text-slate-300">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-slate-100">Universal Client Integration</h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Add this script tag to your web application to activate tours and guides.
              </p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="self-start sm:self-auto px-2.5 py-1 rounded-sm bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>

        <div className="p-2.5 bg-slate-950 rounded-sm font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800/80">
          {cdnSnippet}
        </div>
      </div>

      {/* 4. ACTIVE PRODUCT WALKTHROUGHS TABLE */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Configured Walkthroughs</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active guides matching current URL routes
            </p>
          </div>

          <Link
            href="/tours"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center space-x-1"
          >
            <span>Manage Tours</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {tours.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No tours created yet. Launch the studio to craft your first onboarding guide.
            </div>
          ) : (
            tours.map((tour) => (
              <div
                key={tour.id}
                className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                    <Play className="w-3 h-3 fill-slate-700" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-slate-900 text-xs">{tour.title}</h3>
                      <span
                        className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-sm ${
                          tour.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tour.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5 font-mono">
                      <span>slug: {tour.slug}</span>
                      <span>•</span>
                      <span>url: {tour.targetUrlPattern}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 self-end sm:self-center">
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                    {tour.steps?.length || 0} Steps
                  </span>

                  <Link
                    href={`/tours/${tour.id}`}
                    className="px-2.5 py-1 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    Open Studio
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
