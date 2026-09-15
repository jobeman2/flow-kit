'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Layers,
  BarChart3,
  Key,
  LogOut,
  FolderDot,
  Globe2,
  ExternalLink,
} from 'lucide-react';
import { apiFetch, getAuthToken, removeAuthToken } from '@/lib/api';
import CustomSelect from '@/components/CustomSelect';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  const isPublicPage = pathname === '/' || pathname === '/login';

  useEffect(() => {
    if (isPublicPage) return;

    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user & projects
    apiFetch('/v1/auth/me')
      .then((u) => setUser(u))
      .catch(() => {});

    apiFetch('/v1/projects')
      .then((projs) => {
        if (projs && projs.length > 0) {
          setProjects(projs);
          const savedProj = localStorage.getItem('onboardflow_active_project');
          const current = projs.find((p: any) => p.id === savedProj) || projs[0];
          setSelectedProjectId(current.id);
          localStorage.setItem('onboardflow_active_project', current.id);
        }
      })
      .catch(() => {});
  }, [pathname, isPublicPage, router]);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    localStorage.setItem('onboardflow_active_project', projectId);
    window.dispatchEvent(new Event('projectChanged'));
  };

  const handleLogout = () => {
    removeAuthToken();
    router.push('/login');
  };

  if (isPublicPage) return null;

  const navItems = [
    { href: '/console', label: 'Overview', icon: Compass },
    { href: '/tours', label: 'Tours & Studio', icon: Layers },
    { href: '/analytics', label: 'Funnel Analytics', icon: BarChart3 },
    { href: '/keys', label: 'API Keys & Setup', icon: Key },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-soft-sm group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">
                Guide<span className="text-brand-600">Layer</span>
              </span>
            </Link>

            {/* Project Switcher */}
            {projects.length > 0 && (
              <div className="flex items-center space-x-2 bg-slate-100/70 border border-slate-200/80 rounded-xl px-3 py-1 text-xs">
                <FolderDot className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <CustomSelect
                  value={selectedProjectId}
                  onChange={handleProjectChange}
                  options={projects.map((p) => ({ value: p.id, label: p.name }))}
                  className="min-w-[120px]"
                />
              </div>
            )}

            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/console' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 shadow-soft-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mr-1.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              target="_blank"
              className="hidden lg:flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 font-medium"
            >
              <span>Landing Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multilingual Engine</span>
            </div>

            {user && (
              <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-800">{user.name || user.email}</div>
                  <div className="text-[10px] text-slate-400">Admin</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
