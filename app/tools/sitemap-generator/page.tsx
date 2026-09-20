'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCode, 
  Globe, 
  Play, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  RotateCcw, 
  Settings2, 
  FileText, 
  ExternalLink, 
  ShieldCheck,
  Clock,
  Zap,
  List,
  ChevronDown,
  ChevronUp,
  Square
} from 'lucide-react';
import Script from 'next/script';
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import NavAction from '@/components/NavAction';
import FAQSection from '@/components/FAQSection';

const SITEMAP_FAQS = [
  {
    q: "What is an XML Sitemap and why do search engines need it?",
    a: "An XML sitemap is a structured file that tells search engines like Google and Bing which pages and URLs on your website are available for indexing. It helps search engine crawlers find all your important internal pages efficiently without missing nested links."
  },
  {
    q: "How does this Sitemap Generator work?",
    a: "When you enter your website address, our server crawler visits the homepage and follows accessible internal links on the same domain. It skips duplicate URLs, tracking parameters, and non-page assets (images, stylesheets, scripts) to generate a clean, valid XML sitemap."
  },
  {
    q: "What URLs are excluded from the sitemap?",
    a: "The tool automatically excludes external domains, broken links (404/500 errors), duplicate URLs, fragment anchors (#), and media assets such as images (.png, .jpg, .svg), videos, fonts, and stylesheets."
  },
  {
    q: "How do I submit my generated sitemap to Google and Bing?",
    a: "1. Click 'Download Sitemap' to save sitemap.xml.\n2. Upload it to your website's public root directory (e.g., https://yourdomain.com/sitemap.xml).\n3. In Google Search Console, go to Sitemaps, enter 'sitemap.xml', and click Submit.\n4. Add a reference in your robots.txt: 'Sitemap: https://yourdomain.com/sitemap.xml'."
  },
  {
    q: "Does this tool respect robots.txt rules?",
    a: "Yes. By default, the crawler fetches your website's robots.txt file and respects Disallow rules to avoid indexing private or disallowed paths."
  }
];

export default function SitemapGenerator() {
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState<number>(50);
  const [maxDepth, setMaxDepth] = useState<number>(3);
  const [respectRobots, setRespectRobots] = useState<boolean>(true);
  const [showOptions, setShowOptions] = useState<boolean>(false);

  // Crawler State
  const [isCrawling, setIsCrawling] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [currentCrawlingUrl, setCurrentCrawlingUrl] = useState<string>('');
  const [discoveredUrls, setDiscoveredUrls] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Results
  const [generatedXml, setGeneratedXml] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'xml' | 'urls'>('xml');
  const [copied, setCopied] = useState<boolean>(false);

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
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a website URL to crawl.');
      return;
    }

    let targetUrl = trimmed;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
      setUrl(targetUrl);
    }

    try {
      const parsed = new URL(targetUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        setError('Only HTTP and HTTPS website URLs are supported.');
        return;
      }
      if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname.toLowerCase())) {
        setError('Localhost and private network URLs cannot be crawled.');
        return;
      }
    } catch {
      setError('Please enter a valid website address (e.g., https://example.com).');
      return;
    }

    // Reset state
    setGeneratedXml(null);
    setDiscoveredUrls([]);
    setCurrentCrawlingUrl('');
    setElapsedTime(0);
    setStatusMessage('Connecting to server crawler...');
    setIsCrawling(true);

    clearTimer();
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/sitemap-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          maxPages,
          maxDepth,
          respectRobots,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response stream received from the crawler.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith('data:')) continue;
          const jsonStr = trimmedLine.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.type === 'start') {
              setStatusMessage(data.message || 'Starting website crawl...');
            } else if (data.type === 'info') {
              setStatusMessage(data.message);
            } else if (data.type === 'progress') {
              setCurrentCrawlingUrl(data.currentUrl || '');
              setStatusMessage(`Crawling page ${data.crawledCount || 1} (depth ${data.depth || 0})...`);
            } else if (data.type === 'url_discovered') {
              setDiscoveredUrls((prev) => {
                if (prev.includes(data.url)) return prev;
                return [...prev, data.url];
              });
            } else if (data.type === 'complete') {
              setGeneratedXml(data.xml);
              if (Array.isArray(data.urls)) {
                setDiscoveredUrls(data.urls);
              }
              setStatusMessage(`Finished! Discovered ${data.totalPages} internal pages.`);
            } else if (data.type === 'error') {
              throw new Error(data.error || 'Crawling failed.');
            }
          } catch (jsonErr) {
            if (jsonErr instanceof Error && jsonErr.message !== 'Unexpected token') {
              throw jsonErr;
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatusMessage('Crawl canceled.');
      } else {
        const message = err instanceof Error ? err.message : 'Failed to crawl website. Please check the URL and try again.';
        setError(message);
      }
    } finally {
      clearTimer();
      setIsCrawling(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopCrawl = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearTimer();
    setIsCrawling(false);
    setStatusMessage('Crawl stopped by user.');
  };

  const handleClear = () => {
    if (isCrawling && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearTimer();
    setUrl('');
    setIsCrawling(false);
    setStatusMessage('');
    setCurrentCrawlingUrl('');
    setDiscoveredUrls([]);
    setGeneratedXml(null);
    setError(null);
    setElapsedTime(0);
  };

  const handleCopy = async () => {
    if (!generatedXml) return;
    try {
      await navigator.clipboard.writeText(generatedXml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Unable to copy to clipboard.');
    }
  };

  const handleDownload = () => {
    if (!generatedXml) return;
    const blob = new Blob([generatedXml], { type: 'application/xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <PageLayout showBlobs={true}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <NavAction 
          href="/tools" 
          label="Back to Tools" 
          type="back" 
          centeredOnMobile={true}
          className="md:justify-start mb-8"
        />

        {/* Hero Section */}
        <Hero 
          title="Sitemap Generator"
          subtitle="Generate an XML sitemap for your website by crawling accessible internal pages. Clean, valid XML formatted for search engines."
          badgeText="XML CRAWLER"
          badgeIcon={FileCode}
          centered={true}
        />

        {/* Main Tool Container */}
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/80 shadow-xl shadow-slate-900/5 p-6 sm:p-10 mb-12">
          {/* Input Form */}
          <form onSubmit={handleStartCrawl} className="space-y-6">
            <div>
              <label htmlFor="website-url-input" className="block text-sm font-black text-slate-800 uppercase tracking-wider mb-2">
                Website URL
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400 pointer-events-none">
                  <Globe className="w-5 h-5" />
                </div>
                <input 
                  id="website-url-input"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={isCrawling}
                  className="w-full pl-12 pr-28 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all disabled:opacity-60 text-sm sm:text-base"
                />
                {url && !isCrawling && (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="absolute right-3 px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-slate-700 bg-slate-200/70 rounded-md transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Enter your website&apos;s full domain. The crawler will discover accessible internal links from this page.
              </p>
            </div>

            {/* Crawler Settings Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Crawler Settings</span>
                {showOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <AnimatePresence>
                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-2 border-t border-slate-100">
                      <div>
                        <label htmlFor="max-pages-select" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Max Pages
                        </label>
                        <select
                          id="max-pages-select"
                          value={maxPages}
                          onChange={(e) => setMaxPages(Number(e.target.value))}
                          disabled={isCrawling}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value={25}>25 pages (Fast)</option>
                          <option value={50}>50 pages (Standard)</option>
                          <option value={100}>100 pages (In-depth)</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="max-depth-select" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Crawl Depth
                        </label>
                        <select
                          id="max-depth-select"
                          value={maxDepth}
                          onChange={(e) => setMaxDepth(Number(e.target.value))}
                          disabled={isCrawling}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value={1}>1 level (Home only)</option>
                          <option value={2}>2 levels (Direct links)</option>
                          <option value={3}>3 levels (Deep crawl)</option>
                          <option value={4}>4 levels (Max)</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-end">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none py-2 text-xs font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={respectRobots}
                            onChange={(e) => setRespectRobots(e.target.checked)}
                            disabled={isCrawling}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                          />
                          <span>Honor robots.txt disallow</span>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {!isCrawling ? (
                <button
                  type="submit"
                  disabled={!url.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Generate Sitemap</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopCrawl}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Crawl</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleClear}
                disabled={isCrawling && !discoveredUrls.length}
                className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </form>

          {/* Error Callout */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-bold">Error Generating Sitemap</p>
                <p className="mt-0.5 text-red-600 leading-relaxed">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Crawl / Progress State */}
          {isCrawling && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-bold text-blue-900">
                    Crawling Website...
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-blue-700">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {elapsedTime}s
                  </span>
                  <span>•</span>
                  <span>{discoveredUrls.length} pages found</span>
                </div>
              </div>

              {statusMessage && (
                <p className="text-xs font-mono text-blue-800 bg-white/80 px-3 py-2 rounded-lg border border-blue-100 truncate">
                  {statusMessage}
                </p>
              )}

              {currentCrawlingUrl && (
                <p className="text-[11px] text-slate-500 truncate font-mono">
                  Target: {currentCrawlingUrl}
                </p>
              )}
            </motion.div>
          )}

          {/* Results Output Section */}
          {generatedXml && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 pt-8 border-t border-slate-100 space-y-6"
            >
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">
                      Generated XML Sitemap
                    </h2>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                      {discoveredUrls.length} {discoveredUrls.length === 1 ? 'URL' : 'URLs'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Valid sitemaps.org format, ready to download and upload to your root folder.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy XML</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download sitemap.xml</span>
                  </button>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('xml')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'xml' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>XML Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('urls')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'urls' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Discovered URLs ({discoveredUrls.length})</span>
                </button>
              </div>

              {/* XML Code Box */}
              {activeTab === 'xml' ? (
                <div className="relative rounded-xl bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-x-auto max-h-[420px] scrollbar-thin">
                  <pre className="whitespace-pre">{generatedXml}</pre>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                  {discoveredUrls.map((discoveredUrl, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                      <span className="font-mono text-slate-800 truncate max-w-[80%]">
                        {discoveredUrl}
                      </span>
                      <a 
                        href={discoveredUrl}
                        target="_blank" 
                        rel="noreferrer noopener"
                        className="text-slate-400 hover:text-blue-600 p-1"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Informational Guidance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">Server Crawler</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Crawls website pages on the server side to resolve dynamic links, bypass CORS restrictions, and capture canonical routes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">Safe & Clean Output</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Excludes duplicate paths, tracking queries (UTM, gclid), media files, and broken links to generate a clean search sitemap.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">Valid XML Protocol</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              100% compliant with the sitemaps.org standard, recognized by Google Search Console, Bing Webmaster Tools, and Yandex.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <FAQSection 
          pageId="sitemap-generator"
          faqs={SITEMAP_FAQS}
        />

        {/* Breadcrumb Schema */}
        <Script id="sitemap-breadcrumb-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.urltrim.online"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Tools",
                "item": "https://www.urltrim.online/tools"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Sitemap Generator",
                "item": "https://www.urltrim.online/tools/sitemap-generator"
              }
            ]
          })}
        </Script>
      </div>
    </PageLayout>
  );
}
