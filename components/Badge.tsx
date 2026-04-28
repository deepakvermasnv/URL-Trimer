import React from 'react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps {
  children: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
  variant?: 'blue' | 'emerald' | 'indigo' | 'amber' | 'slate' | 'default';
}

export default function Badge({ children, icon: Icon, className, variant = 'default' }: BadgeProps) {
  const variants = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-500 border-amber-100',
    slate: 'bg-slate-50 text-slate-500 border-slate-100',
    default: 'bg-white/70 backdrop-blur-xl border-white text-slate-400',
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
      variants[variant],
      className
    )}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </div>
  );
}
