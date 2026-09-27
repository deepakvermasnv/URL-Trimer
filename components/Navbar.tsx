'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { useTheme } from 'next-themes';
import { 
  Sun, 
  Moon,
  ChevronDown, 
  ArrowRight, 
  Wand2, 
  FileText, 
  Layers3, 
  Scissors, 
  Maximize2, 
  Settings,
  Code,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const ALL_TOOLS = [
    { title: 'URL Trimmer', href: '/#trimmer-app', icon: <Scissors className="w-4 h-4" /> },
    { title: 'Word Counter', href: '/tools/word-counter', icon: <span className="font-bold text-xs">T</span> },
    { title: 'AI Text-to-Image', href: '/tools/ai-image', icon: <Wand2 className="w-4 h-4" /> },
    { title: 'PDF Converter', href: '/tools/pdf-converter', icon: <FileText className="w-4 h-4" /> },
    { title: 'Image Compressor', href: '/tools/image-compressor', icon: <Maximize2 className="w-4 h-4 rotate-45" /> },
    { title: 'Image Converter', href: '/tools/image-converter', icon: <Layers3 className="w-4 h-4" /> },
    { title: 'Text to HTML', href: '/#trimmer-app', icon: <Code className="w-4 h-4" /> },
    { title: 'Chrome Extension', href: '/tools/chrome-extension', icon: <Settings className="w-4 h-4" /> },
    { title: 'Sitemap Generator', href: '/tools/sitemap-generator', icon: <FileText className="w-4 h-4" /> },
  ];

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6" suppressHydrationWarning>
      <header className="max-w-6xl mx-auto h-14 sm:h-16 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-full border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/50 px-4 sm:px-8 flex items-center justify-between transition-all" suppressHydrationWarning>
        {/* Brand Logo */}
        <BrandLogo size="md" />

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 sm:gap-9 text-sm sm:text-[15px] font-bold text-slate-700 dark:text-slate-200">
          <div 
            className="relative py-2" 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="flex items-center gap-1.5 py-1 hover:text-[#0066FF] dark:hover:text-blue-400 transition-colors cursor-pointer text-sm sm:text-[15px] font-bold text-slate-700 dark:text-slate-200"
            >
              <span>Tools</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${toolsOpen ? 'rotate-180 text-[#0066FF] dark:text-blue-400' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 pt-2 z-50"
                >
                  <div className="w-68 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-3 max-h-[420px] overflow-y-auto custom-scrollbar">
                    <div className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase px-3 py-1.5 tracking-widest mb-1">ALL TOOLS</div>
                    {ALL_TOOLS.map((t, idx) => (
                      <Link 
                        key={idx}
                        href={t.href} 
                        onClick={() => setToolsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef5ff] dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 hover:text-[#0066FF] dark:hover:text-blue-400 transition-all"
                      >
                        <div className="w-8.5 h-8.5 rounded-xl bg-[#eef5ff] dark:bg-[#1a2130] text-[#0066FF] dark:text-slate-200 border border-blue-100/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
                          {t.icon}
                        </div>
                        <span className="text-sm font-bold">{t.title}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a href="#how-it-works" className="hover:text-[#0066FF] dark:hover:text-blue-400 transition-colors py-1">
            How it works
          </a>
          <a href="#homepage-faqs" className="hover:text-[#0066FF] dark:hover:text-blue-400 transition-colors py-1">
            FAQ
          </a>
          <Link href="/blog" className="hover:text-[#0066FF] dark:hover:text-blue-400 transition-colors py-1">
            Blog
          </Link>
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-50 dark:bg-slate-800 text-[#0066FF] dark:text-amber-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors border border-blue-100/80 dark:border-slate-700 cursor-pointer shadow-xs"
          >
            {isDark ? (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400/20" />
            ) : (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          <Link
            href="/tools"
            className="bg-[#0066FF] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full flex items-center gap-1.5 sm:gap-2 shadow-md shadow-blue-500/25 hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            <span className="hidden sm:inline">View More Tools</span>
            <span className="inline sm:hidden">Tools</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="md:hidden w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto custom-scrollbar"
          >
            <div className="p-4 space-y-4">
              <div className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">NAVIGATION</div>
              
              <div className="grid grid-cols-2 gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <a 
                  href="#how-it-works" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#0066FF] dark:hover:text-blue-400 transition-all"
                >
                  How it works
                </a>
                <a 
                  href="#homepage-faqs" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#0066FF] dark:hover:text-blue-400 transition-all"
                >
                  FAQ
                </a>
                <Link 
                  href="/blog" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#0066FF] dark:hover:text-blue-400 transition-all"
                >
                  Blog
                </Link>
                <Link 
                  href="/tools" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-[#0066FF] text-white rounded-xl hover:bg-blue-700 transition-all text-center"
                >
                  All Tools
                </Link>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-2">QUICK TOOLS</div>
                <div className="grid grid-cols-1 gap-1.5">
                  {ALL_TOOLS.map((t, idx) => (
                    <Link
                      key={idx}
                      href={t.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-[#0066FF] dark:hover:text-blue-400 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-blue-400 flex items-center justify-center shrink-0">
                        {t.icon}
                      </div>
                      <span className="text-xs font-bold">{t.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
