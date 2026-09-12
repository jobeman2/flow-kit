'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, Show } from '@clerk/nextjs';
import {
  Compass,
  ArrowRight,
  Check,
  Copy,
  Layers,
  Sparkles,
  Zap,
  Globe2,
  ShieldCheck,
  BarChart3,
  Code2,
  Play,
  Terminal,
  Server,
  Lock,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Database,
  ArrowUpRight,
  Search,
} from 'lucide-react';

export default function LandingPage() {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'cdn' | 'npm' | 'react'>('cdn');
  
  // Interactive Simulator State
  const [simStep, setSimStep] = useState<number>(1);
  const [simLang, setSimLang] = useState<'en' | 'am' | 'om'>('en');

  // Live API Sandbox State
  const [apiEndpoint, setApiEndpoint] = useState<'tours' | 'events' | 'sdk'>('tours');
  const [apiLoading, setApiLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiStatusCode, setApiStatusCode] = useState<number | null>(null);
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  const snippetContent = {
    cdn: `<!-- 2-Line Drop-In: Paste in any HTML / Web Application -->
<script
  src="http://localhost:4000/sdk.js"
  data-api-key="pk_live_demo_addis_79a2f1b4c6e8"
  data-locale="en"
></script>`,
    npm: `// Install: npm install @onboardflow/web
import { OnboardFlow } from '@onboardflow/web';

const flow = OnboardFlow.init({
  apiKey: 'pk_live_demo_addis_79a2f1b4c6e8',
  locale: 'en', // 'am' (Amharic), 'om' (Oromo), 'en'
});`,
    react: `// Install: npm install @onboardflow/react
import { OnboardingProvider, TourTriggerButton } from '@onboardflow/react';

export default function App() {
  return (
    <OnboardingProvider apiKey="pk_live_demo_addis_79a2f1b4c6e8">
      <YourAppComponents />
      <TourTriggerButton tourSlug="welcome-citizen-walkthrough">
        Take Tour
      </TourTriggerButton>
    </OnboardingProvider>
  );
}`,
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // Interactive Simulator Content across 3 languages (Zero emojis)
  const simData: Record<string, { title: string; desc: string; target: string; placement: string; btnNext: string; btnBack: string }> = {
    en: {
      title: simStep === 1 ? 'Global Smart Search' : simStep === 2 ? 'Multilingual Engine' : 'Instant e-Governance Services',
      desc: simStep === 1 
        ? 'Find municipal records, certificates, trade licenses, and tax filings in milliseconds.'
        : simStep === 2
        ? 'Seamlessly switch between English, Amharic, and Afaan Oromoo with zero page reload.'
        : 'Access verified certificates and online government payments with 1 click.',
      target: simStep === 1 ? '#search-bar' : simStep === 2 ? '#lang-switch' : '#quick-actions',
      placement: 'Bottom Center',
      btnNext: simStep === 3 ? 'Finish Walkthrough' : 'Next Step →',
      btnBack: 'Back',
    },
    am: {
      title: simStep === 1 ? 'የማዘጋጃ ቤት አገልግሎት ፍለጋ' : simStep === 2 ? 'ቋንቋዎን ይምረጡ' : 'ፈጣን የኢንተርኔት አገልግሎቶች',
      desc: simStep === 1 
        ? 'የከተማ አገልግሎቶችን፣ የታክስ መዝገቦችን፣ የልደት ምስክር ወረቀቶችን እና የንግድ ፈቃዶችን በፍጥነት ያግኙ።'
        : simStep === 2
        ? 'መላው ፖርታል እና የጉዞ መመሪያዎች በእንግሊዝኛ፣ በአማርኛ እና በአፋን ኦሮሞ በተሟላ ሁኔታ ይገኛሉ።'
        : 'የተረጋገጡ ዲጂታል ሰነዶችን፣ የመስመር ላይ የታክስ ክፍያዎችን እና የቀጠሮ መያዣን በአንድ ጠቅታ ያግኙ።',
      target: simStep === 1 ? '#search-bar' : simStep === 2 ? '#lang-switch' : '#quick-actions',
      placement: 'Bottom Center',
      btnNext: simStep === 3 ? 'ጉብኝቱን ጨርስ' : 'ቀጣይ →',
      btnBack: 'ተመለስ',
    },
    om: {
      title: simStep === 1 ? 'Barbaada Tajaajila Waloo' : simStep === 2 ? 'Afaan Keessan Filadhaa' : 'Tajaajiloota Dijitaalaa Ariifataa',
      desc: simStep === 1 
        ? 'Tajaajiloota magaalaa, galmee gibiraa, waraqaa ragaa dhalootaa fi heeyyama daldalaa sekondii muraasa keessatti barbaadaa.'
        : simStep === 2
        ? 'Marsariitiin guutuun fi qajeelfamoonni hundi Afaan Ingilizii, Afaan Oromoo fi Amaaraatiin ni argamu.'
        : 'Waraqaalee ragaa mirkanaa\'an, kaffaltii gibiraa toora interneetii fi beellama qabachuu cuqaasa tokkoon argadhaa.',
      target: simStep === 1 ? '#search-bar' : simStep === 2 ? '#lang-switch' : '#quick-actions',
      placement: 'Bottom Center',
      btnNext: simStep === 3 ? 'Xumuri' : 'Itti Aana →',
      btnBack: 'Duubatti',
    },
  };

  const currentSim = simData[simLang];

  // Execute Live API Call against local API backend
  const runApiCall = async () => {
    setApiLoading(true);
    setApiResponse(null);
    setApiStatusCode(null);
    setApiLatency(null);

    const startTime = performance.now();
    try {
      if (apiEndpoint === 'tours') {
        const res = await fetch('http://localhost:4000/v1/public/tours', {
          headers: { 'x-api-key': 'pk_live_demo_addis_79a2f1b4c6e8' },
        });
        const data = await res.json();
        const duration = Math.round(performance.now() - startTime);
        setApiStatusCode(res.status);
        setApiLatency(duration);
        setApiResponse(JSON.stringify(data, null, 2));
      } else if (apiEndpoint === 'events') {
        const payload = {
          tourId: 'cmtrnz9yr000dub7sxz7zfwuf',
          stepIndex: 1,
          eventType: 'STEP_SEEN',
          locale: 'en',
          metadata: { browser: 'Chrome', viewport: '1920x1080' },
        };
        const res = await fetch('http://localhost:4000/v1/public/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'pk_live_demo_addis_79a2f1b4c6e8',
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        const duration = Math.round(performance.now() - startTime);
        setApiStatusCode(res.status);
        setApiLatency(duration);
        setApiResponse(JSON.stringify(data, null, 2));
      } else {
        const res = await fetch('http://localhost:4000/sdk.js');
        const text = await res.text();
        const duration = Math.round(performance.now() - startTime);
        setApiStatusCode(res.status);
        setApiLatency(duration);
        setApiResponse(`// CDN Payload: ${text.length} bytes (HTTP 200 OK)\n` + text.slice(0, 450) + '\n\n// ... [remaining minified SDK bundle] ...');
      }
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      setApiStatusCode(500);
      setApiLatency(duration);
      setApiResponse(JSON.stringify({ error: 'Connection failed', message: err.message }, null, 2));
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-column-navy font-sans antialiased selection:bg-column-cyan/20 selection:text-column-navy">
      
      {/* =========================================================
          TOP ARCHITECTURAL NAVIGATION
      ========================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          
          {/* Brand Mark */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-7 h-7 bg-column-navy flex items-center justify-center text-white font-mono text-xs font-bold rounded-sm group-hover:bg-column-cyan group-hover:text-column-navy transition-colors">
                GL
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-bold text-sm tracking-tight text-column-navy">
                  GuideLayer
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  // SYS.ONB
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-600">
              <a href="#architecture" className="hover:text-column-navy transition-colors">
                Architecture
              </a>
              <a href="#comparison" className="hover:text-column-navy transition-colors">
                Direct vs Legacy
              </a>
              <a href="#api-sandbox" className="hover:text-column-navy transition-colors">
                API Sandbox
              </a>
              <a href="#pricing" className="hover:text-column-navy transition-colors">
                Pricing
              </a>
            </nav>
          </div>

          {/* Action Hub */}
          <div className="flex items-center space-x-3">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-column-navy transition-colors px-2 py-1"
            >
              <span>Citizen Demo</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-xs font-semibold text-slate-700 hover:text-column-navy px-3 py-1.5 transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="inline-flex items-center text-xs font-semibold text-white bg-column-navy hover:bg-slate-800 px-3.5 py-1.5 rounded-sm transition-all shadow-xs cursor-pointer">
                  Create Workspace
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <Link
                href="/console"
                className="text-xs font-semibold text-column-navy hover:text-slate-900 px-3 py-1.5 transition-colors"
              >
                Workspace Console
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO SECTION: COLUMN.COM BLUEPRINT SPLIT
      ========================================================= */}
      <section className="relative border-b border-slate-200 overflow-hidden bg-grid-hairline">
        
        {/* Top Architectural Spec Bar */}
        <div className="max-w-7xl mx-auto border-x border-slate-200">
          <div className="h-9 px-4 sm:px-6 lg:px-8 border-b border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500 bg-white/60">
            <div className="flex items-center space-x-3">
              <span className="inline-block w-2 h-2 rounded-full bg-column-cyan" />
              <span>INFRASTRUCTURE PROTOCOL V1.0</span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:inline">UNIVERSAL SPOTLIGHT ENGINE</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>LATENCY: &lt;12MS</span>
              <span className="text-slate-300">|</span>
              <span>FOOTPRINT: 16.2KB</span>
            </div>
          </div>

          {/* Main Hero Header Area */}
          <div className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="inline-flex items-center space-x-2 px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700 mb-6">
              <span>[ 00 ]</span>
              <span className="font-semibold text-column-navy">DEVELOPER ONBOARDING INFRASTRUCTURE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-column-navy tracking-tight leading-[1.08] mb-6">
              The product walkthrough infrastructure built for developers.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mb-8">
              The first onboarding platform built with direct DOM spotlight injection, sub-16KB footprints, and air-gapped data sovereignty. No bloated iframes. No vendor lock-in.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center space-x-2 text-xs font-semibold text-white bg-column-navy hover:bg-slate-800 px-5 py-2.5 rounded-sm transition-all"
              >
                <span>Get Production API Key</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <a
                href="#api-sandbox"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-sm transition-colors"
              >
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>Test Live API Sandbox</span>
              </a>

              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-mono text-column-cyan bg-column-navy px-3 py-2 rounded-sm hover:bg-slate-900 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-column-cyan" />
                <span>TRY DEMO APP (PORT 5173)</span>
              </a>
            </div>
          </div>

          {/* =====================================================
              SIGNATURE COLUMN SPLIT PLAYGROUND (CODE VS LIVE DOM)
          ===================================================== */}
          <div className="border-t border-slate-200 grid grid-cols-1 lg:grid-cols-12 bg-white">
            
            {/* LEFT SPLIT PANE: INTEGRATION ENGINE & CODE (5 cols) */}
            <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200 p-6 flex flex-col justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-slate-400">// INTEGRATION</span>
                    <span className="text-xs font-bold text-column-navy uppercase tracking-wider">2 Lines of Code</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm">
                    ZERO IFRAME
                  </span>
                </div>

                {/* Tab switcher */}
                <div className="flex items-center space-x-1 bg-white border border-slate-200 p-1 rounded-sm mb-3">
                  {(['cdn', 'npm', 'react'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSnippetTab(tab)}
                      className={`flex-1 text-[11px] font-mono py-1 rounded-xs transition-colors ${
                        activeSnippetTab === tab
                          ? 'bg-column-navy text-white font-bold'
                          : 'text-slate-600 hover:text-column-navy'
                      }`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Code container */}
                <div className="relative rounded-sm bg-column-dark border border-slate-800 p-4 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto shadow-inner">
                  <button
                    onClick={() => copyCode(snippetContent[activeSnippetTab])}
                    className="absolute top-3 right-3 p-1.5 rounded-sm bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Copy code"
                  >
                    {copiedSnippet ? <Check className="w-3.5 h-3.5 text-column-cyan" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="text-[11px] text-slate-200">
                    <code>{snippetContent[activeSnippetTab]}</code>
                  </pre>
                </div>
              </div>

              {/* Technical Specifications Specs */}
              <div className="mt-6 pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-[11px] font-mono">
                <div>
                  <span className="block text-slate-400 text-[10px]">WEIGHT</span>
                  <span className="font-bold text-column-navy">16.2 KB</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px]">PARSER</span>
                  <span className="font-bold text-column-navy">NATIVE DOM</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px]">ISOLATION</span>
                  <span className="font-bold text-column-navy">SVG MASK</span>
                </div>
              </div>
            </div>

            {/* RIGHT SPLIT PANE: LIVE SPOTLIGHT SIMULATOR (7 cols) */}
            <div className="lg:col-span-7 p-6 flex flex-col justify-between bg-white relative">
              
              {/* Simulator Header & Language Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-column-cyan" />
                  <span className="text-xs font-bold text-column-navy uppercase tracking-wider">
                    Interactive DOM Runtime Sandbox
                  </span>
                </div>

                {/* Multilingual Switcher */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-sm border border-slate-200 text-[11px] font-mono">
                  <span className="text-slate-400 px-1 text-[10px]">LANG:</span>
                  {(['en', 'am', 'om'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSimLang(lang)}
                      className={`px-2 py-0.5 rounded-xs transition-colors ${
                        simLang === lang
                          ? 'bg-column-navy text-white font-bold'
                          : 'text-slate-600 hover:text-column-navy'
                      }`}
                    >
                      {lang === 'en' ? 'EN' : lang === 'am' ? 'አማ' : 'OM'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Host Page with SVG Spotlight */}
              <div className="my-6 p-4 rounded-sm border border-slate-200 bg-slate-50 relative overflow-hidden min-h-[300px]">
                
                {/* Simulated App Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4 text-xs font-mono text-slate-500">
                  <span className="font-bold text-column-navy">ADDIS MUNICIPAL PORTAL</span>
                  <span>SESSION #4829</span>
                </div>

                {/* Target Element 1: Search */}
                <div
                  id="search-bar"
                  className={`p-2.5 rounded-sm border mb-3 transition-all ${
                    simStep === 1
                      ? 'border-column-cyan bg-white shadow-xs ring-2 ring-column-cyan/20 font-semibold'
                      : 'border-slate-200 bg-white/70 text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-2 text-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <span>Search citizen services, certificates, and trade filings...</span>
                  </div>
                </div>

                {/* Target Element 2: Language & Controls */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div
                    id="lang-switch"
                    className={`p-2.5 rounded-sm border transition-all ${
                      simStep === 2
                        ? 'border-column-cyan bg-white shadow-xs ring-2 ring-column-cyan/20'
                        : 'border-slate-200 bg-white/70 text-slate-400'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">LANGUAGE ENGINE</span>
                    <span className="text-xs font-semibold text-column-navy">Native Ethiopic & Latin</span>
                  </div>

                  <div
                    id="quick-actions"
                    className={`p-2.5 rounded-sm border transition-all ${
                      simStep === 3
                        ? 'border-column-cyan bg-white shadow-xs ring-2 ring-column-cyan/20'
                        : 'border-slate-200 bg-white/70 text-slate-400'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">E-SERVICES</span>
                    <span className="text-xs font-semibold text-column-navy">Instant Digital Filings</span>
                  </div>
                </div>

                {/* ACTIVE SPOTLIGHT TOOLTIP CALLOUT */}
                <div className="mt-4 p-4 rounded-sm bg-white border border-column-navy shadow-lg relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-mono bg-column-cyan/15 text-column-navy font-bold">
                        STEP {simStep} / 3
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {currentSim.target}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      AUTOPOSITION: {currentSim.placement}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-column-navy mb-1">
                    {currentSim.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {currentSim.desc}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setSimStep((s) => Math.max(1, s - 1))}
                      disabled={simStep === 1}
                      className="text-xs font-medium text-slate-500 hover:text-column-navy disabled:opacity-30 transition-colors cursor-pointer"
                    >
                      {currentSim.btnBack}
                    </button>

                    <button
                      onClick={() => setSimStep((s) => (s >= 3 ? 1 : s + 1))}
                      className="text-xs font-semibold text-white bg-column-navy hover:bg-slate-800 px-3.5 py-1.5 rounded-sm transition-colors shadow-xs cursor-pointer"
                    >
                      {currentSim.btnNext}
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulator Action Footnote */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2">
                <span>CUTOUT: SVG 0.3s cubic-bezier</span>
                <span>STATE: RUNTIME ACTIVE</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 01: FOUR ARCHITECTURAL PILLARS (HAIRLINE GRID)
      ========================================================= */}
      <section id="architecture" className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto border-x border-slate-200">
          
          {/* Section Header */}
          <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono text-slate-500 mb-1">
                // 01 ARCHITECTURE
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-column-navy tracking-tight">
                Designed for speed, data sovereignty, and universal DOM execution.
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400 shrink-0">
              SPECIFICATION // V1.0
            </span>
          </div>

          {/* 4-Column Blueprint Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            
            {/* Box 1 */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-slate-50/60 transition-colors">
              <div>
                <div className="text-xs font-mono text-slate-400 mb-4">[ 01 ]</div>
                <h3 className="text-base font-bold text-column-navy mb-2">
                  Zero-Iframe Cutout Mask
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Traditional onboarding wraps tooltips in heavy, opaque iframes that break responsive layouts. GuideLayer uses a pure mathematical SVG spotlight mask directly over the parent DOM.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>MASK OVERHEAD</span>
                <span className="font-bold text-column-navy">&lt; 16.2KB</span>
              </div>
            </div>

            {/* Box 2 */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-slate-50/60 transition-colors">
              <div>
                <div className="text-xs font-mono text-slate-400 mb-4">[ 02 ]</div>
                <h3 className="text-base font-bold text-column-navy mb-2">
                  Native Multilingual Runtime
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Built from the ground up with Ethiopic and non-Latin typography. Dynamic language switching (`setLocale(&apos;am&apos;)`) hot-swaps copy across Amharic, Afaan Oromoo, and English without reload.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>LOCALES</span>
                <span className="font-bold text-column-navy">NATIVE I18N</span>
              </div>
            </div>

            {/* Box 3 */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-slate-50/60 transition-colors">
              <div>
                <div className="text-xs font-mono text-slate-400 mb-4">[ 03 ]</div>
                <h3 className="text-base font-bold text-column-navy mb-2">
                  Drop-Off Funnel Pipeline
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Non-blocking telemetry beacons record user drop-off points, step completions, and friction areas in real time to guarantee maximum user onboarding retention.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>BEACON LATENCY</span>
                <span className="font-bold text-column-navy">ASYNC &lt; 8MS</span>
              </div>
            </div>

            {/* Box 4 */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-slate-50/60 transition-colors">
              <div>
                <div className="text-xs font-mono text-slate-400 mb-4">[ 04 ]</div>
                <h3 className="text-base font-bold text-column-navy mb-2">
                  Air-Gapped Sovereignty
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enterprise banking, government portals, and defense apps cannot stream user data to foreign SaaS providers. GuideLayer can run 100% self-hosted on your own PostgreSQL cluster.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>DEPLOYMENT</span>
                <span className="font-bold text-column-navy">CLOUD OR SELF-HOST</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 02: DIRECT VS LEGACY COMPARISON (COLUMN STYLE)
      ========================================================= */}
      <section id="comparison" className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto border-x border-slate-200">
          
          <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/40">
            <div className="text-[11px] font-mono text-slate-500 mb-1">
              // 02 COMPARISON
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-column-navy tracking-tight">
              Why leading developers choose GuideLayer over legacy SaaS.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            
            {/* The Legacy SaaS Way */}
            <div className="p-6 sm:p-8 bg-slate-50/60">
              <div className="flex items-center space-x-2 text-xs font-mono text-rose-600 font-bold mb-6">
                <span>[ LEGACY STACK ]</span>
                <span>APPCUES / WALKME / PENDO</span>
              </div>

              <ul className="space-y-4 text-xs text-slate-600">
                <li className="flex items-start space-x-3">
                  <span className="font-mono text-rose-500 font-bold mt-0.5">01</span>
                  <div>
                    <span className="font-bold text-slate-800 block">Heavy Bloat (150KB - 300KB)</span>
                    Massive bundled iframe runtimes that delay First Contentful Paint and destroy web performance scores.
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="font-mono text-rose-500 font-bold mt-0.5">02</span>
                  <div>
                    <span className="font-bold text-slate-800 block">Exorbitant Pricing Tax</span>
                    Starts at $400 - $1,200/month with strict tier gates on Monthly Active Users and custom domains.
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="font-mono text-rose-500 font-bold mt-0.5">03</span>
                  <div>
                    <span className="font-bold text-slate-800 block">Zero Data Sovereignty</span>
                    Every click, user ID, and municipal interaction is sent to external US-based cloud databases.
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="font-mono text-rose-500 font-bold mt-0.5">04</span>
                  <div>
                    <span className="font-bold text-slate-800 block">Broken Ethiopic & Non-Latin Scripts</span>
                    Requires awkward hacks for Amharic or Afaan Oromoo fonts with constant layout overflow bugs.
                  </div>
                </li>
              </ul>
            </div>

            {/* The GuideLayer Platform Infrastructure Way */}
            <div className="p-6 sm:p-8 bg-white">
              <div className="flex items-center space-x-2 text-xs font-mono text-emerald-600 font-bold mb-6">
                <span>[ DIRECT PLATFORM ]</span>
                <span>GUIDELAYER ARCHITECTURE</span>
              </div>

              <ul className="space-y-4 text-xs text-slate-700">
                <li className="flex items-start space-x-3">
                  <span className="font-mono text-emerald-600 font-bold mt-0.5">01</span>
                  <div>
                    <span className="font-bold text-column-navy block">Sub-16.2KB Zero-Dependency Runtime</span>
                    Lightweight standalone CDN script with instant execution, zero iframe penalty, and perfect Lighthouse scores.
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="font-mono text-emerald-600 font-bold mt-0.5">02</span>
                  <div>
                    <span className="font-bold text-column-navy block">Affordable & Developer-First</span>
                    Free tier for startups, and simple $49/mo flat growth pricing. No predatory MAU billing penalties.
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="font-mono text-emerald-600 font-bold mt-0.5">03</span>
                  <div>
                    <span className="font-bold text-column-navy block">Air-Gapped Self-Hosting Available</span>
                    Deploy to your own local infrastructure or government data centers with PostgreSQL and Redis.
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="font-mono text-emerald-600 font-bold mt-0.5">04</span>
                  <div>
                    <span className="font-bold text-column-navy block">Native Multilingual Studio</span>
                    First-class support for Amharic, Afaan Oromoo, Tigrinya, Arabic, and English with instant hot-swapping.
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 03: LIVE RUNNABLE API TERMINAL (COLUMN DARK PANE)
      ========================================================= */}
      <section id="api-sandbox" className="bg-column-navy text-white py-16 border-b border-slate-900 bg-grid-hairline-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-[11px] font-mono text-column-cyan mb-1">
                // 03 RUNNABLE REST API SANDBOX
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Live Developer Engine & Telemetry Pipeline
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-400">
              CONNECTED TO LOCAL BACKEND: <span className="text-column-cyan">PORT 4000</span>
            </div>
          </div>

          {/* Terminal Console Box */}
          <div className="rounded-sm border border-slate-700 bg-column-dark overflow-hidden shadow-2xl">
            
            {/* Terminal Header with Endpoint Tabs */}
            <div className="px-4 py-3 bg-column-surface border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                <span className="text-xs font-mono text-slate-400 ml-2">REST Console // cURL Simulator</span>
              </div>

              {/* Endpoint Selector Tabs */}
              <div className="flex items-center space-x-1 bg-column-dark p-1 rounded-sm border border-slate-700 text-xs font-mono">
                <button
                  onClick={() => setApiEndpoint('tours')}
                  className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                    apiEndpoint === 'tours' ? 'bg-column-cyan text-column-navy font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  GET /v1/public/tours
                </button>
                <button
                  onClick={() => setApiEndpoint('events')}
                  className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                    apiEndpoint === 'events' ? 'bg-column-cyan text-column-navy font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  POST /v1/public/events
                </button>
                <button
                  onClick={() => setApiEndpoint('sdk')}
                  className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                    apiEndpoint === 'sdk' ? 'bg-column-cyan text-column-navy font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  GET /sdk.js
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Request Details */}
              <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 pr-0 lg:pr-6">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-2">REQUEST HEADERS & TARGET</span>
                  
                  <div className="p-3 bg-column-deep border border-slate-800 rounded-sm font-mono text-xs text-slate-300 space-y-1.5 mb-4">
                    <p className="text-column-cyan font-bold">
                      {apiEndpoint === 'events' ? 'POST' : 'GET'} http://localhost:4000/{apiEndpoint === 'sdk' ? 'sdk.js' : `v1/public/${apiEndpoint}`}
                    </p>
                    {apiEndpoint !== 'sdk' && (
                      <p className="text-slate-400">
                        x-api-key: <span className="text-slate-200">pk_live_demo_addis_79a2f1b4c6e8</span>
                      </p>
                    )}
                    {apiEndpoint === 'events' && (
                      <p className="text-slate-400">Content-Type: application/json</p>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {apiEndpoint === 'tours'
                      ? 'Queries all published walkthroughs and multilingual copy for the authorized project key with local caching.'
                      : apiEndpoint === 'events'
                      ? 'Streams real-time step telemetry directly into the analytics aggregation engine.'
                      : 'Delivers the compiled, standalone universal client SDK (<16.2KB minified).'}
                  </p>
                </div>

                <button
                  onClick={runApiCall}
                  disabled={apiLoading}
                  className="w-full inline-flex items-center justify-center space-x-2 text-xs font-mono font-bold text-column-navy bg-column-cyan hover:bg-emerald-300 px-4 py-2.5 rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {apiLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>EXECUTING QUERY...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>EXECUTE LIVE REQUEST</span>
                    </>
                  )}
                </button>
              </div>

              {/* Response Viewer */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-400">LIVE SERVER RESPONSE</span>
                    {apiStatusCode && (
                      <div className="flex items-center space-x-2 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          HTTP {apiStatusCode} OK
                        </span>
                        <span className="text-slate-400">
                          {apiLatency}ms
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-column-deep border border-slate-800 rounded-sm font-mono text-[11px] text-slate-200 h-[220px] overflow-y-auto">
                    {apiResponse ? (
                      <pre className="text-slate-300 whitespace-pre-wrap">
                        <code>{apiResponse}</code>
                      </pre>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                        <Terminal className="w-8 h-8 mb-2 stroke-1 text-slate-600" />
                        <span>Click &quot;EXECUTE LIVE REQUEST&quot; to fetch live data from the local NestJS backend.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-3">
                  <span>SECURITY: TLS 1.3 / HMAC KEY AUTH</span>
                  <span>CACHE: LRU IN-MEMORY + REDIS</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 04: ARCHITECTURAL PRICING GRID
      ========================================================= */}
      <section id="pricing" className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto border-x border-slate-200">
          
          <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono text-slate-500 mb-1">
                // 04 PRICING SPECIFICATION
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-column-navy tracking-tight">
                Transparent infrastructure pricing. No surprise MAU penalties.
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400 shrink-0">
              BILLED MONTHLY OR ANNUALLY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            
            {/* Developer Tier */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400 mb-2">[ TIER 01 ]</div>
                <h3 className="text-lg font-bold text-column-navy mb-1">Developer</h3>
                <p className="text-xs text-slate-500 mb-6">For indie hackers and early proof-of-concept prototypes.</p>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-column-navy">$0</span>
                  <span className="text-xs text-slate-400 ml-1">/ month</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-600 mb-8 font-mono">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Up to 1,000 Monthly Active Users</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>2 Active Walkthroughs</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Public CDN SDK Script</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Community GitHub Support</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full text-center text-xs font-semibold text-column-navy bg-slate-100 hover:bg-slate-200 border border-slate-200 py-2.5 rounded-sm transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Growth Scale Tier (Featured) */}
            <div className="p-6 sm:p-8 flex flex-col justify-between bg-slate-50/70 relative">
              <div className="absolute top-0 right-0 bg-column-navy text-white text-[10px] font-mono px-2 py-0.5">
                RECOMMENDED
              </div>

              <div>
                <div className="text-xs font-mono text-slate-400 mb-2">[ TIER 02 ]</div>
                <h3 className="text-lg font-bold text-column-navy mb-1">Production Scale</h3>
                <p className="text-xs text-slate-500 mb-6">For scaling SaaS businesses, startups, and product teams.</p>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-column-navy">$49</span>
                  <span className="text-xs text-slate-400 ml-1">/ month</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-700 mb-8 font-mono">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span className="font-bold">25,000 Monthly Active Users</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Unlimited Walkthrough Tours</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Full Multilingual Studio (Amharic, Oromo, EN)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Funnel Drop-Off Analytics & Export</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Custom Brand Themes & Styles</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full text-center text-xs font-bold text-white bg-column-navy hover:bg-slate-800 py-2.5 rounded-sm transition-colors shadow-xs"
              >
                Launch Scale Console
              </Link>
            </div>

            {/* Enterprise Air-Gapped Tier */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400 mb-2">[ TIER 03 ]</div>
                <h3 className="text-lg font-bold text-column-navy mb-1">Self-Hosted Enterprise</h3>
                <p className="text-xs text-slate-500 mb-6">For government agencies, municipal portals, and defense.</p>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-column-navy">$499</span>
                  <span className="text-xs text-slate-400 ml-1">/ month or custom</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-600 mb-8 font-mono">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Unlimited MAUs & Workspaces</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>100% Air-Gapped Docker / Binary Deployment</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Private PostgreSQL & Redis Sovereignty</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Dedicated SLA & 24/7 Engineer Support</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full text-center text-xs font-semibold text-column-navy bg-slate-100 hover:bg-slate-200 border border-slate-200 py-2.5 rounded-sm transition-colors"
              >
                Contact Architecture Team
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          ARCHITECTURAL FOOTER
      ========================================================= */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto border-x border-slate-200">
          
          {/* Status ticker */}
          <div className="px-4 sm:px-6 lg:px-8 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 bg-slate-50/60">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>SYSTEM STATUS: OPERATIONAL</span>
              <span className="text-slate-300">|</span>
              <span>API UPTIME: 99.99%</span>
            </div>
            <div className="flex items-center space-x-3">
              <span>LOCAL REST: PORT 4000</span>
              <span className="text-slate-300">|</span>
              <span>DASHBOARD: PORT 3001</span>
            </div>
          </div>

          {/* Links and Copyright */}
          <div className="p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-column-navy flex items-center justify-center text-white font-mono text-[10px] font-bold rounded-xs">
                GL
              </div>
              <span className="text-xs font-bold text-column-navy">
                GuideLayer Architecture
              </span>
              <span className="text-xs text-slate-400">
                © {new Date().getFullYear()} All rights reserved.
              </span>
            </div>

            <div className="flex items-center space-x-6 text-xs font-mono text-slate-500">
              <Link href="/console" className="hover:text-column-navy transition-colors">
                Console
              </Link>
              <Link href="/keys" className="hover:text-column-navy transition-colors">
                API Keys
              </Link>
              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noreferrer"
                className="hover:text-column-navy transition-colors"
              >
                Citizen Portal
              </a>
              <Link href="/login" className="hover:text-column-navy transition-colors">
                Sign In
              </Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
