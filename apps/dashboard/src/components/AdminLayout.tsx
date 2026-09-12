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
} from 'lucide-react';
import { apiFetch, getAuthToken, setAuthTokens, removeAuthToken, getActiveProjectId, setActiveProjectId } from '@/lib/api';

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
                  GuideLayer
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

          {/* Project Switcher Card */}
          <div className="p-3.5 border-b border-slate-100">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
              Active Project
            </label>
            <div className="relative">
              <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
                <div className="flex items-center space-x-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {currentProject?.name || 'Default Project'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </div>

              {projects.length > 1 && (
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
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
    </div>
  );
}
