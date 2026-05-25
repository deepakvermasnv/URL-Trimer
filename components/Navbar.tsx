'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Zap, Puzzle, ChevronDown, User } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/lib/SidebarContext';
import { useAnimationsEnabled } from '@/hooks/useAnimationsEnabled';

import { Search } from '@/components/Search';

export function Navbar() {
  const { toggleSidebar } = useSidebar();
  const animationsEnabled = useAnimationsEnabled();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 z-[150] flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
        
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 overflow-hidden">
            <motion.div
              whileHover={animationsEnabled ? { rotate: [0, -10, 10, 0] } : undefined}
              transition={{ duration: 0.5 }}
            >
              <Zap className="w-5 h-5 fill-current" />
            </motion.div>
          </div>
          <span className="hidden xs:block text-xl font-black text-slate-900 tracking-tighter">URL Trim</span>
        </Link>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link href="/tools" className="hidden sm:flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-xl transition-all group border border-transparent hover:border-slate-100">
          <Puzzle className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-600">Apps & Extensions</span>
        </Link>

        <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden sm:block" />

        <Search />
        
        <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center shadow-sm cursor-pointer hover:border-blue-200 hover:bg-blue-50 transition-all overflow-hidden group">
          <User className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </header>
  );
}
