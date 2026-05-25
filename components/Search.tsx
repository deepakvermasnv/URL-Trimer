'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Zap, ArrowRight, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { TOOLS } from '@/lib/tools';
import { cn } from '@/lib/utils';

import { createPortal } from 'react-dom';

export function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Filter tools based on query
  const results = query.trim() === '' 
    ? TOOLS.filter(t => t.isPopular).slice(0, 5)
    : TOOLS.filter(t => 
        t.name.toLowerCase().includes(query.toLowerCase()) || 
        t.category.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
      );

  const openSearch = () => {
    setIsOpen(true);
    setSelectedIndex(0);
    setQuery('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = (href: string) => {
    if (href === '#') return;
    setIsOpen(false);
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex].href);
      }
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-2 sm:pt-[12vh] px-2 sm:px-4 pointer-events-none">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/40 pointer-events-auto"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[70vh] pointer-events-auto"
          >
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center gap-4 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <SearchIcon className="w-5 h-5 text-blue-600" />
              </div>
              <input 
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="What precision tool do you need?"
                className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 font-bold py-2 text-lg sm:text-xl"
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 sm:p-4 custom-scrollbar bg-slate-50/20">
              {results.length > 0 ? (
                <div className="space-y-1.5 pt-2 pb-4">
                  <div className="px-4 py-2 mb-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      {query.trim() === '' ? 'Recommended Protocol' : `Matches Found (${results.length})`}
                    </h3>
                  </div>
                  {results.map((tool, index) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelect(tool.href)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left relative group",
                        index === selectedIndex ? "bg-white shadow-xl shadow-slate-200/50 ring-1 ring-blue-50" : "hover:bg-slate-50/50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300",
                        index === selectedIndex ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white border border-slate-200 text-slate-400"
                      )}>
                        <tool.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                           <h4 className={cn(
                            "font-black text-sm sm:text-base tracking-tight",
                            index === selectedIndex ? "text-slate-900" : "text-slate-700"
                          )}>
                            {tool.name}
                          </h4>
                        </div>
                        <p className={cn(
                          "text-xs sm:text-sm font-medium transition-colors",
                          index === selectedIndex ? "text-slate-500" : "text-slate-400 line-clamp-1 truncate"
                        )}>
                          {tool.description}
                        </p>
                      </div>
                      <div className={cn(
                        "hidden md:block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                        index === selectedIndex ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
                      )}>
                        {tool.category}
                      </div>
                      <ArrowRight className={cn(
                        "w-5 h-5 transition-all hidden sm:block",
                        index === selectedIndex ? "translate-x-0 opacity-100 text-blue-600" : "-translate-x-2 opacity-0 text-slate-300"
                      )} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-6">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                    <SearchIcon className="w-10 h-10 text-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-900 text-xl font-black tracking-tight">No match detected for &quot;{query}&quot;</p>
                    <p className="text-sm text-slate-400 font-medium max-w-[240px] mx-auto leading-relaxed">
                      Try searching <span className="text-blue-500 font-bold">PDF</span>, <span className="text-blue-500 font-bold">SEO</span>, or <span className="text-blue-500 font-bold">Converter</span>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100 shrink-0 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                  <div className="px-1.5 py-1 rounded border border-slate-200 bg-white shadow-sm text-slate-500 font-mono">↑↓</div> navigate
                </span>
                <span className="flex items-center gap-2">
                  <div className="px-2 py-1 rounded border border-slate-200 bg-white shadow-sm text-slate-500 font-mono">ENTER</div> select
                </span>
              </div>
              <span className="hidden sm:inline">ESC TO DISMISS</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Search Trigger in Navbar-like style or as a standalone button */}
      <button 
        onClick={openSearch}
        className="hidden md:flex items-center gap-3 px-4 py-2 border border-slate-200 bg-slate-50/50 rounded-xl text-slate-400 hover:bg-white hover:border-blue-200 hover:text-blue-500 transition-all group w-[240px]"
      >
        <SearchIcon className="w-4 h-4" />
        <span className="text-sm font-medium flex-1 text-left">Search tools...</span>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-slate-200 bg-white text-[10px] font-bold">
          <Command className="w-2.5 h-2.5" />
          <span>K</span>
        </div>
      </button>

      {/* Mobile Search Button */}
      <button 
        onClick={openSearch}
        className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
      >
        <SearchIcon className="w-5 h-5 text-slate-500" />
      </button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
