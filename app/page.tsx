'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, Copy, Check, Scissors, RotateCcw, Trash2, FileUp, Settings2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function URLTrimmer() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [customExtensions, setCustomExtensions] = useState('.com, .net, .org, .io, .co, .in');
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const processInput = async () => {
      if (!input.trim()) {
        setOutput('');
        setProgress(0);
        setIsProcessing(false);
        return;
      }

      const lines = input.split('\n').filter(line => line.trim() !== '');
      const totalLines = lines.length;

      setIsProcessing(true);
      setProgress(0);

      let currentOutput: string[] = [];
      const seenDomains = new Set<string>();
      let currentIndex = 0;
      const chunkSize = 100;
      
      const extensions = customExtensions
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(e => e !== '');

      const processNextChunk = () => {
        if (isCancelled) return;

        const end = Math.min(currentIndex + chunkSize, totalLines);
        for (let i = currentIndex; i < end; i++) {
          const trimmedLine = lines[i].trim();
          if (!trimmedLine) continue;

          let result = trimmedLine;
          let foundCustom = false;

          // Try custom extensions first (literal matching)
          for (const ext of extensions) {
            const index = trimmedLine.toLowerCase().indexOf(ext);
            if (index !== -1) {
              result = trimmedLine.substring(0, index + ext.length);
              foundCustom = true;
              break;
            }
          }

          if (!foundCustom) {
            try {
              // Check if it has a protocol
              const hasProtocol = /^https?:\/\//i.test(trimmedLine);
              const urlToParse = hasProtocol ? trimmedLine : `http://${trimmedLine}`;
              const parsed = new URL(urlToParse);
              
              // Get the origin (protocol + host + port)
              result = parsed.origin;
              
              // If the original input didn't have a protocol, remove the one we added
              if (!hasProtocol) {
                result = result.replace(/^https?:\/\//i, '');
              }
            } catch (e) {
              // Fallback for malformed URLs: split by the first path/query/fragment separator
              result = trimmedLine.split(/[/?#]/)[0];
            }
          }
          
          if (removeDuplicates) {
            if (!seenDomains.has(result)) {
              seenDomains.add(result);
              currentOutput.push(result);
            }
          } else {
            currentOutput.push(result);
          }
        }

        currentIndex = end;
        const currentProgress = Math.round((currentIndex / totalLines) * 100);
        setProgress(currentProgress);

        if (currentIndex < totalLines) {
          requestAnimationFrame(processNextChunk);
        } else {
          setOutput(currentOutput.join('\n'));
          setIsProcessing(false);
        }
      };

      // Small delay to debounce and ensure we don't block the main thread immediately
      setTimeout(processNextChunk, 100);
    };

    processInput();

    return () => {
      isCancelled = true;
    };
  }, [input, customExtensions, removeDuplicates]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.csv'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setInput(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] selection:bg-indigo-100 selection:text-indigo-900">
      {/* Simple Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Trimmer</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'API', 'Pricing'].map(item => (
              <a key={item} href="#" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">{item}</a>
            ))}
          </nav>
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm">
            Sign In
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Clean your links <span className="text-indigo-600">instantly.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            The simplest way to strip paths and queries from your URLs. Just paste and copy.
          </p>
        </div>

        <div className="space-y-8">
          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            {/* Input Area */}
            <div 
              className={cn(
                "p-6 sm:p-8 transition-all duration-300",
                isDragging ? "bg-indigo-50/50" : "bg-white"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Input URLs</label>
                {isProcessing && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-indigo-600">{progress}%</span>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <textarea
                  className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500/10 rounded-2xl p-6 text-gray-700 placeholder-gray-300 min-h-[200px] resize-none text-lg leading-relaxed transition-all"
                  placeholder="Paste your links here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                {isDragging && (
                  <div className="absolute inset-0 bg-indigo-600/5 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center border-2 border-indigo-600 border-dashed pointer-events-none">
                    <FileUp className="w-10 h-10 text-indigo-600 mb-2" />
                    <span className="text-sm font-bold text-indigo-600">Drop files here</span>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Bar with Settings Toggle */}
            <div className="px-6 py-4 bg-gray-50 border-y border-gray-100 flex items-center justify-between">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest"
              >
                <Settings2 className="w-4 h-4" />
                Settings
              </button>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleClear}
                  className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Settings Content */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-gray-100"
                >
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Extensions</label>
                        <input 
                          type="text"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none"
                          value={customExtensions}
                          onChange={(e) => setCustomExtensions(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duplicates</label>
                        <button 
                          onClick={() => setRemoveDuplicates(!removeDuplicates)}
                          className={cn(
                            "w-full px-4 py-2.5 rounded-xl text-sm font-bold border transition-all",
                            removeDuplicates 
                              ? "bg-indigo-600 border-indigo-600 text-white" 
                              : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                          )}
                        >
                          {removeDuplicates ? 'Removing Duplicates' : 'Keep Duplicates'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Output Area */}
            <AnimatePresence mode="wait">
              {(output || isProcessing) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 sm:p-8 bg-gray-50/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cleaned Results</label>
                    <button
                      onClick={handleCopy}
                      disabled={isProcessing || !output}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm",
                        copied 
                          ? "bg-emerald-500 text-white" 
                          : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy All'}
                    </button>
                  </div>
                  <div className={cn(
                    "bg-white border border-gray-100 rounded-2xl p-6 text-sm font-mono text-gray-600 whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar transition-opacity",
                    isProcessing && "opacity-30"
                  )}>
                    {output || "Processing..."}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Simple Footer */}
          <footer className="pt-12 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-400">
            <p>© 2026 Trimmer Labs. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
