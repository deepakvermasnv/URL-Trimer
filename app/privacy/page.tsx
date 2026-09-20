import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Lock, 
  ShieldCheck, 
  Cpu, 
  EyeOff, 
  Trash2, 
  ExternalLink, 
  BarChart3, 
  HardDrive, 
  Mail, 
  CheckCircle2 
} from 'lucide-react';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  const sections = [
    { id: 'protocol', label: 'Core Protocol' },
    { id: 'collection', label: '1. Data Collection' },
    { id: 'processing', label: '2. Processing Environment' },
    { id: 'external-links', label: '3. External Links' },
    { id: 'analytics', label: '4. Analytics' },
    { id: 'storage', label: '5. Local Storage' },
    { id: 'contact', label: '6. Inquiries' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-blue-100 selection:text-blue-900 font-sans antialiased">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 lg:py-20">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 sm:mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2.5 px-3.5 py-2 -ml-3.5 text-sm font-semibold text-slate-600 hover:text-blue-600 rounded-xl hover:bg-slate-200/50 active:bg-slate-200 transition-all group"
            aria-label="Return to URL Trim terminal"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Terminal</span>
          </Link>
        </div>

        {/* Hero Header Section */}
        <header className="mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Client-Side Security Standard</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-5">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Privacy <span className="text-blue-600">Policy.</span>
            </h1>
            <div className="hidden sm:flex w-14 h-14 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl items-center justify-center shadow-xs shrink-0">
              <Lock className="w-7 h-7" />
            </div>
          </div>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-normal leading-relaxed max-w-[65ch]">
            URL Trim is designed with privacy by architecture. All link sanitization, parameter stripping, and text processing run 
            exclusively inside your local browser runtime—ensuring your sensitive data never leaves your device.
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-6 pt-6 border-t border-slate-200/70 text-xs sm:text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Effective: April 2026
            </span>
            <span className="text-slate-300">•</span>
            <span>Zero Server Data Retention</span>
            <span className="text-slate-300">•</span>
            <span>Version 1.4.0</span>
          </div>
        </header>

        {/* Quick Read Highlights (Bento Summary) */}
        <section aria-label="Privacy summary highlights" className="mb-12 sm:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/70 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 mb-1.5">100% In-Browser Execution</h2>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal">
                URLs are processed solely within JavaScript memory. Nothing is ever uploaded to a remote server or external cloud storage.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/70 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <EyeOff className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 mb-1.5">Zero Personal Profiling</h2>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal">
                No accounts, no user identification, and no invasive tracking cookies. Your link operations remain completely anonymous.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/70 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 mb-1.5">Ephemeral Session Storage</h2>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal">
                Active clipboard and buffer inputs exist only during the open session. Closing or refreshing the page purges all session traces.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Jump Navigation Pill Bar */}
        <nav aria-label="Table of contents" className="mb-10 sm:mb-14 sticky top-4 z-10 bg-[#f8fafc]/90 backdrop-blur-md py-2.5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-y border-slate-200/60">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs font-semibold text-slate-600">
            <span className="text-slate-400 uppercase tracking-wider text-[11px] shrink-0 mr-1 font-bold">Jump to:</span>
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 hover:text-blue-600 transition-colors shadow-2xs whitespace-nowrap active:scale-95"
              >
                {sec.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Policy Content Sections */}
        <article className="space-y-8 sm:space-y-12">

          {/* Featured Core Security Protocol */}
          <section 
            id="protocol" 
            className="scroll-mt-24 relative overflow-hidden bg-gradient-to-br from-white to-blue-50/40 p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-blue-200/70 shadow-xs"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-blue-700">
                Core Security Protocol
              </h2>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-4">
              Physics-Based Privacy: Your Data Never Leaves Your Device
            </h3>

            <p className="text-slate-700 text-base sm:text-[17px] leading-[1.8] font-normal mb-6 max-w-[68ch]">
              URL Trim is engineered as a client-side web utility. When you clean thousands of URLs or convert formatted text, 
              <strong className="font-semibold text-slate-900"> all data manipulation occurs strictly inside your web browser&apos;s local memory space</strong>. 
              No input text, processed strings, or link targets are transmitted across the network to our servers or third-party infrastructure.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-blue-100">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  No remote backend database or logging endpoints
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  Safe for enterprise spreadsheets and proprietary client backlink lists
                </span>
              </div>
            </div>
          </section>

          {/* Section 1: Data Collection */}
          <section 
            id="collection" 
            className="scroll-mt-24 bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/70 shadow-xs"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 text-slate-800 text-xs sm:text-sm font-extrabold tracking-tight shrink-0">
                01
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Data Collection &amp; Zero Retention
              </h2>
            </div>

            <div className="space-y-4 text-slate-700 text-base sm:text-[16.5px] leading-[1.75] max-w-[70ch]">
              <p>
                We do not collect, harvest, or monetize any personal information. Our software does not maintain user databases, 
                does not mandate account creation, and does not require credit card or contact details to access full utility functions.
              </p>
              <p>
                Because there is no authentication layer, your browsing activity remains entirely anonymous. We cannot link any 
                specific URL stream, domain pattern, or text transformation back to you or your machine.
              </p>
            </div>
          </section>

          {/* Section 2: Processing Environment */}
          <section 
            id="processing" 
            className="scroll-mt-24 bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/70 shadow-xs"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 text-slate-800 text-xs sm:text-sm font-extrabold tracking-tight shrink-0">
                02
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Processing Environment &amp; Browser Sandbox
              </h2>
            </div>

            <div className="space-y-4 text-slate-700 text-base sm:text-[16.5px] leading-[1.75] max-w-[70ch]">
              <p>
                When you paste data into the editor or upload link lists, the strings reside in client-side variables controlled by your 
                browser&apos;s JavaScript engine (V8, JavaScriptCore, or SpiderMonkey). The regex parsers, domain extractors, and HTML generators 
                execute within this protected sandboxed thread.
              </p>
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 sm:p-5 mt-2">
                <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-slate-600" />
                  Instant Ephemeral Cleanup
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  As soon as you close your browser tab, click &quot;Clear Buffer&quot;, or refresh the page, the browser immediately frees the assigned memory allocations. 
                  No residual scratch files or cache artifacts persist on the server or on your disk.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: External Links */}
          <section 
            id="external-links" 
            className="scroll-mt-24 bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/70 shadow-xs"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 text-slate-800 text-xs sm:text-sm font-extrabold tracking-tight shrink-0">
                03
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                External Links &amp; Destination Privacy
              </h2>
            </div>

            <div className="space-y-4 text-slate-700 text-base sm:text-[16.5px] leading-[1.75] max-w-[70ch]">
              <p>
                Features like &quot;Open All Links&quot; dispatch standard browser-level navigation commands to launch URLs in new tabs. Once a tab initiates 
                a connection with a destination domain, that connection falls under the independent privacy policy and tracking practices of that specific website.
              </p>
              <p className="text-sm text-slate-500 bg-amber-50/60 border border-amber-200/60 rounded-xl p-4">
                <strong className="text-amber-900 font-semibold">Security Note:</strong> Always exercise caution when batch-opening unknown or untrusted links. 
                URL Trim strips tracking parameters to enhance hygiene, but we do not inspect or guarantee the safety of remote content hosted on external domains.
              </p>
            </div>
          </section>

          {/* Section 4: Analytics */}
          <section 
            id="analytics" 
            className="scroll-mt-24 bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/70 shadow-xs"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 text-slate-800 text-xs sm:text-sm font-extrabold tracking-tight shrink-0">
                04
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Anonymized Telemetry &amp; Performance Metrics
              </h2>
            </div>

            <div className="space-y-4 text-slate-700 text-base sm:text-[16.5px] leading-[1.75] max-w-[70ch]">
              <p>
                We employ minimal, privacy-centric analytics (Google Analytics 4 with strict IP anonymization enabled) 
                to measure aggregated operational health: overall site visits, error rate frequencies, and popular tool mode usage.
              </p>
              <ul className="space-y-2.5 pt-2">
                <li className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>We <strong className="font-semibold text-slate-800">never</strong> send URL inputs, pasted text, or output results to analytics.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>We <strong className="font-semibold text-slate-800">never</strong> track cross-site browsing histories or create commercial advertising profiles.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>IP addresses are anonymized before storage, preventing geographical pinpointing.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5: Local Storage */}
          <section 
            id="storage" 
            className="scroll-mt-24 bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/70 shadow-xs"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 text-slate-800 text-xs sm:text-sm font-extrabold tracking-tight shrink-0">
                05
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Local Storage &amp; User Preferences
              </h2>
            </div>

            <div className="space-y-4 text-slate-700 text-base sm:text-[16.5px] leading-[1.75] max-w-[70ch]">
              <p>
                URL Trim uses standard browser <code className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-xs">localStorage</code> solely 
                to remember non-sensitive user interface preferences—such as custom domain extension rules or your preferred editor layout.
              </p>
              <p>
                These values are stored exclusively on your device and are never synchronized across networks. You can reset these settings at any time 
                by clearing your browser&apos;s site data or clicking &quot;Reset Rules&quot; in the settings tray.
              </p>
            </div>
          </section>

          {/* Section 6: Contact & Inquiries */}
          <section 
            id="contact" 
            className="scroll-mt-24 bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/70 shadow-xs"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 text-slate-800 text-xs sm:text-sm font-extrabold tracking-tight shrink-0">
                06
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Security Inquiries &amp; Protocol Audits
              </h2>
            </div>

            <div className="space-y-4 text-slate-700 text-base sm:text-[16.5px] leading-[1.75] max-w-[70ch]">
              <p>
                If you are a security researcher, enterprise compliance officer, or developer with inquiries regarding our client-side architecture 
                or privacy guarantees, please feel free to reach out to our team.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-sm active:scale-[0.98]"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Security Team</span>
                </Link>

                <Link
                  href="/terms"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-[0.98]"
                >
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                  <span>View Terms of Service</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Document Footer & Timestamp */}
          <div className="pt-8 sm:pt-12 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400 font-bold uppercase tracking-[0.15em]">
            <p>Last Updated: April 2026 • Trimmer Labs Security Team</p>
            <p>Ref: SEC-DOC-V1.4</p>
          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}
