import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavActionProps {
  href: string;
  label: string;
  type?: 'back' | 'forward';
  className?: string;
  centeredOnMobile?: boolean;
}

export default function NavAction({ href, label, type = 'back', className, centeredOnMobile = true }: NavActionProps) {
  const Icon = type === 'back' ? ArrowLeft : ExternalLink;

  return (
    <div className={cn(
      "flex mb-12 sm:mb-16",
      centeredOnMobile ? "justify-center lg:justify-start" : "justify-end",
      type === 'forward' && "justify-center lg:justify-end",
      className
    )}>
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-blue-900/5 text-slate-900 text-[13px] font-black uppercase tracking-widest hover:bg-white hover:shadow-blue-900/10 hover:-translate-y-0.5 transition-all duration-300 group",
          type === 'back' && "text-blue-600 hover:text-blue-700 font-black"
        )}
      >
        <motion.div
          initial={{ opacity: 0, x: type === 'back' ? 10 : -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          {type === 'back' && <Icon className="w-4 h-4" />}
          {label}
          {type === 'forward' && <Icon className="w-4 h-4 text-blue-600 group-hover:rotate-12 transition-transform" />}
        </motion.div>
      </Link>
    </div>
  );
}
