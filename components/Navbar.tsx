'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { 
  Sun, 
  ChevronDown, 
  ArrowRight, 
  Link2, 
  Wand2, 
  FileText, 
  Image as ImageIcon, 
  Layers3, 
  Scissors, 
  Layers, 
  Fingerprint, 
  Code2, 
  Code, 
  Maximize2, 
  Settings 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToolsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setToolsOpen(false);
    }, 250);
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6" suppressHydrationWarning>
      <header className="max-w-6xl mx-auto h-16 bg-white/95 backdrop-blur-md rounded-full border border-slate-200/80 shadow-xl shadow-slate-200/60 px-6 sm:px-8 flex items-center justify-between transition-all" suppressHydrationWarning>
        {/* Brand Logo */}
        <BrandLogo />

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 sm:gap-9 text-sm sm:text-[15px] font-bold text-slate-700">
          <div 
            className="relative py-2" 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="flex items-center gap-1.5 py-1 hover:text-[#0066FF] transition-colors cursor-pointer text-sm sm:text-[15px] font-bold text-slate-700"
            >
              <span>Tools</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${toolsOpen ? 'rotate-180 text-[#0066FF]' : ''}`} />
            </button>

            {/* Dropdown Menu with Hover Bridge */}
            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 pt-2 z-50"
                >
                  <div className="w-68 bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-3 max-h-[420px] overflow-y-auto custom-scrollbar">
                    <div className="text-[11px] font-black text-slate-400 uppercase px-3 py-1.5 tracking-widest mb-1">ALL TOOLS</div>
                    
                    {/* Tool 1 */}
                    <Link 
                      href="/#trimmer-app" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef5ff] text-slate-800 hover:text-[#0066FF] transition-all"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#eef5ff] text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0">
                        <Scissors className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold">URL Trimmer</span>
                    </Link>

                    {/* Tool 2 */}
                    <Link 
                      href="/tools/word-counter" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef5ff] text-slate-800 hover:text-[#0066FF] transition-all"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#eef5ff] text-[#0066FF] border border-blue-100/60 flex items-center justify-center font-bold text-xs shrink-0">T</div>
                      <span className="text-sm font-bold">Word Counter</span>
                    </Link>

                    {/* Tool 3 */}
                    <Link 
                      href="/tools/ai-image" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef5ff] text-slate-800 hover:text-[#0066FF] transition-all"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#eef5ff] text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0">
                        <Wand2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold">AI Text-to-Image</span>
                    </Link>

                    {/* Tool 4 */}
                    <Link 
                      href="/tools/pdf-converter" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef5ff] text-slate-800 hover:text-[#0066FF] transition-all"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#eef5ff] text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold">PDF Converter</span>
                    </Link>

                    {/* Tool 5 */}
                    <Link 
                      href="/tools/image-compressor" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef5ff] text-slate-800 hover:text-[#0066FF] transition-all"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#eef5ff] text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0">
                        <Maximize2 className="w-4 h-4 rotate-45" />
                      </div>
                      <span className="text-sm font-bold">Image Compressor</span>
                    </Link>

                    {/* Tool 6 */}
                    <Link 
                      href="/tools/image-converter" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef5ff] text-slate-800 hover:text-[#0066FF] transition-all"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#eef5ff] text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0">
                        <Layers3 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold">Image Converter</span>
                    </Link>

                    {/* Tool 7 */}
                    <Link 
                      href="/#trimmer-app" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef5ff] text-slate-800 hover:text-[#0066FF] transition-all"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#eef5ff] text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0">
                        <Code className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold">Text to HTML</span>
                    </Link>

                    {/* Tool 8 */}
                    <Link 
                      href="/tools/chrome-extension" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef5ff] text-slate-800 hover:text-[#0066FF] transition-all"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#eef5ff] text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0">
                        <Settings className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold">Chrome Extension</span>
                    </Link>

                    {/* Tool 9 */}
                    <Link 
                      href="/tools/sitemap-generator" 
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef5ff] text-slate-800 hover:text-[#0066FF] transition-all"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#eef5ff] text-[#0066FF] border border-blue-100/60 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold">Sitemap Generator</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a href="#how-it-works" className="hover:text-[#0066FF] transition-colors py-1">
            How it works
          </a>
          <a href="#homepage-faqs" className="hover:text-[#0066FF] transition-colors py-1">
            FAQ
          </a>
          <Link href="/blog" className="hover:text-[#0066FF] transition-colors py-1">
            Blog
          </Link>
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full bg-blue-50 text-[#0066FF] flex items-center justify-center hover:bg-blue-100 transition-colors border border-blue-100/80 cursor-pointer shadow-sm"
          >
            <Sun className="w-4 h-4" />
          </button>

          <Link
            href="/tools"
            className="bg-[#0066FF] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full flex items-center gap-2 shadow-md shadow-blue-500/25 hover:shadow-lg transition-all cursor-pointer"
          >
            <span>View More Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>
    </div>
  );
}


