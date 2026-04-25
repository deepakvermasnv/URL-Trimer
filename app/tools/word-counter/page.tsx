'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Type, 
  Trash2, 
  Copy, 
  Check, 
  Clock, 
  Hash, 
  AlignLeft,
  FileText,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import Footer from '@/components/Footer';

export default function WordCounter() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  // Memoize stats calculation for performance
  const stats = useMemo(() => {
    if (!text.trim()) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0
      };
    }

    const trimmedText = text.trim();
    const wordsArr = trimmedText.split(/\s+/).filter(w => w.length > 0);
    const words = wordsArr.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const readingTime = Math.ceil(words / 200);

    return {
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words,
      sentences,
      paragraphs,
      readingTime
    };
  }, [text]);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="min-h-screen blue-gradient-bg selection:bg-blue-100 selection:text-blue-900 relative">
      <div className="absolute inset-x-0 top-0 h-[500px] pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-400/5 rounded-full blur-[60px]" />
        <div className="absolute top-[20%] right-[-5%] w-64 h-64 bg-indigo-400/5 rounded-full blur-[40px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 sm:py-24 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16">
          <Link 
            href="/tools" 
            className="inline-flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tool Library
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="px-5 py-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-blue-900/5 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Live Analysis Node
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              className="px-5 py-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-100 shadow-xl shadow-blue-900/5 flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 hover:border-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Cache
            </motion.button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-7xl font-black text-slate-900 tracking-tighter mb-6">
            Word <span className="text-blue-600">Counter.</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Real-time textual analytics. Purely local, absolutely private processing of your creative or technical writing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Input Column */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 flex flex-col"
          >
            <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-white overflow-hidden h-full flex flex-col">
              <div className="p-8 sm:p-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-blue-600 rounded-full animate-pulse" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Text Workspace</h3>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Input Buffer</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopy}
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                      copied ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-slate-900 text-white shadow-slate-200"
                    )}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </motion.button>
                </div>

                <textarea
                  className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-[2rem] p-8 text-slate-700 font-medium placeholder-slate-300 min-h-[450px] flex-1 resize-none text-lg leading-relaxed transition-all duration-500 outline-none shadow-inner"
                  placeholder="Paste or type your text here to begin analysis..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* Stats Column */}
          <motion.aside 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4 space-y-8 h-full"
          >
            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white p-10 h-full">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <AlignLeft className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Metrics</h2>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Real-time stats</p>
                </div>
              </div>

              <div className="space-y-10">
                {[
                  { label: 'Words', value: stats.words, icon: Type, color: 'text-blue-600' },
                  { label: 'Characters', value: stats.characters, icon: Hash, color: 'text-indigo-600' },
                  { label: 'Sentences', value: stats.sentences, icon: FileText, color: 'text-violet-600' },
                  { label: 'Paragraphs', value: stats.paragraphs, icon: AlignLeft, color: 'text-sky-600' },
                  { label: 'Reading Time', value: `${stats.readingTime} min`, icon: BookOpen, color: 'text-emerald-600' }
                ].map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-blue-50 transition-colors">
                        <stat.icon className={cn("w-4 h-4", stat.color)} />
                      </div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tight tabular-nums">{stat.value}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 pt-10 border-t border-slate-100">
                <div className="bg-slate-50 rounded-3xl p-6 space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>No Spaces</span>
                    <span className="text-slate-900">{stats.charactersNoSpaces} chars</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: stats.characters > 0 ? `${(stats.charactersNoSpaces / stats.characters) * 100}%` : 0 }}
                      className="h-full bg-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
