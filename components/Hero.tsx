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
      <div className="space-y-6">
        {badgeText && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            <Badge icon={badgeIcon} variant="blue" className={centered ? 'mx-auto' : ''}>
              {badgeText}
            </Badge>
          </motion.div>
        )}
        <motion.h1 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[1.1]"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "circOut" }}
            className={`text-slate-500 text-lg font-medium leading-relaxed max-w-2xl ${centered ? 'mx-auto' : ''}`}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </header>
  );
}
