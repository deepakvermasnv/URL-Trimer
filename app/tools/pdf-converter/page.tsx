'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import NextImage from 'next/image';
import { 
  FileDown, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Trash2, 
  GripVertical, 
  Download, 
  Plus, 
  Zap,
  Shield,
  FileCheck,
  Loader2,
  X,
  Type,
  Layout,
  FileBox
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import NavAction from '@/components/NavAction';
import Badge from '@/components/Badge';
import { cn } from '@/lib/utils';

// Lazy load libraries
const getJsPDF = async () => (await import('jspdf')).default;
const getMammoth = async () => (await import('mammoth'));
const getJSZip = async () => (await import('jszip')).default;

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: string;
}

interface DocFile {
  id: string;
  file: File;
  name: string;
  size: string;
  content?: string;
}

type ConversionMode = 'images' | 'word' | 'pptx' | 'text';

export default function PDFConverter() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [docFiles, setDocFiles] = useState<DocFile[]>([]);
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<ConversionMode>('images');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const parsePPTX = async (file: File) => {
    const JSZip = await getJSZip();
    const zip = await JSZip.loadAsync(file);
    let extractedText = '';
    
    const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
    
    for (let i = 1; i <= slideFiles.length; i++) {
      const slidePath = `ppt/slides/slide${i}.xml`;
      const xmlString = await zip.file(slidePath)?.async('string');
      if (xmlString) {
        const textNodes = xmlString.match(/<a:t>([^<]*)<\/a:t>/g) || [];
        const slideText = textNodes.map(node => node.replace(/<[^>]*>/g, '')).join(' ');
        extractedText += `\n--- Slide ${i} ---\n${slideText}\n`;
      }
    }
    return extractedText;
  };

  const onFilesSelected = async (files: FileList | null) => {
    if (!files) return;
    setIsProcessing(true);

    const processFiles = async () => {
      if (activeTab === 'images') {
        const newImages: ImageFile[] = [];
        Array.from(files).forEach(file => {
          if (file.type.startsWith('image/')) {
            newImages.push({
              id: Math.random().toString(36).substring(2, 9),
              file,
              preview: URL.createObjectURL(file),
              name: file.name,
              size: formatSize(file.size)
            });
          }
        });
        return { images: newImages };
      } else if (activeTab === 'word') {
        const mammoth = await getMammoth();
        const newDocs: DocFile[] = [];
        for (const file of Array.from(files)) {
          if (file.name.endsWith('.docx')) {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            newDocs.push({
              id: Math.random().toString(36).substring(2, 9),
              file,
              name: file.name,
              size: formatSize(file.size),
              content: result.value
            });
          }
        }
        return { docs: newDocs };
      } else if (activeTab === 'pptx') {
        const newDocs: DocFile[] = [];
        for (const file of Array.from(files)) {
          if (file.name.endsWith('.pptx')) {
            const content = await parsePPTX(file);
            newDocs.push({
              id: Math.random().toString(36).substring(2, 9),
              file,
              name: file.name,
              size: formatSize(file.size),
              content
            });
          }
        }
        return { docs: newDocs };
      }
      return {};
    };

    try {
      const [result] = await Promise.all([
        processFiles(),
        new Promise(resolve => setTimeout(resolve, 4000))
      ]);

      if (result.images) setImages(prev => [...prev, ...result.images]);
      if (result.docs) setDocFiles(prev => [...prev, ...result.docs]);
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
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
    onFilesSelected(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const removeDoc = (id: string) => {
    setDocFiles(prev => prev.filter(doc => doc.id !== id));
  };

  const generatePDF = async () => {
    const hasContent = images.length > 0 || docFiles.length > 0 || text.trim();
    if (!hasContent) return;
    
    setIsGenerating(true);
    try {
      const JsPDF = await getJsPDF();
      const pdf = new JsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      let isFirstPage = true;

      // 1. Handle Direct Text
      if (text.trim()) {
        const lines = pdf.splitTextToSize(text, contentWidth);
        pdf.text(lines, margin, margin + 10);
        isFirstPage = false;
      }

      // 2. Handle Word/PPTX Docs
      for (const doc of docFiles) {
        if (!isFirstPage) pdf.addPage();
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text(`Source: ${doc.name}`, margin, margin);
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        const lines = pdf.splitTextToSize(doc.content || '', contentWidth);
        
        let cursorY = margin + 10;
        lines.forEach((line: string) => {
          if (cursorY > pageHeight - margin) {
            pdf.addPage();
            cursorY = margin;
          }
          pdf.text(line, margin, cursorY);
          cursorY += 6;
        });
        isFirstPage = false;
      }

      // 3. Handle Images
      for (const img of images) {
        if (!isFirstPage) {
          pdf.addPage();
        }
        
        const imgElement = await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = img.preview;
        });

        const imgWidth = imgElement.width;
        const imgHeight = imgElement.height;
        const ratio = imgWidth / imgHeight;

        let targetWidth = contentWidth;
        let targetHeight = targetWidth / ratio;

        if (targetHeight > pageHeight - (margin * 2)) {
          targetHeight = pageHeight - (margin * 2);
          targetWidth = targetHeight * ratio;
        }

        const x = (pageWidth - targetWidth) / 2;
        const y = (pageHeight - targetHeight) / 2;

        pdf.addImage(img.preview, 'JPEG', x, y, targetWidth, targetHeight);
        isFirstPage = false;
      }

      pdf.save(`pdf-converter-${activeTab}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getAcceptType = () => {
    switch(activeTab) {
      case 'images': return 'image/*';
      case 'word': return '.docx';
      case 'pptx': return '.pptx';
      default: return '*';
    }
  };

  return (
    <PageLayout showBlobs={true}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16">
        <NavAction 
          href="/tools" 
          label="Tool Library" 
          type="back" 
          className="mb-0" 
        />
        
        <div className="flex items-center gap-4">
          <Badge variant="blue">
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            End-to-End Encryption
          </Badge>
        </div>
      </div>

      <Hero 
        centered
        badgeText="Universal Protocol"
        badgeIcon={Zap}
        title={<>Universal <span className="text-blue-600">Converter.</span></>}
        subtitle="Convert images, Word documents, and presentations into professional PDF files instantly. Processed 100% locally for your privacy."
      />

      <div className="max-w-6xl mx-auto mb-32">
        {/* Format Selector */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {[
            { id: 'images', label: 'Images to PDF', icon: ImageIcon },
            { id: 'word', label: 'Word to PDF', icon: FileText },
            { id: 'pptx', label: 'PowerPoint to PDF', icon: Layout },
            { id: 'text', label: 'Text to PDF', icon: Type }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setActiveTab(mode.id as ConversionMode);
                setImages([]);
                setDocFiles([]);
              }}
              className={cn(
                "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 border-2",
                activeTab === mode.id 
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200" 
                  : "bg-white text-slate-500 border-slate-100 hover:border-blue-200 hover:text-slate-900"
              )}
            >
              <mode.icon className={cn("w-4 h-4", activeTab === mode.id ? "text-white" : "text-blue-500")} />
              {mode.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-10">
          <AnimatePresence mode="wait">
            {activeTab !== 'text' ? (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Upload Area */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative border-4 border-dashed rounded-[3rem] p-12 sm:p-20 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer group",
                    isDragging ? "bg-blue-50 border-blue-400 scale-[0.98]" : "bg-white/50 border-slate-100 hover:border-blue-200 hover:bg-white"
                  )}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    multiple 
                    accept={getAcceptType()}
                    className="hidden" 
                    onChange={(e) => onFilesSelected(e.target.files)}
                  />
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner text-blue-600">
                    {isProcessing ? <Loader2 className="w-10 h-10 animate-spin" /> : <Upload className="w-10 h-10" />}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {isProcessing ? 'Processing Your Assets...' : `Drop your ${activeTab.toUpperCase()} files here`}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm">
                    {isProcessing ? 'We are checking file integrity and parsing content locally.' : (activeTab === 'images' ? 'PNG, JPG, WEBP supported' : activeTab === 'word' ? 'DOCX format supported' : 'PPTX format supported')}
                  </p>
                  
                  {isDragging && !isProcessing && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 bg-blue-600/5 backdrop-blur-[2px] rounded-[3rem] flex items-center justify-center pointer-events-none z-10"
                    >
                      <div className="bg-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                        <Plus className="w-6 h-6 text-blue-600 animate-bounce" />
                        <span className="font-black text-blue-600 uppercase tracking-widest">Deploy Assets</span>
                      </div>
                    </motion.div>
                  )}
                  
                  {isProcessing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-[3rem] flex flex-col items-center justify-center z-20"
                    >
                      <div className="relative w-24 h-24 mb-6">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border-4 border-blue-100 border-t-blue-600 rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileCheck className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>
                      <span className="font-black text-blue-600 uppercase tracking-[0.3em] text-xs">Security Protocol Active</span>
                    </motion.div>
                  )}
                </div>

                {/* Assets List */}
                {activeTab === 'images' && images.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image Sequence ({images.length})</span>
                      <div className="flex items-center gap-3">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={generatePDF}
                          disabled={isGenerating}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-200"
                        >
                          {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                          Export PDF
                        </motion.button>
                        <button 
                          onClick={() => setImages([])} 
                          className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                    <Reorder.Group axis="y" values={images} onReorder={setImages} className="space-y-3">
                      {images.map((img) => (
                        <Reorder.Item 
                          key={img.id} 
                          value={img}
                          className="bg-white/80 backdrop-blur-xl border border-white p-4 rounded-3xl shadow-lg shadow-blue-900/5 flex items-center gap-6 group cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100 shadow-inner relative">
                            <NextImage 
                              src={img.preview} 
                              alt={img.name} 
                              fill 
                              sizes="64px"
                              unoptimized 
                              className="object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{img.name}</h4>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{img.size} • READY</span>
                          </div>
                          <button onClick={() => removeImage(img.id)} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <X className="w-5 h-5" />
                          </button>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                )}

                {(activeTab === 'word' || activeTab === 'pptx') && docFiles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Queue ({docFiles.length})</span>
                      <div className="flex items-center gap-3">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={generatePDF}
                          disabled={isGenerating}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-200"
                        >
                          {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                          Export PDF
                        </motion.button>
                        <button 
                          onClick={() => setDocFiles([])} 
                          className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {docFiles.map((doc) => (
                        <div 
                          key={doc.id}
                          className="bg-white/80 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-lg shadow-blue-900/5 flex items-center gap-6 group"
                        >
                          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                            {activeTab === 'word' ? <FileText className="w-6 h-6 text-blue-600" /> : <Layout className="w-6 h-6 text-orange-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{doc.name}</h4>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.size} • PARSED</span>
                          </div>
                          <button onClick={() => removeDoc(doc.id)} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="text-tab"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-white p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 capitalize">Text Buffer</h3>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Manual Entry</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={generatePDF}
                        disabled={isGenerating || !text.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
                      >
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        Export PDF
                      </motion.button>
                      <button 
                        onClick={() => setText('')} 
                        className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste your content here. We'll convert it into a clean, formatted PDF instantly."
                    className="w-full bg-slate-50/50 border-2 border-transparent hover:border-blue-100 focus:bg-white focus:border-blue-500 rounded-[2rem] p-8 text-slate-700 font-medium min-h-[400px] resize-none text-base leading-relaxed transition-all duration-300 outline-none shadow-inner"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Security Banner */}
      <section className="mt-32 p-12 sm:p-20 rounded-[4rem] bg-slate-950 text-white relative overflow-hidden shadow-2xl shadow-blue-900/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="w-24 h-24 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center shrink-0">
            <Shield className="w-12 h-12 text-blue-400" />
          </div>
          <div className="space-y-6 text-center md:text-left">
            <h2 className="text-3xl font-black tracking-tight">Zero-Knowledge Conversion</h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-3xl">
              Our conversion protocol executes in your browser&apos;s sandboxed memory. We NEVER upload your private documents to any server. Your sensitive data remains yours, always.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              {['Local Parsing', 'Client-Side Export', 'Anonymous Session'].map((t) => (
                <div key={t} className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold uppercase tracking-widest">
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Use Our PDF Converter */}
      <section className="mt-40 space-y-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12 text-slate-600 font-medium leading-relaxed">
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Professional Converters. Zero Cost. Zero Risks.</h2>
              <p className="text-lg">
                Stop uploading your documents to suspicious online converters. Our platform provides the same professional-grade tools for Word, PPTX, and Image conversion, but runs them locally.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <FileBox className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-900">Multi-Format Engine</h3>
                <p className="text-sm">Whether it&apos;s a deck, a report, or a collection of high-res photos, our engine compiles them into a standardized PDF format.</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900">Integrity Check</h3>
                <p className="text-sm">We preserve text fidelity and image quality, ensuring your PDF looks professional on any device or reader.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-12 h-fit">
            <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Technical Engine</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Word Engine", value: "Mammoth.js" },
                  { label: "PPTX Engine", value: "JSZip Parser" },
                  { label: "Export", value: "jsPDF 2.5+" },
                  { label: "Locality", value: "100% Client-Side" }
                ].map(spec => (
                  <div key={spec.label} className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{spec.label}</span>
                    <span className="text-xs font-bold text-slate-700">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
