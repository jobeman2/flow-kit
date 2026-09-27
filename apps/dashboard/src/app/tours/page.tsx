'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Sparkles,
  Zap,
  Check,
  ArrowRight,
} from 'lucide-react';
import { apiFetch, getActiveProjectId } from '@/lib/api';
import DangerConfirmModal from '@/components/DangerConfirmModal';

interface TourTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: any;
  defaultTitle: string;
  defaultSlug: string;
  steps: any[];
}

const TOUR_TEMPLATES: TourTemplate[] = [
  {
    id: 'welcome',
    name: 'New User Welcome Tour',
    badge: '3 Steps',
    description: 'Guide first-time signups through search, primary actions, and workspace preferences.',
    icon: Sparkles,
    defaultTitle: 'Welcome & Getting Started',
    defaultSlug: 'welcome-tour',
    steps: [
      {
        stepIndex: 1,
        targetSelector: '#search-bar, nav',
        placement: 'BOTTOM',
        i18n: {
          en: {
            title: 'Global Search & Navigation',
            content: 'Find projects, recent records, and resources anywhere in your workspace.',
            nextBtn: 'Next Step →',
          },
          am: {
            title: 'አጠቃላይ ፍለጋ እና ዳሰሳ',
            content: 'በስራ ቦታዎ ውስጥ ያሉትን ማንኛውንም መዝገቦች እና ሰነዶች በቀላሉ ያግኙ።',
            nextBtn: 'ቀጣይ →',
          },
        },
      },
      {
        stepIndex: 2,
        targetSelector: '#primary-action, .btn-primary, [data-action="create"]',
        placement: 'BOTTOM',
        i18n: {
          en: {
            title: 'Create Your First Item',
            content: 'Start your core workflow here by creating a new document or project.',
            nextBtn: 'Next Step →',
          },
          am: {
            title: 'የመጀመሪያዎን ስራ ይፍጠሩ',
            content: 'እዚህ ላይ ጠቅ በማድረግ አዲስ ፕሮጀክት ወይም ሰነድ መፍጠር ይጀምሩ።',
            nextBtn: 'ቀጣይ →',
          },
        },
      },
      {
        stepIndex: 3,
        targetSelector: '#user-settings, .profile-btn, header .user-menu',
        placement: 'LEFT',
        i18n: {
          en: {
            title: 'Settings & Workspace Control',
            content: 'Configure team members, security keys, and account preferences.',
            nextBtn: 'Finish Tour ✓',
          },
          am: {
            title: 'ማስተካከያ እና የስራ ቦታ ቁጥጥር',
            content: 'የቡድን አባላትን፣ የደህንነት ቁልፎችን እና የግል ማስተካከያዎችን ያቀናብሩ።',
            nextBtn: 'ጨርስ ✓',
          },
        },
      },
    ],
  },
  {
    id: 'spotlight',
    name: 'Feature Spotlight Beacon',
    badge: '1 Step',
    description: 'High-impact spotlight to announce new features, redesigns, or important alerts.',
    icon: Zap,
    defaultTitle: 'Feature Spotlight: New Tool',
    defaultSlug: 'feature-spotlight',
    steps: [
      {
        stepIndex: 1,
        targetSelector: '#new-feature, .feature-highlight',
        placement: 'BOTTOM',
        i18n: {
          en: {
            title: 'Check Out the New Workflow Tool',
            content: 'We updated this section with faster bulk actions and export capabilities.',
            nextBtn: 'Got it, thanks!',
          },
          am: {
            title: 'አዲሱን የአሰራር መሳሪያ ይመልከቱ',
            content: 'ይህንን ክፍል በፈጣን እና በዘመናዊ አሰራር አሻሽለነዋል።',
            nextBtn: 'ተረድቻለሁ!',
          },
        },
      },
    ],
  },
  {
    id: 'multilingual',
    name: 'Multilingual Onboarding (EN / አማ)',
    badge: 'Bilingual',
    description: 'Pre-configured with English and authentic Amharic (አማርኛ) translations.',
    icon: Globe2,
    defaultTitle: 'Multilingual Welcome Guide',
    defaultSlug: 'multilingual-guide',
    steps: [
      {
        stepIndex: 1,
        targetSelector: '#welcome-header',
        placement: 'BOTTOM',
        i18n: {
          en: {
            title: 'Welcome to your Workspace',
            content: 'This walkthrough will guide you through key capabilities in seconds.',
            nextBtn: 'Get Started →',
          },
          am: {
            title: 'እንኳን ወደ የስራ ቦታዎ በደህና መጡ',
            content: 'ይህ የመረጃ መመሪያ ዋና ዋና አገልግሎቶችን በሰከንዶች ውስጥ ያሳይዎታል።',
            nextBtn: 'ይጀምሩ →',
          },
        },
      },
      {
        stepIndex: 2,
        targetSelector: '#lang-switch, header',
        placement: 'BOTTOM',
        i18n: {
          en: {
            title: 'Switch Languages Anytime',
            content: 'The entire portal supports English, Amharic, and Afaan Oromoo seamlessly.',
            nextBtn: 'Complete Tour ✓',
          },
          am: {
            title: 'በማንኛውም ጊዜ ቋንቋ ይቀይሩ',
            content: 'መላው ፖርታል በእንግሊዝኛ፣ በአማርኛ እና በአፋን ኦሮሞ በተሟላ ሁኔታ ይሰራል።',
            nextBtn: 'ጨርስ ✓',
          },
        },
      },
    ],
  },
  {
    id: 'checklist',
    name: 'Milestone Checklist',
    badge: '4 Milestones',
    description: 'Drive user onboarding with step-by-step milestone tracking.',
    icon: CheckCircle2,
    defaultTitle: 'New User Activation Checklist',
    defaultSlug: 'activation-checklist',
    steps: [
      {
        stepIndex: 1,
        targetSelector: '#profile-setup',
        placement: 'RIGHT',
        i18n: {
          en: {
            title: 'Complete Profile Setup',
            content: 'Add your profile details and set your preferred timezone.',
            nextBtn: 'Next Milestone →',
          },
        },
      },
      {
        stepIndex: 2,
        targetSelector: '#create-project',
        placement: 'BOTTOM',
        i18n: {
          en: {
            title: 'Create First Project',
            content: 'Name your first workspace project to start tracking onboarding.',
            nextBtn: 'Next Milestone →',
          },
        },
      },
      {
        stepIndex: 3,
        targetSelector: '#api-keys',
        placement: 'BOTTOM',
        i18n: {
          en: {
            title: 'Connect API Key',
            content: 'Grab your publishable API key and drop it into your web app.',
            nextBtn: 'Final Milestone →',
          },
        },
      },
      {
        stepIndex: 4,
        targetSelector: '#launch-btn',
        placement: 'BOTTOM',
        i18n: {
          en: {
            title: 'Launch Live Tour',
            content: 'Publish your walkthrough and watch real-time user retention climb.',
            nextBtn: 'All Milestones Complete!',
          },
        },
      },
    ],
  },
  {
    id: 'blank',
    name: 'Blank Walkthrough',
    badge: 'Custom',
    description: 'Start with a single blank step and build your walkthrough from scratch.',
    icon: Layers,
    defaultTitle: 'Custom Walkthrough',
    defaultSlug: 'custom-walkthrough',
    steps: [
      {
        stepIndex: 1,
        targetSelector: '#welcome-header',
        placement: 'BOTTOM',
        i18n: {
          en: {
            title: 'Step 1 Title',
            content: 'Explain what this element does.',
            nextBtn: 'Next',
          },
        },
      },
    ],
  },
];

export default function ToursListPage() {
  const router = useRouter();
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('welcome');
  const [newTitle, setNewTitle] = useState('Welcome & Getting Started');
  const [newSlug, setNewSlug] = useState('welcome-tour');
  const [newUrlPattern, setNewUrlPattern] = useState('*');
  const [deletingTour, setDeletingTour] = useState<any | null>(null);

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
    window.addEventListener('flowkit_token_synced', onProjectChanged);

    // Auto-open create modal if redirected from console empty state
    if (sessionStorage.getItem('openCreateTour') === '1') {
      sessionStorage.removeItem('openCreateTour');
      openCreateModalWithTemplate('welcome');
    }

    return () => {
      window.removeEventListener('projectChanged', onProjectChanged);
      window.removeEventListener('flowkit_token_synced', onProjectChanged);
    };
  }, []);

  const openCreateModalWithTemplate = (templateId = 'welcome') => {
    const tpl = TOUR_TEMPLATES.find((t) => t.id === templateId) || TOUR_TEMPLATES[0];
    setSelectedTemplateId(tpl.id);
    setNewTitle(tpl.defaultTitle);
    setNewSlug(tpl.defaultSlug);
    setNewUrlPattern('*');
    setIsModalOpen(true);
  };

  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeProjectId = getActiveProjectId();
    if (!activeProjectId || !newTitle) return;

    const tpl = TOUR_TEMPLATES.find((t) => t.id === selectedTemplateId) || TOUR_TEMPLATES[0];

    try {
      const res = await apiFetch(`/v1/projects/${activeProjectId}/tours`, {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug || undefined,
          targetUrlPattern: newUrlPattern || '*',
          defaultLocale: 'en',
          steps: tpl.steps,
        }),
      });

      setIsModalOpen(false);
      setNewTitle('');
      setNewSlug('');
      
      if (res?.id) {
        router.push(`/tours/${res.id}`);
      } else {
        loadTours();
      }
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

  const handleDelete = async () => {
    if (!deletingTour) return;
    const activeProjectId = getActiveProjectId();
    if (!activeProjectId) return;
    await apiFetch(`/v1/projects/${activeProjectId}/tours/${deletingTour.id}`, {
      method: 'DELETE',
    });
    setDeletingTour(null);
    loadTours();
  };

  const filteredTours = tours.filter((tour) => {
    const title = tour?.title || '';
    const slug = tour?.slug || '';
    const pattern = tour?.targetUrlPattern || '';
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      title.toLowerCase().includes(q) ||
      slug.toLowerCase().includes(q) ||
      pattern.toLowerCase().includes(q);

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
          onClick={() => openCreateModalWithTemplate('welcome')}
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
                    onClick={() => setDeletingTour(tour)}
                    className="p-1.5 rounded-sm text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete walkthrough"
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

      {/* 4. Create Tour Modal with Starter Templates */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded bg-column-navy flex items-center justify-center text-column-cyan">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Create New Walkthrough</h2>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                1-Click Templates
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Choose a battle-tested template or start from scratch. You can fine-tune every step and target selector in the studio.
            </p>

            <form onSubmit={handleCreateTour} className="space-y-5">
              
              {/* Template Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 font-mono">
                  1. Select a Starter Template
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {TOUR_TEMPLATES.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id;
                    const Icon = tpl.icon;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplateId(tpl.id);
                          setNewTitle(tpl.defaultTitle);
                          setNewSlug(tpl.defaultSlug);
                        }}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-column-navy bg-slate-50 ring-2 ring-column-cyan/30 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <div
                              className={`w-6 h-6 rounded flex items-center justify-center ${
                                isSelected ? 'bg-column-navy text-column-cyan' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                              {tpl.badge}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight mb-1">
                            {tpl.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {tpl.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center space-x-1 text-[10px] font-mono text-column-navy font-bold">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Selected Template</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tour Details */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 font-mono">
                  2. Walkthrough Configuration
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Walkthrough Title
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Workspace Welcome Tour"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-column-navy focus:border-column-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      URL-Safe Slug
                    </label>
                    <input
                      type="text"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      placeholder="e.g. welcome-tour"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-column-navy focus:border-column-navy font-mono"
                    />
                  </div>
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-column-navy focus:border-column-navy font-mono"
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    Use &apos;*&apos; to trigger across all pages, or specify a path like &apos;/projects/*&apos;.
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-[11px] font-mono text-slate-400">
                  {TOUR_TEMPLATES.find((t) => t.id === selectedTemplateId)?.steps.length || 1} initial step(s) will be generated
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-column-navy hover:bg-slate-800 rounded-md shadow-xs transition-all cursor-pointer"
                  >
                    <span>Create & Launch Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Delete Walkthrough Danger Modal ── */}
      <DangerConfirmModal
        isOpen={!!deletingTour}
        onClose={() => setDeletingTour(null)}
        onConfirm={handleDelete}
        confirmName={deletingTour?.title || ''}
        title="Delete Walkthrough"
        confirmLabel="I understand, delete this walkthrough"
        resourceType="walkthrough"
        description={
          <>
            This will permanently delete{' '}
            <strong>&ldquo;{deletingTour?.title}&rdquo;</strong> including all its steps and analytics data.
          </>
        }
      />
    </div>
  );
}
