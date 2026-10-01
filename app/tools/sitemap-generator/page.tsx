'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { 
  FileCode, 
  Globe, 
  Play, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  RotateCcw, 
  FileText, 
  ExternalLink, 
  ShieldCheck,
  Clock,
  Zap,
  List,
  Square,
  ArrowLeft
} from 'lucide-react';
import Script from 'next/script';
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import NavAction from '@/components/NavAction';
import FAQSection from '@/components/FAQSection';

const SITEMAP_FAQS = [

  {
    q: "Why Does Your Website Need an XML Sitemap?",
    a: "An XML sitemap helps search engines like Google and Bing find important pages on your website. It provides a clear list of URLs that search engine crawlers can use to discover your content. This is especially helpful for websites with many pages or complex structures, as it makes important URLs easier to find."
  },
  {
    q: "How Can You Create a Sitemap Using This Tool?",
    a: "Creating a sitemap is simple. Enter your website URL, and our XML sitemap crawler will scan accessible internal pages on your domain. It identifies valid page URLs, skips duplicate links and unnecessary files, and creates a clean XML sitemap that you can download and use for your website."
  },
  {
    q: "Which Website URLs Are Included in the Generated Sitemap?",
    a: "The sitemap generator focuses on accessible internal pages from your website. It excludes external links, broken URLs, duplicate pages, fragment links, and non-page files such as images, videos, fonts, and stylesheets. This helps keep your sitemap focused on useful website pages."
  },
  {
    q: "How Can You Add Your XML Sitemap to Google Search Console?",
    a: "After using our free XML sitemap generator, follow these steps to submit your sitemap:\n\n1. Generate and download your sitemap.xml file.\n2. Upload the file to your website's root directory.\n3. Open Google Search Console and select your website property.\n4. Go to the Sitemaps section and enter your sitemap URL.\n5. Click Submit to send it to Google.\n\nYou can also add your sitemap URL to the robots.txt file to help search engines locate it."
  },
  {
    q: "Does the XML Sitemap Crawler Follow robots.txt Rules?",
    a: "Yes, the crawler checks your website's robots.txt file and follows its Disallow rules when crawling pages. This helps prevent the tool from accessing paths that your website has restricted for crawlers. Make sure your robots.txt settings allow access to the pages you want to include in your sitemap."
  }
];

export default function SitemapGenerator() {
  const [url, setUrl] = useState('');

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
          maxPages: 0,
          maxDepth: 10,
          respectRobots: true,
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-16 space-y-8 relative">
        {/* Top Header Controls (Matching homepage design) */}
        <div className="flex items-center justify-between mb-2">
          <Link 
            href="/tools" 
            className="px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-[11px] font-bold tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all uppercase inline-flex items-center gap-1.5 shadow-xs hover:shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>TOOL LIBRARY</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-bold text-emerald-700">
              <FileCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>XML sitemap generator</span>
            </div>
          </div>
        </div>

        {/* Hero Section Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Sitemap <span className="text-[#0066FF]">Generator.</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-normal">
            Create a sitemap for your website in just a few clicks. URLTrim crawls your accessible pages and generates a clean XML file ready for search engines.
          </p>
        </div>

        {/* Main Tool Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-10 mb-12">
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
            <h3 className="font-black text-slate-900 text-sm">Find Website Pages Easily</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our XML sitemap crawler scans your website to find accessible pages, including dynamic URLs and canonical routes. It helps identify important pages so you can create an accurate sitemap for search engines.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">Create a Clean XML Sitemap</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create a clean XML sitemap without duplicate URLs, tracking parameters, broken links, or unnecessary files. Our free XML sitemap generator helps keep your sitemap organized and ready for search engines.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">Generate Search Engine Friendly XML</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              100% compliant with the sitemaps.org standard, recognized by Google Search Console, Bing Webmaster Tools, and Yandex.
            </p>
          </div>
        </div>

        {/* Two-Column Explanation Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-8 sm:p-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
               What Can You Do with Our XML Sitemap Generator?
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Create a sitemap for your website with our free XML sitemap generator. Simply enter your website URL, and our XML sitemap crawler will scan accessible pages to create a structured sitemap that helps search engines discover your content.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                There is no need to register or create an account. Enter your website URL, generate your sitemap, and download the XML file when it is ready.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Our sitemap generator also helps identify duplicate URLs, tracking parameters, and broken links to keep your sitemap clean and organized.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Once generated, you can download your sitemap and upload it to your website to help search engines find your important pages.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                What Is an XML Sitemap?
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                An XML sitemap is a file that lists important URLs on your website and provides useful information about those pages. It helps search engines like Google and Bing discover your website content and understand which pages are available for crawling.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                For websites with many pages, a sitemap can make it easier for search engines to find URLs that may not be easily accessible through internal links.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Using an online XML sitemap generator, you can create a sitemap without manually listing every page. A properly formatted XML sitemap follows the sitemaps.org protocol and can be submitted through Google Search Console and Bing Webmaster Tools.
              </p>
            </div>
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
