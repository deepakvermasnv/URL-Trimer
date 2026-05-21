'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  FileText,
  Image as ImageIcon,
  FileImage,
  FileDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/lib/SidebarContext';

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
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[140] md:hidden"
            />
          )}
        </AnimatePresence>

        <motion.aside 
          initial={false}
          animate={{ 
            x: isCollapsed ? '-101%' : '0%',
            opacity: isCollapsed ? 0 : 1
          }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className={cn(
            "fixed left-0 top-16 bottom-0 w-[100px] sm:w-[110px] bg-white/90 backdrop-blur-3xl border-r border-slate-200/40 flex flex-col items-center py-8 z-[145] overflow-y-auto scrollbar-none md:flex",
            "shadow-[1px_0_20px_rgba(0,0,0,0.02)] md:shadow-none will-change-transform"
          )}
          style={{ 
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <nav className="w-full flex-shrink-0 flex flex-col items-center gap-7 px-1 pb-24" style={{ transformStyle: "preserve-3d" }}>
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
      </motion.aside>
    </>
  );
}
