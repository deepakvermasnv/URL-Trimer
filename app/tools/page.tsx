'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, Chrome, Layout, PenTool, Search as SearchIcon, Shield } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import NavAction from '@/components/NavAction';
import { cn } from '@/lib/utils';
import { TOOLS, CATEGORIES } from '@/lib/tools';

export default function ToolsLibrary() {
  const [activeTab, setActiveTab] = useState('All');

  const filteredTools = useMemo(() => {
    if (activeTab === 'All') return TOOLS;
    return TOOLS.filter(tool => tool.category === activeTab);
  }, [activeTab]);

  const popularTools = useMemo(() => TOOLS.filter(t => t.isPopular), []);

  return (
    <PageLayout showBlobs={true}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <NavAction 
          href="/" 
          label="Back to Terminal" 
          type="back" 
          centeredOnMobile={true}
          className="md:justify-start mb-8"
        />

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            URL Trim’s full suite of tools
          </h1>
          
          {/* Tabs Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mt-8 border-b border-slate-100 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={cn(
                  "px-6 py-3 text-sm font-bold transition-all relative whitespace-nowrap",
                  activeTab === cat ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
                )}
              >
                {cat}
                {activeTab === cat && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Interface Container */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden transition-all duration-500">
            <div
              className="grid grid-cols-1"
            >
              {/* List Section */}
              <div className="p-8 sm:p-12">
                <div className="flex items-center gap-2 mb-8">
                  <Star className="w-4 h-4 text-orange-400 fill-current" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {activeTab === 'All' ? 'Recent and popular' : `${activeTab} Tools`}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-x-12 sm:gap-y-10">
                  {filteredTools.map((tool) => (
                    <Link 
                      key={tool.id} 
                      href={tool.href}
                      className={cn(
                        "flex items-center gap-4 group transition-all",
                        tool.status === 'Coming Soon' && "pointer-events-none opacity-60"
                      )}
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 transition-group-hover:bg-blue-50 transition-colors">
                        <tool.icon className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{tool.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{tool.description}</p>
                        {tool.status === 'Coming Soon' && (
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mt-0.5">SOON</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
        </div>

        {/* Security Banner Refined */}
        <div 
          className="mt-20 p-10 rounded-[3rem] bg-slate-900 text-white flex flex-col sm:flex-row items-center gap-8 shadow-2xl shadow-blue-900/40 relative overflow-hidden"
        >
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight">Privacy-First Architecture</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              All tools in our library operate exclusively on your device. We do not use servers to process your inputs. Your data stays in the browser and disappears when you close the tab.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
