'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, Show } from '@clerk/nextjs';
import {
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
  BookOpen,
  MousePointerClick,
  Sliders,
  HelpCircle,
  Eye,
  Crosshair,
  Compass,
  Monitor,
  Flame,
  CheckCircle,
} from 'lucide-react';

export default function LandingPage() {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'cdn' | 'npm' | 'react'>('cdn');
  const [activeDocTab, setActiveDocTab] = useState<'quickstart' | 'builder' | 'sdk' | 'i18n'>('quickstart');

  // Interactive Live Product Simulator State
  const [simStep, setSimStep] = useState<number>(1);
  const [simLang, setSimLang] = useState<'en' | 'am' | 'om'>('en');

  // Live API Sandbox State
  const [apiEndpoint, setApiEndpoint] = useState<'tours' | 'events' | 'sdk'>('tours');
  const [apiLoading, setApiLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiStatusCode, setApiStatusCode] = useState<number | null>(null);
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://flow-kit.onrender.com';
  const liveDemoUrl = 'http://murn.196.190.216.193.nip.io';

  const snippetContent = {
    cdn: `<!-- 1-Line Drop-In: Any HTML, WordPress, PHP, or Web App -->
<script
  src="${apiUrl}/flow-kit.js"
  data-api-key="pk_live_your_project_key"
  data-locale="en"
></script>`,
    npm: `// Install: npm install @flow-kit/web
import { FlowKit } from '@flow-kit/web';

const flow = FlowKit.init({
  apiKey: 'pk_live_your_project_key',
  locale: 'en', // 'en', 'am' (Amharic), 'om' (Oromo)
});`,
    react: `// Next.js (App Router) / React
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="${apiUrl}/flow-kit.js"
          strategy="afterInteractive"
          data-api-key="pk_live_your_project_key"
        />
      </body>
    </html>
  );
}`,
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // Interactive Simulator Content across 3 languages
  const simData: Record<string, { title: string; desc: string; targetName: string; placement: string; btnNext: string; btnBack: string }> = {
    en: {
      title: simStep === 1 ? 'Instant Property Search' : simStep === 2 ? 'Multilingual Hot-Swap' : 'One-Click Actions & Reports',
      desc: simStep === 1 
        ? 'Search across all inspection units, tenant records, and property compliance reports in real time.'
        : simStep === 2
        ? 'Switch your portal language instantly between English, Amharic, and Afaan Oromoo with zero page reloads.'
        : 'Generate inspection reports, export compliance PDFs, or trigger follow-up tasks in 1 click.',
      targetName: simStep === 1 ? 'Search Input' : simStep === 2 ? 'Language Switcher' : 'Action Button',
      placement: 'Bottom Center',
      btnNext: simStep === 3 ? 'Restart Tour' : 'Next Step →',
      btnBack: 'Back',
    },
    am: {
      title: simStep === 1 ? 'ፈጣን የንብረት ፍለጋ' : simStep === 2 ? 'ቋንቋዎችን በቀላሉ ይቀይሩ' : 'የሪፖርት ማመንጫ እና እርምጃዎች',
      desc: simStep === 1 
        ? 'ሁሉንም የፍተሻ ክፍሎች፣ የተከራይ መዝገቦች እና የሕግ ተገዢነት ሪፖርቶችን ወዲያውኑ ይፈልጉ።'
        : simStep === 2
        ? 'ገጹን ዳግም መጫን ሳያስፈልግ የፖርታሉን ቋንቋ በእንግሊዝኛ፣ በአማርኛ እና በአፋን ኦሮሞ መካከል ይቀይሩ።'
        : 'የፍተሻ ሪፖርቶችን ያመንጩ፣ ፒዲኤፍ ሰነዶችን ያውርዱ፣ ወይም ቀጣይ ሥራዎችን በአንድ ጠቅታ ይጀምሩ።',
      targetName: simStep === 1 ? 'የፍለጋ ሳጥን' : simStep === 2 ? 'የቋንቋ መምረጫ' : 'የእርምጃ አዝራር',
      placement: 'Bottom Center',
      btnNext: simStep === 3 ? 'ጉብኝቱን እንደገና ጀምር' : 'ቀጣይ →',
      btnBack: 'ተመለስ',
    },
    om: {
      title: simStep === 1 ? 'Barbaada Qabeenyaa Ariifataa' : simStep === 2 ? 'Afaan Battalatti Jijjiiraa' : 'Gabaasaalee fi Tarkaanfiiwwan',
      desc: simStep === 1 
        ? 'Kutaalee sakatta\'aa hunda, galmeewwan kireeffattootaa fi gabaasa seera qabeessummaa daqiiqaa muraasa keessatti barbaadaa.'
        : simStep === 2
        ? 'Fuula haaromsuu osoo hin barbaachisin afaan poortaalii keessanii Ingiliffa, Oromiffaa fi Amaaraa gidduutti jijjiiraa.'
        : 'Gabaasa sakatta\'aa maddisiisaa, PDF buufadhaa, yookiin hojiiwwan itti aanan cuqaasa tokkoon jalqabaa.',
      targetName: simStep === 1 ? 'Sanduuqa Barbaadaa' : simStep === 2 ? 'Filannoo Afaanii' : 'Qabduu Tarkaanfii',
      placement: 'Bottom Center',
      btnNext: simStep === 3 ? 'Irra Deebi\'i' : 'Itti Aana →',
      btnBack: 'Duubatti',
    },
  };

  const currentSim = simData[simLang];

  // Execute Live API Call
  const runApiCall = async () => {
    setApiLoading(true);
    setApiResponse(null);
    setApiStatusCode(null);
    setApiLatency(null);

    const startTime = performance.now();
    try {
      if (apiEndpoint === 'tours') {
        const res = await fetch(`${apiUrl}/v1/public/tours`, {
          headers: { 'x-api-key': 'pk_test_6li08i12o35muichu8b' },
        });
        const data = await res.json();
        const duration = Math.round(performance.now() - startTime);
        setApiStatusCode(res.status);
        setApiLatency(duration);
        setApiResponse(JSON.stringify(data, null, 2));
      } else if (apiEndpoint === 'events') {
        const payload = {
          tourId: 'sample-tour-id',
          stepIndex: 1,
          eventType: 'STEP_VIEWED',
          locale: 'en',
          metadata: { browser: 'Chrome', viewport: '1920x1080' },
        };
        const res = await fetch(`${apiUrl}/v1/public/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'pk_test_6li08i12o35muichu8b',
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        const duration = Math.round(performance.now() - startTime);
        setApiStatusCode(res.status);
        setApiLatency(duration);
        setApiResponse(JSON.stringify(data, null, 2));
      } else {
        const res = await fetch(`${apiUrl}/flow-kit.js`);
        const text = await res.text();
        const duration = Math.round(performance.now() - startTime);
        setApiStatusCode(res.status);
        setApiLatency(duration);
        setApiResponse(`// Flow-Kit Standalone Universal Client (${text.length} bytes, HTTP 200 OK)\n` + text.slice(0, 480) + '\n\n// ... [minified high-performance DOM runtime] ...');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Ambient background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl opacity-80" />
        <div className="absolute top-[600px] -left-40 w-[600px] h-[600px] bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="absolute top-[800px] -right-40 w-[600px] h-[600px] bg-indigo-600/10 blur-3xl rounded-full" />
      </div>

      {/* =========================================================
          TOP NAVIGATION BAR
      ========================================================= */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Mark */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                  <Compass className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  Flow-Kit
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">2.0</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">In-App Walkthroughs</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold text-slate-300">
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#demo" className="hover:text-white transition-colors">
                Interactive Demo
              </a>
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#docs" className="hover:text-white transition-colors">
                Documentation
              </a>
              <a href="#api-sandbox" className="hover:text-white transition-colors">
                API Sandbox
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                Access &amp; Pricing
              </a>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <a
              href={liveDemoUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 px-3.5 py-1.5 rounded-lg transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Murn App</span>
            </a>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all cursor-pointer">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <Link
                href="/console"
                className="inline-flex items-center text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                Go to Console
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO SECTION: PRODUCT SPOTLIGHT SHOWCASE
      ========================================================= */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        
        {/* Top Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-xs font-medium text-slate-200 shadow-xl shadow-indigo-950/40 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span>Point &amp; Click In-App Builder 2.0</span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-400">Zero iframes</span>
          </div>
        </div>

        {/* Hero Headings */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
            Interactive product tours <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              built directly on your live website.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Guide users through your software with beautiful spotlight tours. Create and edit steps by clicking real elements on your page — no code deploys, no bloated iframes, and sub-16KB footprint.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Start Building for Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#demo"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 px-6 py-3 rounded-xl transition-all"
          >
            <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span>Try Interactive Demo</span>
          </a>

          <a
            href={liveDemoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800 px-5 py-3 rounded-xl transition-all"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>Open Real App (Murn)</span>
          </a>
        </div>

        {/* Key Feature Stats Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-center mb-16">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <span className="block text-xl font-bold text-white">&lt; 16.2 KB</span>
            <span className="text-[11px] text-slate-400 font-medium">Ultra-Lightweight</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <span className="block text-xl font-bold text-emerald-400">Zero Iframes</span>
            <span className="text-[11px] text-slate-400 font-medium">Native SVG Cutout</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <span className="block text-xl font-bold text-cyan-400">Amharic &amp; EN</span>
            <span className="text-[11px] text-slate-400 font-medium">Native Multilingual</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <span className="block text-xl font-bold text-purple-400">Live Analytics</span>
            <span className="text-[11px] text-slate-400 font-medium">Step-by-Step Funnels</span>
          </div>
        </div>

        {/* =========================================================
            HERO PRODUCT SHOWCASE: INTERACTIVE TOUR SIMULATOR
        ========================================================= */}
        <div id="demo" className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl shadow-indigo-950/60 overflow-hidden backdrop-blur-xl">
          
          {/* Mock Browser Title Bar */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-3 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
                https://your-app.com/dashboard <span className="text-cyan-400">?flowkit_builder=true</span>
              </span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-xs">
              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400 mr-1 font-medium">Language:</span>
              {(['en', 'am', 'om'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSimLang(lang)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    simLang === lang
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'am' ? 'አማርኛ' : 'Oromoo'}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Simulation Area */}
          <div className="p-6 sm:p-10 relative bg-slate-950/60 min-h-[460px] flex flex-col justify-between">
            
            {/* Simulated App Workspace Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-400 text-xs">
                  MP
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Murn Properties &amp; Inspections</h3>
                  <p className="text-xs text-slate-400">Enterprise Asset Workspace</p>
                </div>
              </div>

              {/* Target Element 1: Search Bar */}
              <div
                id="demo-search"
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all duration-300 w-full sm:w-72 ${
                  simStep === 1
                    ? 'bg-indigo-950/80 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-4 ring-cyan-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-500'
                }`}
              >
                <Search className={`w-4 h-4 ${simStep === 1 ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className={`text-xs ${simStep === 1 ? 'text-white font-medium' : 'text-slate-500'}`}>
                  Search inspection records...
                </span>
              </div>
            </div>

            {/* Simulated App Middle Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
              
              {/* Target Element 2: Language Card */}
              <div
                id="demo-i18n"
                className={`p-4 rounded-xl transition-all duration-300 ${
                  simStep === 2
                    ? 'bg-indigo-950/80 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-4 ring-cyan-500/20'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Globe2 className={`w-4 h-4 ${simStep === 2 ? 'text-cyan-400' : 'text-indigo-400'}`} />
                  <span className="text-xs font-bold text-white">Multilingual Switcher</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hot-swaps step titles between English, Amharic, and Afaan Oromoo live.
                </p>
              </div>

              {/* Card B */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Active Inspections</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  12 properties scheduled for unit review this week.
                </p>
              </div>

              {/* Target Element 3: Action Trigger */}
              <div
                id="demo-action"
                className={`p-4 rounded-xl transition-all duration-300 flex flex-col justify-between ${
                  simStep === 3
                    ? 'bg-indigo-950/80 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-4 ring-cyan-500/20'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className={`w-4 h-4 ${simStep === 3 ? 'text-cyan-400' : 'text-amber-400'}`} />
                    <span className="text-xs font-bold text-white">One-Click Actions</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Trigger custom actions, exports, or next steps directly.
                  </p>
                </div>
                <button className="mt-3 w-full py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors">
                  Generate Report
                </button>
              </div>

            </div>

            {/* REALISTIC FLOATING WALKTHROUGH CARD */}
            <div className="max-w-md mx-auto w-full bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 relative animate-in fade-in slide-in-from-bottom-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Step {simStep} of 3
                  </span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          simStep === i ? 'w-4 bg-cyan-400' : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Target: {currentSim.targetName}</span>
              </div>

              <h4 className="text-base font-bold text-white mb-2">
                {currentSim.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                {currentSim.desc}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => setSimStep((s) => Math.max(1, s - 1))}
                  disabled={simStep === 1}
                  className="text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer px-2 py-1"
                >
                  {currentSim.btnBack}
                </button>

                <button
                  onClick={() => setSimStep((s) => (s >= 3 ? 1 : s + 1))}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <span>{currentSim.btnNext}</span>
                </button>
              </div>
            </div>

            {/* Bottom In-App Floating Dock Simulation */}
            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-center">
              <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-slate-900 border border-slate-700 shadow-xl text-xs font-medium text-slate-300">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-semibold">Flow-Kit Admin Dock</span>
                <span className="text-slate-600">|</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300">Press Alt + B to inspect</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* =========================================================
          SECTION: HOW FLOW-KIT WORKS (3 CLEAR STEPS)
      ========================================================= */}
      <section id="how-it-works" className="py-24 border-t border-slate-800/80 bg-slate-950/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 block">
              Easy 3-Step Workflow
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              How Flow-Kit Works
            </h2>
            <p className="text-base text-slate-400">
              Launch interactive product walkthroughs without writing complex tour code or redeploying your frontend.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Embed 1 Line of Code</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Paste the lightweight script into your HTML, Next.js, React, or WordPress site. Flow-Kit connects instantly with your project API key.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300">
                &lt;script src=&quot;{apiUrl}/flow-kit.js&quot;&gt;
              </div>
            </div>

            {/* Step 2 Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Point &amp; Click Visual Builder</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Open your site as an admin or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-xs text-white border border-slate-700">Alt + B</kbd>. Click any button, navigation menu, or table to attach onboarding steps live.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400">
                ✓ 1-Click Page Auto-Scan &amp; Selector Picker
              </div>
            </div>

            {/* Step 3 Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Track Funnels &amp; Retention</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Publish with 1 click. Watch real-time visitor sessions, step drop-off funnels, and completion rates in your console to optimize user engagement.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-indigo-400">
                ✓ Real-Time Telemetry &amp; Funnel Metrics
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION: FEATURES & CORE CAPABILITIES
      ========================================================= */}
      <section id="features" className="py-24 border-t border-slate-800/80 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 block">
              Architectural Superiority
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Built for Modern Web Engineering
            </h2>
            <p className="text-base text-slate-400">
              Why fast-moving engineering teams choose Flow-Kit over clunky legacy software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                <MousePointerClick className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Zero-Iframe Cutout</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uses a mathematical SVG spotlight mask directly over your parent DOM. Never breaks mobile responsive layouts or dropdown z-indexes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Globe2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Native Multilingual (i18n)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                First-class support for non-Latin typography including Amharic, Afaan Oromoo, and Arabic with zero-reload dynamic copy swapping.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Drop-Off Funnel Pipeline</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Async telemetry beacons record exact drop-off points, step completions, and friction areas in real time (&lt;8ms latency).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Air-Gapped &amp; Self-Hostable</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Keep user data private. Deploy Flow-Kit on your own Docker containers, private clouds, or PostgreSQL databases.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION: COMPLETE DOCUMENTATION HUB
      ========================================================= */}
      <section id="docs" className="py-24 border-t border-slate-800/80 bg-slate-950/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 block">
                Quick Integration
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Developer Documentation
              </h2>
            </div>

            {/* Documentation Tabs */}
            <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              {[
                { id: 'quickstart', label: 'Quickstart' },
                { id: 'builder', label: 'In-App Builder' },
                { id: 'sdk', label: 'JavaScript SDK' },
                { id: 'i18n', label: 'Multi-Language' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDocTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeDocTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
            
            {/* Quickstart Tab */}
            {activeDocTab === 'quickstart' && (
              <div className="space-y-8 max-w-4xl">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Installing Flow-Kit</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Flow-Kit works out of the box with any modern frontend framework. Add the script and you are ready to build tours.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                      Method 1: HTML Script Tag (Universal)
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">
                      Add to the <code>&lt;head&gt;</code> or bottom of the <code>&lt;body&gt;</code> of your website:
                    </p>
                    <div className="relative p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
                      <button
                        onClick={() => copyCode(snippetContent.cdn)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        title="Copy snippet"
                      >
                        {copiedSnippet ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <pre><code>{snippetContent.cdn}</code></pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                      Method 2: Next.js (App Router)
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">
                      Include in your root <code>src/app/layout.tsx</code> using Next.js Script:
                    </p>
                    <div className="relative p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
                      <pre><code>{snippetContent.react}</code></pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Builder Tab */}
            {activeDocTab === 'builder' && (
              <div className="space-y-8 max-w-4xl">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">In-App Live Visual Builder</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Build and edit walkthroughs without leaving your application. The builder attaches directly to your live DOM.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 text-xs font-bold flex items-center justify-center">1</div>
                    <h4 className="text-sm font-bold text-white">Trigger Builder Mode</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Visit any page with <code>?flowkit_builder=true</code> or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] text-white">Alt + B</kbd>.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-600/30 text-cyan-400 text-xs font-bold flex items-center justify-center">2</div>
                    <h4 className="text-sm font-bold text-white">Auto-Scan or Pick</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Click <strong>&quot;Auto-Scan&quot;</strong> for instant 1-click step generation, or click <strong>&quot;Pick Element&quot;</strong> to target any button or menu.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 text-xs font-bold flex items-center justify-center">3</div>
                    <h4 className="text-sm font-bold text-white">Save &amp; Go Live</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Customize titles, descriptions, and card placements. Click <strong>Save Step</strong> and your users see updates instantly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* JavaScript SDK Tab */}
            {activeDocTab === 'sdk' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">JavaScript Client API</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Trigger walkthroughs from any button, modal, or custom user event programmatically.
                  </p>
                </div>

                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950 text-xs">
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-mono text-cyan-300 font-bold">window.flowKitInstance.startTour(&apos;slug&apos;)</span>
                    <span className="text-slate-400">Launch a tour programmatically by its unique slug</span>
                  </div>
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-mono text-cyan-300 font-bold">window.flowKitInstance.nextStep()</span>
                    <span className="text-slate-400">Advance visitor to the next tour step</span>
                  </div>
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-mono text-cyan-300 font-bold">window.flowKitInstance.prevStep()</span>
                    <span className="text-slate-400">Return visitor to previous step</span>
                  </div>
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-mono text-cyan-300 font-bold">window.flowKitInstance.endTour()</span>
                    <span className="text-slate-400">Dismiss the active walkthrough modal</span>
                  </div>
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-mono text-cyan-300 font-bold">window.flowKitInstance.setLocale(&apos;am&apos;)</span>
                    <span className="text-slate-400">Hot-swap walkthrough language on the fly (en, am, om)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Multi-Language Tab */}
            {activeDocTab === 'i18n' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Multilingual Copy Management</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Flow-Kit stores translations per step so your product guides natively adapt to your user&apos;s preferred language.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white">Supported Locales</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                      English (en)
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                      Amharic / አማርኛ (am)
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                      Afaan Oromoo (om)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    When you translate steps in the Studio, Flow-Kit stores each localized string. When your application language changes, simply call <code>window.flowKitInstance.setLocale(&apos;am&apos;)</code> and all tooltips update smoothly without reloading.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION: RUNNABLE LIVE API SANDBOX
      ========================================================= */}
      <section id="api-sandbox" className="py-24 border-t border-slate-800/80 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 block">
                Live Developer Console
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                REST API Sandbox
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-400">
              API Status: <span className="text-emerald-400 font-bold">Online &amp; Ready</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
            
            {/* Terminal Header with Endpoint Tabs */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" />
                <span className="text-xs font-mono text-slate-400 ml-2">REST Pipeline Tester</span>
              </div>

              {/* Endpoint Selector Tabs */}
              <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setApiEndpoint('tours')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    apiEndpoint === 'tours' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  GET /v1/public/tours
                </button>
                <button
                  onClick={() => setApiEndpoint('events')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    apiEndpoint === 'events' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  POST /v1/public/events
                </button>
                <button
                  onClick={() => setApiEndpoint('sdk')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    apiEndpoint === 'sdk' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  GET /flow-kit.js
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Request Details */}
              <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 pr-0 lg:pr-8">
                <div>
                  <span className="text-xs font-bold text-slate-300 block mb-3 uppercase tracking-wider">Request Endpoint</span>
                  
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 space-y-1.5 mb-5">
                    <p className="text-cyan-400 font-bold">
                      {apiEndpoint === 'events' ? 'POST' : 'GET'} {apiUrl}/{apiEndpoint === 'sdk' ? 'flow-kit.js' : `v1/public/${apiEndpoint}`}
                    </p>
                    {apiEndpoint !== 'sdk' && (
                      <p className="text-slate-400">
                        x-api-key: <span className="text-slate-200">pk_test_sample_client_key</span>
                      </p>
                    )}
                    {apiEndpoint === 'events' && (
                      <p className="text-slate-400">Content-Type: application/json</p>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {apiEndpoint === 'tours'
                      ? 'Fetches active walkthrough steps and translations matching the authenticated project.'
                      : apiEndpoint === 'events'
                      ? 'Dispatches step completion beacons directly to the analytics retention pipeline.'
                      : 'Delivers the compiled, standalone universal client SDK (<16.2KB minified).'}
                  </p>
                </div>

                <button
                  onClick={runApiCall}
                  disabled={apiLoading}
                  className="w-full inline-flex items-center justify-center space-x-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 px-5 py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-400/20"
                >
                  {apiLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Executing Request...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Execute Live Request</span>
                    </>
                  )}
                </button>
              </div>

              {/* Response Viewer */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Response</span>
                    {apiStatusCode && (
                      <div className="flex items-center space-x-2 text-xs font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                          HTTP {apiStatusCode} OK
                        </span>
                        <span className="text-slate-400">
                          {apiLatency}ms
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 h-[220px] overflow-y-auto">
                    {apiResponse ? (
                      <pre className="text-slate-300 whitespace-pre-wrap">
                        <code>{apiResponse}</code>
                      </pre>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                        <Terminal className="w-8 h-8 mb-2 stroke-1 text-slate-600" />
                        <span>Click &quot;Execute Live Request&quot; to test the live Flow-Kit API engine.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-3">
                  <span>TLS 1.3 / API KEY AUTH</span>
                  <span>CACHE: LRU + REDIS</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION: PRICING (ZERO DOLLAR SIGNS)
      ========================================================= */}
      <section id="pricing" className="py-24 border-t border-slate-800/80 bg-slate-950/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 block">
              Transparent Access
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Simple, Developer-First Access
            </h2>
            <p className="text-base text-slate-400">
              No hidden fees, no predatory user limits, and open-source friendly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Starter Community Tier */}
            <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Community</span>
                <h3 className="text-2xl font-bold text-white mt-1 mb-2">Starter Free</h3>
                <p className="text-xs text-slate-400 mb-6">For indie developers, side projects, and early MVPs.</p>

                <div className="mb-6 pb-6 border-b border-slate-800">
                  <span className="text-3xl font-extrabold text-white">Free Forever</span>
                  <p className="text-xs text-slate-400 mt-1">No credit card required</p>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-300 mb-8 font-medium">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Up to 5,000 Monthly Active Users</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>5 Active Walkthrough Tours</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Universal CDN SDK Script</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Point &amp; Click In-App Builder</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full text-center text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3 rounded-xl transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Growth Scale Tier (Featured) */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-indigo-950/60 to-slate-900 border-2 border-indigo-500/60 shadow-xl shadow-indigo-950/50 flex flex-col justify-between relative">
              <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                Most Popular
              </div>

              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Growth</span>
                <h3 className="text-2xl font-bold text-white mt-1 mb-2">Team &amp; Scale</h3>
                <p className="text-xs text-slate-400 mb-6">For scaling SaaS applications, startups, and platforms.</p>

                <div className="mb-6 pb-6 border-b border-indigo-500/30">
                  <span className="text-3xl font-extrabold text-white">Public Beta</span>
                  <p className="text-xs text-cyan-400 mt-1">Full features unlocked during preview</p>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-200 mb-8 font-medium">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="font-bold text-white">Unlimited Monthly Active Users</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Unlimited Walkthrough Tours</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Multilingual Studio (Amharic, Oromo, EN)</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Step-by-Step Retention Analytics</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Custom Brand Themes &amp; Colors</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
              >
                Join Free Beta
              </Link>
            </div>

            {/* Enterprise Air-Gapped Tier */}
            <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enterprise</span>
                <h3 className="text-2xl font-bold text-white mt-1 mb-2">Self-Hosted</h3>
                <p className="text-xs text-slate-400 mb-6">For government portals, defense, and privacy-sensitive apps.</p>

                <div className="mb-6 pb-6 border-b border-slate-800">
                  <span className="text-3xl font-extrabold text-white">Self-Hosted</span>
                  <p className="text-xs text-slate-400 mt-1">Docker &amp; private data center</p>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-300 mb-8 font-medium">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Unlimited Workspaces &amp; Domains</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>100% Air-Gapped Deployment</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Private PostgreSQL &amp; Redis Sovereignty</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Dedicated SLA &amp; Support</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full text-center text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3 rounded-xl transition-colors"
              >
                Access Self-Hosted
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                <Compass className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-sm font-bold text-white">Flow-Kit Platform</span>
              <span className="text-xs text-slate-500">
                © {new Date().getFullYear()} All rights reserved.
              </span>
            </div>

            <div className="flex items-center space-x-6 text-xs text-slate-400 font-medium">
              <Link href="/console" className="hover:text-white transition-colors">
                Console
              </Link>
              <a href="#docs" className="hover:text-white transition-colors">
                Documentation
              </a>
              <Link href="/keys" className="hover:text-white transition-colors">
                API Keys
              </Link>
              <a
                href={liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                Live Demo
              </a>
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
