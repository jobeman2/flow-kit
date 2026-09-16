'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  ExternalLink,
  Smartphone,
  Server,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import { apiFetch, getActiveProjectId } from '@/lib/api';

type PlatformTab = 'cdn' | 'react' | 'wordpress' | 'php' | 'android';

export default function ApiKeysPage() {
  const [project, setProject] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PlatformTab>('cdn');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'PUBLIC_CLIENT' | 'SECRET_BACKEND'>('PUBLIC_CLIENT');
  const [newKeyEnv, setNewKeyEnv] = useState<'PRODUCTION' | 'TEST'>('PRODUCTION');
  const [creating, setCreating] = useState(false);
  const [alertNotice, setAlertNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlertNotice({ message, type });
    setTimeout(() => setAlertNotice(null), 3500);
  };

  const loadData = async () => {
    const activeProjectId = getActiveProjectId();
    if (!activeProjectId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [projData, keysData] = await Promise.all([
        apiFetch(`/v1/projects/${activeProjectId}`).catch(() => null),
        apiFetch(`/v1/projects/${activeProjectId}/keys`).catch(() => []),
      ]);
      setProject(projData);
      setKeys(keysData || []);
    } catch (e) {
      console.error('Failed to load project keys', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('projectChanged', loadData);
    return () => window.removeEventListener('projectChanged', loadData);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    showAlert('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeProjectId = getActiveProjectId();
    if (!activeProjectId || !newKeyName.trim()) return;

    try {
      setCreating(true);
      const newKey = await apiFetch(`/v1/projects/${activeProjectId}/keys`, {
        method: 'POST',
        body: JSON.stringify({
          name: newKeyName.trim(),
          type: newKeyType,
          environment: newKeyEnv,
        }),
      });

      setKeys((prev) => [newKey, ...prev]);
      setIsCreateModalOpen(false);
      setNewKeyName('');
      showAlert(`New ${newKeyType === 'PUBLIC_CLIENT' ? 'Public' : 'Backend'} API Key provisioned!`);
    } catch (err: any) {
      console.error(err);
      showAlert(err.message || 'Failed to create key', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Applications using it will immediately cease to load tours.')) {
      return;
    }

    const activeProjectId = getActiveProjectId();
    if (!activeProjectId) return;

    try {
      await apiFetch(`/v1/projects/${activeProjectId}/keys/${keyId}`, {
        method: 'DELETE',
      });
      setKeys((prev) =>
        prev.map((k) => (k.id === keyId ? { ...k, status: 'REVOKED', revokedAt: new Date().toISOString() } : k))
      );
      showAlert('API key revoked successfully.');
    } catch (err: any) {
      console.error(err);
      showAlert('Failed to revoke API key', 'error');
    }
  };

  const activeClientKey =
    keys.find((k) => k.type === 'PUBLIC_CLIENT' && k.status === 'ACTIVE')?.key ||
    'pk_live_demo_79a2f1b4c6e8';

  const snippets: Record<PlatformTab, { title: string; code: string; note: string }> = {
    cdn: {
      title: 'Universal HTML / CDN (2 Lines)',
      note: 'Works on any web page: Webflow, Shopify, Squarespace, Wix, Framer, or static HTML.',
      code: `<!-- Flow-Kit Universal Walkthrough SDK -->
<!-- Place immediately before the closing </body> tag -->
<script
  src="http://localhost:4000/sdk.js"
  data-api-key="${activeClientKey}"
  data-locale="en"
  defer
></script>

<!-- (Optional) Declarative button to trigger any tour manually -->
<button data-flowkit-tour="welcome-walkthrough">
  Take Interactive Tour
</button>`,
    },
    react: {
      title: 'React & Next.js (@flow-kit/react)',
      note: 'Official wrapper for React 18+ and Next.js (App Router & Pages Router) with TypeScript support.',
      code: `// 1. Install official package
// npm install @flow-kit/react   (or: pnpm add @flow-kit/react)

// 2. Wrap your root layout (e.g. app/layout.tsx or _app.tsx)
'use client';

import { FlowKitProvider, useFlowKit, TourTriggerButton } from '@flow-kit/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <FlowKitProvider
      apiKey="${activeClientKey}"
      apiUrl="http://localhost:4000"
      locale="en" // dynamically set to 'am' (Amharic), 'om' (Oromo), 'en'
    >
      <Navbar />
      {children}
    </FlowKitProvider>
  );
}

// 3. Programmatic control anywhere in your components:
function Header() {
  const { startTour, nextStep, prevStep } = useFlowKit();

  return (
    <div className="flex items-center gap-3">
      {/* Method A: Direct function call */}
      <button onClick={() => startTour('welcome-walkthrough')}>
        Start Onboarding
      </button>

      {/* Method B: Declarative button component */}
      <TourTriggerButton tourSlug="feature-tour">
        Explore New Features
      </TourTriggerButton>
    </div>
  );
}`,
    },
    wordpress: {
      title: 'WordPress & WooCommerce',
      note: 'Drop into functions.php or any Code Snippets plugin. Fully compatible with WooCommerce checkout & cart funnels.',
      code: `<?php
/**
 * Add Flow-Kit Onboarding Tours to WordPress
 * Paste in your active child theme's functions.php or Code Snippets plugin
 */
function flowkit_register_walkthrough_sdk() {
    // Only load on front-end public pages
    if (is_admin()) return;

    // Enqueue SDK in page footer
    wp_enqueue_script(
        'flowkit-sdk',
        'http://localhost:4000/sdk.js',
        array(),
        '1.0.0',
        array('strategy' => 'defer', 'in_footer' => true)
    );

    // Inject active project public API key
    wp_script_add_data('flowkit-sdk', 'data-api-key', '${activeClientKey}');
    wp_script_add_data('flowkit-sdk', 'data-locale', get_locale() === 'am_ET' ? 'am' : 'en');
}
add_action('wp_enqueue_scripts', 'flowkit_register_walkthrough_sdk');

/**
 * Shortcode to trigger tours from posts, pages, or Elementor widgets:
 * Usage: [flowkit_tour slug="store-guide" label="Start Store Guide"]
 */
function flowkit_tour_shortcode($atts) {
    $args = shortcode_atts(array(
        'slug'  => 'welcome-walkthrough',
        'label' => 'Start Guided Tour',
        'class' => 'button flowkit-trigger-btn'
    ), $atts);

    return sprintf(
        '<button type="button" class="%s" data-flowkit-tour="%s">%s</button>',
        esc_attr($args['class']),
        esc_attr($args['slug']),
        esc_html($args['label'])
    );
}
add_shortcode('flowkit_tour', 'flowkit_tour_shortcode');
?>`,
    },
    php: {
      title: 'Vanilla PHP & Laravel',
      note: 'Use Laravel Blade directives or standard PHP header helpers for full backend rendering.',
      code: `{{-- ========================================== --}}
{{-- 1. LARAVEL BLADE (resources/views/layouts/app.blade.php) --}}
{{-- ========================================== --}}
{{-- Place immediately before the closing </body> tag: --}}
<script
    src="{{ config('services.flowkit.url', 'http://localhost:4000') }}/sdk.js"
    data-api-key="{{ config('services.flowkit.key', '${activeClientKey}') }}"
    data-locale="{{ app()->getLocale() }}"
    defer>
</script>

{{-- In config/services.php --}}
'flowkit' => [
    'key' => env('FLOWKIT_PUBLIC_KEY', '${activeClientKey}'),
    'url' => env('FLOWKIT_API_URL', 'http://localhost:4000'),
],

<?php
// ==========================================
// 2. VANILLA PHP HELPER (e.g. header.php)
// ==========================================
function render_flowkit_sdk($apiKey = '${activeClientKey}', $locale = 'en') {
    $safeKey = htmlspecialchars($apiKey, ENT_QUOTES, 'UTF-8');
    $safeLocale = htmlspecialchars($locale, ENT_QUOTES, 'UTF-8');
    echo "<script src=\"http://localhost:4000/sdk.js\" data-api-key=\"{$safeKey}\" data-locale=\"{$safeLocale}\" defer></script>";
}
?>`,
    },
    android: {
      title: 'Android (WebView & Native Kotlin)',
      note: 'Embed seamlessly in Android WebView hybrid applications or fetch tour JSON directly for Jetpack Compose.',
      code: `// ==============================================================
// OPTION A: Android WebView Integration (Hybrid / PWA)
// ==============================================================
// In your MainActivity.kt or Fragment:
import android.webkit.WebView
import android.webkit.WebSettings

val webView: WebView = findViewById(R.id.flowkit_webview)
webView.settings.apply {
    javaScriptEnabled = true
    domStorageEnabled = true
    databaseEnabled = true
}

// The Flow-Kit SDK automatically works within your web app:
webView.loadUrl("https://your-domain.com?flowkitKey=${activeClientKey}")

// ==============================================================
// OPTION B: Native Jetpack Compose / Kotlin (REST Bootstrap)
// ==============================================================
// 1. Fetch tour metadata and step targets via Flow-Kit REST endpoint:
// GET http://localhost:4000/v1/sdk/bootstrap?apiKey=${activeClientKey}&url=/home

data class FlowKitStep(
    val stepIndex: Int,
    val targetSelector: String?,
    val placement: String,
    val title: String,
    val content: String
)

// 2. Track funnel events back to the dashboard:
// POST http://localhost:4000/v1/events
// Body:
// {
//   "apiKey": "${activeClientKey}",
//   "tourId": "tour_uuid_here",
//   "type": "STEP_VIEW",
//   "stepIndex": 0
// }`,
    },
  };

  return (
    <div className="space-y-6">
      {/* Global Alert Notification */}
      {alertNotice && (
        <div
          className={`flex items-center justify-between p-3.5 px-4 rounded-sm border text-xs font-semibold animate-in fade-in ${
            alertNotice.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {alertNotice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            ) : (
              <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            )}
            <span>{alertNotice.message}</span>
          </div>
          <button
            onClick={() => setAlertNotice(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Header & Active Project Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">API Keys & Integration</h1>
            {project && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-900 text-white tracking-wide">
                {project.name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Scoped cryptographic keys and drop-in integration packages for web, WordPress, PHP, and Android.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/projects"
            className="px-3 py-1.5 rounded-sm border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <Globe2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Switch Website</span>
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Key</span>
          </button>
        </div>
      </div>

      {/* 2. Multi-Platform Integration Suite */}
      <div className="bg-slate-900 rounded-sm border border-slate-800 p-5 sm:p-6 text-white shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="font-semibold text-xs text-slate-200 uppercase tracking-wider">
              Drop-In SDK Integration
            </h2>
          </div>

          {/* Platform Switcher Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-sm space-x-1 border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('cdn')}
              className={`px-3 py-1 rounded-sm text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'cdn'
                  ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>HTML / CDN</span>
            </button>
            <button
              onClick={() => setActiveTab('react')}
              className={`px-3 py-1 rounded-sm text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'react'
                  ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>React & Next.js</span>
            </button>
            <button
              onClick={() => setActiveTab('wordpress')}
              className={`px-3 py-1 rounded-sm text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'wordpress'
                  ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>WordPress / WooCommerce</span>
            </button>
            <button
              onClick={() => setActiveTab('php')}
              className={`px-3 py-1 rounded-sm text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'php'
                  ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>PHP / Laravel</span>
            </button>
            <button
              onClick={() => setActiveTab('android')}
              className={`px-3 py-1 rounded-sm text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'android'
                  ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>
          </div>
        </div>

        {/* Note banner */}
        <div className="mb-3 text-[11px] text-slate-400 flex items-center space-x-1.5">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <span>{snippets[activeTab].note}</span>
        </div>

        {/* Code Snippet Box */}
        <div className="relative">
          <pre className="bg-slate-950 p-4 rounded-sm text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed max-h-[380px]">
            {snippets[activeTab].code}
          </pre>
          <button
            onClick={() => handleCopy(snippets[activeTab].code, `snippet-${activeTab}`)}
            className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center space-x-1.5 text-xs font-medium border border-slate-700 cursor-pointer shadow-xs"
          >
            {copiedKey === `snippet-${activeTab}` ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy Snippet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Active Cryptographic Keys Table */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Cryptographic Keys for {project ? project.name : 'Current Project'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Public client keys (<code className="font-mono text-slate-700">pk_*</code>) are safe to embed in client HTML and mobile apps. Secret backend keys (<code className="font-mono text-slate-700">sk_*</code>) must be kept secure.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1 rounded-sm border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>New Key</span>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading cryptographic keys...</div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No API keys found for this project. Click &ldquo;Create Key&rdquo; to generate one.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {keys.map((k) => (
              <div
                key={k.id}
                className="p-4 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900 text-xs">{k.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                        k.type === 'PUBLIC_CLIENT'
                          ? 'bg-slate-100 text-slate-800 border border-slate-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {k.type}
                    </span>
                    <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-sm font-mono border border-slate-200">
                      {k.environment}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                        k.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {k.status}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center space-x-2 font-mono text-xs text-slate-600">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] select-all border border-slate-200/60">
                      {k.key}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopy(k.key, k.id)}
                    className="px-3 py-1 rounded-sm border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    {copiedKey === k.id ? (
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

                  {k.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleRevokeKey(k.id)}
                      title="Revoke this API Key"
                      className="p-1 rounded-sm text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Create Key Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-sm border border-slate-200 shadow-xl max-w-md w-full p-6 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-slate-800" />
                <h3 className="font-bold text-sm text-slate-900">Provision New API Key</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Description / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staging Website, Mobile App Bridge"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Key Type</label>
                  <select
                    value={newKeyType}
                    onChange={(e: any) => setNewKeyType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="PUBLIC_CLIENT">Public Client (pk_*)</option>
                    <option value="SECRET_BACKEND">Secret Backend (sk_*)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Environment</label>
                  <select
                    value={newKeyEnv}
                    onChange={(e: any) => setNewKeyEnv(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="PRODUCTION">Production</option>
                    <option value="TEST">Test / Dev</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm text-[11px] text-slate-600 leading-relaxed">
                Public client keys are constrained to read-only walkthrough bootstrapping for configured allowed domains.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newKeyName.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {creating ? 'Provisioning...' : 'Provision Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
