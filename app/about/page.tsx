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

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Why We Built URL Trimmer</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              URL Trimmer was built by a small team of developers and SEO professionals who were tired of the same frustrating workflow: exporting backlink data, opening Excel, writing complex formulas, and spending an hour cleaning what should take seconds. We searched for existing tools and found two categories: server-side tools that required us to upload sensitive client data to unknown servers, or Python scripts that required technical setup every time.
            </p>
            <p className="text-slate-600 mb-8 leading-relaxed">
              We wanted something different — a tool as fast as a script but as accessible as a website, and as private as running code locally. That&apos;s URL Trimmer: professional-grade URL cleaning that runs entirely in your browser.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Core Principles</h2>
            <ul className="space-y-4 mb-12">
              <li className="text-slate-600 leading-relaxed font-medium"><strong>Privacy by Architecture:</strong> We don&apos;t just promise not to log your data — our system makes server-side data collection technically impossible.</li>
              <li className="text-slate-600 leading-relaxed font-medium"><strong>Performance Without Compromise:</strong> 10,000+ URLs processed in under a second, with a UI that stays responsive throughout.</li>
              <li className="text-slate-600 leading-relaxed font-medium"><strong>Zero Friction:</strong> No accounts, no uploads, no waiting. Open the tool and start cleaning.</li>
              <li className="text-slate-600 leading-relaxed font-medium"><strong>Open Roadmap:</strong> We build features based on what our users actually need, shared transparently through our blog.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Who We Are</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              URL Trimmer is developed by <strong>Trimmer Labs</strong>, a small independent software studio focused on building privacy-first, client-side web utilities. Our team has backgrounds in software engineering, search engine optimization, and data analysis — which means we build tools we actually use in our own professional work.
            </p>
            <p className="text-slate-600 mb-12 leading-relaxed">
              We started with URL Trimmer because it solved a problem we faced daily. If you&apos;re using it too, we&apos;d love to hear how you&apos;re using it and what features would make your workflow even better.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Is it really free?</h4>
                <p className="text-sm text-slate-500 font-medium">Yes, completely free with no limits on usage or bulk size.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Any future charges?</h4>
                <p className="text-sm text-slate-500 font-medium">We may introduce a Pro tier with advanced features, but the core tool stays free.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Commercial use?</h4>
                <p className="text-sm text-slate-500 font-medium">Absolutely — many SEO agencies and marketing teams use it daily for client work.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Data safety?</h4>
                <p className="text-sm text-slate-500 font-medium">Since all processing is local, your data never touches any internet infrastructure.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
