'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, Copy, Check, Scissors, RotateCcw, Trash2, FileUp, Settings2, Loader2, ExternalLink, Edit3, Star, Zap } from 'lucide-react';
import Footer from '@/components/Footer';
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import NavAction from '@/components/NavAction';
import { TOOLS } from '@/lib/tools';
import { cn } from '@/lib/utils';

export default function URLTrimmer() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [customExtensions, setCustomExtensions] = useState('.com, .net, .org, .io, .co, .in');
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [isManualEditing, setIsManualEditing] = useState(false);

  // Mouse Spotlight Effect
  useEffect(() => {
    let frameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      // Performance optimization: skip processing if width is small (mobile) or spotlight not needed
      if (window.innerWidth < 768) return;
      
      frameId = requestAnimationFrame(() => {
        if (spotlightRef.current) {
          spotlightRef.current.style.background = `radial-gradient(
            300px circle at ${e.clientX}px ${e.clientY}px,
            rgba(37, 99, 235, 0.15),
            rgba(59, 130, 246, 0.05) 30%,
            transparent 80%
          )`;
        }
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const processInput = async () => {
      if (isManualEditing) return; // Skip automatic processing if user is manually refining results

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
  }, [input, customExtensions, removeDuplicates, isManualEditing]);

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
    setIsManualEditing(false);
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


      <PageLayout className="selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden relative" showBlobs={true}>
        {/* Interactive Spotlight Overlay */}
        <div ref={spotlightRef} className="fixed inset-0 pointer-events-none z-0 spotlight" />
        
        <Hero 
          centered 
          badgeText="Fast & Local URL Processor"
          badgeIcon={Zap}
          title={
            <>
              URL <span className="text-blue-600">Trim.</span>
            </>
          }
          subtitle="Clean your bulk URL lists by stripping paths, queries, and fragments instantly. All processing happens right in your browser."
        />

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
                  <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Config</h2>
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
                    aria-label={removeDuplicates ? "Disable deduplication" : "Enable deduplication"}
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
            whileHover={{ 
              rotateX: 1, 
              rotateY: -1,
              transition: { duration: 0.3 }
            }}
            style={{ perspective: 1500, transformStyle: "preserve-3d" }}
            className="lg:col-span-8 space-y-8 will-change-transform"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white overflow-hidden transition-all duration-500 hover:shadow-blue-900/15">
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
                        <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Input Buffer ({input.split('\n').filter(line => line.trim() !== '').length})</h3>
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
                      aria-label="Clear input buffer"
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
                          <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Output Stream ({output.split('\n').filter(line => line.trim() !== '').length})</h3>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Trimmed Results</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsManualEditing(!isManualEditing)}
                          disabled={isProcessing || !output}
                          className={cn(
                            "px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm border",
                            isManualEditing 
                              ? "bg-blue-50 text-blue-600 border-blue-200" 
                              : "bg-white text-slate-700 border-slate-200 hover:border-blue-500 hover:text-blue-600"
                          )}
                        >
                          <Edit3 className="w-4 h-4" />
                          {isManualEditing ? "Exit Edit" : "Manual Edit"}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleOpenAll}
                          disabled={isProcessing || !output}
                          aria-label="Open all links in new tabs"
                          className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-white text-slate-700 border border-slate-200 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 shadow-sm flex items-center"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-2" />
                          Open All
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCopy}
                          disabled={isProcessing || !output}
                          aria-label={copied ? "Copied" : "Copy results to clipboard"}
                          className={cn(
                            "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 relative overflow-hidden",
                            copied 
                              ? "bg-emerald-500 text-white shadow-emerald-200" 
                              : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 transition-all duration-300"
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
                      key={isManualEditing ? 'editing' : 'viewing'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "group/output relative bg-white border border-slate-100 rounded-3xl p-8 text-sm font-mono text-slate-600 transition-all duration-500 shadow-inner",
                        isProcessing && "opacity-30"
                      )}>
                      {isManualEditing ? (
                        <textarea 
                          value={output}
                          onChange={(e) => setOutput(e.target.value)}
                          className="w-full h-[300px] bg-transparent resize-none outline-none custom-scrollbar"
                          placeholder="Edit results manually..."
                        />
                      ) : (
                        <div className="whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar">
                          {output || "Crunching domains..."}
                        </div>
                      )}
                      {!isManualEditing && <div className="absolute inset-0 ring-2 ring-blue-500/20 ring-inset opacity-0 group-hover/output:opacity-100 transition-opacity rounded-3xl pointer-events-none" />}
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
                initial={{ opacity: 0, scale: 0.9, y: 50, rotateY: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.8, 
                  delay: i * 0.15,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                whileHover={{ 
                  y: -15,
                  scale: 1.02,
                  rotateX: -5,
                  rotateY: 5,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                style={{ 
                  perspective: "2000px",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden"
                }}
                className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] border border-white shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/15 transition-all duration-500 group relative overflow-hidden will-change-transform"
              >
                {/* 3D Inner Content shadow/glow */}
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />
                
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-blue-100 relative z-10",
                  f.color === "blue" ? "bg-blue-50 text-blue-600" :
                  f.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                  "bg-indigo-50 text-indigo-600"
                )}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 relative z-10">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium relative z-10">
                  {f.desc}
                </p>
                
                {/* 3D Decorative Accent */}
                <div className="absolute bottom-4 right-4 text-slate-50 opacity-0 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700 -rotate-12">
                   <f.icon className="w-24 h-24" />
                </div>
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
                    <div className="text-5xl font-black text-blue-500 tabular-nums transition-all duration-500 group-hover:text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">{s.step}</div>
                    <h4 className="text-sm font-bold uppercase tracking-[0.2em]">{s.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {s.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
            </motion.section>

          {/* URL Trim Tools Section */}
          <section id="tools" className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">URL Trim Tools</h2>
              <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Professional Grade Utility Library</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden transition-all duration-500">
              <div className="p-8 sm:p-12">
                <div className="flex items-center gap-2 mb-10 justify-center sm:justify-start">
                  <Star className="w-4 h-4 text-orange-400 fill-current" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    URL Trim’s full suite of tools
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-x-12 sm:gap-y-10">
                  {TOOLS.slice(0, 6).map((tool) => (
                    <Link 
                      key={tool.id} 
                      href={tool.href}
                      className={cn(
                        "flex items-center gap-4 group transition-all",
                        tool.href === '#' && "pointer-events-none opacity-60"
                      )}
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                        <tool.icon className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{tool.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{tool.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                
                <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                  <Link href="/tools" className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-3 transition-all">
                    Explore Extended Library <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* SEO Optimized Long-Form Content */}
          <section className="space-y-20 pb-20 border-t border-slate-100 pt-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-8 space-y-12">
                <div className="space-y-6">
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">What Is URL Trim? The Ultimate Bulk URL Cleaning Tool</h2>
                  <p className="text-slate-600 leading-relaxed text-lg font-medium">
                    URL Trim is a free, browser-based tool designed to help SEO professionals, developers, digital marketers, and privacy-conscious users <strong className="text-blue-600">clean bulk URL lists</strong> with precision and speed. Whether you&apos;re dealing with hundreds of messy affiliate links, thousands of backlink URLs, or complex tracking-parameter-laden addresses, URL Trim strips away the noise and delivers clean, usable domain names — all without sending a single byte to our servers.
                  </p>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900">Why Do You Need a Bulk URL Cleaner?</h3>
                  <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
                    <p>
                      Modern URLs are cluttered. Every time you share a link, visit a page, or export a URL list from an analytics tool, you end up with strings full of <strong className="text-slate-800">tracking parameters</strong> (like <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600">utm_source</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600">fbclid</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600">gclid</code>), nested paths, redirects, and query fragments. These make your data analysis messy, your spreadsheets unreadable, and your reports inaccurate.
                    </p>
                    <p>
                      URL Trim solves this problem instantly. Paste your raw URL list — no matter how large — and our intelligent engine strips everything down to the clean root domain or your preferred structure within seconds.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Who Uses URL Trim?</h4>
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
                      Privacy isn&apos;t just a promise here — it&apos;s enforced by physics. Your data never leaves your device. All processing happens 100% locally in your browser. No servers, no logs, no risks.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-slate-900">URL Trim vs. Manual Cleaning</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Manually cleaning URLs in Excel using complex formulas is tedious and breaks with non-standard URL structures. Python scripts work but require technical knowledge and environment setup. URL Trim gives you the power of a programmatic solution with the simplicity of a no-code tool — no spreadsheet gymnastics, no scripting, no server uploads.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h3>
                  <div className="space-y-8">
                    {[
                      { q: "Is URL Trim completely free?", a: "Yes, URL Trim is completely free to use with no limits on the number of URLs you can process." },
                      { q: "What is the URL limit?", a: "Our optimized chunking engine handles 10,000+ URLs simultaneously without blocking your browser's main thread." },
                      { q: "Can I use it on mobile?", a: "Yes, URL Trim works on all modern mobile browsers including iOS and Android." },
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
      </PageLayout>
    </>
  );
}
