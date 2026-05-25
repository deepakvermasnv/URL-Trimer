'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, Copy, Check, Scissors, RotateCcw, Trash2, FileUp, Settings2, Loader2, ExternalLink, Star, Zap, Fingerprint, Type, Layers } from 'lucide-react';
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
  const [activeMode, setActiveMode] = useState<'trimmer' | 'slug' | 'title-case' | 'dedup'>('trimmer');

  // Mouse Spotlight Effect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let lastRan = 0;
    let throttleTimeout: NodeJS.Timeout | null = null;
    let frameId: number | null = null;

    const updateSpotlight = (clientX: number, clientY: number) => {
      if (frameId) cancelAnimationFrame(frameId);
      
      frameId = requestAnimationFrame(() => {
        if (spotlightRef.current) {
          spotlightRef.current.style.background = `radial-gradient(
            300px circle at ${clientX}px ${clientY}px,
            rgba(37, 99, 235, 0.15),
            rgba(59, 130, 246, 0.05) 30%,
            transparent 80%
          )`;
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Performance optimization: skip if under breakpoint (mobile & tablet)
      if (window.innerWidth < 1024) return;

      const now = Date.now();
      const throttleMs = 80; // Only recalculate position every 80ms

      if (!lastRan || now - lastRan >= throttleMs) {
        updateSpotlight(e.clientX, e.clientY);
        lastRan = now;
      } else {
        if (throttleTimeout) clearTimeout(throttleTimeout);
        throttleTimeout = setTimeout(() => {
          updateSpotlight(e.clientX, e.clientY);
          lastRan = Date.now();
        }, throttleMs - (now - lastRan));
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (throttleTimeout) clearTimeout(throttleTimeout);
      if (frameId) cancelAnimationFrame(frameId);
    };
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

          if (activeMode === 'trimmer') {
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
          } else if (activeMode === 'slug') {
            result = trimmedLine
              .toLowerCase()
              .trim()
              .replace(/[^\w\s-]/g, '')
              .replace(/[\s_]+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-+|-+$/g, '');
          } else if (activeMode === 'title-case') {
            result = trimmedLine
              .toLowerCase()
              .split(' ')
              .map(word => {
                if (!word) return '';
                return word.charAt(0).toUpperCase() + word.slice(1);
              })
              .join(' ');
          } else if (activeMode === 'dedup') {
            result = trimmedLine;
          }
          
          if (activeMode === 'dedup') {
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
  }, [input, customExtensions, activeMode]);

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

        <div className="max-w-6xl mx-auto w-full space-y-6">
          {/* Operational Mode Option */}
          <div 
            className="p-5 px-6 rounded-[2rem] bg-white/70 backdrop-blur-md border border-slate-100 shadow-xl shadow-slate-900/[0.02] flex items-center justify-center"
          >
            {/* Mode selection buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-3 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 w-full lg:w-auto">
              <button
                onClick={() => setActiveMode('trimmer')}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer",
                  activeMode === 'trimmer'
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/45"
                    : "text-slate-600 hover:text-slate-850 hover:bg-white/40"
                )}
              >
                <Scissors className="w-3.5 h-3.5 shrink-0" />
                <span>URL Trimmer</span>
              </button>

              <button
                onClick={() => setActiveMode('dedup')}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer",
                  activeMode === 'dedup'
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/45"
                    : "text-slate-600 hover:text-slate-850 hover:bg-white/40"
                )}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Remove Duplicate URL</span>
              </button>
              
              <button
                onClick={() => setActiveMode('slug')}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer",
                  activeMode === 'slug'
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/45"
                    : "text-slate-600 hover:text-slate-850 hover:bg-white/40"
                )}
              >
                <Fingerprint className="w-3.5 h-3.5 shrink-0" />
                <span>Slug Generator</span>
              </button>

              <button
                onClick={() => setActiveMode('title-case')}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer",
                  activeMode === 'title-case'
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/45"
                    : "text-slate-600 hover:text-slate-850 hover:bg-white/40"
                )}
              >
                <Type className="w-3.5 h-3.5 shrink-0" />
                <span>Title Case Converter</span>
              </button>
            </div>
          </div>

          {/* Main Workspace */}
          <motion.div 
            whileHover={{ 
              rotateX: 0.5, 
              rotateY: -0.5,
              transition: { duration: 0.3 }
            }}
            style={{ perspective: 1500, transformStyle: "preserve-3d" }}
            className="space-y-8 will-change-transform"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white overflow-hidden transition-all duration-500 hover:shadow-blue-900/15">
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                {/* Left Side: Input Area */}
                <div 
                  className={cn(
                    "p-8 sm:p-10 transition-colors duration-500 relative flex flex-col justify-between h-full",
                    isDragging ? "bg-blue-50/50" : "bg-white"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                        <div>
                          <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest">
                            {activeMode === 'trimmer' && `Input Buffer (${input.split('\n').filter(line => line.trim() !== '').length})`}
                            {activeMode === 'slug' && `Title Buffer (${input.split('\n').filter(line => line.trim() !== '').length})`}
                            {activeMode === 'title-case' && `Text Buffer (${input.split('\n').filter(line => line.trim() !== '').length})`}
                            {activeMode === 'dedup' && `URL Buffer (${input.split('\n').filter(line => line.trim() !== '').length})`}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                            {activeMode === 'trimmer' && 'Load URLs Below'}
                            {activeMode === 'slug' && 'Load Phrases Below'}
                            {activeMode === 'title-case' && 'Load Text Below'}
                            {activeMode === 'dedup' && 'Load URLs Below'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {isProcessing && (
                          <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                            <span className="text-xs font-bold text-blue-600">{progress}%</span>
                          </div>
                        )}
                        <motion.button 
                          whileHover={{ scale: 1.05, backgroundColor: "#fee2e2", borderColor: "#fca5a5" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleClear}
                          aria-label="Clear input buffer"
                          className="group flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50/70 border border-red-100 px-3.5 py-1.5 rounded-2xl transition-all uppercase tracking-widest shadow-sm shadow-red-100/50"
                        >
                          <Trash2 className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                          <span>Clear</span>
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="relative group/input flex-1 flex flex-col">
                      <textarea
                        className="w-full bg-slate-50/50 border-2 border-transparent hover:border-blue-100 focus:bg-white focus:border-blue-500 rounded-3xl p-6 text-slate-700 font-medium placeholder-slate-300 h-[380px] lg:h-[460px] resize-none text-base leading-relaxed transition-all duration-300 outline-none shadow-inner"
                        placeholder={
                          activeMode === 'trimmer'
                            ? "Paste links to begin processing..."
                            : activeMode === 'slug'
                            ? "Paste titles or phrases to generate clean URL slugs (e.g. 'Ultimate SEO Guide 2026')..."
                            : activeMode === 'title-case'
                            ? "Paste text or headlines to convert to Title Case (e.g. 'how to make a website')..."
                            : "Paste links to filter out duplicate URLs..."
                        }
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                      />
                      <div className="absolute inset-0 bg-blue-500/5 rounded-3xl pointer-events-none opacity-0 group-hover/input:opacity-100 transition-opacity duration-500" />
                      {isDragging && (
                        <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[4px] rounded-3xl flex flex-col items-center justify-center border-2 border-blue-500 border-dashed pointer-events-none">
                          <FileUp className="w-12 h-12 text-blue-600 mb-3" />
                          <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Drop Stream Here</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Output Area */}
                <div className="p-8 sm:p-10 bg-slate-50/30 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                        <div>
                          <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest">
                            {activeMode === 'trimmer' && `Output Stream (${output.split('\n').filter(line => line.trim() !== '').length})`}
                            {activeMode === 'slug' && `Slug Output (${output.split('\n').filter(line => line.trim() !== '').length})`}
                            {activeMode === 'title-case' && `Title Case Output (${output.split('\n').filter(line => line.trim() !== '').length})`}
                            {activeMode === 'dedup' && `Unique URLs (${output.split('\n').filter(line => line.trim() !== '').length})`}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                            {activeMode === 'trimmer' && 'Trimmed Results'}
                            {activeMode === 'slug' && 'Slugified Phrases'}
                            {activeMode === 'title-case' && 'Standardized Casing'}
                            {activeMode === 'dedup' && 'Deduplicated URLs'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(activeMode === 'trimmer' || activeMode === 'dedup') && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleOpenAll}
                            disabled={isProcessing || !output}
                            aria-label="Open all links in new tabs"
                            className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-white text-slate-700 border border-slate-200 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 shadow-sm flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Open All
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCopy}
                          disabled={isProcessing || !output}
                          aria-label={copied ? "Copied" : "Copy results to clipboard"}
                          className={cn(
                            "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-1.5 relative overflow-hidden",
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
                              className="flex items-center gap-1.5"
                            >
                              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span className="relative z-10">{copied ? 'Copied' : 'Copy'}</span>
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
                    
                    <div 
                      className={cn(
                        "group/output relative bg-white border border-slate-100 rounded-3xl p-6 text-sm font-mono text-slate-600 transition-all duration-500 shadow-inner h-[380px] lg:h-[460px] flex flex-col justify-between",
                        isProcessing && "opacity-30"
                      )}>
                      <textarea 
                        value={output}
                        onChange={(e) => setOutput(e.target.value)}
                        className="w-full h-full bg-transparent resize-none outline-none custom-scrollbar z-10 relative leading-relaxed whitespace-pre"
                        placeholder=""
                      />
                      
                      {!output && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none select-none z-0">
                          {activeMode === 'trimmer' && (
                            <>
                              <Scissors className="w-10 h-10 text-slate-300 mb-3" />
                              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Awaiting URL Stream</p>
                              <p className="text-slate-400 text-[10px] max-w-[200px]">Paste single or multiple URLs on the left side to instantly strip extra paths offline.</p>
                            </>
                          )}
                          {activeMode === 'dedup' && (
                            <>
                              <Layers className="w-10 h-10 text-slate-300 mb-3" />
                              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Awaiting URL Stream</p>
                              <p className="text-slate-400 text-[10px] max-w-[200px]">Paste a list of URLs on the left side to automatically remove all duplicates.</p>
                            </>
                          )}
                          {activeMode === 'slug' && (
                            <>
                              <Fingerprint className="w-10 h-10 text-slate-300 mb-3" />
                              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Awaiting Phrase Stream</p>
                              <p className="text-slate-400 text-[10px] max-w-[200px]">Paste multi-word headers or book titles on the left to generate clean URL slugs offline.</p>
                            </>
                          )}
                          {activeMode === 'title-case' && (
                            <>
                              <Type className="w-10 h-10 text-slate-300 mb-3" />
                              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Awaiting Word Stream</p>
                              <p className="text-slate-400 text-[10px] max-w-[200px]">Paste lowercase headings or lines of text to automatically standardize to proper Title Case.</p>
                            </>
                          )}
                        </div>
                      )}
                      <div className="absolute inset-0 ring-2 ring-blue-500/20 ring-inset opacity-0 group-hover/output:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Informational Sections */}
        <div className="mt-32 space-y-32">
          {/* URL Trim Tools Section */}
          <section id="tools" className="space-y-12" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 600px' }}>
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

          {/* Features Grid */}
          <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-10" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 350px' }}>
            {[
              { icon: Scissors, color: "blue", title: "Smart Trimming", desc: "Strip excess paths and parameters with surgical accuracy." },
              { icon: Check, color: "emerald", title: "Unique Logic", desc: "Instantly filter out duplicate domains for cleaner reporting." },
              { icon: Settings2, color: "indigo", title: "Custom TLDs", desc: "Target exactly the extensions you need for specialized cleaning." }
            ].map((f, i) => (
              <motion.div 
                key={i}
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
          <section 
            className="bg-slate-950 rounded-[3rem] p-12 sm:p-24 text-white relative overflow-hidden shadow-2xl shadow-blue-900/30"
            style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 650px' }}
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="max-w-xl mb-16">
                <h2 
                  className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight"
                >
                  Streamlined <br /> Processing.
                </h2>
                <p className="text-blue-400 leading-relaxed uppercase text-xs tracking-[0.3em] font-bold">The 4-Step Link Protocol</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
                {[
                  { step: "01", title: "Paste", desc: "Load your messy URL lists into the workspace." },
                  { step: "02", title: "Set", desc: "Select extension modules for your criteria." },
                  { step: "03", title: "Clean", desc: "Watch the engine strip paths in real-time." },
                  { step: "04", title: "Copy", desc: "Retrieve your purified domains instantly." }
                ].map((s, i) => (
                  <div 
                    key={i} 
                    className="space-y-6 group"
                  >
                    <div className="text-5xl font-black text-blue-500 tabular-nums transition-all duration-500 group-hover:text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">{s.step}</div>
                    <h4 className="text-sm font-bold uppercase tracking-[0.2em]">{s.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {s.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SEO Optimized Long-Form Content */}
          <section className="space-y-20 pb-20 border-t border-slate-100 pt-32" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 1000px' }}>
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
