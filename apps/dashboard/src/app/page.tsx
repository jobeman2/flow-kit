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
  BookOpen,
  MousePointerClick,
  Sliders,
  HelpCircle,
  LayoutDashboard,
  Box,
  Users,
  Settings,
  Bell,
} from 'lucide-react';
import LiveDemoOverlay, { TourDemoStep } from '@/components/LiveDemoOverlay';
import OnboardingChecklist, { ChecklistItem } from '@/components/OnboardingChecklist';
import ContextualBeacon from '@/components/ContextualBeacon';

export default function LandingPage() {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'cdn' | 'npm' | 'react'>('cdn');
  const [activeDocTab, setActiveDocTab] = useState<'quickstart' | 'builder' | 'sdk' | 'i18n'>('quickstart');

  // Driver.js style interactive live tour demo state
  const [liveTourOpen, setLiveTourOpen] = useState(false);
  const [liveTourSteps, setLiveTourSteps] = useState<TourDemoStep[]>([]);
  const [liveTourTitle, setLiveTourTitle] = useState('Interactive Demo');

  // Interactive Checklist Hub Items
  const checklistItems: ChecklistItem[] = [
    {
      id: 'item-guided-tour',
      title: 'Take the 30-Second Guided Tour',
      duration: '30s',
      action: () => triggerDemo('product-tour'),
    },
    {
      id: 'item-spotlight',
      title: 'Inspect SVG Spotlight Isolation',
      duration: '15s',
      action: () => triggerDemo('spotlight'),
    },
    {
      id: 'item-multilingual',
      title: 'Test Multilingual Amharic Walkthrough',
      duration: '20s',
      action: () => triggerDemo('multilingual'),
    },
    {
      id: 'item-docs',
      title: 'Explore Developer Documentation',
      duration: '1m',
      action: () => {
        window.location.href = '/docs';
      },
    },
  ];

  const triggerDemo = (type: 'product-tour' | 'spotlight' | 'multilingual' | 'beacon' | 'progress') => {
    if (type === 'product-tour') {
      setLiveTourTitle('Product Tour Demo');
      setLiveTourSteps([
        {
          targetSelector: '#hero-title',
          title: 'Welcome to Flow-Kit',
          description: 'The developer-first product tour platform. Create step-by-step walkthroughs that look native to your UI.',
          placement: 'bottom',
          badge: 'Step 1 of 3',
        },
        {
          targetSelector: '#code-integration-tabs',
          title: '2-Line Integration',
          description: 'Works with zero backend changes. Drop a script tag or install @flow-kit/web in Next.js, React, or Vue.',
          placement: 'right',
          badge: 'Step 2 of 3',
        },
        {
          targetSelector: '#get-started-cta',
          title: 'Zero-Friction Start',
          description: 'Create your account for free, point-and-click to build tours on your site, and watch retention climb.',
          placement: 'bottom',
          badge: 'Step 3 of 3',
        },
      ]);
    } else if (type === 'spotlight') {
      setLiveTourTitle('Feature Spotlight Demo');
      setLiveTourSteps([
        {
          targetSelector: '#code-integration-tabs',
          title: 'Pure SVG Cutout Isolation',
          description: 'Notice how the backdrop dims smoothly and cuts out the exact element. Zero iframes, zero z-index conflicts, and 100% interactive.',
          placement: 'right',
          badge: 'Feature Spotlight',
        },
      ]);
    } else if (type === 'multilingual') {
      setLiveTourTitle('Multilingual Tour Demo');
      setLiveTourSteps([
        {
          targetSelector: '#hero-title',
          title: 'እንኳን ወደ Flow-Kit በደህና መጡ!',
          description: 'በድረ-ገጽዎ ላይ ሙሉ ለሙሉ በአማርኛ እና በእንግሊዝኛ የጉዞ መመሪያዎችን በደቂቃዎች ውስጥ ይፍጠሩ።',
          placement: 'bottom',
          badge: 'ደረጃ 1 ከ 3',
          langTag: 'አማርኛ (Amharic)',
        },
        {
          targetSelector: '#code-integration-tabs',
          title: 'በ 2 መስመር ኮድ ብቻ',
          description: 'ምንም ውስብስብ አሰራር ሳይኖር በ 1 ቀላል ስክሪፕት ወደ ድረ-ገጽዎ ያካትቱ። ሙሉ ለሙሉ በአማርኛ እና በእንግሊዝኛ ይሰራል።',
          placement: 'right',
          badge: 'ደረጃ 2 ከ 3',
          langTag: 'አማርኛ (Amharic)',
        },
        {
          targetSelector: '#get-started-cta',
          title: 'አሁኑኑ በነጻ ይጀምሩ',
          description: 'ምንም ክፍያ ወይም ክሬዲት ካርድ ሳይጠየቁ ወዲያውኑ የራስዎን የጉብኝት መመሪያዎች መፍጠር ይጀምሩ።',
          placement: 'bottom',
          badge: 'ደረጃ 3 ከ 3',
          langTag: 'አማርኛ (Amharic)',
        },
      ]);
    } else if (type === 'beacon') {
      setLiveTourTitle('Contextual Hint Demo');
      setLiveTourSteps([
        {
          targetSelector: '#docs-hero-btn',
          title: 'Contextual Guide Beacon',
          description: 'Non-blocking hints can draw user attention to new features, documentation, or settings without breaking their workflow.',
          placement: 'bottom',
          badge: 'Contextual Hint',
        },
      ]);
    } else if (type === 'progress') {
      setLiveTourTitle('Progress Walkthrough');
      setLiveTourSteps([
        {
          targetSelector: '#hero-title',
          title: '1. Instant Headline Targeting',
          description: 'Target headings, cards, or hero elements with simple CSS selectors.',
          placement: 'bottom',
          badge: '1 of 4',
        },
        {
          targetSelector: '#architecture-specs',
          title: '2. Sub-16KB Runtime',
          description: 'Ultra-fast direct DOM rendering with <12ms execution time.',
          placement: 'bottom',
          badge: '2 of 4',
        },
        {
          targetSelector: '#code-integration-tabs',
          title: '3. Drop-in Code Snippet',
          description: 'Supports HTML, React, Next.js, and WordPress out of the box.',
          placement: 'right',
          badge: '3 of 4',
        },
        {
          targetSelector: '#get-started-cta',
          title: '4. Ready to Launch',
          description: 'Click next to finish this interactive walkthrough!',
          placement: 'bottom',
          badge: '4 of 4',
        },
      ]);
    }

    setLiveTourOpen(true);
  };

  // Interactive Simulator State
  const [simStep, setSimStep] = useState<number>(1);
  const [simLang, setSimLang] = useState<'en' | 'am' | 'om'>('en');

  // Live API Sandbox State
  const [apiEndpoint, setApiEndpoint] = useState<'tours' | 'events' | 'sdk'>('tours');
  const [apiLoading, setApiLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiStatusCode, setApiStatusCode] = useState<number | null>(null);
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://flow-kit.onrender.com';

  const snippetContent = {
    cdn: `<!-- 1-Line Drop-In: Paste into any HTML, WordPress, or Web App -->
<script
  src="${apiUrl}/flow-kit.js"
  data-api-key="pk_live_sample_customer_key"
  data-locale="en"
></script>`,
    npm: `// Install: npm install @flow-kit/web
import { FlowKit } from '@flow-kit/web';

const flow = FlowKit.init({
  apiKey: 'pk_live_sample_customer_key',
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
          data-api-key="pk_live_sample_customer_key"
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

  // Interactive Simulator Content across 3 languages (Zero emojis)
  const simData: Record<string, { title: string; desc: string; target: string; placement: string; btnNext: string; btnBack: string }> = {
    en: {
      title: simStep === 1 ? 'Global Smart Search' : simStep === 2 ? 'Multilingual Engine' : 'Instant Cloud Services',
      desc: simStep === 1 
        ? 'Find records, inspection reports, licenses, and filings in milliseconds.'
        : simStep === 2
        ? 'Seamlessly switch between English, Amharic, and Afaan Oromoo with zero page reload.'
        : 'Access verified records and digital workflows with a single click.',
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
        setApiResponse(`// Flow-Kit CDN Bundle (${text.length} bytes, HTTP 200 OK)\n` + text.slice(0, 450) + '\n\n// ... [remaining minified SDK runtime bundle] ...');
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
      {/* =========================================================
          TOP NAVIGATION (MATCHING SPEC)
      ========================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Mark & Desktop Links */}
          <div className="flex items-center space-x-8">
            <Link id="brand-logo" href="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 bg-slate-900 flex items-center justify-center text-white font-bold text-xs rounded-md shadow-xs transition-colors">
                FK
              </div>
              <span className="font-bold text-base tracking-tight text-slate-900">
                Flow-Kit
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 text-xs font-medium text-slate-600">
              <a href="#hero" className="text-blue-600 font-semibold relative py-1 border-b-2 border-blue-600">
                Walkthroughs
              </a>
              <a href="#how-it-works" className="hover:text-slate-900 transition-colors py-1">
                How It Works
              </a>
              <Link id="docs-nav-link" href="/docs" className="hover:text-slate-900 transition-colors py-1">
                Documentation
              </Link>
              <a href="#architecture" className="hover:text-slate-900 transition-colors py-1">
                Architecture
              </a>
              <a href="#comparison" className="hover:text-slate-900 transition-colors py-1">
                Direct vs Legacy
              </a>
              <a href="#api-sandbox" className="hover:text-slate-900 transition-colors py-1">
                API Sandbox
              </a>
              <a href="#pricing" className="hover:text-slate-900 transition-colors py-1">
                Pricing
              </a>
            </nav>
          </div>

          {/* Action Hub */}
          <div className="flex items-center space-x-4">
            <Link
              href="/console"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Workspace Console
            </Link>

            <Show when="signed-in">
              <UserButton />
            </Show>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all shadow-xs" title="Sign In">
                  U
                </div>
              </SignInButton>
            </Show>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO SECTION: 2-COLUMN WITH LIVE MOCKUP & DEMO CHIPS
      ========================================================= */}
      <section id="hero" className="relative border-b border-slate-200/80 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: HEADLINE, COPY & ACTIONS */}
            <div className="lg:col-span-6 space-y-6">
              {/* Capsule Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-md bg-[#EDF3FB] border border-blue-100 text-[11px] font-semibold text-blue-900 tracking-wider uppercase">
                INTERACTIVE WALKTHROUGH PLATFORM
              </div>

              {/* Main Headline */}
              <h1 id="hero-title" className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                The product walkthrough infrastructure built for modern web apps.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Create interactive onboarding tours in minutes with a live point-and-click builder or 2 lines of code. Sub-16KB footprint, native multi-language support, and zero iframes.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  id="get-started-cta"
                  href="/register"
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-5 py-3 rounded-md transition-all shadow-xs"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  id="docs-hero-btn"
                  href="/docs"
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-3 rounded-md transition-colors shadow-2xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Documentation</span>
                </Link>

                <a
                  href="#api-sandbox"
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-3 rounded-md transition-colors shadow-2xs"
                >
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Test Live API Sandbox</span>
                </a>
              </div>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE VISUAL MOCKUP WINDOW */}
            <div className="lg:col-span-6 relative mt-6 lg:mt-0">
              {/* Soft rounded backdrop glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100/60 via-slate-100/70 to-indigo-50/50 rounded-3xl transform rotate-1 scale-102 filter blur-xs -z-10" />

              {/* Window Card Frame */}
              <div id="demo-mockup-window" className="relative rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden">
                {/* Window Titlebar */}
                <div className="h-8 px-4 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    flowkit.app/demo
                  </div>
                  <div className="w-10" />
                </div>

                {/* Window Workspace Layout */}
                <div className="flex min-h-[350px] relative">
                  {/* Left Dark Sidebar */}
                  <div className="w-36 sm:w-44 bg-[#0F172A] p-3 flex flex-col justify-between shrink-0 relative">
                    <div>
                      {/* Sidebar Brand */}
                      <div className="flex items-center space-x-2 px-2 py-1.5 mb-3">
                        <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                          FK
                        </div>
                        <span className="text-white text-xs font-bold tracking-tight">Flow-Kit</span>
                      </div>

                      {/* Nav Items */}
                      <nav className="space-y-1">
                        {/* Active Item with attached Tooltip */}
                        <div className="relative">
                          <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md bg-blue-600/25 text-white text-xs font-semibold border border-blue-500/40">
                            <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                            <span>Dashboard</span>
                          </div>

                          {/* Floating Tour Step Tooltip anchored to Dashboard */}
                          <div className="absolute -left-28 sm:-left-36 top-1/2 -translate-y-1/2 z-30 w-44 sm:w-52 bg-white rounded-xl shadow-2xl border border-blue-200/90 p-3 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center space-x-1.5 mb-1">
                              <span className="w-2 h-2 rounded-full bg-blue-600" />
                              <span className="text-[11px] font-bold text-blue-600">1. Open your dashboard</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-snug">
                              Get an overview of your workspace and recent activity.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer">
                          <Box className="w-3.5 h-3.5" />
                          <span>Products</span>
                        </div>
                        <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer">
                          <Users className="w-3.5 h-3.5" />
                          <span>Users</span>
                        </div>
                        <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer">
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>Analytics</span>
                        </div>
                        <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer">
                          <Settings className="w-3.5 h-3.5" />
                          <span>Settings</span>
                        </div>
                      </nav>
                    </div>
                  </div>

                  {/* Main Dashboard Canvas */}
                  <div className="flex-1 bg-slate-50/60 p-4 sm:p-5 flex flex-col justify-between">
                    {/* Top Search & Actions */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="relative w-36 sm:w-44">
                        <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                        <input
                          type="text"
                          readOnly
                          placeholder="Search..."
                          className="w-full pl-7 pr-2 py-1 text-[11px] rounded-md border border-slate-200 bg-white text-slate-600 placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                          <Bell className="w-2.5 h-2.5" />
                        </div>
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                          J
                        </div>
                      </div>
                    </div>

                    {/* Section Title */}
                    <div className="mb-2.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">Dashboard</h4>
                    </div>

                    {/* 3 Metric Cards */}
                    <div className="grid grid-cols-3 gap-2 mb-2.5">
                      <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                        <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Total Users</div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">2,458</div>
                        <div className="text-[9px] text-emerald-600 font-semibold flex items-center mt-0.5">
                          <span>↑ 12%</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                        <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Active Projects</div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">86</div>
                        <div className="text-[9px] text-emerald-600 font-semibold flex items-center mt-0.5">
                          <span>↑ 8%</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                        <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Conversion Rate</div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">4.2%</div>
                        <div className="text-[9px] text-emerald-600 font-semibold flex items-center mt-0.5">
                          <span>↑ 3%</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Split: Recent Activity & Line Chart */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Recent Activity */}
                      <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                        <div className="text-[10px] font-bold text-slate-800 mb-1.5">Recent Activity</div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[9px]">
                            <div className="flex items-center space-x-1.5">
                              <div className="w-3.5 h-3.5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Users className="w-2 h-2" />
                              </div>
                              <span className="text-slate-700 font-medium truncate max-w-[85px]">New user registered</span>
                            </div>
                            <span className="text-slate-400 text-[8px]">2m ago</span>
                          </div>
                          <div className="flex items-center justify-between text-[9px]">
                            <div className="flex items-center space-x-1.5">
                              <div className="w-3.5 h-3.5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                <Layers className="w-2 h-2" />
                              </div>
                              <span className="text-slate-700 font-medium truncate max-w-[85px]">Project updated</span>
                            </div>
                            <span className="text-slate-400 text-[8px]">12m ago</span>
                          </div>
                          <div className="flex items-center justify-between text-[9px]">
                            <div className="flex items-center space-x-1.5">
                              <div className="w-3.5 h-3.5 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <Sparkles className="w-2 h-2" />
                              </div>
                              <span className="text-slate-700 font-medium truncate max-w-[85px]">Payment received</span>
                            </div>
                            <span className="text-slate-400 text-[8px]">1h ago</span>
                          </div>
                        </div>
                      </div>

                      {/* Smooth Blue Curved Line Chart */}
                      <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center">
                        <svg className="w-full h-16" viewBox="0 0 200 80" fill="none">
                          <defs>
                            <linearGradient id="heroChartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M 5 60 C 25 58, 40 40, 65 42 C 90 44, 110 20, 135 22 C 160 24, 175 10, 195 12 L 195 80 L 5 80 Z"
                            fill="url(#heroChartGrad)"
                          />
                          <path
                            d="M 5 60 C 25 58, 40 40, 65 42 C 90 44, 110 20, 135 22 C 160 24, 175 10, 195 12"
                            stroke="#3B82F6"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM LIVE DEMOS BAR & FLOATING WIDGET */}
        <div id="live-demo-chips" className="border-t border-slate-200/80 bg-white py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 mr-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Interactive Live Demos
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  — Click to test Flow-Kit directly on this page:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerDemo('product-tour')}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-xs font-medium text-slate-800 shadow-2xs transition-all cursor-pointer group"
                >
                  <Play className="w-3.5 h-3.5 text-slate-700" />
                  <span>Animated Tour</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    3 steps
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerDemo('spotlight')}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-xs font-medium text-slate-800 shadow-2xs transition-all cursor-pointer group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                  <span>Feature Spotlight</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    SVG cutout
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerDemo('multilingual')}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-xs font-medium text-slate-800 shadow-2xs transition-all cursor-pointer group"
                >
                  <Globe2 className="w-3.5 h-3.5 text-slate-700" />
                  <span>Multilingual</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    AM / EN
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerDemo('beacon')}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-xs font-medium text-slate-800 shadow-2xs transition-all cursor-pointer group"
                >
                  <Zap className="w-3.5 h-3.5 text-slate-700" />
                  <span>Contextual Hint</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    guide beacon
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerDemo('progress')}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-xs font-medium text-slate-800 shadow-2xs transition-all cursor-pointer group"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-slate-700" />
                  <span>With Progress Dots</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    4 steps
                  </span>
                </button>
              </div>
            </div>

            {/* Floating Tour Step Pill in Hero Bottom Right */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => triggerDemo('product-tour')}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Get Started</span>
                <span className="text-slate-400 text-[11px]">(3/4)</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          SECTION: HOW IT WORKS (SIMPLE & CLEAR USER JOURNEY)
      ========================================================= */}
      <section id="how-it-works" className="border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto border-x border-slate-200/80">
          
          <div className="p-6 sm:p-8 border-b border-slate-200/80 bg-slate-50/40 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1">
                // 01 WORKFLOW
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                How Flow-Kit Works
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              From zero to interactive live product walkthroughs in under 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/80">
            
            {/* Step 1 */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-slate-50/50 transition-colors">
              <div>
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center mb-4 shadow-xs">
                  01
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Embed 1 Line of Code
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Add our ultra-lightweight script to your HTML, React, Next.js, or Vue website. No complex build pipelines or backend configuration required.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <code className="text-[11px] font-mono text-blue-600 bg-blue-50/80 px-2 py-1 rounded border border-blue-100">
                  &lt;script src=&quot;{apiUrl}/flow-kit.js&quot;&gt;
                </code>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-slate-50/50 transition-colors">
              <div>
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center mb-4 shadow-xs">
                  02
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Point & Click Visual Builder
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Log into your website and use the floating dock or press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-sans font-medium text-slate-700">Alt + B</kbd>. Click any button or card on your page to attach tour steps instantly.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                1-CLICK AUTO-SCAN & SELECTOR PICKER
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-slate-50/50 transition-colors">
              <div>
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center mb-4 shadow-xs">
                  03
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Track Funnels & Retention
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Publish with 1 click. Watch real-time visitor sessions, step-by-step drop-offs, and completion rates on your analytics dashboard to optimize user onboarding.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                STEP-BY-STEP RETENTION ANALYTICS
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          SECTION: DOCUMENTATION & USER GUIDES
      ========================================================= */}
      <section id="docs" className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto border-x border-slate-200">
          
          <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono text-slate-500 mb-1">
                // 02 DOCUMENTATION
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-column-navy tracking-tight">
                Developer & Creator Guide
              </h2>
            </div>
            <div className="flex items-center space-x-1 bg-white border border-slate-200 p-1 rounded-sm text-xs font-medium">
              {[
                { id: 'quickstart', label: 'Quickstart' },
                { id: 'builder', label: 'Live Builder' },
                { id: 'sdk', label: 'JavaScript SDK' },
                { id: 'i18n', label: 'Multi-Language' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDocTab(tab.id as any)}
                  className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                    activeDocTab === tab.id
                      ? 'bg-column-navy text-white font-semibold'
                      : 'text-slate-600 hover:text-column-navy'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-10 bg-white">
            
            {/* Quickstart Tab */}
            {activeDocTab === 'quickstart' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="text-lg font-bold text-column-navy mb-1">Installing Flow-Kit</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Flow-Kit works everywhere — in static HTML sites, Next.js, React, Vue, WordPress, and enterprise web portals.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm">
                    <span className="text-xs font-bold text-column-navy block mb-2">Option A: HTML Script Tag (Universal)</span>
                    <p className="text-xs text-slate-600 mb-2">Add this script to the <code>&lt;head&gt;</code> or bottom of the <code>&lt;body&gt;</code> of your application:</p>
                    <pre className="p-3 bg-column-dark text-slate-200 rounded-sm text-xs font-mono overflow-x-auto">
                      {`<script
  src="${apiUrl}/flow-kit.js"
  data-api-key="YOUR_API_KEY"
></script>`}
                    </pre>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm">
                    <span className="text-xs font-bold text-column-navy block mb-2">Option B: Next.js (App Router)</span>
                    <p className="text-xs text-slate-600 mb-2">Include in your root <code>app/layout.tsx</code> using Next.js Script:</p>
                    <pre className="p-3 bg-column-dark text-slate-200 rounded-sm text-xs font-mono overflow-x-auto">
                      {`import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="${apiUrl}/flow-kit.js"
          strategy="afterInteractive"
          data-api-key="YOUR_API_KEY"
        />
      </body>
    </html>
  );
}`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Live Builder Tab */}
            {activeDocTab === 'builder' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="text-lg font-bold text-column-navy mb-1">Using the In-App Visual Builder</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The visual builder runs directly inside your website so you can build walkthroughs by clicking on real page elements.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-2">
                    <div className="w-6 h-6 rounded bg-column-navy text-white text-xs font-bold flex items-center justify-center">1</div>
                    <h4 className="text-xs font-bold text-column-navy">Open Builder</h4>
                    <p className="text-xs text-slate-600">
                      Visit your site with <code>?flowkit_builder=true</code> or press <kbd className="px-1 bg-white border border-slate-200 rounded font-mono text-[10px]">Alt + B</kbd>.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-2">
                    <div className="w-6 h-6 rounded bg-column-navy text-white text-xs font-bold flex items-center justify-center">2</div>
                    <h4 className="text-xs font-bold text-column-navy">Pick or Auto-Scan</h4>
                    <p className="text-xs text-slate-600">
                      Click <strong>&quot;Auto-Scan&quot;</strong> to generate landmarks automatically, or click <strong>&quot;Pick Element&quot;</strong> to target any button or input.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-2">
                    <div className="w-6 h-6 rounded bg-column-navy text-white text-xs font-bold flex items-center justify-center">3</div>
                    <h4 className="text-xs font-bold text-column-navy">Save & Deploy</h4>
                    <p className="text-xs text-slate-600">
                      Configure title, description, and card placement. Click <strong>Save Step</strong> and your visitors will see the update immediately.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SDK Reference Tab */}
            {activeDocTab === 'sdk' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="text-lg font-bold text-column-navy mb-1">JavaScript SDK Methods</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Trigger walkthroughs from buttons, react to user actions, or programmatically control step navigation.
                  </p>
                </div>

                <div className="divide-y divide-slate-200 border border-slate-200 rounded-sm overflow-hidden text-xs">
                  <div className="p-3 bg-slate-50 font-mono font-bold text-column-navy flex items-center justify-between">
                    <span>window.flowKitInstance.startTour(&apos;welcome-tour&apos;)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Launch walkthrough by slug</span>
                  </div>
                  <div className="p-3 bg-white font-mono text-slate-700 flex items-center justify-between">
                    <span>window.flowKitInstance.nextStep()</span>
                    <span className="text-[10px] text-slate-500 font-sans">Advance to next step</span>
                  </div>
                  <div className="p-3 bg-slate-50 font-mono text-slate-700 flex items-center justify-between">
                    <span>window.flowKitInstance.prevStep()</span>
                    <span className="text-[10px] text-slate-500 font-sans">Return to previous step</span>
                  </div>
                  <div className="p-3 bg-white font-mono text-slate-700 flex items-center justify-between">
                    <span>window.flowKitInstance.endTour()</span>
                    <span className="text-[10px] text-slate-500 font-sans">Dismiss active tour</span>
                  </div>
                  <div className="p-3 bg-slate-50 font-mono text-slate-700 flex items-center justify-between">
                    <span>window.flowKitInstance.setLocale(&apos;am&apos;)</span>
                    <span className="text-[10px] text-slate-500 font-sans">Switch language on the fly</span>
                  </div>
                </div>
              </div>
            )}

            {/* Multi-Language Tab */}
            {activeDocTab === 'i18n' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="text-lg font-bold text-column-navy mb-1">Native Multilingual Support</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Flow-Kit includes built-in multilingual copy management for English, Amharic (አማርኛ), Afaan Oromoo, and custom locales.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-3">
                  <span className="text-xs font-bold text-column-navy block">How Language Switching Works</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    When you translate a step in the Studio, Flow-Kit stores translations per step. When a user switches their application language, call <code>window.flowKitInstance.setLocale(&apos;am&apos;)</code> to hot-swap all walkthrough step titles and descriptions without reloading the page.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 03: FOUR ARCHITECTURAL PILLARS (HAIRLINE GRID)
      ========================================================= */}
      <section id="architecture" className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto border-x border-slate-200">
          
          {/* Section Header */}
          <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono text-slate-500 mb-1">
                // 03 ARCHITECTURE
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-column-navy tracking-tight">
                Designed for speed, data privacy, and universal DOM execution.
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
                  Traditional onboarding wraps tooltips in heavy, opaque iframes that break responsive layouts. Flow-Kit uses a pure mathematical SVG spotlight mask directly over the parent DOM.
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
                  Built from the ground up with Ethiopic and non-Latin typography. Dynamic language switching hot-swaps copy across Amharic, Afaan Oromoo, and English without reload.
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
                  Data Privacy & Self-Hosting
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enterprise banking, government portals, and internal apps cannot stream customer data to foreign providers. Flow-Kit can run 100% self-hosted on your own PostgreSQL cluster.
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
          SECTION 04: DIRECT VS LEGACY COMPARISON (COLUMN STYLE)
      ========================================================= */}
      <section id="comparison" className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto border-x border-slate-200">
          
          <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/40">
            <div className="text-[11px] font-mono text-slate-500 mb-1">
              // 04 COMPARISON
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-column-navy tracking-tight">
              Why leading developers choose Flow-Kit over legacy SaaS.
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
                    <span className="font-bold text-slate-800 block">Expensive Subscription Lock-in</span>
                    Heavy annual contracts with strict gates on Monthly Active Users and custom domains.
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="font-mono text-rose-500 font-bold mt-0.5">03</span>
                  <div>
                    <span className="font-bold text-slate-800 block">Zero Data Sovereignty</span>
                    Every click, user ID, and customer interaction is sent to external US-based cloud databases.
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

            {/* The Flow-Kit Platform Infrastructure Way */}
            <div className="p-6 sm:p-8 bg-white">
              <div className="flex items-center space-x-2 text-xs font-mono text-emerald-600 font-bold mb-6">
                <span>[ DIRECT PLATFORM ]</span>
                <span>FLOW-KIT PLATFORM</span>
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
                    Free tier for startups and open access for growing teams. No predatory MAU billing penalties.
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="font-mono text-emerald-600 font-bold mt-0.5">03</span>
                  <div>
                    <span className="font-bold text-column-navy block">Air-Gapped Self-Hosting Available</span>
                    Deploy to your own local infrastructure or private data centers with PostgreSQL and Redis.
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
          SECTION 05: LIVE RUNNABLE API TERMINAL (COLUMN DARK PANE)
      ========================================================= */}
      <section id="api-sandbox" className="bg-column-navy text-white py-16 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-[11px] font-mono text-column-cyan mb-1">
                // 05 RUNNABLE REST API SANDBOX
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Live Developer Engine & Telemetry Pipeline
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-400">
              CONNECTED TO LIVE ENGINE: <span className="text-column-cyan">FLOW-KIT CLOUD</span>
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
                <span className="text-xs font-mono text-slate-400 ml-2">REST Console // Live API</span>
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
                  GET /flow-kit.js
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Request Details */}
              <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 pr-0 lg:pr-6">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-2">REQUEST TARGET</span>
                  
                  <div className="p-3 bg-column-deep border border-slate-800 rounded-sm font-mono text-xs text-slate-300 space-y-1.5 mb-4">
                    <p className="text-column-cyan font-bold">
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
                      ? 'Queries all published walkthroughs and multilingual copy for the authorized project key.'
                      : apiEndpoint === 'events'
                      ? 'Streams real-time step telemetry directly into the analytics aggregation engine.'
                      : 'Delivers the compiled, standalone universal client SDK (16.2KB minified).'}
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
                      <span>EXECUTING REQUEST...</span>
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
                        <span>Click &quot;EXECUTE LIVE REQUEST&quot; to test the live Flow-Kit API engine.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-3">
                  <span>SECURITY: TLS 1.3 / API KEY AUTH</span>
                  <span>CACHE: LRU IN-MEMORY + REDIS</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 06: PRICING SPECIFICATION (NO DOLLAR SIGNS)
      ========================================================= */}
      <section id="pricing" className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto border-x border-slate-200">
          
          <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono text-slate-500 mb-1">
                // 06 PRICING SPECIFICATION
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-column-navy tracking-tight">
                Simple, developer-first access. No surprise penalties.
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400 shrink-0">
              FREE FOREVER &amp; EXPANDABLE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            
            {/* Developer Tier */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400 mb-2">[ COMMUNITY TIER ]</div>
                <h3 className="text-lg font-bold text-column-navy mb-1">Starter Community</h3>
                <p className="text-xs text-slate-500 mb-6">For indie hackers, early startups, and personal projects.</p>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-column-navy">Free Forever</span>
                  <p className="text-xs text-slate-400 mt-1">No credit card required</p>
                </div>

                <ul className="space-y-3 text-xs text-slate-600 mb-8 font-mono">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Up to 5,000 Monthly Active Users</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>5 Active Walkthrough Tours</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Universal CDN SDK Script</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Point &amp; Click In-App Builder</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full text-center text-xs font-semibold text-column-navy bg-slate-100 hover:bg-slate-200 border border-slate-200 py-2.5 rounded-sm transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Growth Scale Tier (Featured) */}
            <div className="p-6 sm:p-8 flex flex-col justify-between bg-slate-50/70 relative">
              <div className="absolute top-0 right-0 bg-column-navy text-white text-[10px] font-mono px-2 py-0.5">
                POPULAR
              </div>

              <div>
                <div className="text-xs font-mono text-slate-400 mb-2">[ TEAM TIER ]</div>
                <h3 className="text-lg font-bold text-column-navy mb-1">Growth &amp; Teams</h3>
                <p className="text-xs text-slate-500 mb-6">For growing SaaS businesses, product teams, and platforms.</p>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-column-navy">Public Beta</span>
                  <p className="text-xs text-slate-400 mt-1">Full features unlocked during preview</p>
                </div>

                <ul className="space-y-3 text-xs text-slate-700 mb-8 font-mono">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span className="font-bold">Unlimited Monthly Active Users</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Unlimited Walkthrough Tours</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Multilingual Studio (Amharic, Oromo, EN)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Drop-Off Funnel Analytics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Custom Brand Styling &amp; Themes</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full text-center text-xs font-bold text-white bg-column-navy hover:bg-slate-800 py-2.5 rounded-sm transition-colors shadow-xs"
              >
                Start Free with Team Features
              </Link>
            </div>

            {/* Enterprise Air-Gapped Tier */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400 mb-2">[ ENTERPRISE TIER ]</div>
                <h3 className="text-lg font-bold text-column-navy mb-1">Self-Hosted Enterprise</h3>
                <p className="text-xs text-slate-500 mb-6">For government portals, defense, and privacy-sensitive apps.</p>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-column-navy">Self-Hosted</span>
                  <p className="text-xs text-slate-400 mt-1">Docker &amp; private data center</p>
                </div>

                <ul className="space-y-3 text-xs text-slate-600 mb-8 font-mono">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Unlimited Workspaces &amp; Domains</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>100% Air-Gapped Deployment</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Private PostgreSQL &amp; Redis Sovereignty</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-column-cyan" />
                    <span>Dedicated Engineering Support</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full text-center text-xs font-semibold text-column-navy bg-slate-100 hover:bg-slate-200 border border-slate-200 py-2.5 rounded-sm transition-colors"
              >
                Access Self-Hosted Stack
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
              <span>CLOUD ENGINE: ONLINE</span>
              <span className="text-slate-300">|</span>
              <span>LATENCY: &lt;12MS</span>
            </div>
          </div>

          {/* Links and Copyright */}
          <div className="p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-column-navy flex items-center justify-center text-white font-mono text-[10px] font-bold rounded-xs">
                FK
              </div>
              <span className="text-xs font-bold text-column-navy">
                Flow-Kit Platform
              </span>
              <span className="text-xs text-slate-400">
                © {new Date().getFullYear()} All rights reserved.
              </span>
            </div>

            <div className="flex items-center space-x-6 text-xs font-mono text-slate-500">
              <Link href="/console" className="hover:text-column-navy transition-colors">
                Console
              </Link>
              <Link href="/docs" className="hover:text-column-navy transition-colors">
                Documentation
              </Link>
              <Link href="/keys" className="hover:text-column-navy transition-colors">
                API Keys
              </Link>
              <Link href="/login" className="hover:text-column-navy transition-colors">
                Sign In
              </Link>
            </div>
          </div>

        </div>
      </footer>

      {/* Driver.js Style Interactive Live Tour Overlay */}
      <LiveDemoOverlay
        isOpen={liveTourOpen}
        steps={liveTourSteps}
        tourTitle={liveTourTitle}
        onClose={() => setLiveTourOpen(false)}
      />

      {/* Userflow / Frigade Style Persistent Onboarding Checklist Widget */}
      <OnboardingChecklist items={checklistItems} />

    </div>
  );
}
