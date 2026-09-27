'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQSection from '@/components/FAQSection';
import { 
  Link2, 
  Copy, 
  Check, 
  Trash2, 
  Upload, 
  ArrowRight, 
  Download, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  UserCheck, 
  Wand2, 
  FileText, 
  Image as ImageIcon, 
  Layers3, 
  Maximize2,
  CheckCircle2,
  Settings,
  Scissors,
  Layers,
  Fingerprint,
  Code2,
  Code,
  ExternalLink,
  ClipboardList
} from 'lucide-react';

const HOMEPAGE_FAQS = [
  {
    q: "What does URL Trim actually do?",
    a: "Remove tracking parameters, queries and fragments from multiple URLs instantly. Get clean, readable links in seconds."
  },
  {
    q: "Do I need to sign up to use it?",
    a: "No. There's no account, no login, nothing to set up. Just open the site and start pasting URLs."
  },
  {
    q: "How many URLs can I clean at once?",
    a: "As many as you want. You can paste a short list or a few thousand links, and it'll clean them all in one go."
  },
  {
    q: "What kind of tracking parameters are removed?",
    a: "Mostly tracking junk—things like UTM tags, session IDs, gclid, fbclid, and affiliate codes tacked onto links."
  },
  {
    q: "Is my data safe when I use this tool?",
    a: "Yes. Nothing gets uploaded anywhere. The whole cleaning process happens on your own device."
  },
  {
    q: "Is URL Trim really free?",
    a: "Yes, completely. No paid plans, no limits, no catch."
  }
];

// Default sample URLs matching reference image
const SAMPLE_URLS = [
  "https://example.com/page?utm_source=google",
  "https://shop.com/product?id=123&ref=facebook",
  "https://site.com/about#team",
  "https://blog.com/post?utm_campaign=news",
  "https://example.com/contact?source=ad"
];

function trimSingleUrl(raw: string, mode: string): string {
  if (!raw.trim()) return '';
  let url = raw.trim();

  if (mode === 'dedup') return url;

  if (mode === 'add-https') {
    if (/^https:\/\//i.test(url)) return url;
    if (/^http:\/\//i.test(url)) return 'https://' + url.substring(7);
    return 'https://' + url;
  }

  if (mode === 'slug') {
    return url
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  if (mode === 'remove-html') {
    return url.replace(/<[^>]*>/g, '').trim();
  }

  if (mode === 'text-to-html') {
    return `<p>${url}</p>`;
  }

  // Default: URL Trimmer mode
  try {
    const hasProtocol = /^https?:\/\//i.test(url);
    const parsed = new URL(hasProtocol ? url : `https://${url}`);
    let clean = `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`;
    if (clean.endsWith('/') && parsed.pathname === '/') {
      clean = clean.slice(0, -1);
    }
    return clean;
  } catch (e) {
    return url.split('?')[0].split('#')[0];
  }
}

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<'trimmer' | 'dedup' | 'add-https' | 'slug' | 'remove-html' | 'text-to-html'>('trimmer');
  const [input, setInput] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync outputText live whenever input or activeMode changes
  React.useEffect(() => {
    const rawLines = input.trim() 
      ? input.split('\n').filter(l => l.trim() !== '')
      : (activeMode === 'trimmer' ? SAMPLE_URLS : []);

    const cleaned = rawLines.map((original) => trimSingleUrl(original, activeMode)).join('\n');
    setOutputText(cleaned);
  }, [input, activeMode]);

  const outputLines = outputText.split('\n').filter(l => l.trim() !== '');
  const totalCount = outputLines.length;
  const cleanedCount = totalCount;

  const handleTrimAction = () => {
    if (!input.trim() && activeMode === 'trimmer') {
      setInput(SAMPLE_URLS.join('\n'));
    }
  };

  const handleClear = () => {
    setInput('');
    setOutputText('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleCopyAll = async () => {
    if (!outputText.trim()) return;
    await navigator.clipboard.writeText(outputText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleOpenAll = () => {
    const lines = outputText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    lines.forEach((line, idx) => {
      const url = /^https?:\/\//i.test(line) ? line : `https://${line}`;
      setTimeout(() => {
        window.open(url, '_blank');
      }, idx * 150);
    });
  };

  const handleCopyRow = async (cleanUrl: string, idx: number) => {
    await navigator.clipboard.writeText(cleanUrl);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadCSV = () => {
    if (results.length === 0) return;
    const csvHeader = "Original URL,Clean URL\n";
    const csvRows = results.map(r => `"${r.original.replace(/"/g, '""')}","${r.clean.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cleaned_urls.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInput(content.replace(/\r\n/g, '\n'));
      }
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf2ff] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Header Section */}
      <section className="pt-28 pb-10 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-[#eaf2ff] via-[#f4f8ff] to-[#f7fafe]">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#e3edff] text-[#0066FF] border border-blue-200/50 text-[11px] font-bold tracking-wider uppercase mb-6 shadow-sm">
            <span>FAST • PRIVATE • FREE</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
            Trim URLs. Clean Lists. <span className="text-[#0066FF]">Stay Focused.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal mb-2">
            Remove tracking parameters, queries and fragments from multiple URLs instantly.
            <br className="hidden sm:inline" /> Get clean, readable links in seconds.
          </p>


        </div>
      </section>

      {/* Main Tool Container */}
      <section id="trimmer-app" className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
        {/* Mode Selector Bar */}
        <div className="bg-white rounded-3xl p-2.5 border border-slate-100/90 shadow-lg shadow-blue-500/5 max-w-5xl mx-auto mb-6 flex items-center justify-center">
          <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100">
            <button
              onClick={() => setActiveMode('trimmer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'trimmer'
                  ? 'bg-white text-[#0066FF] shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>URL Trimmer</span>
            </button>

            <button
              onClick={() => setActiveMode('dedup')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'dedup'
                  ? 'bg-white text-[#0066FF] shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Remove Duplicate URL</span>
            </button>

            <button
              onClick={() => setActiveMode('add-https')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'add-https'
                  ? 'bg-white text-[#0066FF] shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Add https://</span>
            </button>

            <button
              onClick={() => setActiveMode('slug')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'slug'
                  ? 'bg-white text-[#0066FF] shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Slug Generator</span>
            </button>

            <button
              onClick={() => setActiveMode('remove-html')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'remove-html'
                  ? 'bg-white text-[#0066FF] shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Remove HTML Tags</span>
            </button>

            <button
              onClick={() => setActiveMode('text-to-html')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'text-to-html'
                  ? 'bg-white text-[#0066FF] shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Text to HTML</span>
            </button>
          </div>
        </div>

        {/* 2 Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT CARD: Input Buffer */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#0066FF] rounded-full" />
                  <div>
                    <h2 className="text-[11px] font-black text-[#0066FF] uppercase tracking-wider leading-tight">
                      INPUT BUFFER ({input.trim() ? input.split('\n').filter(l => l.trim()).length : 0})
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LOAD URLS BELOW</p>
                  </div>
                </div>

                <button
                  onClick={handleClear}
                  className="bg-[#ffeff0] hover:bg-red-100 text-[#ff4d4f] border border-red-100 rounded-full px-3.5 py-1 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>CLEAR</span>
                </button>
              </div>

              {/* Textarea Area */}
              <div className="mb-4">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste links to begin processing..."
                  className="w-full h-[340px] sm:h-[400px] p-5 text-xs sm:text-sm font-mono text-slate-700 bg-slate-50/50 rounded-2xl border border-slate-200/80 focus:border-[#0066FF] focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none resize-none leading-relaxed transition-all placeholder:text-slate-400/70"
                />
              </div>

              {/* Drag & Drop Upload Zone */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,.html,text/plain,text/csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex items-center justify-center gap-3 ${
                  isDragging 
                    ? 'border-[#0066FF] bg-blue-50/80 shadow-md' 
                    : 'border-blue-200/80 bg-blue-50/30 hover:bg-blue-50/70 hover:border-[#0066FF]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white text-[#0066FF] flex items-center justify-center shadow-sm border border-blue-100 shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-700">Or drag & drop a .txt or .csv file here</p>
                  <p className="text-[10px] text-slate-400">Supports up to 10,000 URLs</p>
                </div>
              </div>
            </div>


          </div>

          {/* RIGHT CARD: Output Stream */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#10b981] rounded-full" />
                  <div>
                    <h2 className="text-[11px] font-black text-[#0066FF] uppercase tracking-wider leading-tight">
                      OUTPUT STREAM ({totalCount})
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TRIMMED RESULTS</p>
                  </div>
                </div>

                {/* Highlighted OPEN ALL and COPY Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAll}
                    className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>OPEN ALL</span>
                  </button>

                  <button
                    onClick={handleCopyAll}
                    className="bg-[#0066FF] hover:bg-blue-700 text-white rounded-full px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
                  >
                    {copiedAll ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                    <span>{copiedAll ? 'COPIED!' : 'COPY'}</span>
                  </button>
                </div>
              </div>

              {/* Clean Output Results Box */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden mb-4 min-h-[340px] sm:min-h-[400px] relative flex flex-col justify-center">
                <textarea
                  value={outputText}
                  onChange={(e) => setOutputText(e.target.value)}
                  placeholder="Trimmed results will appear here..."
                  className="w-full h-[340px] sm:h-[400px] p-5 text-xs sm:text-sm font-mono text-slate-800 bg-transparent outline-none resize-none leading-relaxed custom-scrollbar focus:bg-white/70 transition-colors"
                />
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium text-[11px]">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{totalCount} URLs processed successfully.</span>
              </div>

              <div className="text-slate-400 font-medium text-[11px]">
                Total: <span className="text-slate-700">{totalCount} URLs</span> | Cleaned: <span className="text-slate-700">{cleanedCount}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION: More Useful Tools */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 my-20">
        {/* Section Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex flex-col gap-1 items-start">
              <span>More Useful Tools</span>
              <span className="w-8 h-1 bg-[#0066FF] rounded-full"></span>
            </h2>
          </div>

          <Link 
            href="/tools" 
            className="bg-white hover:bg-[#0066FF] text-[#0066FF] hover:text-white border border-blue-200/90 hover:border-[#0066FF] px-4.5 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-md hover:shadow-blue-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ease-out group"
          >
            <span>View all tools</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300 ease-out" />
          </Link>
        </div>

        {/* Separate Cards Grid (Matching Screenshot #2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Tool 1: URL Trimmer */}
          <Link href="#trimmer-app" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50/80 text-[#0066FF] border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Scissors className="w-5.5 h-5.5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors mb-0.5">URL Trimmer</h3>
                <p className="text-xs text-slate-400 font-normal leading-snug">Clean URL lists by stripping...</p>
              </div>
            </div>
            <div className="w-7.5 h-7.5 rounded-full bg-blue-50/60 text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0 group-hover:bg-[#0066FF] group-hover:text-white group-hover:border-transparent transition-all ml-2">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </Link>

          {/* Tool 2: Word Counter */}
          <Link href="/tools/word-counter" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50/80 text-[#0066FF] border border-blue-100 flex items-center justify-center shrink-0 font-bold text-lg group-hover:scale-105 transition-transform">
                T
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors mb-0.5">Word Counter</h3>
                <p className="text-xs text-slate-400 font-normal leading-snug">Analyze text structure and counts.</p>
              </div>
            </div>
            <div className="w-7.5 h-7.5 rounded-full bg-blue-50/60 text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0 group-hover:bg-[#0066FF] group-hover:text-white group-hover:border-transparent transition-all ml-2">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </Link>

          {/* Tool 3: AI Text-to-Image */}
          <Link href="/tools/ai-image" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50/80 text-[#0066FF] border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Wand2 className="w-5.5 h-5.5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors mb-0.5">AI Text-to-Image</h3>
                <p className="text-xs text-slate-400 font-normal leading-snug">Create high-quality stunning graphics...</p>
              </div>
            </div>
            <div className="w-7.5 h-7.5 rounded-full bg-blue-50/60 text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0 group-hover:bg-[#0066FF] group-hover:text-white group-hover:border-transparent transition-all ml-2">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </Link>

          {/* Tool 4: Image Compressor */}
          <Link href="/tools/image-compressor" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50/80 text-[#0066FF] border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Maximize2 className="w-5.5 h-5.5 stroke-[2] rotate-45" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors mb-0.5">Image Compressor</h3>
                <p className="text-xs text-slate-400 font-normal leading-snug">Reduce image size while keeping quality.</p>
              </div>
            </div>
            <div className="w-7.5 h-7.5 rounded-full bg-blue-50/60 text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0 group-hover:bg-[#0066FF] group-hover:text-white group-hover:border-transparent transition-all ml-2">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </Link>

          {/* Tool 5: Image Converter */}
          <Link href="/tools/image-converter" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50/80 text-[#0066FF] border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Layers3 className="w-5.5 h-5.5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors mb-0.5">Image Converter</h3>
                <p className="text-xs text-slate-400 font-normal leading-snug">Convert between imaging formats.</p>
              </div>
            </div>
            <div className="w-7.5 h-7.5 rounded-full bg-blue-50/60 text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0 group-hover:bg-[#0066FF] group-hover:text-white group-hover:border-transparent transition-all ml-2">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </Link>

          {/* Tool 6: PDF Converter */}
          <Link href="/tools/pdf-converter" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50/80 text-[#0066FF] border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5.5 h-5.5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors mb-0.5">PDF Converter</h3>
                <p className="text-xs text-slate-400 font-normal leading-snug">Convert images to PDF high-quality.</p>
              </div>
            </div>
            <div className="w-7.5 h-7.5 rounded-full bg-blue-50/60 text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0 group-hover:bg-[#0066FF] group-hover:text-white group-hover:border-transparent transition-all ml-2">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </Link>

          {/* Tool 7: Text to HTML */}
          <Link href="#trimmer-app" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50/80 text-[#0066FF] border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Code className="w-5.5 h-5.5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors mb-0.5">Text to HTML</h3>
                <p className="text-xs text-slate-400 font-normal leading-snug">Convert plain text to clean HTML code.</p>
              </div>
            </div>
            <div className="w-7.5 h-7.5 rounded-full bg-blue-50/60 text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0 group-hover:bg-[#0066FF] group-hover:text-white group-hover:border-transparent transition-all ml-2">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </Link>

          {/* Tool 8: Chrome Extension */}
          <Link href="/tools/chrome-extension" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50/80 text-[#0066FF] border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Settings className="w-5.5 h-5.5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors mb-0.5">Chrome Extension</h3>
                <p className="text-xs text-slate-400 font-normal leading-snug">Load Word Counter as browser extension.</p>
              </div>
            </div>
            <div className="w-7.5 h-7.5 rounded-full bg-blue-50/60 text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0 group-hover:bg-[#0066FF] group-hover:text-white group-hover:border-transparent transition-all ml-2">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </Link>

          {/* Tool 9: Sitemap Generator */}
          <Link href="/tools/sitemap-generator" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50/80 text-[#0066FF] border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5.5 h-5.5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors mb-0.5">Sitemap Generator</h3>
                <p className="text-xs text-slate-400 font-normal leading-snug">Crawl website pages and generate sitemap.</p>
              </div>
            </div>
            <div className="w-7.5 h-7.5 rounded-full bg-blue-50/60 text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0 group-hover:bg-[#0066FF] group-hover:text-white group-hover:border-transparent transition-all ml-2">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </Link>
        </div>
      </section>

      {/* SECTION: How It Works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 my-20">
        <div className="mb-12">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex flex-col gap-1 items-start">
            <span>How It Works</span>
            <span className="w-8 h-1 bg-[#0066FF] rounded-full"></span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch relative">
          {/* Step 1 Card */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative justify-center">
            <div className="relative mb-6">
              <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white text-xs font-bold flex items-center justify-center absolute -top-2 -left-2 shadow-md z-10 border-2 border-white">
                1
              </div>
              <div className="w-16 h-16 rounded-2xl bg-blue-50/80 text-[#0066FF] border border-blue-100 flex items-center justify-center shadow-inner">
                <FileText className="w-7 h-7 stroke-[2]" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Paste or Upload</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-normal">
              Add your URLs, one per line or drag & drop a .txt or .csv file.
            </p>
          </div>

          {/* Arrow Divider 1 */}
          <div className="hidden md:flex justify-center text-slate-300 absolute left-1/3 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </div>
          </div>

          {/* Step 2 Card */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative justify-center">
            <div className="relative mb-6">
              <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white text-xs font-bold flex items-center justify-center absolute -top-2 -left-2 shadow-md z-10 border-2 border-white">
                2
              </div>
              <div className="w-16 h-16 rounded-2xl bg-blue-50/80 text-[#0066FF] border border-blue-100 flex items-center justify-center shadow-inner">
                <Settings className="w-7 h-7 stroke-[2]" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Get Clean URLs</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-normal">
              Click Trim URLs and process your list instantly.
            </p>
          </div>

          {/* Arrow Divider 2 */}
          <div className="hidden md:flex justify-center text-slate-300 absolute left-2/3 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </div>
          </div>

          {/* Step 3 Card */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative justify-center">
            <div className="relative mb-6">
              <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white text-xs font-bold flex items-center justify-center absolute -top-2 -left-2 shadow-md z-10 border-2 border-white">
                3
              </div>
              <div className="w-16 h-16 rounded-2xl bg-blue-50/80 text-[#0066FF] border border-blue-100 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-7 h-7 stroke-[2]" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Copy or Download</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-normal">
              Copy the clean URLs or download as a CSV file.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: Why Use URL Trim? */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 my-20">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex flex-col gap-1 items-start">
            <span>Why Use URL Trim?</span>
            <span className="w-8 h-1 bg-[#0066FF] rounded-full"></span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#eef5ff] text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-0.5">Save Time</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                Clean hundreds of URLs in seconds.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#eef5ff] text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-0.5">100% Private</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                Runs in your browser — URLs are not uploaded.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#eef5ff] text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-0.5">Accurate Results</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                Remove tracking, queries and fragments reliably.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#eef5ff] text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-0.5">Free to Use</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                All tools are completely free, with no sign up required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Frequently Asked Questions */}
      <FAQSection pageId="homepage" faqs={HOMEPAGE_FAQS} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
