'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Play,
  Globe2,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import { apiFetch, getActiveProjectId } from '@/lib/api';

export default function ToursListPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newUrlPattern, setNewUrlPattern] = useState('*');

  const loadTours = async () => {
    const activeProjectId = getActiveProjectId();
    if (!activeProjectId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await apiFetch(`/v1/projects/${activeProjectId}/tours`);
      setTours(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTours();
    const onProjectChanged = () => loadTours();
    window.addEventListener('projectChanged', onProjectChanged);
    return () => window.removeEventListener('projectChanged', onProjectChanged);
  }, []);

  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeProjectId = getActiveProjectId();
    if (!activeProjectId || !newTitle) return;

    try {
      await apiFetch(`/v1/projects/${activeProjectId}/tours`, {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug || undefined,
          targetUrlPattern: newUrlPattern,
          defaultLocale: 'en',
          steps: [
            {
              stepIndex: 1,
              targetSelector: '#welcome-header',
              placement: 'BOTTOM',
              i18n: {
                en: {
                  title: 'Welcome to your Workspace',
                  content: 'This walkthrough will guide you through key capabilities in seconds.',
                  nextBtn: 'Get Started',
                },
                am: {
                  title: 'እንኳን ወደ የስራ ቦታዎ በደህና መጡ',
                  content: 'ይህ የመረጃ መመሪያ ዋና ዋና አገልግሎቶችን በሰከንዶች ውስጥ ያሳይዎታል።',
                  nextBtn: 'ይጀምሩ',
                },
                om: {
                  title: 'Baga nagaan dhuftan',
                  content: 'Qajeelfamni kun tajaajiloota ijoo daqiiqaa muraasa keessatti isinitti agarsiisa.',
                  nextBtn: 'Jalqabi',
                },
              },
            },
          ],
        }),
      });

      setIsModalOpen(false);
      setNewTitle('');
      setNewSlug('');
      loadTours();
    } catch (err: any) {
      alert(err.message || 'Error creating tour');
    }
  };

  const handlePublish = async (tourId: string) => {
    const activeProjectId = getActiveProjectId();
    if (!activeProjectId) return;
    await apiFetch(`/v1/projects/${activeProjectId}/tours/${tourId}/publish`, {
      method: 'POST',
    });
    loadTours();
  };

  const handleDelete = async (tourId: string) => {
    if (!confirm('Are you sure you want to delete this walkthrough?')) return;
    const activeProjectId = getActiveProjectId();
    if (!activeProjectId) return;
    await apiFetch(`/v1/projects/${activeProjectId}/tours/${tourId}`, {
      method: 'DELETE',
    });
    loadTours();
  };

  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.targetUrlPattern.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || tour.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Walkthroughs & Tours</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build and manage interactive spotlight guides, element tooltips, and product walkthroughs.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Walkthrough</span>
        </button>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-sm border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by title, slug, or URL..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-800 transition-colors placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center space-x-1 w-full sm:w-auto self-start sm:self-auto">
          {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'ALL' ? 'All Guides' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tours Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTours.map((tour) => {
          const isPublished = tour.status === 'PUBLISHED';
          return (
            <div
              key={tour.id}
              className="bg-white rounded-sm border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-slate-400 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-sm ${
                      isPublished
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {tour.status}
                  </span>

                  <div className="flex items-center space-x-1 text-slate-400 text-[11px] font-mono">
                    <Globe2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>EN • AM • OM</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm group-hover:text-slate-700 transition-colors">
                  {tour.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {tour.description || 'Interactive product onboarding guide.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>URL: {tour.targetUrlPattern}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-sm text-slate-700 font-sans font-medium">
                    {tour.steps?.length || 0} Steps
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {!isPublished && (
                    <button
                      onClick={() => handlePublish(tour.id)}
                      className="px-2.5 py-1 rounded-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer border border-emerald-200"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Publish</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(tour.id)}
                    className="p-1.5 rounded-sm text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete tour"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Link
                  href={`/tours/${tour.id}`}
                  className="px-3 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-xs"
                >
                  <span>Open Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTours.length === 0 && !loading && (
        <div className="p-12 text-center bg-white rounded-sm border border-slate-200 text-xs text-slate-500">
          No walkthroughs found matching your search.
        </div>
      )}

      {/* 4. Create Tour Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1">Create New Walkthrough</h2>
            <p className="text-xs text-slate-500 mb-4">
              Define the guide name, target URL pattern, and default language.
            </p>

            <form onSubmit={handleCreateTour} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tour Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Workspace Welcome Tour"
                  className="w-full px-3 py-2 border border-slate-200 rounded-sm text-xs focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tour Slug (URL-Safe Identifier)
                </label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="e.g. welcome-tour"
                  className="w-full px-3 py-2 border border-slate-200 rounded-sm text-xs focus:outline-none focus:border-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target URL Pattern (Wildcard or Glob)
                </label>
                <input
                  type="text"
                  value={newUrlPattern}
                  onChange={(e) => setNewUrlPattern(e.target.value)}
                  placeholder="* or /dashboard/*"
                  className="w-full px-3 py-2 border border-slate-200 rounded-sm text-xs focus:outline-none focus:border-slate-800 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-sm shadow-xs cursor-pointer"
                >
                  Create & Launch Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
