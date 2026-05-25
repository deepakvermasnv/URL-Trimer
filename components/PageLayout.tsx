'use client';

import React from 'react';
import Footer from './Footer';
import { motion } from 'motion/react';
import { useAnimationsEnabled } from '@/hooks/useAnimationsEnabled';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  showBlobs?: boolean;
}

export default function PageLayout({ children, className, showBlobs = false }: PageLayoutProps) {
  return (
    <div className={`min-h-screen blue-gradient-bg selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden ${className}`}>
      
      <div className="max-w-6xl mx-auto px-6 py-12 sm:py-20 relative z-10">
        {children}
      </div>
      <Footer />
    </div>
  );
}
