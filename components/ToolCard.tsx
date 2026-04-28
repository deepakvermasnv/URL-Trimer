import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import Badge from './Badge';

interface ToolCardProps {
  tool: {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    category: string;
    href: string;
    status: string;
  };
  index: number;
}

export default function ToolCard({ tool, index }: ToolCardProps) {
  const isComingSoon = tool.status === 'Coming Soon';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Link 
        href={isComingSoon ? '#' : tool.href}
        className={`block h-full bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white p-10 shadow-xl shadow-blue-900/5 transition-all duration-500 ${
          isComingSoon 
            ? 'opacity-60 cursor-not-allowed' 
            : 'hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1'
        }`}
      >
        <div className="flex items-start justify-between mb-10">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
            isComingSoon ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'
          }`}>
            <tool.icon className="w-7 h-7" />
          </div>
          <Badge 
            variant={
              tool.status === 'Active' ? 'emerald' : 
              tool.status === 'Ready' ? 'blue' : 
              'slate'
            }
          >
            {tool.status}
          </Badge>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
            {tool.name}
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {tool.description}
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Category: {tool.category}
          </span>
          {!isComingSoon && (
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 group-hover:gap-4 transition-all uppercase tracking-widest">
              Launch Tool
              <ChevronRight className="w-4 h-4 text-blue-600" />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
