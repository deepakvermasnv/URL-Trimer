'use client';

import React from 'react';
import { useSidebar } from '@/lib/SidebarContext';
import { cn } from '@/lib/utils';

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <main 
      className={cn(
        "min-h-screen bg-[#eaf2ff] transition-[padding-left] duration-300 ease-in-out",
        isCollapsed ? "md:pl-0" : "md:pl-[110px]"
      )}
    >
      {children}
    </main>
  );
}
