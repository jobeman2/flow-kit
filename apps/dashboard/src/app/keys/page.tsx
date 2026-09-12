'use client';

import React, { useEffect, useState } from 'react';
import {
  Key,
  Copy,
  Check,
  Plus,
  ShieldAlert,
  Code2,
  Trash2,
  Terminal,
  Layers,
  Globe2,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cdn' | 'npm' | 'react'>('cdn');
  const [loading, setLoading] = useState(true);

  const loadKeys = async () => {
    const activeProjectId = localStorage.getItem('onboardflow_active_project');
    if (!activeProjectId) return;
    try {
      setLoading(true);
      const data = await apiFetch(`/v1/projects/${activeProjectId}/keys`);
      setKeys(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const activeClientKey =
    keys.find((k) => k.type === 'PUBLIC_CLIENT' && k.status === 'ACTIVE')?.key ||
    'pk_live_demo_addis_79a2f1b4c6e8';

  const snippets = {
    cdn: `<!-- 2-Line Drop-In: Paste in any HTML / Web Application -->
<script
  src="http://localhost:4000/sdk.js"
  data-api-key="${activeClientKey}"
  data-locale="en"
></script>`,
    npm: `// Install: npm install @onboardflow/web
import { OnboardFlow } from '@onboardflow/web';

// Initialize with 1 line of code
const flow = OnboardFlow.init({
  apiKey: '${activeClientKey}',
  apiUrl: 'http://localhost:4000',
  locale: 'en', // 'am' (Amharic), 'om' (Oromo), 'en'
});`,
    react: `// Install: npm install @onboardflow/react
import { OnboardingProvider, useTour, TourTriggerButton } from '@onboardflow/react';

export default function App() {
  return (
    <OnboardingProvider apiKey="${activeClientKey}" apiUrl="http://localhost:4000">
      <YourAppComponents />
      {/* Declarative button to trigger any walkthrough */}
      <TourTriggerButton tourSlug="welcome-citizen-walkthrough">
        Take Tour
      </TourTriggerButton>
    </OnboardingProvider>
  );
}`,
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">API Keys & Integration</h1>
        <p className="text-xs text-slate-500 mt-1">
          Authenticate client SDK sessions and backend management APIs with scoped cryptographic keys.
        </p>
      </div>

      {/* 2. Integration Code Snippet */}
      <div className="bg-slate-900 rounded-sm border border-slate-800 p-5 sm:p-6 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-xs text-slate-200 uppercase tracking-wider">Drop-In SDK Integration</h2>
          </div>

          <div className="flex items-center bg-slate-800 p-1 rounded-sm space-x-1 border border-slate-700/50">
            <button
              onClick={() => setActiveTab('cdn')}
              className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'cdn' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              HTML / CDN (2 Lines)
            </button>
            <button
              onClick={() => setActiveTab('npm')}
              className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'npm' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              NPM (@onboardflow/web)
            </button>
            <button
              onClick={() => setActiveTab('react')}
              className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'react' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              React / Next.js
            </button>
          </div>
        </div>

        <div className="relative">
          <pre className="bg-slate-950 p-4 rounded-sm text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed">
            {snippets[activeTab]}
          </pre>
          <button
            onClick={() => handleCopy(snippets[activeTab], 'snippet')}
            className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center space-x-1.5 text-xs font-medium border border-slate-700 cursor-pointer"
          >
            {copiedKey === 'snippet' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Active API Keys List */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Cryptographic Keys</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Public client keys are safe to embed in client-side HTML and mobile apps.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {keys.map((key) => (
            <div key={key.id} className="p-4 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900 text-xs">{key.name}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                      key.type === 'PUBLIC_CLIENT'
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {key.type}
                  </span>
                  <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-sm font-mono border border-slate-200">
                    {key.environment}
                  </span>
                </div>
                <div className="mt-1 flex items-center space-x-2 font-mono text-xs text-slate-600">
                  <span>{key.key}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(key.key, key.id)}
                  className="px-3 py-1 rounded-sm border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  {copiedKey === key.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Key</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
