'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Footer from '@/components/Footer';

export default function DisclaimerPage() {
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
              Legal <span className="text-blue-600">Disclaimer.</span>
            </h1>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-12">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm leading-relaxed text-slate-600 space-y-8">
              <p className="font-bold text-slate-900 uppercase tracking-widest text-xs opacity-50 mb-10">Critical Notice</p>
              
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 underline decoration-blue-500 decoration-4 underline-offset-4">1. No Warranty of Result</h3>
                <p>
                  URL Trimmer is provided &quot;as is&quot; and &quot;as available&quot;. While our engine uses advanced regex patterns 
                  and logic to purify links, we cannot guarantee 100% accuracy for every possible URL structure 
                  discovered on the internet. Dynamic redirection and nested obfuscation may occasionally 
                  yield unexpected results.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 underline decoration-blue-500 decoration-4 underline-offset-4">2. Liability Limitation</h3>
                <p>
                  Trimmer Labs, its developers, and affiliates shall not be held liable for any direct, indirect, 
                  incidental, or consequential damages resulting from the use or inability to use this service, 
                  including but not limited to loss of data, marketing attribution errors, or link redirection failures.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 underline decoration-blue-500 decoration-4 underline-offset-4">3. External Content Responsibility</h3>
                <p>
                  The links processed through our platform are created by third parties. Trimmer Labs does not 
                  vouch for, monitor, or endorse the content, security, or privacy practices of the websites 
                  referenced in your URL lists.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 underline decoration-blue-500 decoration-4 underline-offset-4">4. No Professional Advice</h3>
                <p>
                  The information provided through this website and blog is for general informational purposes only. It is not intended as legal, financial, or professional SEO advice. You should seek independent professional advice before making any critical business decisions based on the output of this tool.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 underline decoration-blue-500 decoration-4 underline-offset-4">5. Educational Tool</h3>
                <p>
                  This platform is designed as an educational and workflow-optimization tool. Users should 
                  manually verify critical lists before utilizing them in large-scale production environments.
                </p>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
