import React from 'react';
import { motion } from 'motion/react';
import Badge from './Badge';

interface HeroProps {
  title: React.ReactNode;
  subtitle?: string;
  badgeText?: string;
  badgeIcon?: React.ElementType;
  centered?: boolean;
  className?: string;
}

export default function Hero({ title, subtitle, badgeText, badgeIcon, centered = false, className }: HeroProps) {
  return (
    <header className={`${centered ? 'text-center' : ''} mb-16 sm:mb-20 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        {badgeText && (
          <Badge icon={badgeIcon} variant="blue" className={centered ? 'mx-auto' : ''}>
            {badgeText}
          </Badge>
        )}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[1.1]">
          {title}
        </h1>
        {subtitle && (
          <p className={`text-slate-500 text-lg font-medium leading-relaxed max-w-2xl ${centered ? 'mx-auto' : ''}`}>
            {subtitle}
          </p>
        )}
      </motion.div>
    </header>
  );
}
