'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
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
import Footer from '@/components/Footer';

const SUPPORTED_FORMATS = [
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
      const img = new Image();
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
  };

  return (
    <div className="min-h-screen blue-gradient-bg selection:bg-blue-100 selection:text-blue-900 relative">
      <div className="absolute inset-x-0 top-0 h-[500px] pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-[20%] right-[-5%] w-64 h-64 bg-indigo-400/10 rounded-full blur-[80px] animate-float opacity-50" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 sm:py-24 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16">
          <Link href="/tools" className="inline-flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Tool Library
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="px-5 py-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-blue-900/5 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Local Transformer
            </div>
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl sm:text-7xl font-black text-slate-900 tracking-tighter mb-6">
            Image <span className="text-blue-600">Converter.</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Convert graphics between PNG, JPG, WebP and more. Private, local processing with high-fidelity output.
          </p>
        </motion.div>

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
                <FileUp className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">Drop Image Protocol</h2>
              <p className="text-slate-400 font-medium max-w-xs mx-auto">Drag and drop your image file here or click to browse local storage.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Preview Column */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 aspect-square relative overflow-hidden flex items-center justify-center">
                  {preview && (
                    <img src={preview} alt="Source" className="max-w-full max-h-full object-contain rounded-xl" />
                  )}
                  <div className="absolute top-6 left-6 py-1.5 px-4 rounded-full bg-slate-900/10 backdrop-blur-xl border border-white/20 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                    Source Manifest
                  </div>
                </div>
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
                    <div className="flex items-center gap-3">
                      <Settings2 className="w-5 h-5 text-blue-600" />
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Target Format</h3>
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
                        {converting ? 'Processing...' : 'Execute Conversion'}
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <button
                          onClick={downloadResult}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-6 rounded-2xl text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-100"
                        >
                          <Download className="w-5 h-5" />
                          Download Result
                        </button>
                        <button
                          onClick={() => setResult(null)}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all"
                        >
                          New Operation
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
      </div>
      <Footer />
    </div>
  );
}
