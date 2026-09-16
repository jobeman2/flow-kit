'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Globe2,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import CustomSelect from '@/components/CustomSelect';

export default function AnalyticsPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string>('');
  const [funnelData, setFunnelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadToursAndFunnel = async () => {
    const activeProjectId = localStorage.getItem('onboardflow_active_project');
    if (!activeProjectId) return;

    try {
      setLoading(true);
      const toursList = await apiFetch(`/v1/projects/${activeProjectId}/tours`);
      setTours(toursList);

      const targetTour = selectedTourId || toursList[0]?.id;
      if (targetTour) {
        setSelectedTourId(targetTour);
        const funnel = await apiFetch(
          `/v1/projects/${activeProjectId}/analytics/funnel?tourId=${targetTour}`
        );
        setFunnelData(funnel);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadToursAndFunnel();
  }, [selectedTourId]);

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Tour Dropdown Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Funnel & Drop-Off Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Analyze visitor progression, drop-off rates, and walkthrough completion.
          </p>
        </div>

        {tours.length > 0 && (
          <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-sm px-3 py-1 shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Walkthrough:</span>
            <CustomSelect
              value={selectedTourId}
              onChange={setSelectedTourId}
              options={tours.map((t) => ({ value: t.id, label: t.title }))}
              className="min-w-[160px]"
            />
          </div>
        )}
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Tour Starts</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2.5 text-2xl font-bold text-slate-900 tracking-tight">
            {funnelData?.totalStarted ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            First visits or direct triggers
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Completed Tours</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2.5 text-2xl font-bold text-emerald-700 tracking-tight">
            {funnelData?.totalCompleted ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            Reached the final step
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Completion Rate</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2.5 text-2xl font-bold text-slate-900 tracking-tight">
            {funnelData?.completionRate ? `${funnelData.completionRate}%` : '0%'}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            Overall retention
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Dismissed / Skipped</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2.5 text-2xl font-bold text-slate-900 tracking-tight">
            {funnelData?.totalSkipped ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Exited via close or skip
          </div>
        </div>
      </div>

      {/* 3. Step-by-Step Funnel Chart */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-xs p-5 space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Step-by-Step Retention Funnel</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify exact steps where visitors drop off to optimize copy and element targeting.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {!funnelData?.steps || funnelData.steps.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-sm">
              No steps found or no traffic recorded for this walkthrough yet.
            </div>
          ) : (
            funnelData.steps.map((step: any, idx: number) => {
              const totalStarts = funnelData?.totalStarted || 1;
              const retentionPct = Math.round(((step.completed || step.viewed || 0) / totalStarts) * 100);
              return (
                <div key={idx} className="bg-slate-50 rounded-sm p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-sm bg-slate-900 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                        {step.stepIndex}
                      </span>
                      <span className="font-semibold text-xs text-slate-900">{step.title}</span>
                    </div>

                    <div className="flex items-center space-x-2.5 text-xs">
                      <span className="text-slate-600 font-medium">
                        {step.completed || 0} completed ({retentionPct}%)
                      </span>
                      <span className="text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-medium">
                        {step.dropOffRate || 0}% drop-off
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-sm h-2 overflow-hidden">
                    <div
                      className="bg-slate-800 h-2 rounded-sm transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, retentionPct))}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Real-time Telemetry Event Feed */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Live Telemetry Feed</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Raw events stream dispatched from client SDK
            </p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry Online</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 font-mono text-xs">
          {funnelData?.recentEvents && funnelData.recentEvents.length > 0 ? (
            funnelData.recentEvents.map((ev: any) => (
              <div key={ev.id} className="p-3 px-4 flex items-center justify-between hover:bg-slate-50/70">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                      ev.eventType === 'TOUR_COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ev.eventType === 'TOUR_SKIPPED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {ev.eventType}
                  </span>
                  <span className="text-slate-700">{ev.anonymousUserId}</span>
                  <span className="text-slate-400">path: {ev.path}</span>
                </div>
                <div className="flex items-center space-x-2.5 text-slate-400 text-[11px]">
                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-sm text-[10px] uppercase font-sans font-semibold">
                    {ev.locale}
                  </span>
                  <span>{new Date(ev.clientTimestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 font-sans text-xs">
              No recent events logged yet. Trigger the walkthrough on your app to see live stream.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
