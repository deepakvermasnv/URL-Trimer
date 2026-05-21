'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { 
  ArrowLeft, 
  Wand2, 
  Download, 
  RotateCcw, 
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Image as ImageIcon,
  Layout,
  RefreshCw,
  Clock
} from 'lucide-react';
import Footer from '@/components/Footer';
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import NavAction from '@/components/NavAction';
import Badge from '@/components/Badge';
import { cn } from '@/lib/utils';

const ASPECT_RATIOS = [
  { label: 'Square (1:1)', value: '1:1', icon: '⏹️', description: 'Posts' },
  { label: 'Landscape (16:9)', value: '16:9', icon: '🌅', description: 'Banners' },
  { label: 'Portrait (9:16)', value: '9:16', icon: '📱', description: 'Reels' },
  { label: 'Wide (4:3)', value: '4:3', icon: '🖥️', description: 'Classic Standard' },
  { label: 'Classic Tall (3:4)', value: '3:4', icon: '📸', description: 'Social Feed Grid' }
];

const SAMPLE_PROMPTS = [
  "A majestic brass clockwork mechanical falcon, detailed obsidian eyes, high-contrast professional studio portrait",
  "A floating tea cup containing an entire miniature starry cosmos, swirling blue milk nebulae, soft golden rim",
  "A sleek cyberpunk kitten wearing neon turquoise smart visors, sitting on a rainy neon-lit street, reflections",
  "A cozy hobbit-style library room carved into a grass hill, warm fireplace, endless old leather books, isometric"
];

// Progressive text steps to display while generating to entertain the user
const PROGRESS_STEPS = [
  "Formulating neural seed...",
  "Dreaming high-contrast layouts...",
  "Brushing diffuse lighting...",
  "Rasterizing pristine resolutions...",
  "Completing graphic rendering..."
];

export default function TextToImage() {
  const [prompt, setPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProgressIndex, setCurrentProgressIndex] = useState(0);
  const [puterReady, setPuterReady] = useState(false);

  useEffect(() => {
    const checkPuter = () => {
      if (typeof window !== 'undefined' && (window as any).puter) {
        setPuterReady(true);
        return true;
      }
      return false;
    };

    if (checkPuter()) return;

    const interval = setInterval(() => {
      if (checkPuter()) {
        clearInterval(interval);
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleRandomPrompt = () => {
    const currentIndex = SAMPLE_PROMPTS.indexOf(prompt);
    let nextIndex = Math.floor(Math.random() * SAMPLE_PROMPTS.length);
    if (nextIndex === currentIndex) {
      nextIndex = (nextIndex + 1) % SAMPLE_PROMPTS.length;
    }
    setPrompt(SAMPLE_PROMPTS[nextIndex]);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please input or choose a descriptive text prompt first.');
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);
    setCurrentProgressIndex(0);

    // Cycle through reassuring progressive states to entertain user
    progressIntervalRef.current = setInterval(() => {
      setCurrentProgressIndex((prev) => {
        if (prev < PROGRESS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2800);

    try {
      const cleanPrompt = prompt.trim();
      const fullPrompt = `${cleanPrompt}, aspect ratio ${selectedRatio}`;

      const puter = typeof window !== 'undefined' ? (window as any).puter : null;
      let generationUploadedSuccess = false;

      // Plan A: Try Puter's client-side txt2img API first if it exists and works
      if (puter && puter.ai && typeof puter.ai.txt2img === 'function') {
        try {
          console.log("Attempting image generation via Puter AI services...");
          const imgElement = await puter.ai.txt2img(fullPrompt);
          if (imgElement && imgElement.src) {
            setImageUrl(imgElement.src);
            generationUploadedSuccess = true;
          }
        } catch (puterErr: any) {
          console.warn("Puter.js failed (likely due to sandbox environment or rate limit). Falling back to Pollinations engine...", puterErr);
        }
      }

      // Plan B: Seamless, keyless, and extremely robust fallback using Pollinations.ai (works everywhere!)
      if (!generationUploadedSuccess) {
        console.log("Using Pollinations engine fallback...");
        
        let width = 1024;
        let height = 1024;
        if (selectedRatio === '16:9') {
          width = 1024;
          height = 576;
        } else if (selectedRatio === '9:16') {
          width = 576;
          height = 1024;
        } else if (selectedRatio === '4:3') {
          width = 1024;
          height = 768;
        } else if (selectedRatio === '3:4') {
          width = 768;
          height = 1024;
        }

        // Add random seed to prevent caching and guarantee fresh creations on every click
        const seed = Math.floor(Math.random() * 999999) + 1;
        const pollinationsUrl = `https://image.pollinations.ai/p/${encodeURIComponent(cleanPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;

        // Pre-load the image to prevent flickering or broken image frames in UI, completing the progress bar beautifully.
        // We use a safe preloader that falls back to immediate resolution on error or timeout so it never blocks artificially.
        try {
          const img = new Image();
          img.src = pollinationsUrl;
          img.referrerPolicy = "no-referrer";

          await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => {
              console.log("Pre-loading timed out; displaying image directly.");
              resolve();
            }, 8000); // 8-second safety guard timeout

            img.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            img.onerror = () => {
              clearTimeout(timeout);
              resolve(); // Fall back gracefully; let the browser load it natively
            };
          });
        } catch (preloadErr) {
          console.warn("Dynamic preloading failed to run, setting image directly:", preloadErr);
        }

        setImageUrl(pollinationsUrl);
      }
    } catch (err: any) {
      console.error("All image generation strategies failed:", err);
      const detailMsg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      setError(`Failed to connect to image rendering engine (${detailMsg === '{}' ? 'network error' : detailMsg}). Please modify your prompt and try again.`);
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `ai-generated-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyUrl = async () => {
    if (!imageUrl) return;
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setSelectedRatio('1:1');
    setImageUrl(null);
    setError(null);
  };

  return (
    <PageLayout showBlobs={true}>
      <Script 
        src="https://js.puter.com/v2/" 
        strategy="afterInteractive"
        onLoad={() => setPuterReady(true)}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16">
        <NavAction 
          href="/tools" 
          label="Tool Library" 
          type="back" 
          className="mb-0 sm:mb-0" 
        />
        
        <div className="flex items-center gap-4 justify-center sm:justify-end">
          <Badge variant="emerald">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1" />
            AI cloud-powered
          </Badge>
          {(prompt || imageUrl) && (
            <button
              onClick={handleReset}
              className="px-5 py-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-100 shadow-xl shadow-blue-900/5 flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Form
            </button>
          )}
        </div>
      </div>

      <Hero 
        centered
        title={<>AI Text-To-Image <span className="text-blue-600">Generator.</span></>}
        subtitle="Transform descriptive scripts into professional-grade digital artwork and assets instantly with the power of Gemini AI."
      />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
        
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-7 bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 sm:p-10 shadow-xl shadow-blue-900/5 space-y-8">
          
          {/* Prompt input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Descriptive Text Prompt
              </label>
              <button 
                type="button"
                onClick={handleRandomPrompt}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Surprise Me
              </button>
            </div>
            <textarea
              className="w-full h-32 px-5 py-4 text-sm font-semibold rounded-2xl bg-slate-50/50 border border-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 transition-all resize-none shadow-inner"
              placeholder="Example: A serene high-mountain lake during golden hour, majestic snow peaks reflected clearly in the still blue water, highly realistic photorealistic texture..."
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError(null);
              }}
            />
          </div>

          {/* Aspect Ratio choice */}
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Layout className="w-4 h-4 text-blue-500" />
              Desired Aspect Ratio
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {ASPECT_RATIOS.map((ratio) => {
                const isSelected = selectedRatio === ratio.value;
                return (
                  <button
                    key={ratio.value}
                    type="button"
                    onClick={() => setSelectedRatio(ratio.value)}
                    className={cn(
                      "flex flex-col items-center justify-center py-4 px-3 rounded-2xl border text-center transition-all cursor-pointer group",
                      isSelected 
                        ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-600/10 text-white" 
                        : "bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-white hover:border-slate-300"
                    )}
                  >
                    <span className="text-xl mb-1.5 group-hover:scale-110 transition-transform">{ratio.icon}</span>
                    <span className="text-xs font-bold leading-tight">{ratio.value}</span>
                    <span className={cn(
                      "text-[9px] mt-1 font-medium block truncate max-w-full leading-none",
                      isSelected ? "text-blue-100" : "text-slate-400"
                    )}>
                      {ratio.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>



          {/* Error display */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-semibold border border-red-100 animate-fadeIn">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Generate trigger button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={cn(
              "w-full py-4 sm:py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-blue-600/10 cursor-pointer",
              loading
                ? "bg-blue-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20 active:scale-[0.98]"
            )}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating Graphics...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Dream Art
              </>
            )}
          </button>

        </div>

        {/* Right Column: Output / Live Rendering Status */}
        <div className="lg:col-span-5 flex flex-col justify-stretch">
          
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 sm:p-10 shadow-xl shadow-blue-900/5 h-full flex flex-col items-center justify-center min-h-[420px] text-center relative overflow-hidden">
            
            {loading ? (
              <div className="space-y-6 flex flex-col items-center justify-center w-full z-10 py-10">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center animate-pulse shadow-inner relative">
                  <Wand2 className="w-10 h-10 text-blue-600 animate-spin transition-all duration-1000" />
                  <span className="absolute inset-0 rounded-full border-4 border-dashed border-blue-500 animate-spin" style={{ animationDuration: '6000ms' }} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-800">Casting AI Canvas</h3>
                  <div className="flex items-center gap-1.5 justify-center text-xs font-mono text-blue-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{PROGRESS_STEPS[currentProgressIndex]}</span>
                  </div>
                </div>
                
                {/* Decorative retro loading gauge */}
                <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner max-w-xs">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentProgressIndex + 1) / PROGRESS_STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            ) : imageUrl ? (
              <div className="space-y-6 w-full flex flex-col items-center justify-center h-full">
                
                {/* The Graphic canvas container */}
                <div className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] overflow-hidden shadow-inner relative group/img aspect-square flex items-center justify-center">
                  <img 
                    src={imageUrl} 
                    alt={prompt} 
                    className="w-full h-full object-contain max-h-[400px] transition-transform duration-500 group-hover/img:scale-105" 
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Aspect Ratio Display badge */}
                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-mono font-black text-white uppercase tracking-wider">
                    {selectedRatio} RATIO
                  </div>
                </div>

                {/* Download and Share Controls */}
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button
                    onClick={handleDownload}
                    className="py-3 px-4 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Save Asset
                  </button>
                  <button
                    onClick={handleCopyUrl}
                    className="py-3 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Copied Base64
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Image
                      </>
                    )}
                  </button>
                </div>

              </div>
            ) : (
              <div className="space-y-6 py-10 text-slate-400 flex flex-col items-center max-w-sm z-10">
                <div className="w-20 h-20 bg-slate-100/80 rounded-full flex items-center justify-center shadow-inner">
                  <ImageIcon className="w-9 h-9 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">Artistic Studio</h3>
                  <p className="text-xs font-semibold leading-relaxed text-slate-400">
                    Input a description on the left pane and generate clean, vector-inspired graphics and artwork in real-time.
                  </p>
                </div>
              </div>
            )}
            
          </div>

        </div>

      </div>

      <Footer />
    </PageLayout>
  );
}
