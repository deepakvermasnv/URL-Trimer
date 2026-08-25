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
  List,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  HelpCircle,
  FileDown,
  Info
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
  priority?: string;
  changefreq?: string;
}

const XML_SITEMAP_FAQS = [
  {
    q: "What is an XML Sitemap and why is it essential for SEO?",
    a: "An XML Sitemap is an XML protocol file that lists the important URLs of your website. It acts as an authoritative map for search engine bots (Googlebot, Bingbot, Yandex, DuckDuckGo) to discover, crawl, and index all your canonical web pages quickly without missing deep links."
  },
  {
    q: "How many pages can I crawl for free?",
    a: "You can crawl up to 500 pages per domain with up to 5 crawl depth levels in Crawler Mode. Alternatively, you can use Direct Paste Mode to convert an unlimited list of your own URLs into a valid sitemap.xml instantly."
  },
  {
    q: "What does this tool filter out automatically?",
    a: "Our crawler automatically filters out external links, duplicate canonical URLs, hash fragments (#), tracking query parameters (such as utm_source, gclid, fbclid), and non-HTML assets like images (.png, .jpg, .webp), videos (.mp4), stylesheets, scripts, and PDFs."
  },
  {
    q: "How do I upload and submit my generated sitemap.xml?",
    a: "1. Download the generated sitemap.xml file.\n2. Upload it to the root directory of your website (e.g. https://yourdomain.com/sitemap.xml).\n3. Open Google Search Console -> Sitemaps -> Enter 'sitemap.xml' and click Submit.\n4. Add a reference line in your robots.txt: Sitemap: https://yourdomain.com/sitemap.xml"
  },
  {
    q: "Does this tool respect robots.txt rules?",
    a: "Yes! By default, the generator reads your domain's robots.txt and honors Disallow directives for search bots. You can also toggle this setting in Crawler Options."
  }
];

export default function XMLSitemapGenerator() {
  const [mode, setMode] = useState<'crawler' | 'manual'>('crawler');

  // Crawler Mode States
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(100);
  const [maxDepth, setMaxDepth] = useState(3);
  const [changeFreq, setChangeFreq] = useState('weekly');
  const [priority, setPriority] = useState('0.8');
  const [respectRobots, setRespectRobots] = useState(true);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Manual List Mode States
  const [manualUrlsInput, setManualUrlsInput] = useState('');

  // Crawl Execution States
  const [isCrawling, setIsCrawling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [crawledPages, setCrawledPages] = useState<CrawledPage[]>([]);
  const [queueSize, setQueueSize] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Output & Results
  const [generatedXml, setGeneratedXml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'preview' | 'table'>('preview');

  // Manual URL Add in Results
  const [newCustomUrl, setNewCustomUrl] = useState('');

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

  // Client-side XML generator helper
  const regenerateXmlFromPages = useCallback((pages: CrawledPage[], defaultFreq: string, defaultPrio: string) => {
    if (pages.length === 0) {
      setGeneratedXml(null);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    pages.forEach((page, index) => {
      const isHomepage = index === 0 || new URL(page.url).pathname === '/';
      const prio = page.priority || (isHomepage ? '1.0' : defaultPrio);
      const freq = page.changefreq || defaultFreq;
      
      const safeUrl = page.url
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      xml += `  <url>\n`;
      xml += `    <loc>${safeUrl}</loc>\n`;
      xml += `    <lastmod>${page.lastmod || today}</lastmod>\n`;
      xml += `    <changefreq>${freq}</changefreq>\n`;
      xml += `    <priority>${prio}</priority>\n`;
      xml += `  </url>\n`;
    });
    xml += `</urlset>`;
    setGeneratedXml(xml);
  }, []);

  // Update XML if options or pages change
  const handleUpdateChangeFreq = (newFreq: string) => {
    setChangeFreq(newFreq);
    if (crawledPages.length > 0) {
      regenerateXmlFromPages(crawledPages, newFreq, priority);
    }
  };

  const handleUpdatePriority = (newPrio: string) => {
    setPriority(newPrio);
    if (crawledPages.length > 0) {
      regenerateXmlFromPages(crawledPages, changeFreq, newPrio);
    }
  };

  const handleRemovePage = (urlToRemove: string) => {
    const updated = crawledPages.filter((p) => p.url !== urlToRemove);
    setCrawledPages(updated);
    regenerateXmlFromPages(updated, changeFreq, priority);
  };

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomUrl.trim()) return;

    let target = newCustomUrl.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = `https://${target}`;
    }

    try {
      const parsed = new URL(target);
      parsed.hash = '';
      const clean = parsed.toString();

      if (crawledPages.some((p) => p.url === clean)) {
        setError('This URL is already in the sitemap list.');
        return;
      }

      const newPage: CrawledPage = {
        url: clean,
        depth: 0,
        status: 200,
        title: parsed.pathname === '/' ? 'Home Page' : parsed.pathname.replace(/^\//, ''),
        lastmod: new Date().toISOString().split('T')[0],
      };

      const updated = [...crawledPages, newPage];
      setCrawledPages(updated);
      setNewCustomUrl('');
      setError(null);
      regenerateXmlFromPages(updated, changeFreq, priority);
    } catch {
      setError('Please enter a valid URL (e.g. https://example.com/page).');
    }
  };

  // Run Crawler Mode
  const handleStartCrawl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a website URL to crawl.');
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
      setError('Please enter a valid URL (e.g. https://example.com).');
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
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.type === 'status') {
              setStatusMessage(data.message);
            } else if (data.type === 'progress') {
              setCrawledPages((prev) => {
                if (prev.some(p => p.url === data.url)) return prev;
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
              setStatusMessage(`Discovered: ${data.url}`);
            } else if (data.type === 'complete') {
              setGeneratedXml(data.xml);
              setProgress(100);
              setStatusMessage(`Finished! Generated sitemap with ${data.totalPages} URLs.`);
              setIsCrawling(false);
              clearTimer();
            } else if (data.type === 'error') {
              setError(data.message || 'Crawl error occurred.');
              setIsCrawling(false);
              clearTimer();
            }
          } catch {
            // Ignore incomplete chunks in stream
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatusMessage('Crawl stopped by user.');
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred while crawling.');
      }
      setIsCrawling(false);
      clearTimer();
    }
  };

  // Run Manual URL List Mode
  const handleGenerateManualList = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = manualUrlsInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setError('Please paste at least one website URL.');
      return;
    }

    setError(null);
    setIsCrawling(true);
    setStatusMessage('Generating XML sitemap from URL list...');

    try {
      const response = await fetch('/api/xml-sitemap-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directGenerate: true,
          urlsList: lines,
          changeFreq,
          priority,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate sitemap.');
      }

      setCrawledPages(data.pages || []);
      setGeneratedXml(data.xml);
      setStatusMessage(`Success! Generated sitemap with ${data.totalPages} URLs.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate sitemap.');
    } finally {
      setIsCrawling(false);
    }
  };

  const handleCancelCrawl = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsCrawling(false);
    clearTimer();
    setStatusMessage('Crawl cancelled.');
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
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleDownloadTxt = () => {
    if (crawledPages.length === 0) return;
    const content = crawledPages.map((p) => p.url).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'urls-list.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const filteredPages = crawledPages.filter((page) => 
    page.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const xmlSizeKb = generatedXml ? (new Blob([generatedXml]).size / 1024).toFixed(1) : '0';

  return (
    <PageLayout showBlobs={true}>
      <NavAction href="/tools" label="Back to Tools" type="back" />

      <Hero 
        title={
          <span>
            XML Sitemap <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Generator</span>
          </span>
        }
        subtitle="Crawl your website or paste URLs to generate a 100% valid sitemap.xml formatted for Google Search Console and Bing Webmaster Tools."
        badgeText="Free SEO Utility"
        badgeIcon={FileCode}
        centered={true}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Mode Selector Tabs */}
        <div className="flex p-1.5 bg-slate-100/80 rounded-2xl max-w-md mx-auto border border-slate-200/70">
          <button
            type="button"
            onClick={() => setMode('crawler')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'crawler'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Website Crawler</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'manual'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Paste URL List</span>
          </button>
        </div>

        {/* CRAWLER MODE CARD */}
        {mode === 'crawler' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 p-6 sm:p-8 space-y-6"
          >
            <form onSubmit={handleStartCrawl} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="website-url" className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Website URL to Crawl
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Up to 500 pages free
                  </span>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <input
                    id="website-url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    disabled={isCrawling}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Sample Domain Shortcuts */}
              {!isCrawling && !url && (
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                  <span className="font-semibold text-slate-600">Quick test:</span>
                  <button
                    type="button"
                    onClick={() => setUrl('https://news.ycombinator.com')}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors font-mono"
                  >
                    news.ycombinator.com
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrl('https://example.com')}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors font-mono"
                  >
                    example.com
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
                  <span>Crawler Settings & Metadata</span>
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
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span className="uppercase">Max Pages Limit</span>
                          <span className="text-blue-600">{maxPages} URLs</span>
                        </div>
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
                          Crawl Depth ({maxDepth} Levels)
                        </label>
                        <select
                          value={maxDepth}
                          onChange={(e) => setMaxDepth(Number(e.target.value))}
                          disabled={isCrawling}
                          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={1}>1 level (Homepage only)</option>
                          <option value={2}>2 levels (Direct header & footer links)</option>
                          <option value={3}>3 levels (Standard blog or business site)</option>
                          <option value={4}>4 levels (Deep nested archives)</option>
                          <option value={5}>5 levels (Maximum depth)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Change Frequency
                        </label>
                        <select
                          value={changeFreq}
                          onChange={(e) => handleUpdateChangeFreq(e.target.value)}
                          disabled={isCrawling}
                          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="always">always</option>
                          <option value="hourly">hourly</option>
                          <option value="daily">daily</option>
                          <option value="weekly">weekly</option>
                          <option value="monthly">monthly</option>
                          <option value="yearly">yearly</option>
                          <option value="never">never</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Default Priority
                        </label>
                        <select
                          value={priority}
                          onChange={(e) => handleUpdatePriority(e.target.value)}
                          disabled={isCrawling}
                          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="1.0">1.0 (Highest)</option>
                          <option value="0.8">0.8 (Standard Content)</option>
                          <option value="0.6">0.6 (Medium)</option>
                          <option value="0.5">0.5 (Default)</option>
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
                          <span>Respect robots.txt rules (Recommended for standard SEO)</span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="flex items-center gap-4">
                {!isCrawling ? (
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Crawl & Generate Sitemap</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelCrawl}
                    className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-rose-500/25 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span>Stop Crawling</span>
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}

        {/* MANUAL URL LIST MODE CARD */}
        {mode === 'manual' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 p-6 sm:p-8 space-y-6"
          >
            <form onSubmit={handleGenerateManualList} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="manual-urls" className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Paste URL List (One URL Per Line)
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Instant generation
                  </span>
                </div>
                <textarea
                  id="manual-urls"
                  rows={6}
                  value={manualUrlsInput}
                  onChange={(e) => setManualUrlsInput(e.target.value)}
                  placeholder={`https://example.com/\nhttps://example.com/about\nhttps://example.com/pricing\nhttps://example.com/blog\nhttps://example.com/contact`}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Change Frequency
                  </label>
                  <select
                    value={changeFreq}
                    onChange={(e) => handleUpdateChangeFreq(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">daily</option>
                    <option value="weekly">weekly</option>
                    <option value="monthly">monthly</option>
                    <option value="yearly">yearly</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => handleUpdatePriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1.0">1.0 (Highest)</option>
                    <option value="0.8">0.8 (Standard)</option>
                    <option value="0.5">0.5 (Default)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCrawling || !manualUrlsInput.trim()}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Generate Instant Sitemap</span>
              </button>
            </form>
          </motion.div>
        )}

        {/* Error Alert Box */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold">Error: </span>
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Live Crawl Progress Panel */}
        {(isCrawling || (crawledPages.length > 0 && mode === 'crawler')) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isCrawling ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {isCrawling ? 'Crawling Website Pages...' : 'Crawl Complete'}
                </h2>
              </div>
              <span className="text-xs font-mono font-medium text-slate-500 max-w-sm truncate">
                {statusMessage}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Progress ({progress}%)</span>
                <span>{crawledPages.length} / {maxPages} pages</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100/70">
                <div className="flex items-center gap-1.5 text-blue-600 text-[11px] font-bold uppercase mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>URLs Discovered</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {crawledPages.length}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/70">
                <div className="flex items-center gap-1.5 text-indigo-600 text-[11px] font-bold uppercase mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Queue Remaining</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {queueSize}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100/70">
                <div className="flex items-center gap-1.5 text-purple-600 text-[11px] font-bold uppercase mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time Elapsed</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {elapsedTime}s
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/70">
                <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold uppercase mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>XML File Size</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {xmlSizeKb} KB
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* RESULTS & XML PREVIEW */}
        {generatedXml && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Sitemap.xml Ready ({crawledPages.length} URLs)
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Valid sitemaps.org format, ready to download and upload to your root folder.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyXml}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied XML!' : 'Copy XML'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Export raw URL list"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Export .txt</span>
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
            <div className="flex border-b border-slate-100 text-xs font-bold gap-2">
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`pb-2.5 px-4 border-b-2 transition-colors cursor-pointer ${
                  viewMode === 'preview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                XML Code Preview
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`pb-2.5 px-4 border-b-2 transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Manage URLs Table ({crawledPages.length})
              </button>
            </div>

            {/* XML Preview View */}
            {viewMode === 'preview' ? (
              <div className="relative">
                <pre className="bg-slate-950 text-slate-100 p-5 rounded-2xl overflow-x-auto text-xs font-mono leading-relaxed max-h-[420px] border border-slate-800 selection:bg-blue-500 selection:text-white">
                  <code>{generatedXml}</code>
                </pre>
              </div>
            ) : (
              /* Manage Table View */
              <div className="space-y-4">
                {/* Search & Add URL Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search discovered URLs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <form onSubmit={handleAddCustomUrl} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add URL manually..."
                      value={newCustomUrl}
                      onChange={(e) => setNewCustomUrl(e.target.value)}
                      className="w-full sm:w-64 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </form>
                </div>

                {/* Table */}
                <div className="max-h-[380px] overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs bg-slate-50/50">
                  {filteredPages.map((page, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-white transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-slate-900 truncate">
                          {page.url}
                        </div>
                        <div className="text-slate-500 text-[11px] truncate flex items-center gap-2">
                          <span>{page.title}</span>
                          <span>•</span>
                          <span>{page.lastmod}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px]">
                          Depth {page.depth}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          200 OK
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePage(page.url)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove URL from sitemap"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredPages.length === 0 && (
                    <div className="p-6 text-center text-slate-400">
                      No URLs match your filter query.
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Instructions / How to Submit Card */}
        <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
            <Info className="w-4 h-4 text-blue-400" />
            <span>How to Submit Your Sitemap to Search Engines</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs leading-relaxed text-slate-300">
            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">1</span>
                <span>Upload to Server</span>
              </div>
              <p>
                Place the downloaded <code className="text-blue-300 bg-slate-950 px-1 py-0.5 rounded font-mono">sitemap.xml</code> into your public root folder so it is accessible at <code className="text-blue-300 bg-slate-950 px-1 py-0.5 rounded font-mono">https://domain.com/sitemap.xml</code>.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">2</span>
                <span>Google Search Console</span>
              </div>
              <p>
                Log into Google Search Console, navigate to <strong>Sitemaps</strong> in the left sidebar, type <code className="text-blue-300 bg-slate-950 px-1 py-0.5 rounded font-mono">sitemap.xml</code> and click Submit.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">3</span>
                <span>Reference in robots.txt</span>
              </div>
              <p>
                Add this directive to your robots.txt file: <br />
                <code className="text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded font-mono text-[11px] block mt-1">Sitemap: https://domain.com/sitemap.xml</code>
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Streaming Live Crawler</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Crawls internal links concurrently and streams progress directly to your browser without page refresh.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Automated Link Sanitization</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Removes tracking parameters (utm_*, gclid, fbclid), ignores non-HTML assets, and strips duplicate query parameters.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
            <FileCode className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">100% Valid XML Schema</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fully compliant with the sitemaps.org 0.9 protocol with valid loc, lastmod, changefreq, and priority tags.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection
          pageId="xml-sitemap-generator"
          faqs={XML_SITEMAP_FAQS}
        />

        {/* Breadcrumb Schema */}
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
