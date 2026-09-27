'use client';

import React, { useState, useEffect } from 'react';

export function HydrationGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="opacity-0 min-h-screen" suppressHydrationWarning />
    );
  }

  return <div suppressHydrationWarning>{children}</div>;
}
