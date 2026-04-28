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
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import NavAction from '@/components/NavAction';
import Badge from '@/components/Badge';
import ToolCard from '@/components/ToolCard';

const TOOLS = [
// ... (rest of the file remains same, I will just apply the layout changes)
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
    <PageLayout showBlobs={true}>
      <NavAction 
        href="/" 
        label="Back to Terminal" 
        type="back" 
        centeredOnMobile={true}
        className="md:justify-start"
      />

      <Hero 
        badgeText="Toolbox Protocol"
        badgeIcon={Zap}
        title={<>Utility <span className="text-blue-600">Library.</span></>}
        subtitle="A curated collection of professional-grade web tools, built for performance and absolute privacy. No data ever leaves your device."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {TOOLS.map((tool, i) => (
          <ToolCard key={tool.id} tool={tool} index={i} />
        ))}
      </div>

      {/* Security Banner */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-20 p-10 rounded-[3rem] bg-slate-900 text-white flex flex-col sm:flex-row items-center gap-8 shadow-2xl shadow-blue-900/40 relative overflow-hidden"
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
    </PageLayout>
  );
}
