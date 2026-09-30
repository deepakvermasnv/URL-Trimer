'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import NextImage from 'next/image';
import { 
  ArrowLeft, 
  FileImage, 
  Download, 
  RotateCcw, 
  Trash2, 
  Upload, 
  Check,
  AlertCircle,
  Settings2,
  FileUp
} from 'lucide-react';
import Script from 'next/script';
import Footer from '@/components/Footer';
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import NavAction from '@/components/NavAction';
import Badge from '@/components/Badge';
import FAQSection from '@/components/FAQSection';

const IMAGE_CONVERTER_FAQS = [
  {
    q: "What formats does the Image Converter support?",
    a: "You can convert images between PNG, JPG, and WebP formats."
  },
  {
    q: "Is my original image uploaded to a server for conversion?",
    a: "No. The conversion happens entirely within your web browser."
  },
  {
    q: "Will converting my image make it lose quality?",
    a: "No. It uses standard canvas methods to convert formats without unnecessary loss."
  },
  {
    q: "Is this image converter completely free?",
    a: "Yes."
  },
  {
    q: "Can I convert high-resolution files?",
    a: "Yes. High-resolution images are processed locally in your browser."
  }
];

const SUPPORTED_FORMATS = [
// ... (rest of the file remains same, I will just apply the layout changes)
  { id: 'image/png', label: 'PNG', ext: 'png' },
  { id: 'image/jpeg', label: 'JPG', ext: 'jpg' },
  { id: 'image/webp', label: 'WebP', ext: 'webp' },
  { id: 'image/bmp', label: 'BMP', ext: 'bmp' },
];

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState(SUPPORTED_FORMATS[0].id);
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
       alert('Please select an image file.');
       return;
    }
    setFile(selectedFile);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleConvert = async () => {
    if (!preview) return;
    setConverting(true);
    
    try {
      const img = new window.Image();
      img.src = preview;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL(targetFormat);
      setResult(dataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setConverting(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const link = document.createElement('a');
    const ext = SUPPORTED_FORMATS.find(f => f.id === targetFormat)?.ext || 'img';
    link.download = `converted-image.${ext}`;
    link.href = result;
    link.click();
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConvertNewImage = () => {
    reset();
  };

  return (
    <PageLayout showBlobs={true}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-16 space-y-8 relative">
        {/* Top Header Controls (Matching homepage design) */}
        <div className="flex items-center justify-between mb-2">
          <Link 
            href="/tools" 
            className="px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-[11px] font-bold tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all uppercase inline-flex items-center gap-1.5 shadow-xs hover:shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>TOOL LIBRARY</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LOCAL TRANSFORMER</span>
            </div>
          </div>
        </div>

        {/* Hero Section Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Image <span className="text-[#0066FF]">Converter.</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-normal">
            Convert graphics between PNG, JPG, WebP and more. Private, local processing with high-fidelity output.
          </p>
        </div>

        <div>
          <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={onFileSelect} />
          {!file ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer bg-white rounded-3xl border-2 border-dashed border-blue-200 hover:border-[#0066FF] p-12 sm:p-16 text-center transition-all duration-300 shadow-xl shadow-slate-200/40"
            >
              <div className="w-20 h-20 bg-blue-50/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-[#0066FF] group-hover:text-white transition-all duration-300 text-[#0066FF]">
                <FileUp className="w-9 h-9" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 group-hover:text-[#0066FF] transition-colors">Drop Your Image</h2>
              <p className="text-slate-400 font-medium text-xs sm:text-sm max-w-xs mx-auto">Drag and drop your image file here or click to browse local storage.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Preview Column */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="space-y-6"
              >
                <motion.div 
                  whileHover={{ 
                    rotateX: -2,
                    rotateY: 2,
                    z: 20,
                    transition: { duration: 0.4 }
                  }}
                  style={{ perspective: 1000, transformStyle: "preserve-3d" }}
                  className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 aspect-square relative overflow-hidden flex items-center justify-center group will-change-transform"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {preview && (
                    <div className="relative w-full h-full p-4" style={{ transform: "translateZ(20px)" }}>
                      <NextImage 
                        src={preview} 
                        alt="Source" 
                        fill
                        unoptimized
                        className="object-contain rounded-xl drop-shadow-2xl" 
                      />
                    </div>
                  )}
                  <div className="absolute top-6 left-6 py-1.5 px-4 rounded-full bg-slate-900/10 backdrop-blur-xl border border-white/20 text-[10px] font-black text-slate-900 uppercase tracking-widest z-10">
                    Source Manifest
                  </div>
                </motion.div>
                <div className="bg-slate-50 p-6 rounded-3xl space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>File Context</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">{file.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}</div>
                </div>
              </motion.div>

              {/* Controls Column */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white shadow-xl shadow-blue-900/5 space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Settings2 className="w-5 h-5 text-blue-600" />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Target Format</h3>
                      </div>
                      <button
                        onClick={reset}
                        className="px-3.5 py-1.5 rounded-full bg-white hover:bg-red-50 text-red-500 border border-slate-200/80 text-[10px] font-extrabold tracking-wider uppercase shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>DISCARD</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {SUPPORTED_FORMATS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setTargetFormat(f.id)}
                          className={`py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                            targetFormat === f.id 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                              : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-100'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {!result ? (
                      <button
                        onClick={handleConvert}
                        disabled={converting}
                        className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black py-6 rounded-2xl text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                      >
                        {converting ? <RotateCcw className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                        {converting ? 'Processing...' : 'Convert Image'}
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <button
                          onClick={downloadResult}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-6 rounded-2xl text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-100"
                        >
                          <Download className="w-5 h-5" />
                          Download Image
                        </button>
                        <button
                          onClick={handleConvertNewImage}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all cursor-pointer"
                        >
                          Convert New Image
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-amber-50 border border-amber-100 flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-medium text-amber-700 leading-relaxed uppercase tracking-wider">
                    Note: High resolution images may take a few seconds to process locally. Transparency is preserved in PNG/WebP exports.
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        <FAQSection 
          pageId="image-converter"
          faqs={IMAGE_CONVERTER_FAQS}
        />

        {/* SEO Schemas */}
        <Script id="image-converter-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Free Image Format Converter",
            "url": "https://www.urltrim.online/tools/image-converter",
            "description": "Convert images between PNG, JPG, WebP and other formats for free. Private, local processing with high-fidelity output. No file uploads required.",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "PNG to JPG conversion",
              "JPG to PNG conversion",
              "WebP to PNG conversion",
              "PNG to WebP conversion",
              "JPG to WebP conversion",
              "High-fidelity output",
              "100% private browser processing"
            ],
            "browserRequirements": "Modern web browser with JavaScript enabled",
            "isPartOf": {
              "@type": "WebSite",
              "name": "URL Trimmer",
              "url": "https://www.urltrim.online/"
            }
          })}
        </Script>
        <Script id="image-converter-breadcrumb" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem", "position": 1, "name": "Home",
                "item": "https://www.urltrim.online/"
              },
              {
                "@type": "ListItem", "position": 2, "name": "Tools",
                "item": "https://www.urltrim.online/tools"
              },
              {
                "@type": "ListItem", "position": 3, "name": "Image Converter",
                "item": "https://www.urltrim.online/tools/image-converter"
              }
            ]
          })}
        </Script>
      </div>
    </PageLayout>
  );
}
