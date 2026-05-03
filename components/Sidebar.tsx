'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  MoreHorizontal,
  FileText,
  Image as ImageIcon,
  FileImage,
  ChevronLeft,
  Menu
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
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
        <motion.aside 
          initial={false}
          animate={{ width: isCollapsed ? '80px' : '120px' }}
          className={cn(
            "fixed left-0 top-0 h-full bg-[#f8fafc] border-r border-slate-100 flex flex-col items-center py-6 z-[100] hidden md:flex",
            "shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
          )}
        >
          {/* Menu Toggle at Top */}
          <div className="mb-10 px-2">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white hover:shadow-sm text-blue-600 active:scale-95"
            >
              <Menu className="w-7 h-7" />
            </button>
          </div>
  
          <nav className="flex-1 w-full flex flex-col items-center gap-8 px-1">
          {NAV_ITEMS.map((item: any) => {
            const active = item.isActive ? item.isActive(pathname) : false;
            const Icon = item.icon;

            return (
              <Link 
                key={item.label}
                href={item.href}
                className="group flex flex-col items-center w-full px-1"
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative",
                  active 
                    ? "text-blue-600" 
                    : "text-slate-400 hover:text-blue-600"
                )}>
                  <Icon className={cn("w-7 h-7", active ? "stroke-[2.5px]" : "stroke-2")} />
                  {active && (
                    <motion.div 
                      layoutId="activeSideIndicator"
                      className="absolute -right-3 w-[5px] h-8 bg-blue-600 rounded-l-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "text-[12px] font-bold mt-1 transition-colors text-center leading-tight tracking-tight px-1 max-w-full",
                      active ? "text-blue-600" : "text-slate-500 group-hover:text-blue-600"
                    )}
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile / Custom Logo at Bottom */}
        <div className="mt-auto mb-6 px-2">
           <Link href="/" className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm hover:border-blue-400 transition-colors cursor-pointer bg-white block">
              <img 
                src="https://i.postimg.cc/hGDBjM9R/logo.png" 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
           </Link>
        </div>
      </motion.aside>

      {/* Mobile Menu Placeholder (Optional visibility) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button className="bg-white p-2 rounded-lg shadow-md border border-slate-100">
          <Menu className="w-6 h-6 text-blue-600" />
        </button>
      </div>
    </>
  );
}
