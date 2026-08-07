'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  RefreshCw,
  Clock,
  Trash2,
  Zap
} from 'lucide-react';
import Footer from '@/components/Footer';
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import NavAction from '@/components/NavAction';
import Badge from '@/components/Badge';
import { cn } from '@/lib/utils';

const SAMPLE_PROMPTS = [
  "A majestic brass clockwork mechanical falcon, detailed obsidian eyes, high-contrast professional studio portrait",
  "A floating tea cup containing an entire miniature starry cosmos, swirling blue milk nebulae, soft golden rim",
  "A sleek cyberpunk kitten wearing neon turquoise smart visors, sitting on a rainy neon-lit street, reflections",
  "A cozy hobbit-style library room carved into a grass hill, warm fireplace, endless old leather books, isometric"
];

// Progressive text steps to display while generating to entertain the user
const PROGRESS_STEPS = [
  "Formulating neural seed...",
  "Querying active image rendering cluster...",
  "Dreaming high-contrast layouts...",
  "Brushing diffuse lighting...",
  "Rasterizing pristine resolutions...",
  "Completing graphic rendering..."
];

interface GeneratedImage {
  url?: string;
  base64?: string;
  mimeType?: string;
  seed?: number;
  engine?: string;
  isFallback?: boolean;
}

async function triggerDownload(img: GeneratedImage, index: number) {
  if (typeof window === "undefined") return;
  const filename = `ai-generated-image-${index + 1}-${Date.now()}.png`;

  try {
    let blob: Blob;

    if (img.base64) {
      const byteCharacters = atob(img.base64);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      blob = new Blob(byteArrays, { type: img.mimeType || 'image/png' });
    } else if (img.url) {
      const response = await fetch(img.url);
      if (!response.ok) throw new Error("Failed to fetch cross-origin image content");
      blob = await response.blob();
    } else {
      return;
    }

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } catch (error) {
    console.error("Blob download failed, fallback to standard download link:", error);
    const fallbackSrc = img.url || `data:${img.mimeType || 'image/png'};base64,${img.base64}`;
    const a = document.createElement('a');
    a.href = fallbackSrc;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

function VariationCard({
  img,
  idx,
  prompt,
  copiedIndex,
  onCopy,
  onDownload,
  onRegenerate
}: {
  img: GeneratedImage;
  idx: number;
  prompt: string;
  copiedIndex: number | null;
  onCopy: (img: GeneratedImage, idx: number) => void;
  onDownload: (img: GeneratedImage, idx: number) => void;
  onRegenerate: (idx: number) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
      }
    };
  }, []);

  const getDynamicSrc = () => {
    if (!img.url) {
      return `data:${img.mimeType || 'image/png'};base64,${img.base64}`;
    }
    if (retryCount > 0) {
      return `${img.url}&retry=${retryCount}`;
    }
    return img.url;
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    console.warn(`Variation #${idx + 1} failed to load. Retry count: ${retryCount}`);
    if (img.url && retryCount < 3) {
      setLoading(true);
      setError(false);
      
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
      }
      
      const delay = (retryCount + 1) * 1500;
      retryTimer.current = setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, delay);
    } else {
      setLoading(false);
      setError(true);
    }
  };

  const handleManualRetry = () => {
    setLoading(true);
    setError(false);
    setRetryCount(0);
  };

  const src = getDynamicSrc();

  return (
    <div className="flex flex-col bg-slate-50/50 p-3 rounded-3xl border border-slate-100 hover:border-slate-200 transition-all hover:bg-white hover:shadow-lg hover:shadow-blue-900/5 group relative overflow-hidden">
      
      <div className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-inner relative group/img flex items-center justify-center aspect-square transition-all duration-300">
        
        {loading && (
          <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-4 text-center z-20">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-blue-500 animate-spin flex items-center justify-center mb-2">
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider animate-pulse">
              {retryCount > 0 ? `Retrying load (${retryCount}/3)...` : "Loading Asset..."}
            </p>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 bg-slate-50/95 flex flex-col items-center justify-center p-4 text-center z-20 space-y-3.5">
            <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center border border-red-100 shadow-inner">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-800">Connection Timed Out</h4>
              <p className="text-[9px] text-slate-400 max-w-[160px] mx-auto leading-relaxed">
                Render server was busy. You can reload this variation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualRetry}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Reload
              </button>
              <button
                type="button"
                onClick={() => onRegenerate(idx)}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Wand2 className="w-2.5 h-2.5 text-blue-500" />
                New Seed
              </button>
            </div>
          </div>
        ) : (
          <Image 
            src={src} 
            alt={`${prompt} - option ${idx + 1}`} 
            width={500}
            height={500}
            unoptimized
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "w-full h-full object-contain max-h-[300px] transition-all duration-500 group-hover/img:scale-105",
              loading ? "opacity-0 scale-95" : "opacity-100 scale-100"
            )}
            referrerPolicy="no-referrer"
          />
        )}
        
        {!loading && !error && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover/img:opacity-100 transition-all duration-200 flex items-center justify-center gap-3.5 z-10">
            <button
              type="button"
              onClick={() => onDownload(img, idx)}
              className="w-11 h-11 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Quick Download"
            >
              <Download className="w-5 h-5 text-slate-900" />
            </button>
            <button
              type="button"
              onClick={() => onCopy(img, idx)}
              className="w-11 h-11 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Copy Asset Data"
            >
              {copiedIndex === idx ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <Copy className="w-5 h-5 text-slate-900" />
              )}
            </button>
          </div>
        )}

        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-mono font-black text-white uppercase tracking-wider z-10">
          # {idx + 1}
        </div>
      </div>
    </div>
  );
}

export default function TextToImage() {
  const [prompt, setPrompt] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('free'); // Default to 'free' (High-Speed Flux) for 100% reliable keyless creation
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [currentProgressIndex, setCurrentProgressIndex] = useState(0);

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

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setError('Please type or select a simple description first to enhance.');
      return;
    }
    setEnhancing(true);
    setError(null);
    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to enhance prompt.');
      }
      setPrompt(data.enhancedText);
    } catch (err: any) {
      console.error(err);
      setError(`Failed to enhance prompt: ${err?.message || err}`);
    } finally {
      setEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please input or choose a descriptive text prompt first.');
      return;
    }

    setLoading(true);
    setError(null);
    setFallbackNotice(null);
    setImages([]);
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
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          imageSize,
          engine: selectedEngine,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate image variations.');
      }

      if (data.isFallback) {
        setFallbackNotice(
          `Notice: Google Imagen quota was temporarily exceeded/unavailable. We have seamlessly processed your creation with our Ultra-Flux engine instead so you don't face any blockages!`
        );
      }

      if (data.images && data.images.length > 0) {
        setImages(data.images);
      } else if (data.url) {
        setImages([{ url: data.url, engine: data.engine }]);
      } else if (data.base64) {
        setImages([{ base64: data.base64, mimeType: data.mimeType, engine: data.engine }]);
      } else {
        throw new Error("No image data returned from generator.");
      }
    } catch (err: any) {
      console.error("Image generation failed:", err);
      const detailMsg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      setError(`Renderer communication error (${detailMsg}). Try switching to the Ultra-Flux Engine for 100% keyless reliability.`);
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setLoading(false);
    }
  };

  const regenerateIndividualImage = async (index: number) => {
    const newSeed = Math.floor(Math.random() * 999999) + 1;
    const updatedImages = [...images];
    let width = 1024;
    let height = 1024;
    if (aspectRatio === "16:9") {
      width = 1024;
      height = 576;
    } else if (aspectRatio === "9:16") {
      width = 576;
      height = 1024;
    } else if (aspectRatio === "4:3") {
      width = 1024;
      height = 768;
    } else if (aspectRatio === "3:4") {
      width = 768;
      height = 1024;
    }
    updatedImages[index] = {
      url: `https://image.pollinations.ai/p/${encodeURIComponent(prompt.trim())}?width=${width}&height=${height}&seed=${newSeed}&nologo=true&model=flux&private=true&feed=false`,
      engine: "free",
      seed: newSeed
    };
    setImages(updatedImages);
  };

  const downloadImage = (img: GeneratedImage, index: number) => {
    triggerDownload(img, index);
  };

  const copyImage = async (img: GeneratedImage, index: number) => {
    const src = img.url || `data:${img.mimeType || 'image/png'};base64,${img.base64}`;
    try {
      await navigator.clipboard.writeText(src);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setImages([]);
    setError(null);
    setFallbackNotice(null);
  };

  const hasImages = images && images.length > 0;

  return (
    <PageLayout showBlobs={true}>
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
          {(prompt || hasImages) && (
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

      {/* Main Section container */}
      <div className="max-w-3xl mx-auto space-y-8 mb-20">
        
        {/* Prompt Section (upar wala section) */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 sm:p-10 shadow-xl shadow-blue-900/5 space-y-8">
          
          {/* Rendering Engine Selector */}
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Select Rendering AI Engine
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedEngine('free');
                  setError(null);
                }}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-28 group",
                  selectedEngine === 'free'
                    ? "border-emerald-500 bg-emerald-50/40 shadow-md shadow-emerald-500/5 ring-2 ring-emerald-500/10"
                    : "border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    🚀 Ultra-Flux Engine
                  </span>
                  <Badge variant="emerald" className="scale-90 origin-right py-0.5">FREE &amp; UNLIMITED</Badge>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1.5">
                  Blazing fast rendering, incredibly creative open-source model. Works instantly without any keys. Generates a distinct high-quality image.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedEngine('gemini');
                  setError(null);
                }}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-28 group",
                  selectedEngine === 'gemini'
                    ? "border-blue-500 bg-blue-50/40 shadow-md shadow-blue-500/5 ring-2 ring-blue-500/10"
                    : "border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    ✨ Google Imagen 3
                  </span>
                  <Badge variant="blue" className="scale-90 origin-right py-0.5">DEV PREVIEW</Badge>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1.5">
                  Google&apos;s cinematic image rendering model. Subjects to daily developer quota rates. Generates a distinct high-quality image.
                </p>
              </button>
            </div>
          </div>

          {/* Prompt input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Descriptive Text Prompt
              </label>
              {prompt && (
                <button
                  type="button"
                  onClick={() => {
                    setPrompt('');
                    setError(null);
                  }}
                  className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>
            
            <textarea
              className="w-full h-40 px-5 py-4 text-sm font-semibold rounded-2xl bg-slate-50/50 border border-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 transition-all resize-none shadow-inner leading-relaxed"
              placeholder="Example: A serene high-mountain lake during golden hour, majestic snow peaks reflected clearly in the still blue water, highly realistic photorealistic texture..."
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError(null);
              }}
            />

            {/* Quick Prompt Controls Row */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={enhancing || loading || !prompt.trim()}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer",
                  prompt.trim()
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 border-transparent text-white hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/10 active:scale-[0.98]"
                    : "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
                )}
              >
                <Wand2 className={cn("w-4 h-4", enhancing && "animate-spin")} />
                {enhancing ? "Enhancing Prompt with AI..." : "Enhance Prompt with AI"}
              </button>

              <button 
                type="button"
                disabled={enhancing || loading}
                onClick={handleRandomPrompt}
                className="py-3 px-4 rounded-xl border border-blue-100 bg-blue-50/50 text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                Surprise Me
              </button>
            </div>
          </div>

          {/* Sizing/Format Selection - STRICTLY NO ICONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest block">
                Image Format / Aspect Ratio
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { label: 'Square (1:1)', value: '1:1' },
                  { label: 'Landscape (16:9)', value: '16:9' },
                  { label: 'Portrait (9:16)', value: '9:16' },
                  { label: 'Classic (4:3)', value: '4:3' },
                  { label: 'Tall (3:4)', value: '3:4' }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setAspectRatio(item.value)}
                    className={cn(
                      "px-3 py-2 text-[10px] font-bold rounded-xl border transition-all cursor-pointer text-center",
                      aspectRatio === item.value
                        ? "border-blue-500 bg-blue-50/50 text-blue-600 shadow-sm font-extrabold"
                        : "border-slate-100 bg-slate-50/50 text-slate-500 hover:bg-slate-50 hover:border-slate-200"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest block">
                Image Quality / Size
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { label: 'Standard (1K)', value: '1K' },
                  { label: 'High (2K)', value: '2K' },
                  { label: 'Ultra (4K)', value: '4K' }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    disabled={selectedEngine === 'free' && item.value !== '1K'}
                    onClick={() => setImageSize(item.value)}
                    className={cn(
                      "px-3 py-2 text-[10px] font-bold rounded-xl border transition-all cursor-pointer text-center disabled:opacity-40 disabled:cursor-not-allowed",
                      imageSize === item.value
                        ? "border-blue-500 bg-blue-50/50 text-blue-600 shadow-sm font-extrabold"
                        : "border-slate-100 bg-slate-50/50 text-slate-500 hover:bg-slate-50 hover:border-slate-200"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
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
                Generating Image...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Dream Art
              </>
            )}
          </button>

        </div>

        {/* Image Section (neeche wala section) - by default hidden, visible when generating or has images */}
        {(loading || hasImages) && (
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white p-6 sm:p-8 shadow-xl shadow-blue-900/5 flex flex-col items-center justify-center min-h-[420px] text-center relative overflow-hidden">
            
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
            ) : hasImages ? (
              <div className="space-y-6 w-full flex flex-col items-center justify-center h-full">
                {/* Interactive Single Image Display */}
                <div className="max-w-lg mx-auto grid grid-cols-1 gap-5 w-full">
                  {images.map((img, idx) => (
                    <VariationCard
                      key={`${idx}-${img.url || img.base64 || img.seed || 'initial'}`}
                      img={img}
                      idx={idx}
                      prompt={prompt}
                      copiedIndex={copiedIndex}
                      onCopy={copyImage}
                      onDownload={downloadImage}
                      onRegenerate={regenerateIndividualImage}
                    />
                  ))}
                </div>

                {fallbackNotice && (
                  <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl flex items-start gap-2.5 text-left animate-fadeIn w-full">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-700 font-semibold leading-normal">{fallbackNotice}</p>
                  </div>
                )}

              </div>
            ) : null}
            
          </div>
        )}

      </div>

      <Footer />
    </PageLayout>
  );
}
