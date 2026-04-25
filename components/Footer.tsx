'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Link2 } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform duration-300">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">URL Trimmer</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed mb-8">
              Professional-grade link cleaning protocol. Strip paths, queries, and tracking fragments with surgical precision. All processing happens 100% locally in your session.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Resources</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/blog" className="hover:text-blue-400 transition-colors">Blog</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors">About</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-blue-400 transition-colors">Disclaimer</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-medium tracking-wider">
            &copy; {currentYear} URL TRIMMER LABS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">System Operational</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
