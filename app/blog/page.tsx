'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  featured?: boolean;
}

const FEATURED_POST: BlogPost = {
  title: "The Physics of Zero-Server Link Cleaning: Why Client-Side Processing Is the Future",
  slug: "physics-of-zero-server-link-cleaning",
  excerpt: "Let's be honest. Server-side URL processing exposes user data across transit and remote logs. Client-side processing ships computation directly to your browser for absolute data privacy and zero server latency.",
  date: "April 15, 2026",
  readTime: "6 min read",
  category: "ENGINEERING • PRIVACY",
  image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
  featured: true
};

const GRID_POSTS: BlogPost[] = [
  {
    title: "WHAT TO KNOW BEFORE AUDITING BULK URL LISTS FOR ENTERPRISE SEO",
    slug: "mastering-bulk-url-trimming-seo-best-practices",
    excerpt: "There is usually a lot of noise involved when analyzing raw crawl data. Learn how domain stripping normalizes backlink profiles rapidly.",
    date: "April 08, 2026",
    readTime: "4 min read",
    category: "SEO • WORKFLOW",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "WHY CLIENT-SIDE TOOLS ARE BETTER THAN SERVERS FOR YOUR DATA SECURITY",
    slug: "why-client-side-tools-are-better-for-security",
    excerpt: "Comparing server-side data logs against zero-telemetry local browser processing for maximum enterprise confidentiality.",
    date: "March 30, 2026",
    readTime: "5 min read",
    category: "SECURITY • INFRASTRUCTURE",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "INSIDE THE LINK PROTOCOL: URL TRIMMER V1.4.0 RELEASE NOTES",
    slug: "link-protocol-v1-4-0-release-notes",
    excerpt: "Introducing custom extension modules, high-precision regex engines, and faster client-side processing speeds across all tools.",
    date: "March 22, 2026",
    readTime: "3 min read",
    category: "PRODUCT • RELEASE NOTES",
    image: "https://images.unsplash.com/photo-1542744094-3a31b272c490?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "HOW SITEMAP GENERATION INCREASES THE CRAWL EFFICIENCY OF YOUR WEBSITE",
    slug: "how-sitemap-generation-increases-crawl-efficiency",
    excerpt: "One happy search crawler can discover all your high-value pages. Learn how XML sitemaps optimize indexing budgets.",
    date: "March 15, 2026",
    readTime: "7 min read",
    category: "SEO • CRAWLING",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "5 MISTAKES TO AVOID WHEN PROCESSING LARGE DOMAIN LISTS IN BULK",
    slug: "5-mistakes-to-avoid-when-processing-large-domain-lists",
    excerpt: "Did you know that uncleaned tracking parameters and fragment anchors skew web analytics and backlink reporting?",
    date: "March 05, 2026",
    readTime: "4 min read",
    category: "TIPS • DATA HYGIENE",
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "9 PERKS OF USING BROWSER-BASED FREE TOOLS FOR DAILY DEV WORKFLOWS",
    slug: "9-perks-of-using-browser-based-free-tools",
    excerpt: "Using lightweight browser tools for image conversion, PDF exports, and sitemap generation saves time and protects data privacy.",
    date: "February 24, 2026",
    readTime: "5 min read",
    category: "WORKFLOW • PRODUCTIVITY",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop"
  }
];

export default function BlogPage() {
  return (
    <PageLayout showBlobs={true}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-20 space-y-12">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link 
            href="/tools" 
            className="px-4 py-1.5 rounded-full bg-white dark:bg-[#121723] border border-slate-200/80 dark:border-slate-800/80 text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all uppercase inline-flex items-center gap-1.5 shadow-xs hover:shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
            <span>TOOL LIBRARY</span>
          </Link>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-[#1a2130] border border-blue-200/60 dark:border-slate-700/60 text-[11px] font-bold text-blue-700 dark:text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-slate-300" />
            <span>ARTICLES &amp; GUIDES</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
            Engineering &amp; <span className="text-[#0066FF] dark:text-blue-400">Insights.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
            Deep dives into browser architecture, bulk link processing, data privacy, and SEO data hygiene.
          </p>
        </div>

        {/* Featured Hero Article (Top split card matching user image) */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="group cursor-pointer bg-white dark:bg-[#121723] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg dark:shadow-black/40 hover:shadow-xl transition-all duration-500 overflow-hidden p-4 sm:p-6"
        >
          <Link href={`/blog/${FEATURED_POST.slug}`} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left Image */}
            <div className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={FEATURED_POST.image}
                alt={FEATURED_POST.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>

            {/* Right Details */}
            <div className="lg:col-span-5 flex flex-col justify-between py-2 sm:py-4 px-2 sm:px-4">
              <div>
                <span className="text-[11px] font-bold tracking-[0.18em] text-slate-500 dark:text-slate-400 uppercase block mb-2 sm:mb-3">
                  {FEATURED_POST.category}
                </span>

                <h2 className="text-xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white leading-snug group-hover:text-[#0066FF] dark:group-hover:text-blue-400 transition-colors mb-3 sm:mb-4">
                  {FEATURED_POST.title}
                </h2>

                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-normal line-clamp-3 sm:line-clamp-4 mb-6">
                  {FEATURED_POST.excerpt}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-widest text-[#0066FF] dark:text-blue-400 uppercase group-hover:gap-2.5 transition-all">
                <span>READ MORE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        </motion.article>

        {/* 3-Column Blog Grid (Matching user reference layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 pt-6">
          {GRID_POSTS.map((post, idx) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
              className="group cursor-pointer flex flex-col justify-between"
            >
              <Link href={`/blog/${post.slug}`} className="block h-full flex flex-col justify-between">
                <div>
                  {/* Top Image */}
                  <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4 shadow-xs group-hover:shadow-md transition-all">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>

                  {/* Category */}
                  <span className="text-[11px] font-bold tracking-[0.18em] text-slate-500 dark:text-slate-400 uppercase block mb-2">
                    {post.category}
                  </span>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold font-serif text-slate-900 dark:text-white leading-snug group-hover:text-[#0066FF] dark:group-hover:text-blue-400 transition-colors line-clamp-3 uppercase mb-2">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                </div>

                {/* Read More Link */}
                <div className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-wider text-[#0066FF] dark:text-blue-400 uppercase group-hover:gap-2.5 transition-all mt-auto pt-2">
                  <span>READ MORE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
