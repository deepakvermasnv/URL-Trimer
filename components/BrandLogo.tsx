'use client';

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  darkText?: boolean;
}

export default function BrandLogo({ 
  className = '', 
  iconOnly = false, 
  size = 'md',
  darkText = false 
}: BrandLogoProps) {
  const iconSizeClasses = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-11 h-11 rounded-2xl',
  }[size];

  const zapSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  return (
    <Link href="/" className={`flex items-center gap-2.5 group select-none ${className}`}>
      <div className={`${iconSizeClasses} bg-[#0066FF] flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform shrink-0`}>
        <Zap className={`${zapSizeClasses} fill-white stroke-none`} />
      </div>
      {!iconOnly && (
        <span className={`${textSizeClasses} font-extrabold ${darkText ? 'text-white' : 'text-slate-900'} tracking-tight`}>
          URL<span className="text-[#0066FF]">Trim</span>
        </span>
      )}
    </Link>
  );
}
