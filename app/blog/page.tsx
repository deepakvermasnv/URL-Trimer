'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Clock, ChevronRight } from 'lucide-react';
import Footer from '@/components/Footer';

export default function BlogPage() {
  const posts = [
    {
      title: "The Physics of Zero-Server Link Cleaning",
      excerpt: "Explaining why client-side processing is the gold standard for modern data privacy and speed.",
      date: "April 15, 2026",
      readTime: "6 min read",
      category: "Engineering"
    },
    {
      title: "Mastering Bulk URL Trimming: SEO Best Practices",
      excerpt: "How to use domain stripping to audit backlink profiles and verify site architectures efficiently.",
      date: "April 08, 2026",
      readTime: "4 min read",
      category: "Workflow"
    },
    {
      title: "Inside the Link Protocol: v1.4.0 Release Notes",
      excerpt: "Introducing custom extension modules and the new high-precision regex engine.",
      date: "March 22, 2026",
      readTime: "3 min read",
      category: "Product"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-4xl mx-auto px-6 py-12 sm:py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" />
          Back to Terminal
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-16">
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter">
              Engineering <span className="text-blue-600">Blog.</span>
            </h1>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-12">
            {posts.map((post, i) => (
              <motion.article 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:shadow-blue-900/5 group-hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-[0.2em]">{post.category}</span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium tracking-tight">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{post.title}</h2>
                  <p className="text-slate-500 font-medium leading-relaxed mb-8">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:gap-4 transition-all">
                    Read Report
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
