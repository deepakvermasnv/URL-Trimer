'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, FileText } from 'lucide-react';
import Footer from '@/components/Footer';

export default function TermsPage() {
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
              Terms of <span className="text-blue-600">Service.</span>
            </h1>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-12">
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              By accessing and utilizing URL Trimmer, you acknowledge and agree to the following operational parameters. 
              These terms are established to ensure the integrity of our link-cleaning protocol.
            </p>

            <div className="space-y-12">
              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-4">1. Acceptable Usage</h3>
                <p className="text-slate-600 leading-relaxed">
                  URL Trimmer is provided for legitimate digital cleaning operations. Users are strictly forbidden from 
                  using this platform for phishing, distribution of malware, or any activities that violate international 
                  cyber-security laws. Our engine is designed for link hygiene, not link obfuscation for malicious purposes.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-4">2. Software License</h3>
                <p className="text-slate-600 leading-relaxed">
                  We grant you a non-exclusive, non-transferable license to use this web application for personal or 
                  commercial link-management tasks. All source code and visual assets remain the exclusive property 
                  of Trimmer Labs.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-4">3. Local Execution Reliability</h3>
                <p className="text-slate-600 leading-relaxed">
                  Since processing is contingent upon your local browser engine and device resources, Trimmer Labs 
                  is not responsible for data loss due to browser crashes, physical memory limitations, or network 
                  instability during bulk operations.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-4">4. Modifications to Protocol</h3>
                <p className="text-slate-600 leading-relaxed">
                  Trimmer Labs reserves the right to update the trimming logic, extension patterns, and UI modules 
                  at any time without prior notification. Continuous iteration is part of our precision commitment.
                </p>
              </section>
            </div>

            <div className="pt-12 border-t border-slate-200">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
                System Release: v1.4.0 • April 2026
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
