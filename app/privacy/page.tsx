'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Lock } from 'lucide-react';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
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
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter">
              Privacy <span className="text-blue-600">Policy.</span>
            </h1>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-12">
            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-widest text-[11px]">Core Security Protocol</h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                URL Trimmer is a client-side application. This means <strong>all URL processing happens exclusively within your browser&apos;s memory.</strong> 
                No data is ever sent to our servers for storage, analysis, or monitoring. Your privacy is protected by physics: the data never leaves your device.
              </p>
            </section>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">1. Data Collection</h3>
                <p className="text-slate-600 leading-relaxed">
                  We do not collect personal information. We do not use cookies for tracking. 
                  Our system does not require account creation, ensuring your anonymity throughout the cleaning process.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">2. Processing Environment</h3>
                <p className="text-slate-600 leading-relaxed">
                  When you paste URLs into the Input Buffer, they stay in your local session. 
                  The JavaScript execution that trims the links is run by your browser&apos;s engine. 
                  Closing the tab or refreshing the page wipes all active data from memory.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">3. External Links</h3>
                <p className="text-slate-600 leading-relaxed">
                  The &quot;Open All&quot; feature triggers browser-level commands to open URLs in new tabs. 
                  These links are subject to the privacy policies of the destination websites. 
                  We encourage you to be cautious when visiting unknown domains.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">4. Analytics</h3>
                <p className="text-slate-600 leading-relaxed">
                  We use minimal, privacy-focused analytics (Google Analytics 4 with IP anonymization) 
                  to understand general usage patterns—like page views and feature interaction—without identifying individual users.
                </p>
              </div>
            </div>

            <div className="pt-12 border-t border-slate-200">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
                Last Updated: April 2026 • Trimmer Labs Security Team
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
