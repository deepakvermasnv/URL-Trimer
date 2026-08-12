'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  FileCode, 
  Globe, 
  Play, 
  StopCircle, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Settings2, 
  Layers, 
  Search, 
  FileText, 
  ChevronDown, 
  ExternalLink, 
  ShieldCheck,
  Clock,
  Zap,
  List
} from 'lucide-react';
import Script from 'next/script';
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import NavAction from '@/components/NavAction';
import Badge from '@/components/Badge';
import FAQSection from '@/components/FAQSection';

interface CrawledPage {
  url: string;
  depth: number;
  status: number;
  title: string;
  lastmod: string;
}

const XML_SITEMAP_FAQS = [
  {
    q: "What is an XML Sitemap and why is it important for SEO?",
    a: "An XML sitemap is a structured document that lists all canonical URLs on your website. It acts as a roadmap for search engine crawlers (like Googlebot and Bingbot) to efficiently discover, crawl, and index your pages."
  },
  {
    q: "How many pages can I crawl with this free tool?",
    a: "You can crawl up to 500 internal pages per domain with a maximum crawl depth of 5 levels. The generator automatically strips fragments, ignores duplicates, and skips non-HTML assets (like PDFs, images, and videos)."
  },
  {
    q: "Does this generator crawl external websites or third-party links?",
    a: "No. To prevent infinite loops and ensure speed, the crawler strictly sticks to internal pages matching the exact same domain or hostname as the initial URL."
  },
  {
    q: "Where should I upload my generated sitemap.xml file?",
    a: "Download the generated sitemap.xml file and upload it to your web host's root folder (e.g. https://yourwebsite.com/sitemap.xml). Afterwards, submit the sitemap URL in Google Search Console and Bing Webmaster Tools."
  },
  {
    q: "Does this tool respect robots.txt rules?",
    a: "Yes! By default, the generator checks your website's robots.txt file for Disallow directives and skips any paths that search engine bots are forbidden from crawling."
  }
];

export default function XMLSitemapGenerator() {
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(100);
  const [maxDepth, setMaxDepth] = useState(3);
  const [changeFreq, setChangeFreq] = useState('weekly');
  const [priority, setPriority] = useState('0.8');
  const [respectRobots, setRespectRobots] = useState(true);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const [isCrawling, setIsCrawling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [crawledPages, setCrawledPages] = useState<CrawledPage[]>([]);
  const [queueSize, setQueueSize] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [generatedXml, setGeneratedXml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'preview' | 'table'>('preview');

  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [clearTimer]);

  const handleStartCrawl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a website URL to generate a sitemap.');
      return;
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
      setUrl(targetUrl);
    }

    try {
      new URL(targetUrl);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com).');
      return;
    }

    // Reset crawl state
    setError(null);
    setGeneratedXml(null);
    setCrawledPages([]);
    setProgress(0);
    setQueueSize(0);
    setElapsedTime(0);
    setStatusMessage('Connecting to server...');
    setIsCrawling(true);

    // Start timer
    clearTimer();
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/xml-sitemap-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          maxPages,
          maxDepth,
          changeFreq,
          priority,
          respectRobots,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response stream received from crawler server.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.replace(/^data:\s*/, '');
            try {
              const data = JSON.parse(jsonStr);

              if (data.type === 'status') {
                setStatusMessage(data.message);
              } else if (data.type === 'progress') {
                setCrawledPages((prev) => {
                  const updated = [...prev, {
                    url: data.url,
                    depth: data.depth,
                    status: data.status,
                    title: data.title,
                    lastmod: new Date().toISOString().split('T')[0],
                  }];
                  
                  const calculatedProgress = Math.min(95, Math.round((updated.length / maxPages) * 100));
                  setProgress(calculatedProgress);
                  return updated;
                });
                setQueueSize(data.queueSize || 0);
                setStatusMessage(`Crawling: ${data.url}`);
              } else if (data.type === 'complete') {
                setGeneratedXml(data.xml);
                setProgress(100);
                setStatusMessage(`Finished! Successfully generated sitemap with ${data.totalPages} pages.`);
                setIsCrawling(false);
                clearTimer();
              } else if (data.type === 'error') {
                throw new Error(data.message || 'Crawl error occurred.');
              }
            } catch (err: unknown) {
              if (err instanceof Error) {
                if (err.name === 'AbortError') return;
                setError(err.message);
              }
              setIsCrawling(false);
              clearTimer();
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatusMessage('Crawl cancelled by user.');
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred while crawling.');
      }
      setIsCrawling(false);
      clearTimer();
    }
  };

  const handleCancelCrawl = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsCrawling(false);
    clearTimer();
    setStatusMessage('Crawl stopped.');
  };

  const handleCopyXml = () => {
    if (!generatedXml) return;
    navigator.clipboard.writeText(generatedXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadXml = () => {
    if (!generatedXml) return;
    const blob = new Blob([generatedXml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredPages = crawledPages.filter((page) => 
    page.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout showBlobs={true}>
      <NavAction href="/tools" label="Back to Tools" type="back" />

      <Hero 
        title={
          <span>
            XML Sitemap <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Generator</span>
          </span>
        }
        subtitle="Crawl any website, extract all internal canonical URLs, and generate a valid sitemap.xml ready for Google Search Console."
        badgeText="Free SEO Utility"
        badgeIcon={FileCode}
        centered={true}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main Crawl Control Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 p-6 sm:p-8 space-y-6"
        >
          <form onSubmit={handleStartCrawl} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="website-url" className="block text-sm font-bold text-slate-900 uppercase tracking-wider">
                Website URL to Crawl
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Globe className="w-5 h-5" />
                </div>
                <input
                  id="website-url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={isCrawling}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-base"
                />
              </div>
            </div>

            {/* Quick URL Sample Buttons */}
            {!isCrawling && !url && (
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                <span className="font-semibold">Try sample:</span>
                <button
                  type="button"
                  onClick={() => setUrl('https://news.ycombinator.com')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                >
                  news.ycombinator.com
                </button>
                <button
                  type="button"
                  onClick={() => setUrl('https://wikipedia.org')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                >
                  wikipedia.org
                </button>
              </div>
            )}

            {/* Advanced Crawler Options Toggle */}
            <div className="border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 uppercase tracking-widest transition-colors cursor-pointer"
              >
                <Settings2 className="w-4 h-4" />
                <span>Crawler Options & Metadata</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showAdvancedOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
                  >
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">
                        Max Pages to Crawl ({maxPages})
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="500"
                        step="10"
                        value={maxPages}
                        onChange={(e) => setMaxPages(Number(e.target.value))}
                        disabled={isCrawling}
                        className="w-full accent-blue-600"
                      />
                      <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                        <span>10 pages</span>
                        <span>500 max</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">
                        Max Crawl Depth ({maxDepth})
                      </label>
                      <select
                        value={maxDepth}
                        onChange={(e) => setMaxDepth(Number(e.target.value))}
                        disabled={isCrawling}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>1 level (Homepage only)</option>
                        <option value={2}>2 levels (Direct links)</option>
                        <option value={3}>3 levels (Standard site)</option>
                        <option value={4}>4 levels (Deep site)</option>
                        <option value={5}>5 levels (Maximum limit)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">
                        Change Frequency
                      </label>
                      <select
                        value={changeFreq}
                        onChange={(e) => setChangeFreq(e.target.value)}
                        disabled={isCrawling}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="always">Always</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="never">Never</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">
                        Default Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        disabled={isCrawling}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1.0">1.0 (Highest)</option>
                        <option value="0.8">0.8 (High)</option>
                        <option value="0.6">0.6 (Medium)</option>
                        <option value="0.5">0.5 (Normal)</option>
                        <option value="0.3">0.3 (Low)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={respectRobots}
                          onChange={(e) => setRespectRobots(e.target.checked)}
                          disabled={isCrawling}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span>Respect robots.txt rules (Recommended)</span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Button */}
            <div className="flex items-center gap-4">
              {!isCrawling ? (
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Generate XML Sitemap</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelCrawl}
                  className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-rose-500/25 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Cancel Crawling</span>
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold">Crawl Failed: </span>
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Live Crawl Stats & Progress Monitor */}
        {(isCrawling || crawledPages.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isCrawling ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <h2 className="text-lg font-bold text-slate-900">
                  {isCrawling ? 'Crawling Website Pages...' : 'Crawl Completed'}
                </h2>
              </div>
              <span className="text-xs font-mono font-medium text-slate-500">
                {statusMessage}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Progress ({progress}%)</span>
                <span>{crawledPages.length} / {maxPages} pages</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/60">
                <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pages Found</span>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {crawledPages.length}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/60">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase mb-1">
                  <Layers className="w-4 h-4" />
                  <span>Queue Size</span>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {queueSize}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/60">
                <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Time Elapsed</span>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {elapsedTime}s
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60">
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Max Depth</span>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {maxDepth}
                </div>
              </div>
            </div>

            {/* Discovered Pages Table */}
            {crawledPages.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Discovered URLs ({crawledPages.length})
                  </h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter URLs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs bg-slate-50/50">
                  {filteredPages.map((page, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-white transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-slate-900 truncate">
                          {page.url}
                        </div>
                        <div className="text-slate-500 text-[11px] truncate">
                          {page.title}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px]">
                          Depth {page.depth}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          HTTP 200
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredPages.length === 0 && (
                    <div className="p-4 text-center text-slate-400">
                      No matching URLs found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Results & Generated XML Preview Section */}
        {generatedXml && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Your sitemap.xml is Ready!
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Copy or download your valid XML sitemap and submit it to search engines.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyXml}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy XML'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadXml}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download sitemap.xml</span>
                </button>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border-b border-slate-100 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`pb-2 px-4 border-b-2 transition-colors cursor-pointer ${
                  viewMode === 'preview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                XML Code Preview
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`pb-2 px-4 border-b-2 transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                URL List ({crawledPages.length})
              </button>
            </div>

            {/* XML Preview Code Block */}
            {viewMode === 'preview' ? (
              <div className="relative">
                <pre className="bg-slate-950 text-slate-100 p-6 rounded-2xl overflow-x-auto text-xs font-mono leading-relaxed max-h-[450px] border border-slate-800 selection:bg-blue-500 selection:text-white">
                  <code>{generatedXml}</code>
                </pre>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="max-h-[450px] overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100">
                  {crawledPages.map((page, i) => (
                    <div key={i} className="p-3 flex items-center justify-between gap-4 text-xs">
                      <a 
                        href={page.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-blue-600 hover:underline font-mono truncate"
                      >
                        {page.url}
                      </a>
                      <span className="text-slate-400 text-[11px] shrink-0 font-mono">
                        {page.lastmod}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Limits & Feature Info Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Fast In-Memory Crawl</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Crawls pages concurrently using streaming responses with zero server database bloat.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Smart Filtering</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Filters out duplicate links, external domains, and non-HTML assets like images, PDFs, and ZIP files.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
            <FileCode className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">100% Valid XML</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generates fully compliant sitemaps.org schema XML files ready for Search Console submission.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection
          pageId="xml-sitemap-generator"
          faqs={XML_SITEMAP_FAQS}
        />

        {/* Schema Scripts */}
        <Script id="xml-sitemap-breadcrumb-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem", "position": 1, "name": "Home",
                "item": "https://www.urltrim.online/"
              },
              {
                "@type": "ListItem", "position": 2, "name": "Tools",
                "item": "https://www.urltrim.online/tools"
              },
              {
                "@type": "ListItem", "position": 3, "name": "XML Sitemap Generator",
                "item": "https://www.urltrim.online/tools/xml-sitemap-generator"
              }
            ]
          })}
        </Script>
      </div>
    </PageLayout>
  );
}
