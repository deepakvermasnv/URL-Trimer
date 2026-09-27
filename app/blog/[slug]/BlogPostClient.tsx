'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Calendar, User, ArrowRight } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

export default function BlogPostClient({ post, slug }: { post: any, slug: string }) {
  if (!post) {
    return (
      <PageLayout showBlobs={true}>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold font-serif text-slate-900 mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-[#0066FF] font-bold hover:underline">Back to Engineering Blog</Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showBlobs={true}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-20 space-y-10">
        {/* Navigation Link */}
        <div>
          <Link 
            href="/blog" 
            className="px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-[11px] font-bold tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all uppercase inline-flex items-center gap-1.5 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>BACK TO BLOG</span>
          </Link>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header section */}
          <header className="space-y-4">
            <span className="text-[11px] font-bold tracking-[0.18em] text-slate-500 uppercase block">
              {post.category}
            </span>

            <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900 tracking-tight leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-slate-500 border-t border-b border-slate-200/60 py-3">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {post.date}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {post.readTime}</span>
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> {post.author}</span>
            </div>
          </header>

          {/* Featured Image */}
          {post.image && (
            <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-slate-100 shadow-md">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Body Content */}
          <div className="bg-white p-6 sm:p-12 rounded-3xl border border-slate-200/80 shadow-md">
            {post.content}
          </div>

          {/* Bottom CTA Card */}
          <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold font-serif mb-2">Try URL Trimmer Free</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed font-normal">
                Experience instant client-side link cleaning, domain stripping, and sitemap generation directly in your browser.
              </p>
            </div>
            <Link 
              href="/"
              className="px-6 py-3 bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all whitespace-nowrap shadow-md shadow-blue-600/30 flex items-center gap-2"
            >
              <span>OPEN TERMINAL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.article>
      </div>
    </PageLayout>
  );
}
