'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  FileDown, 
  Download, 
  RotateCcw, 
  Trash2, 
  Upload, 
  Check,
  AlertCircle,
  Settings2,
  FileUp,
  Minimize2,
  Gauge,
  Zap
} from 'lucide-react';
import Footer from '@/components/Footer';
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import NavAction from '@/components/NavAction';
import Badge from '@/components/Badge';

export default function ImageCompressor() {
// ... (rest of the component remains same, I will just apply the layout changes)
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [compressing, setCompressing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; url: string; size: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
       alert('Please select an image file.');
       return;
    }
    // Only support lossy formats for quality-based compression effectively via canvas
    if (!['image/jpeg', 'image/webp'].includes(selectedFile.type)) {
       // We can still process but transparency or lossless might be affected/converted
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

  const handleCompress = async () => {
    if (!preview || !file) return;
    setCompressing(true);
    
    try {
      const img = new Image();
      img.src = preview;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);

      // Determine output type. Prefer JPEG/WebP for quality-based compression
      const outputType = file.type === 'image/png' ? 'image/webp' : file.type;
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setResult({
            blob,
            url,
            size: blob.size
          });
          setCompressing(false);
        }
      }, outputType, quality);
    } catch (err) {
      console.error(err);
      setCompressing(false);
    }
  };

  const downloadResult = () => {
    if (!result || !file) return;
    const link = document.createElement('a');
    const nameArr = file.name.split('.');
    nameArr.pop();
    const ext = result.blob.type.split('/')[1];
    link.download = `${nameArr.join('.')}-compressed.${ext}`;
    link.href = result.url;
    link.click();
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

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
          <Badge variant="blue">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse mr-1" />
            Surgical Compression
          </Badge>
          {file && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={reset}
              className="px-5 py-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-100 shadow-xl shadow-blue-900/5 flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Discard
            </motion.button>
          )}
        </div>
      </div>

      <Hero 
        centered
        title={<>Image <span className="text-blue-600">Compressor.</span></>}
        subtitle="Reduce payload volume with our local compression engine. Optimized for web assets while preserving spectral fidelity."
      />

      <div className="max-w-4xl mx-auto">
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
              className="group cursor-pointer bg-white/90 backdrop-blur-2xl rounded-[3rem] border-4 border-dashed border-slate-100 hover:border-blue-500 hover:bg-white p-20 text-center transition-all duration-500"
            >
              <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={onFileSelect} />
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <Minimize2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">Load Payload Bundle</h2>
              <p className="text-slate-400 font-medium max-w-xs mx-auto">Drop the image you want to compress. No data is sent to external nodes.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Preview & Stats */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 aspect-square relative overflow-hidden flex items-center justify-center">
                  {preview && (
                    <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl" />
                  )}
                  <div className="absolute top-6 left-6 py-1.5 px-4 rounded-full bg-slate-900/10 backdrop-blur-xl border border-white/20 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                    Live Buffer
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2">Original</p>
                    <div className="text-lg font-black text-slate-900">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
                    <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.1em] mb-2">Compressed</p>
                    <div className="text-lg font-black text-emerald-600 transition-all">
                      {result ? `${(result.size / 1024).toFixed(1)} KB` : '---'}
                    </div>
                  </div>
                </div>

                {result && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-blue-600 p-6 rounded-3xl flex items-center justify-between text-white"
                  >
                    <div>
                      <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Efficiency Ratio</p>
                      <h4 className="text-xl font-black">
                        {Math.max(0, Math.round((1 - result.size / file.size) * 100))}% Reduced
                      </h4>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Zap className="w-6 h-6" />
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Controls */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white shadow-xl shadow-blue-900/5 space-y-10">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Gauge className="w-5 h-5 text-blue-600" />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Spectral Quality</h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="number"
                          min="1"
                          max="100"
                          value={Math.round(quality * 100)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) {
                              setQuality(Math.min(100, Math.max(1, val)) / 100);
                              if (result) setResult(null);
                            }
                          }}
                          className="w-16 bg-blue-50 border-none rounded-xl py-1 px-2 text-right text-xl font-black text-blue-600 tracking-tighter focus:bg-blue-100 outline-none transition-colors tabular-nums appearance-none"
                        />
                        <span className="text-xl font-black text-blue-600 tracking-tighter">%</span>
                      </div>
                    </div>

                    <div className="px-2">
                       <input 
                         type="range" 
                         min="0.1" 
                         max="1" 
                         step="0.05" 
                         value={quality}
                         onChange={(e) => {
                           setQuality(parseFloat(e.target.value));
                           if (result) setResult(null); // Clear previous result on change to force re-compress
                         }}
                         className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                       />
                       <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                         <span>High Comp</span>
                         <span>Balanced</span>
                         <span>Pristine</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {!result ? (
                      <button
                        onClick={handleCompress}
                        disabled={compressing}
                        className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black py-6 rounded-2xl text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                      >
                        {compressing ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Minimize2 className="w-5 h-5" />}
                        {compressing ? 'Recalculating...' : 'Compress Protocol'}
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <button
                          onClick={downloadResult}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-6 rounded-2xl text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-100"
                        >
                          <Download className="w-5 h-5" />
                          Download Bundle
                        </button>
                        <button
                          onClick={() => setResult(null)}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all"
                        >
                          Modify Parameters
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-medium text-indigo-700 leading-relaxed uppercase tracking-wider">
                    Target Node: Web Standards. JPG and WebP files yield the best compression ratios. PNG files will be transcoded to high-performance WebP if quality adjustments are applied.
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </PageLayout>
  );
}
