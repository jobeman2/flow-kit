'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Copy,
  Check,
  Terminal,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Search,
  CheckCircle2,
  Code2,
  Globe2,
  ShieldCheck,
  Sliders,
  Play,
  ArrowLeft,
} from 'lucide-react';
import LiveDemoOverlay, { TourDemoStep } from '@/components/LiveDemoOverlay';

export default function DocsPage() {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [activePkgTab, setActivePkgTab] = useState<'npm' | 'pnpm' | 'yarn' | 'cdn'>('npm');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://flow-kit.onrender.com';

  const copyCode = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(key);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const installSnippets = {
    npm: 'npm install @flow-kit/web',
    pnpm: 'pnpm add @flow-kit/web',
    yarn: 'yarn add @flow-kit/web',
    cdn: `<!-- Add to HTML <head> or <body> -->
<script
  src="${apiUrl}/flow-kit.js"
  data-api-key="pk_live_your_project_key"
  data-locale="en"
></script>`,
  };

  const docsTourSteps: TourDemoStep[] = [
    {
      targetSelector: '#docs-header-title',
      title: 'Welcome to Flow-Kit Documentation',
      description: 'Clean, developer-first documentation inspired by Driver.js and Resend. Everything is step-by-step.',
      placement: 'bottom',
      badge: 'Step 1 of 3',
    },
    {
      targetSelector: '#install-code-box',
      title: 'Universal Installation',
      description: 'Install using npm, pnpm, yarn, or embed via a single zero-dependency HTML script tag.',
      placement: 'bottom',
      badge: 'Step 2 of 3',
    },
    {
      targetSelector: '#options-table',
      title: 'Declarative Step Configuration',
      description: 'Easily target CSS selectors, customize placements, and localize content across multiple languages.',
      placement: 'top',
      badge: 'Step 3 of 3',
    },
  ];

  const sidebarLinks = [
    {
      category: 'Getting Started',
      items: [
        { label: 'Introduction', href: '#introduction' },
        { label: 'Installation', href: '#installation', active: true },
        { label: 'Quick Start', href: '#quickstart' },
      ],
    },
    {
      category: 'Integration Guides',
      items: [
        { label: 'HTML / CDN Embed', href: '#html-cdn' },
        { label: 'Next.js & React', href: '#react-next' },
        { label: 'Vue & Nuxt', href: '#vue-nuxt' },
      ],
    },
    {
      category: 'Core Features',
      items: [
        { label: 'Visual In-App Builder', href: '#visual-builder' },
        { label: 'Multilingual (i18n)', href: '#multilingual' },
        { label: 'Selectors & Target Engine', href: '#selectors' },
      ],
    },
    {
      category: 'Configuration & API',
      items: [
        { label: 'Step Options Reference', href: '#options-table' },
        { label: 'Global SDK Options', href: '#global-options' },
        { label: 'Telemetry & Events', href: '#telemetry' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      {/* Top Docs Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-7 h-7 bg-column-navy flex items-center justify-center text-white font-mono text-xs font-bold rounded-sm group-hover:bg-column-cyan group-hover:text-column-navy transition-colors">
                FK
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-bold text-sm tracking-tight text-column-navy">
                  Flow-Kit
                </span>
                <span className="text-xs font-mono text-slate-500 font-normal">
                  / docs
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
              v1.0.0
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsDemoRunning(true)}
              className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-medium text-column-navy bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition-colors cursor-pointer border border-slate-200"
            >
              <Play className="w-3.5 h-3.5 text-column-cyan" />
              <span>Run Tour on Docs</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-column-navy transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/console"
              className="inline-flex items-center text-xs font-semibold text-white bg-column-navy hover:bg-slate-800 px-3 py-1.5 rounded transition-all shadow-xs"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Two-Column Layout (Driver.js / Resend Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Sticky Sidebar */}
        <aside className="w-full md:w-64 shrink-0 md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-6rem)] md:overflow-y-auto pr-2 pb-8">
          {/* Quick Search */}
          <div className="relative mb-6">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-column-navy font-mono transition-all"
            />
          </div>

          {/* Nav Categories */}
          <nav className="space-y-6">
            {sidebarLinks.map((cat, idx) => (
              <div key={idx}>
                <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {cat.category}
                </h4>
                <ul className="space-y-1 text-xs">
                  {cat.items.map((item, i) => (
                    <li key={i}>
                      <a
                        href={item.href}
                        className={`block px-2.5 py-1.5 rounded transition-colors ${
                          item.active
                            ? 'bg-slate-100 font-semibold text-column-navy border-l-2 border-column-navy'
                            : 'text-slate-600 hover:text-column-navy hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Quick Help Card */}
          <div className="mt-8 p-3 rounded-lg border border-slate-200 bg-slate-50/70 text-xs">
            <div className="flex items-center space-x-1.5 text-column-navy font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-column-cyan" />
              <span>Need Live Assistance?</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
              Launch the in-app builder on your web page by pressing <kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">Alt + B</kbd>.
            </p>
          </div>
        </aside>

        {/* Right Main Documentation Content Area */}
        <main className="flex-1 min-w-0 max-w-4xl pb-16">
          
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-500 mb-4">
            <span>Docs</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span>Getting Started</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-column-navy font-semibold">Installation</span>
          </div>

          {/* Header Title Section */}
          <div id="docs-header-title" className="mb-8 pb-6 border-b border-slate-200">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-column-navy tracking-tight mb-3">
              Installation & Quickstart
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl mb-4">
              Flow-Kit is an ultra-lightweight (under 16KB) product walkthrough engine. It works natively across any HTML website, Next.js, React, Vue, or backend platform with zero build complications.
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsDemoRunning(true)}
                className="inline-flex items-center space-x-2 text-xs font-semibold text-white bg-column-navy hover:bg-slate-800 px-4 py-2 rounded-md transition-all shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-column-cyan" />
                <span>Try Live Walkthrough On This Page</span>
              </button>

              <span className="text-xs font-mono text-slate-400">
                // Zero Iframes • Native DOM
              </span>
            </div>
          </div>

          {/* Section: Installation */}
          <section id="installation" className="mb-12">
            <h2 className="text-xl font-bold text-column-navy tracking-tight mb-2">
              1. Install the Package
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              Install the client SDK using your preferred package manager, or include it directly via the CDN script tag.
            </p>

            {/* Tabbed Code Box */}
            <div id="install-code-box" className="rounded-lg border border-slate-800 bg-column-dark overflow-hidden mb-6 shadow-sm">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  {(['npm', 'pnpm', 'yarn', 'cdn'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActivePkgTab(tab)}
                      className={`text-xs font-mono px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        activePkgTab === tab
                          ? 'bg-slate-800 text-white font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => copyCode('install', installSnippets[activePkgTab])}
                  className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer font-mono"
                >
                  {copiedSnippet === 'install' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-column-cyan" />
                      <span className="text-column-cyan">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-slate-200 leading-relaxed">
                  <code>{installSnippets[activePkgTab]}</code>
                </pre>
              </div>
            </div>
          </section>

          {/* Section: Quickstart */}
          <section id="quickstart" className="mb-12">
            <h2 className="text-xl font-bold text-column-navy tracking-tight mb-2">
              2. Initialize Flow-Kit
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              Initialize Flow-Kit by passing your public API key and optional default locale. Flow-Kit will automatically mount the SVG spotlight overlay and telemetry listeners.
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 mb-4 overflow-x-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-slate-400">// app.js or index.ts</span>
                <button
                  onClick={() =>
                    copyCode(
                      'init',
                      `import { FlowKit } from '@flow-kit/web';\n\nconst flow = FlowKit.init({\n  apiKey: 'pk_live_sample_customer_key',\n  locale: 'en', // 'en' | 'am' (Amharic) | 'om' (Oromo)\n  autoStart: true,\n});`
                    )
                  }
                  className="text-slate-500 hover:text-column-navy font-mono cursor-pointer"
                >
                  {copiedSnippet === 'init' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-slate-800">
                <code>{`import { FlowKit } from '@flow-kit/web';

const flow = FlowKit.init({
  apiKey: 'pk_live_sample_customer_key',
  locale: 'en', // 'en' | 'am' (Amharic) | 'om' (Oromo)
  autoStart: true,
});`}</code>
              </pre>
            </div>
          </section>

          {/* Section: Options Table (Driver.js inspired) */}
          <section id="options-table" className="mb-12">
            <h2 className="text-xl font-bold text-column-navy tracking-tight mb-2">
              Step Configuration Reference
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              Each walkthrough step accepts the following parameters. When using the Visual Builder, these are generated visually for you.
            </p>

            <div className="rounded-lg border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-column-navy font-mono">
                    <tr>
                      <th className="py-2.5 px-4 font-bold">Property</th>
                      <th className="py-2.5 px-4 font-bold">Type</th>
                      <th className="py-2.5 px-4 font-bold">Default</th>
                      <th className="py-2.5 px-4 font-bold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-600 font-sans">
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-column-navy">targetSelector</td>
                      <td className="py-3 px-4 font-mono text-emerald-700">string</td>
                      <td className="py-3 px-4 font-mono text-slate-400">required</td>
                      <td className="py-3 px-4">CSS selector of the element to highlight (e.g. <code>#search-bar</code> or <code>.btn-submit</code>).</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-column-navy">title</td>
                      <td className="py-3 px-4 font-mono text-emerald-700">string</td>
                      <td className="py-3 px-4 font-mono text-slate-400">required</td>
                      <td className="py-3 px-4">The main heading displayed inside the step popover card.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-column-navy">description</td>
                      <td className="py-3 px-4 font-mono text-emerald-700">string</td>
                      <td className="py-3 px-4 font-mono text-slate-400">required</td>
                      <td className="py-3 px-4">Detailed instructional copy explaining the target element.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-column-navy">placement</td>
                      <td className="py-3 px-4 font-mono text-emerald-700">&apos;top&apos; | &apos;bottom&apos; | &apos;left&apos; | &apos;right&apos;</td>
                      <td className="py-3 px-4 font-mono">&apos;bottom&apos;</td>
                      <td className="py-3 px-4">Preferred alignment of the popover relative to the target element. Automatically flips if offscreen.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-column-navy">advanceOnSelectorClick</td>
                      <td className="py-3 px-4 font-mono text-emerald-700">boolean</td>
                      <td className="py-3 px-4 font-mono">false</td>
                      <td className="py-3 px-4">When <code>true</code>, automatically advances to the next step when the user clicks the highlighted target element.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-column-navy">locale</td>
                      <td className="py-3 px-4 font-mono text-emerald-700">&apos;en&apos; | &apos;am&apos; | &apos;om&apos;</td>
                      <td className="py-3 px-4 font-mono">&apos;en&apos;</td>
                      <td className="py-3 px-4">Target language. Supports English, Amharic (አማርኛ), and Afaan Oromoo natively.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section: Visual In-App Builder */}
          <section id="visual-builder" className="mb-12">
            <h2 className="text-xl font-bold text-column-navy tracking-tight mb-2">
              Visual In-App Builder Mode
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              You do not need to write CSS selectors manually. You can trigger the visual builder directly inside your live app.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 bg-white">
                <span className="font-mono text-xs font-bold text-column-navy block mb-1">Hotkey Shortcut</span>
                <p className="text-xs text-slate-600">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-xs">Alt + B</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-xs">Ctrl + Shift + F</kbd> while browsing your site to toggle the live builder toolbar.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-white">
                <span className="font-mono text-xs font-bold text-column-navy block mb-1">URL Query Parameter</span>
                <p className="text-xs text-slate-600">
                  Append <code>?flowkit_builder=true</code> to your URL to immediately load the visual selection dock and step editor.
                </p>
              </div>
            </div>
          </section>

          {/* Next / Previous Navigation Links */}
          <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-column-navy transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>

            <Link
              href="/console"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-column-navy hover:text-slate-900 transition-colors"
            >
              <span>Go to Workspace Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </main>
      </div>

      {/* Interactive Docs Tour Overlay */}
      <LiveDemoOverlay
        isOpen={isDemoRunning}
        steps={docsTourSteps}
        tourTitle="Docs Walkthrough"
        onClose={() => setIsDemoRunning(false)}
      />
    </div>
  );
}
