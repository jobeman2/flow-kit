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
  Plus,
  RefreshCw,
  BarChart3,
  Users,
  Zap,
  XCircle,
  Radio,
  Eye,
} from 'lucide-react';
import { apiFetch, getActiveProjectId } from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function ConsoleOverview() {
  const [project, setProject] = useState<any>(null);
  const [tours, setTours] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const toast = useToast();

  const loadData = async (showToast = false) => {
    const activeProjectId = getActiveProjectId();
    if (!activeProjectId) return;

    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      const [proj, toursData, overviewData] = await Promise.all([
        apiFetch(`/v1/projects/${activeProjectId}`),
        apiFetch(`/v1/projects/${activeProjectId}/tours`),
        apiFetch(`/v1/projects/${activeProjectId}/analytics/overview`).catch(() => null),
      ]);

      setProject(proj);
      setTours(toursData || []);
      setOverview(overviewData);

      if (showToast) {
        toast.success('Live traffic data refreshed', 'Metrics Updated');
      }
    } catch (e) {
      console.error('Error loading console data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleProjectChanged = () => {
      loadData();
    };
    window.addEventListener('projectChanged', handleProjectChanged);
    return () => window.removeEventListener('projectChanged', handleProjectChanged);
  }, []);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const clientKey =
    project?.apiKeys?.find((k: any) => k.type === 'PUBLIC_CLIENT' && k.status === 'ACTIVE')?.key ||
    'pk_live_' + (project?.id ? project.id.substring(0, 16) : 'default');

  const cdnSnippet = `<script src="${apiUrl}/flow-kit.js" data-api-key="${clientKey}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cdnSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate a test interaction so user can immediately see live metrics update
  const handleSimulateTraffic = async () => {
    if (!project || tours.length === 0) {
      toast.error('Please create at least one walkthrough to simulate traffic.', 'No Walkthroughs');
      return;
    }

    const targetTour = tours.find((t) => t.status === 'PUBLISHED') || tours[0];
    setSimulating(true);

    try {
      const anonId = 'sim_' + Math.random().toString(36).substring(2, 9);
      const res = await apiFetch(`/v1/public/events?apiKey=${clientKey}`, {
        method: 'POST',
        body: JSON.stringify([
          {
            tourId: targetTour.id,
            tourStepId: targetTour.steps?.[0]?.id || null,
            eventType: 'TOUR_STARTED',
            anonymousUserId: anonId,
            locale: 'en',
            path: window.location.pathname,
            clientTimestamp: new Date().toISOString(),
          },
          {
            tourId: targetTour.id,
            tourStepId: targetTour.steps?.[0]?.id || null,
            eventType: 'STEP_VIEWED',
            anonymousUserId: anonId,
            locale: 'en',
            path: window.location.pathname,
            clientTimestamp: new Date().toISOString(),
          },
          {
            tourId: targetTour.id,
            tourStepId: targetTour.steps?.[0]?.id || null,
            eventType: 'TOUR_COMPLETED',
            anonymousUserId: anonId,
            locale: 'en',
            path: window.location.pathname,
            clientTimestamp: new Date().toISOString(),
          },
        ]),
      });

      toast.success(`Simulated 1 complete tour session for "${targetTour.title}"`, 'Test Event Ingested');
      // Reload overview to reflect immediate changes
      await loadData(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to simulate traffic', 'Simulation Error');
    } finally {
      setSimulating(false);
    }
  };

  const publishedCount = tours.filter((t) => t.status === 'PUBLISHED').length;
  const totalStarts = overview?.totalStarted ?? 0;
  const totalCompleted = overview?.totalCompleted ?? 0;
  const totalEvents = overview?.totalEvents ?? 0;
  const completionRate = overview?.averageCompletionRate ?? 0;
  const activeLocales = (overview?.uniqueLocales && overview.uniqueLocales.length > 0)
    ? overview.uniqueLocales.map((l: string) => l.toUpperCase())
    : ['EN'];

  // Format relative time helper
  const getRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return dateStr;
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'TOUR_STARTED':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">Started</span>;
      case 'STEP_VIEWED':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200">Step Viewed</span>;
      case 'STEP_COMPLETED':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Step Done</span>;
      case 'TOUR_COMPLETED':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case 'TOUR_SKIPPED':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200">Skipped</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">{type}</span>;
    }
  };

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
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE TELEMETRY</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time walkthrough traffic, visitor retention rates, and client SDK status.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="px-2.5 py-1.5 rounded-sm border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs"
            title="Refresh live metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateTraffic}
            disabled={simulating || tours.length === 0}
            className="px-3 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs disabled:opacity-50"
            title="Send a sample tour session to test live telemetry"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>{simulating ? 'Sending Test...' : 'Simulate Event'}</span>
          </button>

          <Link
            href="/tours"
            className="px-3 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tour Studio</span>
          </Link>
        </div>
      </div>

      {/* 2. REAL ACCURATE METRIC TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Active Walkthroughs */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Active Walkthroughs</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{publishedCount}</span>
            <span className="text-xs text-slate-500 font-medium">of {tours.length} total</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-[11px] font-medium">
            {publishedCount > 0 ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">Production active</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-amber-700">No published tours</span>
              </>
            )}
          </div>
        </div>

        {/* Tile 2: Total Tour Starts / Traffic */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Walkthrough Traffic</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {totalStarts}
            </span>
            <span className="text-xs text-slate-500 font-medium">sessions started</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-slate-600 font-medium">
            <Activity className="w-3 h-3 text-slate-500" />
            <span>{totalEvents} total interactions</span>
          </div>
        </div>

        {/* Tile 3: Average Completion Rate */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Completion Retention</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {completionRate}%
            </span>
            <span className="text-xs text-slate-500 font-medium">retention</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-slate-600 font-medium">
            <span>{totalCompleted} finished of {totalStarts} started</span>
          </div>
        </div>

        {/* Tile 4: Localization */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Configured Languages</span>
            <Globe2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeLocales.length} {activeLocales.length === 1 ? 'Locale' : 'Locales'}
            </span>
            <span className="text-xs text-slate-500 font-medium">active</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono">
            <span>{activeLocales.join(' • ')}</span>
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
                Embed this script tag into your website to load walkthroughs and stream live traffic events.
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

      {/* 4. TRAFFIC OVERVIEW & 7-DAY TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Traffic Chart */}
        <div className="lg:col-span-2 bg-white rounded-sm border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <BarChart3 className="w-4 h-4 text-slate-600" />
                <span>7-Day Onboarding Traffic Trend</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily volume of users starting and completing walkthroughs on your site.
              </p>
            </div>

            <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-600">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-900 inline-block" />
                <span>Starts</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                <span>Completed</span>
              </div>
            </div>
          </div>

          {/* Mini Bar Chart */}
          <div className="grid grid-cols-7 gap-2 pt-2 items-end h-36">
            {(overview?.dailyTimeline || []).map((day: any, idx: number) => {
              const maxVal = Math.max(
                ...((overview?.dailyTimeline || []).map((d: any) => Math.max(d.starts, d.completions, 1))),
                5
              );
              const startHeight = Math.max(4, Math.round((day.starts / maxVal) * 100));
              const compHeight = Math.max(4, Math.round((day.completions / maxVal) * 100));

              return (
                <div key={idx} className="flex flex-col items-center justify-end h-full group">
                  <div className="w-full flex items-end justify-center space-x-1 h-28 bg-slate-50 rounded-xs p-1">
                    {/* Starts bar */}
                    <div
                      style={{ height: `${startHeight}%` }}
                      className="w-1/2 bg-slate-900 rounded-xs transition-all group-hover:bg-slate-700 relative"
                      title={`${day.date}: ${day.starts} starts`}
                    />
                    {/* Completions bar */}
                    <div
                      style={{ height: `${compHeight}%` }}
                      className="w-1/2 bg-emerald-500 rounded-xs transition-all group-hover:bg-emerald-400 relative"
                      title={`${day.date}: ${day.completions} completions`}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 mt-1.5 truncate max-w-full">
                    {day.date.split(',')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-2 bg-slate-50 rounded-xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Starts</span>
              <p className="text-base font-bold text-slate-900">{totalStarts}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Step Views</span>
              <p className="text-base font-bold text-slate-900">{overview?.totalStepViews ?? 0}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Finished</span>
              <p className="text-base font-bold text-emerald-700">{totalCompleted}</p>
            </div>
          </div>
        </div>

        {/* Live Traffic Activity Feed */}
        <div className="bg-white rounded-sm border border-slate-200 shadow-xs p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Live Traffic Stream</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Latest events</span>
            </div>

            <div className="divide-y divide-slate-100 mt-2 max-h-56 overflow-y-auto space-y-1">
              {!overview?.recentEvents || overview.recentEvents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <Activity className="w-5 h-5 mx-auto text-slate-300 mb-1" />
                  No events received yet.
                  <p className="text-[10px] text-slate-400 mt-1">
                    Click <strong>Simulate Event</strong> above or embed the script in your app to record visitor traffic.
                  </p>
                </div>
              ) : (
                overview.recentEvents.slice(0, 8).map((ev: any) => (
                  <div key={ev.id} className="py-2 flex items-start justify-between text-xs">
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center space-x-1.5">
                        {getEventBadge(ev.eventType)}
                        <span className="font-semibold text-slate-800 text-[11px] truncate">
                          {ev.tourTitle}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        path: {ev.path} • {ev.anonymousUserId}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium whitespace-nowrap">
                      {getRelativeTime(ev.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/analytics"
            className="w-full py-1.5 rounded-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold text-center transition-colors flex items-center justify-center space-x-1 mt-2"
          >
            <span>Full Funnel Analytics</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 5. WALKTHROUGH PERFORMANCE & DIRECTORY */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Walkthrough Performance & Traffic</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Traffic volume and completion rates broken down per walkthrough guide.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/tours"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
            >
              <span>All Tours</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              href="/tours"
              className="px-3 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Walkthrough</span>
            </Link>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {tours.length === 0 ? (
            <div className="p-10 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Layers className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">No walkthroughs yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Create your first walkthrough to guide users through your website step by step.
                </p>
              </div>
              <Link
                href="/tours"
                className="px-4 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-2 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Walkthrough</span>
              </Link>
            </div>
          ) : (
            (overview?.tourBreakdown || tours).map((tour: any) => {
              const tourStarts = tour.starts ?? 0;
              const tourCompletions = tour.completions ?? 0;
              const tourRate = tour.completionRate ?? 0;

              return (
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
                        <span>•</span>
                        <span>{tour.stepsCount || tour.steps?.length || 0} Steps</span>
                      </div>
                    </div>
                  </div>

                  {/* Traffic Stats & Action */}
                  <div className="flex items-center space-x-4 self-end sm:self-center">
                    {/* Starts & Completions counter */}
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-900">
                        {tourStarts} <span className="font-normal text-slate-500">starts</span> • {tourCompletions} <span className="font-normal text-slate-500">finished</span>
                      </div>
                      <div className="flex items-center space-x-1.5 justify-end mt-1">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, tourRate)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700">{tourRate}%</span>
                      </div>
                    </div>

                    <Link
                      href={`/tours/${tour.id}`}
                      className="px-2.5 py-1 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      Open Studio
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
