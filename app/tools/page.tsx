'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Type, 
  Scissors, 
  Hash, 
  Binary, 
  LayoutGrid,
  Zap,
  Shield,
  Search,
  Minimize2
} from 'lucide-react';
import Footer from '@/components/Footer';

const TOOLS = [
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Professional tool to count words, characters, and sentences from any text with real-time analysis.',
    icon: Type,
    category: 'Content',
    href: '/tools/word-counter',
    status: 'Ready'
  },
  {
    id: 'url-trimmer',
    name: 'URL Trimmer',
    description: 'Bulk clean your URL lists by stripping paths, queries, and tracking fragments instantly.',
    icon: Scissors,
    category: 'SEO',
    href: '/',
    status: 'Active'
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Reduce image file size with surgical precision while maintaining visual quality. 100% browser-based.',
    icon: Minimize2,
    category: 'Graphics',
    href: '/tools/image-compressor',
    status: 'Ready'
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert images between formats (PNG, JPG, WebP, BMP) instantly with zero server uploads.',
    icon: LayoutGrid,
    category: 'Graphics',
    href: '/tools/image-converter',
    status: 'Ready'
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text between UPPERCASE, lowercase, sentence case, and camelCase seamlessly.',
    icon: Binary,
    category: 'Content',
    href: '#',
    status: 'Coming Soon'
  },
  {
    id: 'json-validator',
    name: 'JSON Validator',
    description: 'Verify, format, and beautify your JSON data with instant syntax highlighting.',
    icon: LayoutGrid,
    category: 'Developer',
    href: '#',
    status: 'Coming Soon'
  }
];

export default function ToolsLibrary() {
  return (
    <div className="min-h-screen blue-gradient-bg selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden">
      {/* Decorative blobs - Optimized */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-blue-400/5 rounded-full blur-[60px]" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-indigo-400/5 rounded-full blur-[60px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24 relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Terminal
        </Link>

        <header className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
              <Zap className="w-3 h-3" />
              Toolbox Protocol
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter">
              Utility <span className="text-blue-600">Library.</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl font-medium leading-relaxed">
              A curated collection of professional-grade web tools, built for performance and absolute privacy. No data ever leaves your device.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <Link 
                href={tool.status === 'Coming Soon' ? '#' : tool.href}
                className={`block h-full bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white p-10 shadow-xl shadow-blue-900/5 transition-all duration-500 ${
                  tool.status === 'Coming Soon' 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1'
                }`}
              >
                <div className="flex items-start justify-between mb-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                    tool.status === 'Coming Soon' ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <tool.icon className="w-7 h-7" />
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    tool.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                    tool.status === 'Ready' ? 'bg-blue-50 text-blue-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {tool.status}
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {tool.name}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Category: {tool.category}
                  </span>
                  {tool.status !== 'Coming Soon' && (
                    <div className="flex items-center gap-2 text-xs font-black text-slate-900 group-hover:gap-4 transition-all uppercase tracking-widest">
                      Launch Tool
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Security Banner */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-10 rounded-[3rem] bg-slate-900 text-white flex flex-col sm:flex-row items-center gap-8 shadow-2xl shadow-blue-900/40 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]" />
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Privacy-First Architecture</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              All tools in our library operate exclusively on your device. We do not use servers to process your inputs. Your data stays in the browser and disappears when you close the tab.
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
