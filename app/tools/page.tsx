'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { cn } from '@/lib/utils';
import { TOOLS, CATEGORIES } from '@/lib/tools';
import FAQSection from '@/components/FAQSection';

const TOOLS_FAQS = [
  {
    q: "What tools does URL Trim offer besides the URL cleaner?",
    a: "There's a Word Counter, Image Compressor, Image Converter, PDF Converter, AI Image Generator, Sitemap Generator, and more—all free and browser-based."
  },
  {
    q: "Do I have to pay for any of these tools?",
    a: "No. Every tool is completely free and requires no signup."
  },
  {
    q: "Do I need to download or install anything?",
    a: "No. Everything runs directly inside your browser without installing software."
  },
  {
    q: "Do these tools work on mobile?",
    a: "Yes. Every tool is fully responsive and works on phones, tablets, and desktops."
  },
  {
    q: "Is it safe to use these tools with personal files or text?",
    a: "Yes. Everything is processed locally on your device in your browser's local RAM."
  }
];

export default function ToolsLibrary() {
  const [activeTab, setActiveTab] = useState('All');

  const filteredTools = useMemo(() => {
    if (activeTab === 'All') return TOOLS;
    return TOOLS.filter(tool => tool.category === activeTab);
  }, [activeTab]);

  return (
    <PageLayout showBlobs={true}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        {/* Hero Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#e3edff] text-[#0066FF] border border-blue-200/50 text-[11px] font-bold tracking-wider uppercase mb-5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% BROWSER-BASED UTILITIES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            URL Trim’s <span className="text-[#0066FF]">Full Suite of Tools</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-normal">
            Clean URLs, compress images, convert documents, analyze text, and generate sitemaps—fast, free, and private.
          </p>

          {/* Category Tabs Switcher */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-sm max-w-2xl mx-auto mt-8 flex items-center justify-center gap-1 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={cn(
                  "px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer",
                  activeTab === cat
                    ? "bg-[#0066FF] text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Separate Individual Cards Grid (Matching Homepage) */}
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
              {activeTab === 'All' ? 'RECENT AND POPULAR TOOLS' : `${activeTab.toUpperCase()} TOOLS`} ({filteredTools.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link 
                  key={tool.id} 
                  href={tool.href}
                  className={cn(
                    "bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group relative overflow-hidden",
                    tool.status === 'Coming Soon' && "pointer-events-none opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50/80 text-[#0066FF] border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <IconComponent className="w-5.5 h-5.5 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors mb-0.5">{tool.name}</h3>
                      <p className="text-xs text-slate-400 font-normal leading-snug line-clamp-1">{tool.description}</p>
                    </div>
                  </div>
                  <div className="w-7.5 h-7.5 rounded-full bg-blue-50/60 text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0 group-hover:bg-[#0066FF] group-hover:text-white group-hover:border-transparent transition-all ml-2">
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection 
          pageId="tools"
          faqs={TOOLS_FAQS}
        />
      </div>
    </PageLayout>
  );
}
