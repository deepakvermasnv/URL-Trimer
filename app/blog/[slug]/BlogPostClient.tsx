'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Calendar, User, Tag } from 'lucide-react';
import Footer from '@/components/Footer';

export default function BlogPostClient({ post, slug }: { post: any, slug: string }) {
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
