'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Type, 
  Trash2, 
  Copy, 
  Check, 
  Clock, 
  Hash, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileText,
  RotateCcw,
  BookOpen,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Palette,
  Heading1,
  Heading2,
  Heading3,
  FileDown,
  Maximize2,
  Type as FontSizeIcon,
  ChevronDown,
  ExternalLink,
  FileBadge
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TiptapLink from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import { Extension } from '@tiptap/core';
import { LanguageToolExtension } from '@/lib/languagetool/LanguageToolExtension';
import { LanguageToolMatch } from '@/lib/languagetool/types';
import { DictionaryManager } from '@/lib/languagetool/DictionaryManager';
import { SpellCheckManager } from '@/lib/languagetool/SpellCheckManager';
import { GrammarManager } from '@/lib/languagetool/GrammarManager';
import SuggestionPopup from '@/components/languagetool/SuggestionPopup';
import LanguageToolWidget from '@/components/languagetool/LanguageToolWidget';

// Dynamic imports for heavy libraries to improve performance
const jsPDF = async () => (await import('jspdf')).default;
const html2canvas = async () => (await import('html2canvas')).default;

// Custom Font Size Extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    } as any;
  },
});

import Script from 'next/script';
import Footer from '@/components/Footer';
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import NavAction from '@/components/NavAction';
import Badge from '@/components/Badge';
import { cn } from '@/lib/utils';
import FAQSection from '@/components/FAQSection';

const WORD_COUNTER_FAQS = [
  {
    q: "What does the Word Counter tool show me?",
    a: "It counts words, characters, sentences, reading time, and readability as you type."
  },
  {
    q: "Is it free to use?",
    a: "Yes."
  },
  {
    q: "Does it save or store what I type?",
    a: "No. Everything stays inside your browser."
  },
  {
    q: "Can it tell me how easy or hard my writing is to read?",
    a: "Yes. It provides readability and estimated reading time."
  },
  {
    q: "Can I export or copy my text after checking it?",
    a: "Yes. You can copy the text or export it as a PDF."
  }
];

interface MenuBarProps {
  editor: any;
  ltMatches?: LanguageToolMatch[];
  ltLoading?: boolean;
  ltEnabled?: boolean;
  onToggleLt?: (enabled: boolean) => void;
  onRecheckLt?: () => void;
}

const MenuBar = ({
  editor,
  ltMatches = [],
  ltLoading = false,
  ltEnabled = true,
  onToggleLt = () => {},
  onRecheckLt = () => {},
}: MenuBarProps) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close dropdowns on editor focus/click
  useEffect(() => {
    if (!editor) return;
    const handleClick = () => setActiveDropdown(null);
    editor.on('focus', handleClick);
    return () => editor.off('focus', handleClick);
  }, [editor]);

  if (!editor) return null;

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (readerEvent: any) => {
          editor.chain().focus().setImage({ src: readerEvent.target.result }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
    setActiveDropdown(null);
  };

  const applyLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const colors = [
    { name: 'Default', value: '#0f172a' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Amber', value: '#d97706' },
    { name: 'Indigo', value: '#4f46e5' },
  ];

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px'];

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-4 border-b border-slate-100 bg-white sticky top-0 z-20">
      {/* Font Size Selector */}
      <div className="relative">
        <button 
          onClick={() => toggleDropdown('size')}
          aria-label="Change font size"
          aria-expanded={activeDropdown === 'size'}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest",
            activeDropdown === 'size' ? "bg-slate-200 text-slate-900" : "bg-slate-100/50 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
          )}
        >
          <FontSizeIcon className="w-3.5 h-3.5" />
          Size
          <ChevronDown className={cn("w-3 h-3 ml-1 transition-transform", activeDropdown === 'size' && "rotate-180")} />
        </button>
        
        <AnimatePresence>
          {activeDropdown === 'size' && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 p-2 bg-white rounded-2xl shadow-2xl border border-slate-100 grid grid-cols-3 gap-2 z-30 min-w-[200px]"
            >
              {fontSizes.map(size => (
                <button
                  key={size}
                  onClick={() => {
                    editor.chain().focus().setFontSize(size).run();
                    setActiveDropdown(null);
                  }}
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-blue-50 hover:text-blue-600",
                    editor.isActive('textStyle', { fontSize: size }) ? "bg-blue-50 text-blue-600" : "text-slate-500"
                  )}
                >
                  {size}
                </button>
              ))}
              <button
                onClick={() => {
                  editor.chain().focus().unsetFontSize().run();
                  setActiveDropdown(null);
                }}
                className="col-span-3 px-2 py-1.5 rounded-lg text-xs font-black text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest"
              >
                Reset Size
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Format Selector Dropdown */}
      <div className="relative">
        <button 
          onClick={() => toggleDropdown('format')}
          aria-label="Change text format"
          aria-expanded={activeDropdown === 'format'}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest min-w-[100px] justify-between",
            activeDropdown === 'format' ? "bg-slate-200 text-slate-900" : "bg-slate-100/50 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
          )}
        >
          <span className="truncate">
            {editor.isActive('heading', { level: 1 }) ? 'Heading 1' :
             editor.isActive('heading', { level: 2 }) ? 'Heading 2' :
             editor.isActive('heading', { level: 3 }) ? 'Heading 3' :
             editor.isActive('heading', { level: 4 }) ? 'Heading 4' :
             editor.isActive('heading', { level: 5 }) ? 'Heading 5' :
             editor.isActive('heading', { level: 6 }) ? 'Heading 6' :
             'Paragraph'}
          </span>
          <ChevronDown className={cn("w-3 h-3 ml-1 flex-shrink-0 transition-transform", activeDropdown === 'format' && "rotate-180")} />
        </button>

        <AnimatePresence>
          {activeDropdown === 'format' && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 p-2 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col gap-1 z-30 min-w-[160px]"
            >
              {[1, 2, 3, 4, 5, 6].map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: level as any }).run();
                    setActiveDropdown(null);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-slate-50",
                    editor.isActive('heading', { level }) ? "bg-blue-50 text-blue-600" : "text-slate-600"
                  )}
                >
                  Heading {level}
                </button>
              ))}
              <button
                onClick={() => {
                  editor.chain().focus().setParagraph().run();
                  setActiveDropdown(null);
                }}
                className={cn(
                  "w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-slate-50",
                  editor.isActive('paragraph') ? "bg-blue-50 text-blue-600" : "text-slate-600"
                )}
              >
                Paragraph
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Alignment Dropdown */}
      <div className="relative">
        <button 
          onClick={() => toggleDropdown('align')}
          aria-label="Change text alignment"
          aria-expanded={activeDropdown === 'align'}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest",
            activeDropdown === 'align' ? "bg-slate-200 text-slate-900" : "bg-slate-100/50 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
          )}
        >
          {editor.isActive({ textAlign: 'center' }) ? <AlignCenter className="w-3.5 h-3.5" /> :
           editor.isActive({ textAlign: 'right' }) ? <AlignRight className="w-3.5 h-3.5" /> :
           <AlignLeft className="w-3.5 h-3.5" />}
          Align
          <ChevronDown className={cn("w-3 h-3 ml-1 transition-transform", activeDropdown === 'align' && "rotate-180")} />
        </button>

        <AnimatePresence>
          {activeDropdown === 'align' && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 p-2 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col gap-1 z-30 min-w-[140px]"
            >
              {[
                { label: 'Left', value: 'left', icon: AlignLeft },
                { label: 'Center', value: 'center', icon: AlignCenter },
                { label: 'Right', value: 'right', icon: AlignRight },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    editor.chain().focus().setTextAlign(item.value).run();
                    setActiveDropdown(null);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-slate-50 flex items-center gap-2",
                    editor.isActive({ textAlign: item.value }) ? "bg-blue-50 text-blue-600" : "text-slate-600"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Text Format Group */}
      <div className="flex items-center bg-slate-100/50 p-1 rounded-xl gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Toggle bold"
          className={cn("p-2 rounded-lg transition-all", editor.isActive('bold') ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-900")}
          title="Bold"
        >
          <BoldIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Toggle italic"
          className={cn("p-2 rounded-lg transition-all", editor.isActive('italic') ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-900")}
          title="Italic"
        >
          <ItalicIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Toggle underline"
          className={cn("p-2 rounded-lg transition-all", editor.isActive('underline') ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-900")}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Lists */}
      <div className="flex items-center bg-slate-100/50 p-1 rounded-xl gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("p-2 rounded-lg transition-all", editor.isActive('bulletList') ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-900")}
          title="Bullet List"
        >
          <ListIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("p-2 rounded-lg transition-all", editor.isActive('orderedList') ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-900")}
          title="Ordered List"
        >
          <ListOrderedIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Insertion */}
      <div className="flex items-center bg-slate-100/50 p-1 rounded-xl gap-1">
        <button
          onClick={addImage}
          aria-label="Upload image"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-all"
          title="Upload Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            onClick={() => {
              if (showLinkInput) {
                setShowLinkInput(false);
              } else {
                const previousUrl = editor.getAttributes('link').href;
                setLinkUrl(previousUrl || '');
                setShowLinkInput(true);
                setActiveDropdown(null);
              }
            }}
            aria-label="Insert link"
            className={cn("p-2 rounded-lg transition-all", editor.isActive('link') ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-900")}
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          
          <AnimatePresence>
            {showLinkInput && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 mt-2 p-3 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 flex gap-2 min-w-[280px]"
              >
                <input
                  type="text"
                  placeholder="Paste or type URL"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applyLink();
                    if (e.key === 'Escape') setShowLinkInput(false);
                  }}
                />
                <button
                  onClick={applyLink}
                  className="px-3 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Color Picker */}
      <div className="relative">
        <button 
          onClick={() => toggleDropdown('colors')}
          aria-label="Change text color"
          className={cn(
            "p-2 rounded-xl transition-all",
            activeDropdown === 'colors' ? "bg-slate-200 text-slate-900" : "bg-slate-100/50 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
          )}
        >
          <Palette className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {activeDropdown === 'colors' && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 p-2 bg-white rounded-2xl shadow-2xl border border-slate-100 flex gap-2 z-30"
            >
              {colors.map(c => (
                <button
                  key={c.value}
                  onClick={() => {
                    editor.chain().focus().setColor(c.value).run();
                    setActiveDropdown(null);
                  }}
                  className="w-6 h-6 rounded-lg shadow-inner ring-1 ring-black/5"
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
              <button
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setActiveDropdown(null);
                }}
                className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[8px] font-black"
              >
                CLR
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LanguageTool Status & Control Widget */}
      <div className="ml-auto pl-2 border-l border-slate-200/80">
        <LanguageToolWidget
          matches={ltMatches}
          loading={ltLoading}
          enabled={ltEnabled}
          onToggle={onToggleLt}
          onRecheck={onRecheckLt}
        />
      </div>
    </div>
  );
};

export default function WordCounter() {
  const STORAGE_KEY = 'word-counter-content';
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const initialLoadedRef = React.useRef(false);

  // LanguageTool state management
  const [ltMatches, setLtMatches] = useState<LanguageToolMatch[]>([]);
  const [ltLoading, setLtLoading] = useState(false);
  const [ltEnabled, setLtEnabled] = useState(true);
  const [activeLtMatch, setActiveLtMatch] = useState<LanguageToolMatch | null>(null);
  const [ltPopupCoords, setLtPopupCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TiptapLink.configure({
        openOnClick: false,
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full h-auto my-4',
        },
      }),
      TextStyle,
      FontSize,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CharacterCount,
      LanguageToolExtension.configure({
        language: 'en-US',
        debounceMs: 600,
        enabled: true,
        onMatchesChange: (matches, loading) => {
          setLtMatches(matches);
          setLtLoading(loading);
        },
        onMatchSelect: (match, coords) => {
          setActiveLtMatch(match);
          setLtPopupCoords(coords);
        },
      }),
    ],
    content: `
      <h2>Welcome to the Premium Text Editor</h2>
      <p>Start writing your masterpiece here. Every tool you need is just a click away.</p>
      <p><strong>Pro Tip:</strong> All data stays right in your browser, keeping your writing absolutely private.</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-lg focus:outline-none max-w-none p-8 sm:p-10 min-h-[450px] leading-relaxed',
        spellcheck: 'false',
      },
    },
  });

  // Load content from localStorage on mount
  useEffect(() => {
    if (editor && mounted && !initialLoadedRef.current) {
      initialLoadedRef.current = true;
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        editor.commands.setContent(saved);
      }
    }
    // Only run once on mount when editor is ready
  }, [editor, mounted]);

  const [stats, setStats] = useState({
    characters: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0
  });

  useEffect(() => {
    if (!editor) return;
    
    const handleUpdate = () => {
      const text = editor.getText();
      const words = editor.storage.characterCount.words();
      const characters = editor.storage.characterCount.characters();
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      
      const html = editor.getHTML();
      const paragraphs = (html.match(/<p>/g) || []).length + (html.match(/<h[1-6]>/g) || []).length;
      
      const readingTime = Math.ceil(words / 200);

      setStats({
        characters,
        words,
        sentences,
        paragraphs,
        readingTime
      });

      // Save to localStorage
      if (mounted) {
        localStorage.setItem(STORAGE_KEY, html);
      }
    };

    editor.on('update', handleUpdate);
    // Initial calculation
    handleUpdate();

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, mounted]);

  const handleCopy = async () => {
    if (!editor) return;
    const text = editor.getText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    editor?.commands.clearContent();
    localStorage.removeItem(STORAGE_KEY);
  };

  const editorContainerRef = React.useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = () => {
    if (!editor) return;
    const html = editor.getHTML();
    // Wrap in full HTML template
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Document</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #334155; line-height: 1.6; }
          img { max-width: 100%; height: auto; border-radius: 8px; }
          h1, h2, h3 { color: #0f172a; }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${new Date().getTime()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePdfExport = async () => {
    if (!editor || !editorContainerRef.current) return;
    setIsExporting(true);

    try {
      const JsPDFLib = await jsPDF();
      const html2canvasLib = await html2canvas();

      // Find the tiptap element specifically for best results
      const tiptapElement = editorContainerRef.current.querySelector('.tiptap') as HTMLElement;
      const targetElement = tiptapElement || editorContainerRef.current;

      const canvas = await html2canvasLib(targetElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        // Ensure we capture everything even if scrolled
        windowWidth: targetElement.scrollWidth,
        windowHeight: targetElement.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new JsPDFLib({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`document-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setIsExporting(false);
    }
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
            Active Design Node
          </Badge>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            aria-label="Export document as HTML"
            className="px-5 py-2 rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/10 flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest hover:bg-slate-800 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            Export HTML
          </motion.button>
        </div>
      </div>

      <Hero 
        centered
        title={<>Rich Text <span className="text-blue-600">Workspace.</span></>}
        subtitle="Count words, characters, and sentences from any text with real-time analysis."
      />

      <div className="max-w-6xl mx-auto space-y-6 relative">
        {/* Sticky Horizontal Analytics Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sticky top-20 z-30 w-full bg-white/95 backdrop-blur-2xl rounded-3xl shadow-xl shadow-blue-900/5 border border-white/80 p-4 sm:p-5 transition-all hover:shadow-blue-900/10"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {[
              { label: 'Words', value: mounted ? stats.words : 0, icon: Type, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Characters', value: mounted ? stats.characters : 0, icon: Hash, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Sentences', value: mounted ? stats.sentences : 0, icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'Paragraphs', value: mounted ? stats.paragraphs : 0, icon: AlignLeft, color: 'text-sky-600', bg: 'bg-sky-50' },
              { label: 'Read Time', value: mounted ? `${stats.readingTime} min` : '0 min', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' }
            ].map((stat) => (
              <motion.div 
                key={stat.label}
                whileHover={{ y: -2, scale: 1.01 }}
                className="bg-slate-50/80 hover:bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 transition-all flex items-center gap-3 shadow-sm hover:shadow-md"
              >
                <div className={cn("p-2 rounded-xl shrink-0 shadow-sm", stat.bg)}>
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.label}</div>
                  <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight tabular-nums truncate">{stat.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Full Width Text Editor Column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ perspective: "1500px" }}
          className="w-full flex flex-col will-change-transform"
        >
          <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-white overflow-hidden flex flex-col group transition-shadow duration-500 hover:shadow-blue-900/10">
            <MenuBar
              editor={editor}
              ltMatches={ltMatches}
              ltLoading={ltLoading}
              ltEnabled={ltEnabled}
              onToggleLt={(enabled) => {
                setLtEnabled(enabled);
                editor?.commands.toggleLanguageTool(enabled);
              }}
              onRecheckLt={() => {
                editor?.commands.checkGrammarAndSpelling();
              }}
            />
            
            <div 
              ref={editorContainerRef}
              className="flex-1 overflow-y-auto min-h-[450px] max-h-[650px] custom-scrollbar relative"
            >
              {mounted ? <EditorContent editor={editor} /> : (
                <div className="p-8 sm:p-10 text-slate-300 font-medium">Initializing workspace...</div>
              )}

              {/* LanguageTool Interactive Suggestion Popup */}
              <SuggestionPopup
                match={activeLtMatch}
                coords={ltPopupCoords}
                onReplace={(match, replacement) => {
                  editor?.commands.replaceLanguageToolMatch(match, replacement);
                }}
                onIgnore={(match) => {
                  if (match.isSpelling) {
                    SpellCheckManager.ignoreSpellingMatch(match);
                  } else {
                    GrammarManager.ignoreGrammarMatch(match);
                  }
                  editor?.commands.ignoreLanguageToolMatch(match.id);
                }}
                onAddToDictionary={(word) => {
                  DictionaryManager.addWord(word);
                  editor?.commands.checkGrammarAndSpelling();
                }}
                onClose={() => {
                  editor?.commands.clearLanguageToolPopup();
                }}
              />
            </div>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collaborative Mode: Local</span>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={!isExporting ? { scale: 1.05 } : {}}
                  whileTap={!isExporting ? { scale: 0.95 } : {}}
                  onClick={handlePdfExport}
                  disabled={isExporting}
                  aria-label={isExporting ? "Exporting PDF..." : "Export document as PDF"}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                    isExporting 
                      ? "bg-slate-50 text-slate-400 cursor-not-allowed" 
                      : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                  )}
                >
                  {isExporting ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileBadge className="w-4 h-4" />
                  )}
                  {isExporting ? 'Generating...' : 'Export PDF'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClear}
                  aria-label="Clear document content"
                  className="p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                  title="Clear Document"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  aria-label={copied ? "Text copied" : "Copy text to clipboard"}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all",
                    copied ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-slate-900 text-white shadow-slate-200"
                  )}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy Text'}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

        <FAQSection 
          pageId="word-counter"
          faqs={WORD_COUNTER_FAQS}
        />

        {/* SEO Schemas */}
        <Script id="word-counter-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Online Word Counter",
            "url": "https://www.urltrim.online/tools/word-counter",
            "description": "Free online word counter tool. Count words, characters, sentences and check readability score instantly. Browser-based, private and secure.",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Word count",
              "Character count",
              "Sentence count",
              "Readability score",
              "Reading time estimation",
              "Rich text editor",
              "Export to HTML and PDF"
            ],
            "browserRequirements": "Modern web browser with JavaScript enabled",
            "isPartOf": {
              "@type": "WebSite",
              "name": "URL Trimmer",
              "url": "https://www.urltrim.online/"
            }
          })}
        </Script>
        <Script id="word-counter-breadcrumb" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.urltrim.online/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Tools",
                "item": "https://www.urltrim.online/tools"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Word Counter",
                "item": "https://www.urltrim.online/tools/word-counter"
              }
            ]
          })}
        </Script>
      </PageLayout>
  );
}
