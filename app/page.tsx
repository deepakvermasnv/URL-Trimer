'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, Copy, Check, Scissors, RotateCcw, Trash2, FileUp, Settings2, Loader2, ExternalLink } from 'lucide-react';
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
    <main className="min-h-screen bg-[#F9FAFB] selection:bg-indigo-100 selection:text-indigo-900">
      {/* Simple Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-gray-900/10 active:scale-95 shadow-sm">
            Sign In
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 sm:py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Clean your links <span className="text-indigo-600">instantly.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            The simplest way to strip paths and queries from your URLs. Just paste and copy.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Settings */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 z-10">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-8">
                <Settings2 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Configuration</h2>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Domain Extensions</label>
                  <input 
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-200 outline-none transition-all"
                    value={customExtensions}
                    onChange={(e) => setCustomExtensions(e.target.value)}
                    placeholder=".com, .net..."
                  />
                  <p className="text-[10px] text-gray-400 leading-relaxed">Separate multiple extensions with commas.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data Integrity</label>
                  <button 
                    onClick={() => setRemoveDuplicates(!removeDuplicates)}
                    className={cn(
                      "w-full px-5 py-3 rounded-2xl text-sm font-bold border transition-all flex items-center justify-between group",
                      removeDuplicates 
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-500" 
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <span>Remove Duplicates</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      removeDuplicates ? "bg-white scale-125" : "bg-gray-200 group-hover:bg-gray-300"
                    )} />
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>System Status</span>
                    <span className="text-emerald-500 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Main Workspace */}
          <div className="lg:col-span-8 space-y-8">
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
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Input Buffer</label>
                  </div>
                  <div className="flex items-center gap-4">
                    {isProcessing && (
                      <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full">
                        <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />
                        <span className="text-xs font-bold text-indigo-600">{progress}%</span>
                      </div>
                    )}
                    <button 
                      onClick={handleClear}
                      className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-2 group"
                    >
                      <Trash2 className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                      Clear
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <textarea
                    className="w-full bg-gray-50 hover:bg-gray-100/50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-500/10 rounded-2xl p-6 text-gray-700 placeholder-gray-300 min-h-[240px] resize-none text-lg leading-relaxed transition-all"
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
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cleaned Results</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleOpenAll}
                          disabled={isProcessing || !output}
                          className="px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95 disabled:opacity-50"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open All
                        </button>
                        <button
                          onClick={handleCopy}
                          disabled={isProcessing || !output}
                          className={cn(
                            "px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm",
                            copied 
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" 
                              : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95"
                          )}
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? 'Copied' : 'Copy All'}
                        </button>
                      </div>
                    </div>
                    <div className={cn(
                      "bg-white border border-gray-100 rounded-2xl p-6 text-sm font-mono text-gray-600 whitespace-pre-wrap max-h-[360px] overflow-y-auto custom-scrollbar transition-opacity",
                      isProcessing && "opacity-30"
                    )}>
                      {output || "Processing..."}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* SEO Content Section - Moved outside the grid to prevent overlapping issues */}
        <div className="mt-24 space-y-24">
          {/* Features Grid */}
          <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                <Scissors className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Bulk Processing</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Clean thousands of URLs in seconds. Our optimized algorithm handles large lists without breaking a sweat.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Duplicate Removal</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Automatically filter out redundant links to keep your data clean and unique. Perfect for SEO audits.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                <Settings2 className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Custom Extensions</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Define exactly where you want to trim. Support for all TLDs including .com, .net, .org, and custom ones.
              </p>
            </div>
          </section>

          {/* How it Works */}
          <section className="bg-indigo-600 rounded-[2.5rem] p-10 sm:p-16 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-12">How URL Trimmer Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                <div className="space-y-4">
                  <div className="text-4xl font-black opacity-20">01</div>
                  <h4 className="text-xl font-bold">Paste Your Links</h4>
                  <p className="text-indigo-100 leading-relaxed">
                    Copy your list of messy URLs from any source—spreadsheets, text files, or browser history—and paste them into the input buffer.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="text-4xl font-black opacity-20">02</div>
                  <h4 className="text-xl font-bold">Configure Trimming</h4>
                  <p className="text-indigo-100 leading-relaxed">
                    Use the configuration panel to set your desired domain extensions. The tool will strip everything after these extensions.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="text-4xl font-black opacity-20">03</div>
                  <h4 className="text-xl font-bold">Instant Cleaning</h4>
                  <p className="text-indigo-100 leading-relaxed">
                    Our real-time engine processes your links instantly. You&apos;ll see a clean list of domains ready for use.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="text-4xl font-black opacity-20">04</div>
                  <h4 className="text-xl font-bold">Export & Use</h4>
                  <p className="text-indigo-100 leading-relaxed">
                    Copy the cleaned results to your clipboard or open them all in new tabs with a single click.
                  </p>
                </div>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          </section>

          {/* FAQ Section */}
          <section className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <p className="text-gray-500 mt-2">Everything you need to know about our URL cleaning tool.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900">What is a URL Trimmer?</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  A URL trimmer is a tool that strips paths, query parameters, and fragments from a URL, leaving only the root domain or a specific part of the link.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900">Is it free to use?</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Yes, Trimmer is completely free for individual use. You can process as many URLs as you need without any hidden costs.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900">Does it support bulk URLs?</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Absolutely. You can paste thousands of links at once. Our tool uses chunked processing to ensure your browser remains responsive.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900">Is my data secure?</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Your data never leaves your browser. All processing happens locally on your machine, ensuring maximum privacy and security.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Simple Footer */}
        <footer className="pt-12 mt-24 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-400">
          <p>© 2026 Trimmer Labs. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
