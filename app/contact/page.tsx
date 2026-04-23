'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, MessageSquare, Send } from 'lucide-react';
import Footer from '@/components/Footer';

export default function ContactPage() {
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
            Contact <span className="text-blue-600">Support.</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <p className="text-xl text-slate-600 leading-relaxed font-medium mb-12">
                Need technical assistance or have a feature request? Our engineering team is standing by to help optimize your workflow.
              </p>

              <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Email Support</h3>
                    <p className="text-blue-600 font-medium">support@urltrimmer.io</p>
                    <p className="text-xs text-slate-400 mt-2 tracking-widest uppercase font-bold">Responds in &lt; 24h</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Community Discussion</h3>
                    <p className="text-blue-600 font-medium tracking-tight">Trimmer Labs Discord</p>
                    <p className="text-xs text-slate-400 mt-2 tracking-widest uppercase font-bold">Active Community</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              {/* Decorative light effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
              
              <h3 className="text-white font-bold mb-8 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" />
                Direct Intel
              </h3>

              <div className="space-y-6">
                <div className="space-y-2 text-white">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Signal Name</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 transition-colors text-sm" placeholder="Your name" />
                </div>
                <div className="space-y-2 text-white">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Email Endpoint</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 transition-colors text-sm" placeholder="you@domain.com" />
                </div>
                <div className="space-y-2 text-white">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Operation Detail</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 transition-colors text-sm min-h-[120px] resize-none" placeholder="Describe your request..." />
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                  Execute Transmission
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
