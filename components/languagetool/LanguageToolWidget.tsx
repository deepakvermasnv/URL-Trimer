'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  BookMarked, 
  Trash2, 
  X,
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { LanguageToolMatch } from '@/lib/languagetool/types';
import { DictionaryManager } from '@/lib/languagetool/DictionaryManager';
import { cn } from '@/lib/utils';

interface LanguageToolWidgetProps {
  matches: LanguageToolMatch[];
  loading: boolean;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onRecheck: () => void;
}

export default function LanguageToolWidget({
  matches,
  loading,
  enabled,
  onToggle,
  onRecheck,
}: LanguageToolWidgetProps) {
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [dictionaryWords, setDictionaryWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const spellingCount = matches.filter((m) => m.isSpelling).length;
  const grammarCount = matches.filter((m) => !m.isSpelling).length;
  const totalCount = matches.length;

  const handleOpenDictionary = () => {
    const dict = Array.from(DictionaryManager.getDictionary());
    setDictionaryWords(dict);
    setShowDictionaryModal(true);
  };

  const handleRemoveWord = (word: string) => {
    DictionaryManager.removeWord(word);
    setDictionaryWords((prev) => prev.filter((w) => w !== word));
    onRecheck();
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    DictionaryManager.addWord(newWord.trim());
    setDictionaryWords(Array.from(DictionaryManager.getDictionary()));
    setNewWord('');
    onRecheck();
  };

  return (
    <div className="flex items-center gap-2.5">
      {/* Main Status Pill */}
      <div
        className={cn(
          "flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all shadow-xs",
          !enabled
            ? "bg-slate-100 text-slate-400 border-slate-200"
            : loading
            ? "bg-blue-50 text-blue-600 border-blue-200"
            : totalCount === 0
            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
            : "bg-amber-50 text-amber-800 border-amber-200/80"
        )}
      >
        {!enabled ? (
          <>
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Grammar Off</span>
          </>
        ) : loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
            <span>Checking...</span>
          </>
        ) : totalCount === 0 ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Grammar & Spelling Clean</span>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              {totalCount} Issue{totalCount > 1 ? 's' : ''} (
              {spellingCount > 0 && `${spellingCount} spelling`}
              {spellingCount > 0 && grammarCount > 0 && ', '}
              {grammarCount > 0 && `${grammarCount} grammar`})
            </span>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-full border border-slate-200/80 shadow-2xs">
        <button
          onClick={onRecheck}
          disabled={!enabled || loading}
          className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-white transition-all disabled:opacity-40 cursor-pointer"
          title="Re-check Document"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
        </button>

        <button
          onClick={handleOpenDictionary}
          className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
          title="Personal Dictionary"
        >
          <BookMarked className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onToggle(!enabled)}
          className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
          title={enabled ? "Disable Grammar Checker" : "Enable Grammar Checker"}
        >
          {enabled ? (
            <ToggleRight className="w-4 h-4 text-[#0066FF]" />
          ) : (
            <ToggleLeft className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      {/* Personal Dictionary Portal Modal */}
      {showDictionaryModal && mounted && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-slate-900 relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-2xl text-[#0066FF] border border-blue-100 shrink-0">
                    <BookMarked className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      Personal Dictionary
                    </h3>
                    <p className="text-xs text-slate-500 font-normal">
                      Words added here will not be marked as spelling mistakes.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDictionaryModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Add Word Form */}
              <form onSubmit={handleAddWord} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom word..."
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-full text-xs font-medium bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#0066FF] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  Add
                </button>
              </form>

              {/* Dictionary Word List */}
              <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {dictionaryWords.length === 0 ? (
                  <div className="text-center py-8 text-xs font-medium text-slate-400 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                    No words added to dictionary yet.
                  </div>
                ) : (
                  dictionaryWords.map((word) => (
                    <div
                      key={word}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700"
                    >
                      <span>{word}</span>
                      <button
                        onClick={() => handleRemoveWord(word)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors p-1.5 rounded-lg cursor-pointer"
                        title="Remove word"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowDictionaryModal(false)}
                  className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
