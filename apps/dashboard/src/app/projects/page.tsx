'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FolderDot,
  Plus,
  Search,
  Globe2,
  Key,
  Layers,
  BarChart3,
  ExternalLink,
  Check,
  Copy,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { apiFetch, getActiveProjectId, setActiveProjectId } from '@/lib/api';
import { useToast } from '@/components/Toast';
import CreateProjectModal from '@/components/CreateProjectModal';

export default function ProjectsHubPage() {
  const router = useRouter();
  const toast = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeProjectId, setActiveId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/v1/projects');
      if (Array.isArray(data)) {
        setProjects(data);
        const currentActive = getActiveProjectId() || data[0]?.id;
        setActiveId(currentActive);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSelectProject = (id: string, targetPath?: string) => {
    setActiveProjectId(id);
    setActiveId(id);
    window.dispatchEvent(new Event('projectChanged'));
    toast.success('Switched active project', 'Project Selected');
    if (targetPath) {
      router.push(targetPath);
    }
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    toast.success('API Key copied to clipboard', 'Copied');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesName = p.name.toLowerCase().includes(q);
    const matchesSlug = p.slug?.toLowerCase().includes(q);
    const matchesDomain = p.domains?.some((d: string) => d.toLowerCase().includes(q));
    return matchesName || matchesSlug || matchesDomain;
  });

  const totalTours = projects.reduce((sum, p) => sum + (p._count?.tours || p.tours?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Projects Hub
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {projects.length} {projects.length === 1 ? 'Website' : 'Websites'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage, configure, and switch between your websites, web applications, and their scoped walkthroughs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* 2. Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Connected Websites
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{projects.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Isolated API keys & domain spaces</div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Walkthroughs
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalTours}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active across all connected apps</div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            SDK Integration
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 flex items-center space-x-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Ready</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Universal drop-in script & React</div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, slug, or domain..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-sm bg-white focus:outline-none focus:border-slate-800"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* 4. Projects Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-medium">
          Loading projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-sm border border-slate-200 p-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <FolderDot className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">
            {searchQuery ? 'No projects match your search' : 'No projects yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {searchQuery
              ? 'Try adjusting your search keywords or clear the filter.'
              : 'Create your first project to start building walkthroughs.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 rounded-sm bg-slate-900 text-white text-xs font-semibold cursor-pointer"
            >
              + Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => {
            const isActive = p.id === activeProjectId;
            const primaryKey =
              p.apiKeys?.find((k: any) => k.type === 'PUBLIC_CLIENT' && k.status === 'ACTIVE')?.key ||
              'pk_live_' + p.id.substring(0, 16);
            const tourCount = p._count?.tours || p.tours?.length || 0;
            const domains = p.domains || [];

            return (
              <div
                key={p.id}
                className={`bg-white rounded-sm border transition-all duration-200 flex flex-col justify-between shadow-xs ${
                  isActive
                    ? 'border-slate-900 ring-1 ring-slate-900/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-5 space-y-3">
                  {/* Card Top: Title & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                          {p.name}
                        </h3>
                        {isActive && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        slug: <span className="text-slate-600">{p.slug}</span>
                      </p>
                    </div>

                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  </div>

                  {/* Domains */}
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Allowed Domains
                    </div>
                    {domains.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {domains.map((d: string) => (
                          <span
                            key={d}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-50 text-slate-600 border border-slate-200 truncate max-w-[200px]"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">All domains allowed (*)</span>
                    )}
                  </div>

                  {/* API Key Box */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      <span>Public Client Key</span>
                      <button
                        type="button"
                        onClick={() => handleCopyKey(primaryKey, p.id)}
                        className="text-slate-500 hover:text-slate-900 flex items-center space-x-0.5 cursor-pointer font-sans"
                      >
                        {copiedKey === p.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <code className="block bg-slate-50 p-1.5 rounded-sm text-[10px] font-mono text-slate-700 border border-slate-200 truncate">
                      {primaryKey}
                    </code>
                  </div>
                </div>

                {/* Card Footer: Quick Actions */}
                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tourCount} {tourCount === 1 ? 'Walkthrough' : 'Walkthroughs'}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => router.push('/console')}
                        className="px-2.5 py-1 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Open Dashboard</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectProject(p.id, '/console')}
                        className="px-2.5 py-1 rounded-sm bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer transition-colors"
                      >
                        Switch To
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={(newProj) => {
          loadProjects();
          window.dispatchEvent(new Event('projectChanged'));
        }}
      />
    </div>
  );
}
