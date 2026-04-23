'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Calendar, User, Tag } from 'lucide-react';
import Footer from '@/components/Footer';

const BLOG_POSTS = {
  'physics-of-zero-server-link-cleaning': {
    title: "The Physics of Zero-Server Link Cleaning: Why Client-Side Processing Is the Future",
    date: "April 15, 2026",
    readTime: "6 min read",
    category: "Engineering",
    author: "Trimmer Engineering Team",
    content: (
      <div className="prose prose-slate prose-lg max-w-none">
        <h3>The Problem With Server-Side URL Processing</h3>
        <p>When you upload a list of URLs to a traditional web application, your data travels across the internet, lands on a remote server, gets processed by code you don&apos;t control, and then the results are sent back to you. At every step, your data is exposed.</p>
        
        <h3>Enter Client-Side Processing: The Zero-Server Architecture</h3>
        <p>Client-side processing flips this model entirely. URL Trimmer is built on this architecture. When you paste 10,000 URLs, none of those URLs ever leave your browser tab. The JavaScript engine running locally on your CPU does all the work.</p>
        
        <h3>The Technical Implementation: How It Actually Works</h3>
        <p>Processing large URL lists synchronously in JavaScript would freeze your browser. URL Trimmer solves this using <strong>optimized chunking</strong>. The list is divided into chunks, processed in micro-tasks using <code>requestAnimationFrame</code>, maintaining 60FPS performance.</p>
        
        <h3>Privacy Protected by Physics, Not Just Policy</h3>
        <p>With URL Trimmer&apos;s architecture, the physics of the system make server-side data collection impossible. Your URLs are processed by your CPU, stored in your RAM, and never transmitted. When you close the tab, the RAM is reclaimed, and the data is gone.</p>
      </div>
    )
  },
  'mastering-bulk-url-trimming-seo-best-practices': {
    title: "Mastering Bulk URL Trimming: SEO Best Practices for Domain-Level Analysis",
    date: "April 08, 2026",
    readTime: "4 min read",
    category: "Workflow",
    author: "SEO Strategy Dept",
    content: (
      <div className="prose prose-slate prose-lg max-w-none">
        <h3>Why Domain Stripping Is Essential for SEO Audits</h3>
        <p>Every serious SEO audit involves working with large volumes of URLs. Domain stripping transforms messy data like tracking parameters and query fragments into clean, analyzable forms.</p>
        
        <h3>Use Case 1: Backlink Profile Auditing</h3>
        <p>To understand the true diversity of your link profile, you need to know how many unique domains are linking to you. URL Trimmer extracts clean domains in seconds.</p>
        
        <h3>Use Case 2: Competitor Link Gap Analysis</h3>
        <p>Identify domains that link to your competitors but not to you. URL Trimmer lets you quickly clean up exported competitor backlink lists for running comparisons.</p>
        
        <h3>Use Case 3: Redirect Chain Cleaning</h3>
        <p>When migrating a website, you typically work with large redirect mapping spreadsheets. URL Trimmer handles this normalization in bulk, saving hours of manual cleanup work.</p>
      </div>
    )
  },
  'link-protocol-v1-4-0-release-notes': {
    title: "Inside the Link Protocol: URL Trimmer v1.4.0 — What's New & Why It Matters",
    date: "March 22, 2026",
    readTime: "3 min read",
    category: "Product",
    author: "Product Management",
    content: (
      <div className="prose prose-slate prose-lg max-w-none">
        <h3>Overview: What Changed in v1.4.0</h3>
        <p>Version 1.4.0 introduces <strong>Custom Extension Modules</strong> for precise TLD targeting and a completely rewritten regex engine for higher accuracy.</p>
        
        <h3>New Feature: Custom Extension Modules</h3>
        <p>URL Trimmer now allows users to specify any combination of TLDs, country-code domains, or nGTLDs as filtering targets. Practical for isolating .edu, .gov, or niche TLDs like .ai.</p>
        
        <h3>Engine Upgrade: High-Precision Regex Engine</h3>
        <p>Replacing the string-splitting approach with a purpose-built regex engine. The new engine handles authentication credentials, IPv4/v6 addresses, non-standard ports, and punycode encoding.</p>
        
        <h3>Performance Improvements</h3>
        <p>The v1.4.0 engine is approximately 35% faster due to optimized chunk sizing based on the URL list length and structure.</p>
      </div>
    )
  }
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = BLOG_POSTS[slug as keyof typeof BLOG_POSTS];

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
        <div className="text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-blue-600 font-bold hover:underline">Back to Engineering Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-4xl mx-auto px-6 py-12 sm:py-24">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-[0.2em]">{post.category}</span>
              <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {post.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {post.readTime}</span>
                <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {post.author}</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter mb-8 leading-tight">
              {post.title}
            </h1>
          </header>

          <div className="bg-white p-8 sm:p-14 rounded-[3rem] border border-slate-100 shadow-sm mb-16">
            {post.content}
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-900/40">
            <h3 className="text-xl font-bold mb-4">Master Your Data Protocol</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-8 font-medium">
              Want to see these principles in action? Try our high-precision bulk URL cleaner today. 
              Zero servers, absolute privacy, near-instant velocity.
            </p>
            <Link 
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl text-xs uppercase tracking-widest transition-colors"
            >
              Launch Terminal
            </Link>
          </div>
        </motion.article>
      </div>
      <Footer />
    </div>
  );
}
