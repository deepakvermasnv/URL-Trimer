'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  FileText,
  Globe,
  Plus,
  Trash2,
  Play,
  Download,
  Copy,
  Check,
  AlertCircle,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  FileCode2,
  ShieldCheck,
  Zap,
  ChevronRight
} from 'lucide-react';
import Script from 'next/script';
import PageLayout from '@/components/PageLayout';
import FAQSection from '@/components/FAQSection';
import { cn } from '@/lib/utils';

// Backend API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';


interface ExtractedPage {
  id: string;
  url: string;
  title: string;
  description: string;
  section: string;
  selected: boolean;
}

const SECTION_PRIORITY = [
  'Important Pages',
  'Main Tools / Services',
  'Blog and Resources',
  'Other Pages',
  'Core Pages',
  'Main Tools',
  'Blog & Articles',
  'Product Pages',
  'Service Pages',
  'Additional Resources'
];

const LLMS_TXT_FAQS = [
  {
    q: "What is an llms.txt file?",
    a: "An llms.txt file is a standardized markdown file placed at the root of a website (e.g., https://example.com/llms.txt) that provides LLMs (Large Language Models), AI agents, and web crawlers with a clean, structured index of your website's key pages, documentation, and content."
  },
  {
    q: "How does this tool generate llms.txt?",
    a: "Our tool extracts pages from your sitemap.xml, homepage URL, or manually pasted URLs via our fast shared backend engine. It deduplicates links, validates formatting, categorizes URLs into logical markdown sections, and lets you select or edit pages before downloading your final llms.txt file."
  },
  {
    q: "What should I do if my sitemap URL fails?",
    a: "If fetching your sitemap directly fails, simply open your sitemap XML in your browser, copy its content, and paste it into our manual Sitemap XML paste box below!"
  },
  {
    q: "Where should I host the generated llms.txt file?",
    a: "Upload the generated llms.txt file to the root directory of your web server (e.g., https://yourdomain.com/llms.txt). You can also link to it from your robots.txt file or HTML <head> meta tags."
  },
  {
    q: "Is this tool completely free and private?",
    a: "Yes! The Free LLMs.txt Generator operates fast and securely. No URLs or page contents are permanently stored in any database."
  }
];

export default function LlmsTxtGeneratorPage() {
  // Input States
  const [sitemapUrls, setSitemapUrls] = useState<string[]>(['']);
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [pastedUrls, setPastedUrls] = useState<string>('');
  const [pastedXml, setPastedXml] = useState<string>('');

  // Custom Metadata Optional Fields
  const [siteTitle, setSiteTitle] = useState<string>('');
  const [siteSummary, setSiteSummary] = useState<string>('');

  // Processing & View States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showXmlFallback, setShowXmlFallback] = useState<boolean>(false);
  const [showWarnings, setShowWarnings] = useState<boolean>(false); // <-- YE LINE ADD KAREIN


  // Extracted Pages State
  const [extractedPages, setExtractedPages] = useState<ExtractedPage[]>([]);
  const [generatedResult, setGeneratedResult] = useState<{
    content: string;
    filename: string;
    pageCount: number;
    byteSize: number;
  } | null>(null);

  const [copied, setCopied] = useState<boolean>(false);

  // Handlers for Sitemap URLs Array
  const handleAddSitemapUrl = () => {
    setSitemapUrls((prev) => [...prev, '']);
  };

  const handleUpdateSitemapUrl = (index: number, value: string) => {
    setSitemapUrls((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleRemoveSitemapUrl = (index: number) => {
    setSitemapUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper: Categorize URL into section
  const categorizeUrl = (urlStr: string): string => {
    try {
      const parsed = new URL(urlStr);
      const pathname = parsed.pathname.toLowerCase().replace(/\/$/, '');

      if (!pathname || pathname === '' || ['/about', '/contact', '/privacy', '/terms', '/disclaimer'].includes(pathname)) {
        return 'Important Pages';
      }
      if (pathname.startsWith('/tools') || pathname.includes('tool') || pathname.includes('product') || pathname.includes('service')) {
        return 'Main Tools / Services';
      }
      if (pathname.startsWith('/blog') || pathname.includes('/post') || pathname.includes('/article') || pathname.includes('/news')) {
        return 'Blog and Resources';
      }
      return 'Other Pages';
    } catch {
      return 'Other Pages';
    }
  };

  // Main Handler: Sends input to Shared Backend API
  const handleProcessInputs = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setWarnings([]);
    setStatusMessage('Connecting to crawler engine...');
    setIsProcessing(true);
    setExtractedPages([]);
    setGeneratedResult(null);

    // Prepare Payload
    const firstSitemap = sitemapUrls.map(s => s.trim()).filter(Boolean)[0] || undefined;
    const cleanWebsiteUrl = websiteUrl.trim() || undefined;
    const cleanPageUrls = pastedUrls
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    if (!firstSitemap && !cleanWebsiteUrl && cleanPageUrls.length === 0) {
      setError('Please provide at least one of: Sitemap URL, Website URL, or Paste Specific URLs.');
      setIsProcessing(false);
      return;
    }

    try {
      setStatusMessage('Crawling website pages & extracting metadata...');

      // Line 172 ko badal kar ye likhein:
      const response = await fetch('/api/llms-txt-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sitemapUrl: firstSitemap,
          websiteUrl: cleanWebsiteUrl,
          pageUrls: cleanPageUrls,
          options: {
            maxPages: 50,
            includeBlogs: true,
          },
        }),
      });


      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to generate llms.txt.');
      }

      const { data } = json;

      if (data.warnings && data.warnings.length > 0) {
        setWarnings(data.warnings);
      }

      // Map Backend Pages to UI State
      const mappedPages: ExtractedPage[] = (data.pages || []).map((p: any, idx: number) => ({
        id: `page-${idx}-${Date.now()}`,
        url: p.url,
        title: p.title || p.h1 || p.url,
        description: p.pageDescription || p.metaDescription || '',
        section: categorizeUrl(p.url),
        selected: p.success !== false,
      }));

      setExtractedPages(mappedPages);

      // Save Initial Result
      const content = data.content || '';
      const filename = data.filename || 'llms.txt';
      const byteSize = new Blob([content]).size;

      setGeneratedResult({
        content,
        filename,
        pageCount: mappedPages.filter(p => p.selected).length,
        byteSize,
      });

    } catch (err: any) {
      console.error('Generation Error:', err);
      setError(err.message || 'An error occurred while communicating with the server.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Regenerate Final Markdown Text from UI Selection Changes
  const generateLlmsTxtOutput = (pages: ExtractedPage[]) => {
    const selectedPages = pages.filter((p) => p.selected);
    if (selectedPages.length === 0) {
      setGeneratedResult(null);
      return;
    }

    let headerTitle = siteTitle.trim();
    if (!headerTitle) {
      if (websiteUrl.trim()) {
        try {
          const parsed = new URL(websiteUrl.trim());
          headerTitle = parsed.hostname.replace(/^www\./, '');
        } catch {
          headerTitle = 'Website Index';
        }
      } else if (selectedPages.length > 0) {
        try {
          const parsed = new URL(selectedPages[0].url);
          headerTitle = parsed.hostname.replace(/^www\./, '');
        } catch {
          headerTitle = 'Website Index';
        }
      } else {
        headerTitle = 'Website Index';
      }
    }

    let summaryBlock = siteSummary.trim();
    if (!summaryBlock) {
      summaryBlock = `${headerTitle} index of available pages and tools.`;
    }

    const sectionMap = new Map<string, ExtractedPage[]>();
    for (const page of selectedPages) {
      const sec = page.section || 'Other Pages';
      if (!sectionMap.has(sec)) sectionMap.set(sec, []);
      sectionMap.get(sec)!.push(page);
    }

    let md = `# ${headerTitle}\n\n`;
    md += `> ${summaryBlock}\n\n`;

    for (const secName of ['Important Pages', 'Main Tools / Services', 'Blog and Resources', 'Other Pages']) {
      const secPages = sectionMap.get(secName);
      if (secPages && secPages.length > 0) {
        md += `## ${secName}\n\n`;
        for (const p of secPages) {
          const descText = p.description.trim() ? `: ${p.description.trim()}` : '';
          md += `* [${p.title}](${p.url})${descText}\n`;
        }
        md += `\n`;
      }
    }

    const trimmedContent = md.trim() + '\n';
    const byteSize = new Blob([trimmedContent]).size;

    setGeneratedResult((prev) => ({
      content: trimmedContent,
      filename: prev?.filename || 'llms.txt',
      pageCount: selectedPages.length,
      byteSize,
    }));
  };

  // Toggle Page Selection
  const handleToggleSelectPage = (id: string) => {
    const updated = extractedPages.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p));
    setExtractedPages(updated);
    generateLlmsTxtOutput(updated);
  };

  // Toggle Select All
  const handleToggleSelectAll = (select: boolean) => {
    const updated = extractedPages.map((p) => ({ ...p, selected: select }));
    setExtractedPages(updated);
    generateLlmsTxtOutput(updated);
  };

  // Copy Content Handler
  const handleCopyContent = async () => {
    if (!generatedResult) return;
    try {
      await navigator.clipboard.writeText(generatedResult.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Unable to copy to clipboard.');
    }
  };

  // Download File Handler via Backend API / Blob
  const handleDownloadFile = async () => {
    if (!generatedResult) return;
    const blob = new Blob([generatedResult.content], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = generatedResult.filename || 'llms.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  // Clear / Reset Form
  const handleReset = () => {
    setSitemapUrls(['']);
    setWebsiteUrl('');
    setPastedUrls('');
    setPastedXml('');
    setSiteTitle('');
    setSiteSummary('');
    setIsProcessing(false);
    setStatusMessage('');
    setError(null);
    setWarnings([]);
    setShowXmlFallback(false);
    setExtractedPages([]);
    setGeneratedResult(null);
  };

  return (
    <PageLayout showBlobs={true}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-16 space-y-8 relative">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/tools"
            className="px-4 py-1.5 rounded-full bg-white dark:bg-[#141b27] border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase inline-flex items-center gap-1.5 shadow-xs hover:shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>TOOL LIBRARY</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 text-[11px] font-bold text-blue-700 dark:text-blue-300">
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>LLMs.txt Generator</span>
            </div>
          </div>
        </div>

        {/* Hero Section Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
            Free LLMs.txt <span className="text-[#0066FF] dark:text-blue-400">Generator.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-normal">
            Create a clean, standardized <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-blue-600 dark:text-blue-400 font-bold">llms.txt</code> file for your website. Provide sitemaps, homepage URLs, or custom page links to build markdown indices for LLMs and AI crawlers.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-white dark:bg-[#141b27] rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-200/40 dark:shadow-black/40 p-6 sm:p-10 mb-12">

          <form onSubmit={handleProcessInputs} className="space-y-8">

            {/* INPUT METHOD 1: Sitemap URL */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  1. Sitemap URL
                </label>
                <button
                  type="button"
                  onClick={handleAddSitemapUrl}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0066FF] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Sitemap</span>
                </button>
              </div>

              {sitemapUrls.map((smUrl, index) => (
                <div key={index} className="relative flex items-center gap-2">
                  <div className="relative flex-1 flex items-center">
                    <div className="absolute left-4 text-slate-400 pointer-events-none">
                      <FileCode2 className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type="url"
                      value={smUrl}
                      onChange={(e) => handleUpdateSitemapUrl(index, e.target.value)}
                      placeholder="https://example.com/sitemap.xml"
                      disabled={isProcessing}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm sm:text-base disabled:opacity-60"
                    />
                  </div>
                  {sitemapUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSitemapUrl(index)}
                      className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors shrink-0"
                      title="Remove URL"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports standard <code className="font-mono">sitemap.xml</code> and sitemap index files.
              </p>
            </div>

            {/* OR DIVIDER 1 */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <span className="relative bg-white dark:bg-[#141b27] px-4 text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                OR
              </span>
            </div>

            {/* INPUT METHOD 2: Website URL */}
            <div className="space-y-3">
              <label htmlFor="website-url" className="block text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                2. Website URL
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400 pointer-events-none">
                  <Globe className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="website-url"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com/"
                  disabled={isProcessing}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm sm:text-base disabled:opacity-60"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your website homepage. Used to establish website domain and index main landing pages.
              </p>
            </div>

            {/* OR DIVIDER 2 */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <span className="relative bg-white dark:bg-[#141b27] px-4 text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                OR
              </span>
            </div>

            {/* INPUT METHOD 3: Paste Specific URLs */}
            <div className="space-y-3">
              <label htmlFor="pasted-urls" className="block text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                3. Paste Specific URLs
              </label>
              <textarea
                id="pasted-urls"
                rows={4}
                value={pastedUrls}
                onChange={(e) => setPastedUrls(e.target.value)}
                placeholder={`https://example.com/about\nhttps://example.com/docs/getting-started\nhttps://example.com/blog/latest-post`}
                disabled={isProcessing}
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all disabled:opacity-60"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste specific web page URLs (one URL per line) to explicitly include them.
              </p>
            </div>

            {/* MANUAL XML FALLBACK TOGGLE & BOX */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowXmlFallback(!showXmlFallback)}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{showXmlFallback ? 'Hide Manual Sitemap XML Input' : 'Paste Raw Sitemap XML (Fallback option)'}</span>
              </button>

              {showXmlFallback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2"
                >
                  <label htmlFor="pasted-xml" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Paste Raw Sitemap XML Content
                  </label>
                  <textarea
                    id="pasted-xml"
                    rows={5}
                    value={pastedXml}
                    onChange={(e) => setPastedXml(e.target.value)}
                    placeholder={`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://example.com/page1</loc></url>\n</urlset>`}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="text-[11px] text-slate-500">
                    Use this fallback if your server restricts browser CORS requests from fetching sitemap files directly.
                  </p>
                </motion.div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isProcessing || (!sitemapUrls.some(s => s.trim()) && !websiteUrl.trim() && !pastedUrls.trim() && !pastedXml.trim())}
                className="flex items-center gap-2 px-6 py-3.5 bg-[#0066FF] hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{statusMessage || 'Processing Pages...'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Generate LLMs.txt</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear & Reset</span>
              </button>
            </div>
          </form>

          {/* WARNING NOTICES */}
          {/* WARNING NOTICES (Collapsible Toggle) */}
          {warnings.length > 0 && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowWarnings(!showWarnings)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer"
              >
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{showWarnings ? 'Hide Crawling Notes' : `View Crawling Notes & Warnings (${warnings.length})`}</span>
              </button>

              {showWarnings && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs space-y-1"
                >
                  <ul className="list-disc list-inside space-y-1 pl-1 text-xs opacity-90 font-mono">
                    {warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          )}

          {/* ERROR ALERT */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs sm:text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-bold">Generation Error</p>
                <p className="mt-0.5 leading-relaxed">{error}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* PAGE SELECTION & CONFIGURATION LIST */}
        {extractedPages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#141b27] rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-200/40 dark:shadow-black/40 p-6 sm:p-8 mb-12 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Select & Customize Pages</span>
                  <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-xs rounded-full font-bold">
                    {extractedPages.filter(p => p.selected).length} of {extractedPages.length} Selected
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose which pages to include in your llms.txt index.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleSelectAll(true)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleSelectAll(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Extracted Page Items */}
            <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1">
              {extractedPages.map((page) => (
                <div
                  key={page.id}
                  className={cn(
                    "p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs",
                    page.selected
                      ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50"
                      : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60"
                  )}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={page.selected}
                      onChange={() => handleToggleSelectPage(page.id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {page.title}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                          {page.section}
                        </span>
                      </div>
                      {page.description ? (
                        <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5 line-clamp-1">
                          {page.description}
                        </p>
                      ) : null}
                      <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {page.url}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* GENERATED RESULT SECTION */}
        {generatedResult && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#141b27] rounded-3xl border border-emerald-200/80 dark:border-emerald-900/50 shadow-2xl shadow-emerald-500/5 p-6 sm:p-10 mb-12 space-y-6"
            id="llmstxt-result-section"
          >
            {/* RESULT HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Your llms.txt is ready!
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Standard Markdown formatted file ready for deployment to your web root.
                  </p>
                </div>
              </div>

              {/* FILE INFORMATION METRICS */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pages</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">{generatedResult.pageCount}</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Format</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">TXT</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">File Size</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">{generatedResult.byteSize} Bytes</span>
                </div>
              </div>
            </div>

            {/* PREVIEW BOX */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Content Preview (llms.txt)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Markdown output
                </span>
              </div>
              <div className="relative rounded-2xl bg-slate-950 text-slate-100 p-5 font-mono text-xs sm:text-sm overflow-x-auto max-h-[420px] scrollbar-thin shadow-inner">
                <pre className="whitespace-pre">{generatedResult.content}</pre>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyContent}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Content</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="flex items-center gap-2 px-6 py-3 bg-[#0066FF] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download llms.txt</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const el = document.querySelector('form');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span>Generate Again</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* INFORMATIONAL CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#141b27] border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#0066FF] dark:text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm">Standardized AI Discovery</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Organizes key website URLs into standard markdown sections so LLMs and web crawlers can parse your content efficiently.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#141b27] border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm">Fast Server Processing</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              All URL validation, sitemap parsing, and markdown generation happens fast and securely on our shared microservice backend.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#141b27] border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm">Instant Download & Copy</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Copy raw markdown content with one click or download the ready-to-deploy <code className="font-mono">llms.txt</code> text file immediately.
            </p>
          </div>
        </div>

        {/* TWO-COLUMN EXPLANATION CARD */}
        <div className="bg-white dark:bg-[#141b27] rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-200/40 dark:shadow-black/40 p-8 sm:p-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                What is the llms.txt Proposal?
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                As Large Language Models (LLMs) and AI search engines increasingly index the web, webmasters need a structured way to present key information to AI agents.
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                The <code className="font-mono font-bold text-blue-600 dark:text-blue-400">llms.txt</code> format proposes placing a lightweight Markdown file at the root of a domain. It serves as an optimized table of contents containing key URLs, documentation links, and concise summaries.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                How to Host & Deploy Your llms.txt File
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Once generated with our free tool, save the file as <code className="font-mono font-bold">llms.txt</code> and place it in your website&apos;s public root directory (e.g. <code className="font-mono">https://example.com/llms.txt</code>).
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                You can also declare its location in your <code className="font-mono">robots.txt</code> file or reference it using HTML meta header tags to maximize AI discovery.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs SECTION */}
        <FAQSection pageId="llms-txt-generator" faqs={LLMS_TXT_FAQS} />

        {/* BREADCRUMB SCHEMA */}
        <Script id="llms-txt-breadcrumb-schema" type="application/ld+json">
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
                "name": "LLMs.txt Generator",
                "item": "https://www.urltrim.online/llms-txt-generator"
              }
            ]
          })}
        </Script>
      </div>
    </PageLayout>
  );
}
