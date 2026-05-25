'use client';

import React from 'react';
import { useSidebar } from '@/lib/SidebarContext';
import { cn } from '@/lib/utils';

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <main 
      className={cn(
        "pt-16 min-h-screen transition-[padding-left] duration-300 ease-in-out",
        isCollapsed ? "md:pl-0" : "md:pl-[110px]"
      )}
    >
      {children}
    </main>
  );
}
