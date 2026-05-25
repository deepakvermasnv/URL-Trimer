'use client';

import React, { useState, useEffect } from 'react';

export function HydrationGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!mounted) {
    // Return empty structural space with zero opacity to prevent layout adjustments 
    // and completely avoid seeing unstyled fonts or colors.
    return (
      <div className="opacity-0 min-h-screen" />
    );
  }

  return <>{children}</>;
}
