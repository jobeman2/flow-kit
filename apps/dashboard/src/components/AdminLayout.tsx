'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  Compass,
  LayoutDashboard,
  Layers,
  BarChart3,
  Key,
  LogOut,
  FolderDot,
  Globe2,
  ExternalLink,
  Plus,
  Search,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  LifeBuoy,
  Check,
} from 'lucide-react';
import { apiFetch, getAuthToken, setAuthTokens, removeAuthToken, getActiveProjectId, setActiveProjectId } from '@/lib/api';
import CreateProjectModal from './CreateProjectModal';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sync Clerk authenticated user with backend session
  useEffect(() => {
    if (!clerkLoaded) return;

    if (clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress;
      const fullName = clerkUser.fullName || clerkUser.firstName || email?.split('@')[0] || 'User';
      
      // Auto-sync / provision user in database
      apiFetch('/v1/auth/oauth', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'GOOGLE',
          profile: {
            email: email,
            name: fullName,
            providerId: clerkUser.id,
          },
        }),
      })
        .then((res) => {
          if (res.accessToken) {
            setAuthTokens(res.accessToken, res.refreshToken);
          }
          return apiFetch('/v1/auth/me');
        })
        .then((u) => {
          if (u) setUser(u);
          return apiFetch('/v1/projects');
        })
        .then((projs) => {
          if (projs && projs.length > 0) {
            setProjects(projs);
            const savedProj = getActiveProjectId();
            const current = projs.find((p: any) => p.id === savedProj) || projs[0];
            setSelectedProjectId(current.id);
            setActiveProjectId(current.id);
          }
        })
        .catch((err) => {
          console.error('Session sync error:', err);
        });
    } else {
      // If no Clerk user and no local token, redirect to login
      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }

      apiFetch('/v1/auth/me')
        .then((u) => setUser(u))
        .catch(() => {});

      apiFetch('/v1/projects')
        .then((projs) => {
          if (projs && projs.length > 0) {
            setProjects(projs);
            const savedProj = getActiveProjectId();
            const current = projs.find((p: any) => p.id === savedProj) || projs[0];
            setSelectedProjectId(current.id);
            setActiveProjectId(current.id);
          }
        })
        .catch(() => {});
    }
  }, [clerkUser, clerkLoaded, router]);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveProjectId(projectId);
    window.dispatchEvent(new Event('projectChanged'));
  };

  const handleLogout = async () => {
    removeAuthToken();
    try {
      await signOut();
    } catch {}
    router.push('/login');
  };

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const navItems = [
    { href: '/console', label: 'Overview', icon: LayoutDashboard },
    { href: '/projects', label: 'All Websites (Projects)', icon: FolderDot },
    { href: '/tours', label: 'Tours & Studio', icon: Layers },
    { href: '/analytics', label: 'Funnel Analytics', icon: BarChart3 },
    { href: '/keys', label: 'API Keys & Setup', icon: Key },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row text-slate-900 font-sans antialiased">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-slate-900 leading-none">
                  Flow-Kit
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5">
                  CONSOLE
                </span>
              </div>
            </Link>

            <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
              v1.0
            </span>
          </div>

          {/* Project Switcher Card with Instant Search & Creation */}
          <div className="p-3.5 border-b border-slate-100 relative">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Active Website / Project
              </label>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="text-[10px] text-slate-500 hover:text-slate-900 font-semibold flex items-center space-x-0.5 cursor-pointer"
                title="Create new project"
              >
                <Plus className="w-3 h-3 text-slate-600" />
                <span>New</span>
              </button>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="w-full flex items-center justify-between p-2 rounded-sm bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center space-x-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {currentProject?.name || 'Default Project'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Searchable Dropdown Popover */}
              {showProjectDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => {
                      setShowProjectDropdown(false);
                      setProjectSearch('');
                    }}
                  />
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-sm shadow-xl z-30 py-1 max-h-72 flex flex-col overflow-hidden animate-in fade-in duration-100">
                    {/* Search Input */}
                    <div className="p-1.5 border-b border-slate-100">
                      <div className="relative">
                        <input
                          type="text"
                          value={projectSearch}
                          onChange={(e) => setProjectSearch(e.target.value)}
                          placeholder="Search websites..."
                          className="w-full pl-7 pr-2 py-1 text-xs border border-slate-200 rounded-sm bg-slate-50 focus:outline-none focus:border-slate-800 font-sans"
                          autoFocus
                        />
                        <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                      </div>
                    </div>

                    {/* Projects List */}
                    <div className="overflow-y-auto flex-1 divide-y divide-slate-50 max-h-48">
                      {projects
                        .filter((p) => p.name.toLowerCase().includes(projectSearch.toLowerCase()))
                        .map((p) => {
                          const isSelected = p.id === selectedProjectId;
                          const tourCount = p._count?.tours || p.tours?.length || 0;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                handleProjectChange(p.id);
                                setShowProjectDropdown(false);
                                setProjectSearch('');
                              }}
                              className={`w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected ? 'bg-slate-100 font-semibold text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate pr-1">
                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                <span className="truncate">{p.name}</span>
                              </div>
                              <div className="flex items-center space-x-1 shrink-0 text-[10px] text-slate-400 font-mono">
                                <span>{tourCount} tours</span>
                                {isSelected && <Check className="w-3 h-3 text-emerald-600 ml-1 stroke-[2.5]" />}
                              </div>
                            </button>
                          );
                        })}

                      {projects.filter((p) => p.name.toLowerCase().includes(projectSearch.toLowerCase())).length === 0 && (
                        <div className="p-3 text-center text-xs text-slate-400">
                          No matching projects
                        </div>
                      )}
                    </div>

                    {/* Dropdown Footer */}
                    <div className="p-1.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProjectDropdown(false);
                          setShowCreateModal(true);
                        }}
                        className="px-2 py-0.5 text-slate-700 hover:text-slate-900 font-medium flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-slate-500" />
                        <span>New Project</span>
                      </button>
                      <Link
                        href="/projects"
                        onClick={() => setShowProjectDropdown(false)}
                        className="px-2 py-0.5 text-slate-500 hover:text-slate-900 font-medium"
                      >
                        All ({projects.length}) →
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Nav Links */}
          <nav className="p-3 space-y-1">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 pt-2 pb-1">
              Platform
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/console' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-sm text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / Real Authenticated User Profile */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
          <div className="p-2.5 rounded-sm bg-white border border-slate-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-sm bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {clerkUser?.firstName?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || clerkUser?.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {clerkUser?.fullName || clerkUser?.firstName || user?.name || 'Workspace Admin'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  {clerkUser?.primaryEmailAddress?.emailAddress || user?.email || ''}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Workspace Top Toolbar */}
        <header className="h-14 px-6 sm:px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 sticky top-0 z-30">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Console</span>
            <span className="text-slate-300 font-mono">/</span>
            <span className="font-semibold text-slate-800 capitalize">
              {pathname === '/console' ? 'Overview' : pathname.replace('/', '').replace(/-/g, ' ')}
            </span>
          </div>
        </header>

        {/* Dynamic Page Body */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={(newProj) => {
          setProjects((prev) => [...prev, newProj]);
          handleProjectChange(newProj.id);
        }}
      />
    </div>
  );
}
