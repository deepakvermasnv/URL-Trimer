'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, Copy, Check, Scissors, RotateCcw, Trash2, FileUp, Settings2, Loader2, ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Footer from '@/components/Footer';

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
  const [showIntro, setShowIntro] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [particles, setParticles] = useState<{ width: number; height: number; left: number; delay: number; duration: number }[]>([]);

  // Initialize Particles and Mounting state
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsMounted(true);
      const newParticles = Array.from({ length: 15 }).map(() => ({
        width: Math.random() * 8 + 4,
        height: Math.random() * 8 + 4,
        left: Math.random() * 100,
        delay: Math.random() * 15,
        duration: Math.random() * 10 + 15
      }));
      setParticles(newParticles);
    });
  }, []);

  // Intro Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Mouse Spotlight Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

      // Create a regex to match extensions followed by a separator or end of string
      const escapedExtensions = extensions.map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const extensionRegex = escapedExtensions.length > 0 
        ? new RegExp(`(${escapedExtensions.join('|')})(?=[/?#]|$)`, 'i')
        : null;

      const processNextChunk = () => {
        if (isCancelled) return;

        const end = Math.min(currentIndex + chunkSize, totalLines);
        for (let i = currentIndex; i < end; i++) {
          const trimmedLine = lines[i].trim();
          if (!trimmedLine) continue;

          let result = trimmedLine;
          let foundCustom = false;

          // Try custom extensions first using regex for better accuracy
          if (extensionRegex) {
            const match = trimmedLine.match(extensionRegex);
            if (match && match.index !== undefined) {
              result = trimmedLine.substring(0, match.index + match[0].length);
              foundCustom = true;
            }
          }

          if (!foundCustom) {
            try {
              const hasProtocol = /^https?:\/\//i.test(trimmedLine);
              const urlToParse = hasProtocol ? trimmedLine : `http://${trimmedLine}`;
              const parsed = new URL(urlToParse);
              result = parsed.origin;
              if (!hasProtocol) {
                result = result.replace(/^https?:\/\//i, '');
              }
            } catch (e) {
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
    setOutput('');
    setProgress(0);
  };

  const handleOpenAll = () => {
    if (!output) return;
    const urls = output.split('\n').filter(line => line.trim() !== '');
    
    if (urls.length === 0) return;

    // Browsers typically block multiple popups from a single click.
    // We use a staggered approach and check for blocks.
    let blockedCount = 0;
    
    urls.forEach((url, index) => {
      const formattedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      
      // Staggering the opens can sometimes help bypass simple blockers, 
      // but the first one is usually the only one allowed without explicit permission.
      setTimeout(() => {
        const newWindow = window.open(formattedUrl, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          blockedCount++;
          if (index === urls.length - 1 && blockedCount > 0) {
            alert(`Browser blocked ${blockedCount} of ${urls.length} tabs. Please click the "Pop-up blocked" icon in your address bar and select "Always allow" to open all URLs at once.`);
          }
        }
      }, index * 200);
    });
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
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f8fafc] overflow-hidden"
          >
            {/* Background pattern for intro */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="absolute inset-x-0 h-px bg-blue-600 top-1/4" />
              <div className="absolute inset-x-0 h-px bg-blue-600 top-2/4" />
              <div className="absolute inset-x-0 h-px bg-blue-600 top-3/4" />
            </div>

            <div className="relative text-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-8 mx-auto"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Initializing Link Protocol
              </motion.div>
              
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tighter"
              >
                Welcome to <span className="text-blue-600">Free Bulk URL Cleaner</span>
              </motion.h1>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.4, ease: "linear", delay: 0.3 }}
                className="h-1 bg-blue-600 max-w-[200px] mx-auto rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              />
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-sm font-bold text-slate-400 uppercase tracking-[0.4em]"
              >
                Loading Assets...
              </motion.p>
            </div>

            {/* Circular decorative elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute w-[600px] h-[600px] border border-blue-100 rounded-full opacity-20 pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen blue-gradient-bg selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden relative">
      {/* Interactive Spotlight Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 spotlight" />

      {/* Background Particles Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((p, i) => (
          <div 
            key={i}
            className="absolute bg-blue-500/10 rounded-full animate-particle"
            style={{
              width: `${p.width}px`,
              height: `${p.height}px`,
              left: `${p.left}%`,
              bottom: `-20px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>

      {/* Eye-catching Floating Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-blue-400/20 rounded-full blur-[80px] animate-float opacity-40" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-indigo-400/10 rounded-full blur-[100px] animate-float opacity-30" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-[50%] left-[40%] w-48 h-48 bg-sky-300/15 rounded-full blur-[60px] animate-float opacity-20" style={{ animationDelay: '-1.5s' }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 sm:py-24 relative z-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          className="text-center mb-20"
        >
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm border border-blue-100/50"
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-glow" />
            Fast & Local URL Processor
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl sm:text-7xl font-extrabold text-slate-900 tracking-tight mb-6"
          >
            Free Bulk URL Cleaner — <br className="hidden sm:block" />
            <span className="relative inline-block">
              <span className="relative z-10 text-blue-600">Strip Paths & Queries.</span>
              <motion.span 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute bottom-1 left-0 h-3 bg-blue-100 -z-0 rounded-full" 
              />
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Clean your bulk URL lists by stripping paths, queries, and fragments instantly. 
            All processing happens right in your browser.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Settings */}
          <motion.aside 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="lg:col-span-4 space-y-6 lg:sticky lg:top-12"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-blue-900/5 border border-white p-8 group transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-8">
                <motion.div 
                  whileHover={{ rotate: 180 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 cursor-pointer"
                >
                  <Settings2 className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Config</h2>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Adjustment Module</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    Custom Extensions
                    <motion.span 
                      animate={{ scale: [1, 1.5, 1] }} 
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full" 
                    />
                  </label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border border-slate-100 hover:border-blue-200 focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 text-sm outline-none transition-all duration-300 shadow-sm"
                    value={customExtensions}
                    onChange={(e) => setCustomExtensions(e.target.value)}
                    placeholder=".com, .net..."
                  />
                  <p className="text-[10px] text-slate-400">Separate multiple extensions with commas.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Filtering</label>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRemoveDuplicates(!removeDuplicates)}
                    className={cn(
                      "w-full px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-between group overflow-hidden relative",
                      removeDuplicates 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 shimmer" 
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <span className="relative z-10">Remove Duplicates</span>
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 relative z-10",
                      removeDuplicates ? "bg-white/20 rotate-0 shadow-inner" : "bg-slate-200 rotate-180"
                    )}>
                      <Check className={cn("w-3 h-3 transition-opacity", removeDuplicates ? "opacity-100" : "opacity-0")} />
                    </div>
                  </motion.button>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engine Status</span>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                     Live
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Right Column: Main Workspace */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="lg:col-span-8 space-y-8"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white overflow-hidden transition-all duration-500 hover:shadow-blue-900/10">
              {/* Input Area */}
              <div 
                className={cn(
                  "p-8 sm:p-10 transition-colors duration-500 relative",
                  isDragging ? "bg-blue-50/50" : "bg-white"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      animate={{ height: [32, 24, 32] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-1.5 h-8 bg-blue-600 rounded-full" 
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Input Buffer</h3>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Load URLs Below</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {isProcessing && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-100"
                      >
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-xs font-bold text-blue-600">{progress}%</span>
                      </motion.div>
                    )}
                    <motion.button 
                      whileHover={{ scale: 1.1, color: "#ef4444" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClear}
                      className="group flex items-center gap-2 text-xs font-bold text-slate-400 transition-colors uppercase tracking-widest"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear
                    </motion.button>
                  </div>
                </div>
                
                <div className="relative group/input">
                  <textarea
                    className="w-full bg-slate-50/50 border-2 border-transparent hover:border-blue-100 focus:bg-white focus:border-blue-500 rounded-3xl p-8 text-slate-700 font-medium placeholder-slate-300 min-h-[320px] resize-none text-base leading-relaxed transition-all duration-300 outline-none shadow-inner"
                    placeholder="Paste links to begin processing..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <div className="absolute inset-0 bg-blue-500/5 rounded-3xl pointer-events-none opacity-0 group-hover/input:opacity-100 transition-opacity duration-500" />
                  {isDragging && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-blue-600/10 backdrop-blur-[4px] rounded-3xl flex flex-col items-center justify-center border-2 border-blue-500 border-dashed pointer-events-none"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <FileUp className="w-12 h-12 text-blue-600 mb-3" />
                      </motion.div>
                      <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Drop Stream Here</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Output Area */}
              <AnimatePresence mode="wait">
                {(output || isProcessing) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="p-8 sm:p-10 border-t border-slate-50 bg-slate-50/30"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: 6 }}
                          className="w-1.5 h-8 bg-emerald-500 rounded-full" 
                        />
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Output Stream</h3>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Trimmed Results</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleOpenAll}
                          disabled={isProcessing || !output}
                          className="px-6 py-3 rounded-2xl text-xs font-bold transition-all bg-white text-slate-700 border border-slate-200 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 shadow-sm flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open All
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCopy}
                          disabled={isProcessing || !output}
                          className={cn(
                            "px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 relative overflow-hidden",
                            copied 
                              ? "bg-emerald-500 text-white shadow-emerald-200" 
                              : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 shimmer"
                          )}
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={copied ? 'checked' : 'copy'}
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -20, opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              <span className="relative z-10">{copied ? 'Captured!' : 'Copy List'}</span>
                            </motion.div>
                          </AnimatePresence>
                          {copied && (
                            <motion.div 
                              initial={{ scale: 0, opacity: 1 }}
                              animate={{ scale: 2, opacity: 0 }}
                              className="absolute inset-0 bg-white/20 rounded-full"
                            />
                          )}
                        </motion.button>
                      </div>
                    </div>
                    <motion.div 
                      key={output}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "group/output relative bg-white border border-slate-100 rounded-3xl p-8 text-sm font-mono text-slate-600 whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar transition-all duration-500 shadow-inner",
                        isProcessing && "opacity-30"
                      )}>
                      {output || "Crunching domains..."}
                      <div className="absolute inset-0 ring-2 ring-blue-500/20 ring-inset opacity-0 group-hover/output:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Informational Sections */}
        <div className="mt-32 space-y-32">
          {/* Features Grid */}
          <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Scissors, color: "blue", title: "Smart Trimming", desc: "Strip excess paths and parameters with surgical accuracy." },
              { icon: Check, color: "emerald", title: "Unique Logic", desc: "Instantly filter out duplicate domains for cleaner reporting." },
              { icon: Settings2, color: "indigo", title: "Custom TLDs", desc: "Target exactly the extensions you need for specialized cleaning." }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ 
                  y: -12, 
                  rotateX: 5, 
                  rotateY: 5,
                  transition: { duration: 0.2 }
                }}
                style={{ perspective: 1000 }}
                className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] border border-white shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-shadow duration-500 group"
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-8 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
                  f.color === "blue" ? "bg-blue-50 text-blue-600" :
                  f.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                  "bg-indigo-50 text-indigo-600"
                )}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </section>

          {/* How it Works */}
          <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-slate-950 rounded-[3rem] p-12 sm:p-24 text-white relative overflow-hidden shadow-2xl shadow-blue-900/30"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2 animate-float" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 animate-float" style={{ animationDelay: '-2s' }} />
            
            <div className="relative z-10">
              <div className="max-w-xl mb-16">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight"
                >
                  Streamlined <br /> Processing.
                </motion.h2>
                <p className="text-blue-400 leading-relaxed uppercase text-xs tracking-[0.3em] font-bold">The 4-Step Link Protocol</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
                {[
                  { step: "01", title: "Paste", desc: "Load your messy URL lists into the workspace." },
                  { step: "02", title: "Set", desc: "Select extension modules for your criteria." },
                  { step: "03", title: "Clean", desc: "Watch the engine strip paths in real-time." },
                  { step: "04", title: "Copy", desc: "Retrieve your purified domains instantly." }
                ].map((s, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="space-y-6 group"
                  >
                    <div className="text-6xl font-black text-blue-500 tabular-nums transition-all duration-500 group-hover:text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">{s.step}</div>
                    <h4 className="text-sm font-bold uppercase tracking-[0.2em]">{s.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {s.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
            </motion.section>

          {/* SEO Optimized Long-Form Content */}
          <section className="space-y-20 pb-20 border-t border-slate-100 pt-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-8 space-y-12">
                <div className="space-y-6">
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">What Is URL Trimmer? The Ultimate Bulk URL Cleaning Tool</h2>
                  <p className="text-slate-600 leading-relaxed text-lg font-medium">
                    URL Trimmer is a free, browser-based tool designed to help SEO professionals, developers, digital marketers, and privacy-conscious users <strong className="text-blue-600">clean bulk URL lists</strong> with precision and speed. Whether you're dealing with hundreds of messy affiliate links, thousands of backlink URLs, or complex tracking-parameter-laden addresses, URL Trimmer strips away the noise and delivers clean, usable domain names — all without sending a single byte to our servers.
                  </p>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900">Why Do You Need a Bulk URL Cleaner?</h3>
                  <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
                    <p>
                      Modern URLs are cluttered. Every time you share a link, visit a page, or export a URL list from an analytics tool, you end up with strings full of <strong className="text-slate-800">tracking parameters</strong> (like <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600">utm_source</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600">fbclid</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600">gclid</code>), nested paths, redirects, and query fragments. These make your data analysis messy, your spreadsheets unreadable, and your reports inaccurate.
                    </p>
                    <p>
                      URL Trimmer solves this problem instantly. Paste your raw URL list — no matter how large — and our intelligent engine strips everything down to the clean root domain or your preferred structure within seconds.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Who Uses URL Trimmer?</h4>
                    <ul className="space-y-3 text-sm text-slate-500 font-medium list-disc pl-5">
                      <li><strong>SEO Professionals:</strong> Audit backlink profiles and extract clean unique referring domains.</li>
                      <li><strong>Digital Marketers:</strong> Sanitize lists before importing into campaign tools.</li>
                      <li><strong>Web Developers:</strong> Validate domain lists or preprocess datasets easily.</li>
                      <li><strong>Privacy Users:</strong> Remove tracking identifiers before sharing links.</li>
                      <li><strong>Data Analysts:</strong> Normalize datasets for accurate reporting and mapping.</li>
                    </ul>
                  </div>
                  <div className="bg-blue-600 p-8 rounded-[2rem] shadow-xl shadow-blue-200 space-y-4 text-white">
                    <h4 className="font-black uppercase tracking-widest text-xs opacity-80">Privacy First Policy</h4>
                    <p className="text-sm font-medium leading-relaxed">
                      Privacy isn't just a promise here — it's enforced by physics. Your data never leaves your device. All processing happens 100% locally in your browser. No servers, no logs, no risks.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-slate-900">URL Trimmer vs. Manual Cleaning</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Manually cleaning URLs in Excel using complex formulas is tedious and breaks with non-standard URL structures. Python scripts work but require technical knowledge and environment setup. URL Trimmer gives you the power of a programmatic solution with the simplicity of a no-code tool — no spreadsheet gymnastics, no scripting, no server uploads.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h3>
                  <div className="space-y-8">
                    {[
                      { q: "Is URL Trimmer completely free?", a: "Yes, URL Trimmer is completely free to use with no limits on the number of URLs you can process." },
                      { q: "What is the URL limit?", a: "Our optimized chunking engine handles 10,000+ URLs simultaneously without blocking your browser's main thread." },
                      { q: "Can I use it on mobile?", a: "Yes, URL Trimmer works on all modern mobile browsers including iOS and Android." },
                      { q: "What about IDNs?", a: "Our engine correctly handles international domain names and punycode-encoded URLs with high precision." }
                    ].map((faq, i) => (
                      <div key={i} className="space-y-2">
                        <h4 className="text-sm font-black text-slate-800">{faq.q}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-900/40">
                  <h3 className="text-lg font-bold mb-4">Ready to Protocol?</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
                    Start trimming your links with surgical precision. 
                    No registration. No tracking. Just speed.
                  </p>
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-widest transition-colors"
                  >
                    Back to Terminal
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
    </>
  );
}
