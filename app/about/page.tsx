'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Target, Shield, Zap } from 'lucide-react';
import Footer from '@/components/Footer';

export default function AboutPage() {
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
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter mb-8">
            About <span className="text-blue-600">Protocol.</span>
          </h1>

          <div className="prose prose-slate prose-lg max-w-none">
            <p className="text-xl text-slate-600 leading-relaxed font-medium mb-12">
              URL Trimmer was engineered to solve a specific problem: the noise of modern links. 
              Between tracking parameters, nested paths, and redundant query strings, the web has become cluttered with information that obscures its source.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                { icon: Target, title: "Precision", desc: "Surgical removal of tracking identifiers while maintaining link integrity." },
                { icon: Shield, title: "Privacy", desc: "No data ever leaves your browser. All cleaning happens locally." },
                { icon: Zap, title: "Velocity", desc: "Optimized for bulk processing of thousands of links simultaneously." }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Mission</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              We believe in a cleaner web. URL Trimmer isn&apos;t just a tool; it&apos;s a protocol for digital hygiene. 
              Whether you&apos;re an SEO professional, a developer, or a privacy-conscious user, our mission is to provide the 
              fastest, most secure way to purify your digital footprints.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">The Technology</h2>
            <p className="text-slate-600 mb-12 leading-relaxed">
              Built on modern web technologies and optimized for zero-server interaction. 
              Our engine uses optimized chunking to process URL lists without blocking your browser&apos;s main thread, 
              ensuring 60FPS performance even with 10k+ links.
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
