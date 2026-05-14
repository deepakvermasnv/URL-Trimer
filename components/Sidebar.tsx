'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { 
  LayoutGrid, 
  MoreHorizontal,
  FileText,
  Image as ImageIcon,
  FileImage,
  ChevronLeft,
  Menu,
  FileDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  {
    label: 'All Tools',
    icon: LayoutGrid,
    href: '/tools',
    isActive: (path: string) => path === '/tools'
  },
  {
    label: 'Word Count',
    icon: FileText,
    href: '/tools/word-counter',
    isActive: (path: string) => path === '/tools/word-counter'
  },
  {
    label: 'Image Compressor',
    icon: ImageIcon,
    href: '/tools/image-compressor',
    isActive: (path: string) => path === '/tools/image-compressor'
  },
  {
    label: 'Image Converter',
    icon: FileImage,
    href: '/tools/image-converter',
    isActive: (path: string) => path === '/tools/image-converter'
  },
  {
    label: 'PDF Converter',
    icon: FileDown,
    href: '/tools/pdf-converter',
    isActive: (path: string) => path === '/tools/pdf-converter'
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
        <motion.aside 
          initial={false}
          animate={{ width: isCollapsed ? '80px' : '110px' }}
          transition={{ type: "spring", stiffness: 300, damping: 35, mass: 0.8 }}
          className={cn(
            "fixed left-0 top-0 h-screen bg-white/70 backdrop-blur-xl border-r border-slate-100 flex flex-col items-center py-6 z-[100] hidden md:flex overflow-y-auto custom-scrollbar-hide hover:custom-scrollbar",
            "shadow-[10px_0_30px_rgba(0,0,0,0.02)] will-change-[width] scrollbar-thin scrollbar-thumb-blue-100"
          )}
          style={{ perspective: "1000px" }}
        >
          {/* Menu Toggle at Top */}
          <div className="mb-10 px-2 shrink-0" style={{ transformStyle: "preserve-3d" }}>
            <motion.button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              whileHover={{ 
                scale: 1.1, 
                rotateZ: isCollapsed ? 90 : -90,
                rotateY: 15,
                z: 10
              }}
              whileTap={{ scale: 0.9, rotateZ: 0 }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white shadow-sm text-blue-600 border border-slate-100"
            >
              <Menu className="w-7 h-7" />
            </motion.button>
          </div>
  
          <nav className="flex-1 w-full flex flex-col items-center gap-8 px-1" style={{ transformStyle: "preserve-3d" }}>
          {NAV_ITEMS.map((item: any) => {
            const active = item.isActive ? item.isActive(pathname) : false;
            const Icon = item.icon;

            return (
              <Link 
                key={item.label}
                href={item.href}
                className="group flex flex-col items-center w-full px-1"
              >
                <motion.div 
                  whileHover={{ 
                    scale: 1.15,
                    rotateY: 20,
                    rotateX: -10,
                    z: 20,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative",
                    active 
                      ? "text-blue-600 bg-white shadow-lg shadow-blue-900/5 border border-blue-50" 
                      : "text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md"
                  )}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Icon className={cn("w-7 h-7", active ? "stroke-[2.5px]" : "stroke-2")} />
                  {active && (
                    <motion.div 
                      layoutId="activeSideIndicator"
                      className="absolute -right-3 w-[6px] h-8 bg-blue-600 rounded-l-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "text-[10px] uppercase font-black mt-2 transition-colors text-center leading-tight tracking-[0.05em] px-1 max-w-full",
                      active ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"
                    )}
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile / Custom Logo Section Removed at user request */}
      </motion.aside>

      {/* Mobile Menu Placeholder (Optional visibility) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          aria-label="Open mobile menu"
          className="bg-white p-2 rounded-lg shadow-md border border-slate-100"
        >
          <Menu className="w-6 h-6 text-blue-600" />
        </button>
      </div>
    </>
  );
}
