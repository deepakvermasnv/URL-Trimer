'use client';

import React, { useState } from 'react';
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
    <div className="flex items-center gap-3">
      {/* Main Status Pill */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm",
          !enabled
            ? "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
            : loading
            ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800"
            : totalCount === 0
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800"
            : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800"
        )}
      >
        {!enabled ? (
          <>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Grammar Check Off</span>
          </>
        ) : loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span>Checking document...</span>
          </>
        ) : totalCount === 0 ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Grammar & Spelling Clean</span>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
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
      <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
        <button
          onClick={onRecheck}
          disabled={!enabled || loading}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
          title="Re-check Document"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
        </button>

        <button
          onClick={handleOpenDictionary}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
          title="Personal Dictionary"
        >
          <BookMarked className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onToggle(!enabled)}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
          title={enabled ? "Disable Grammar Checker" : "Enable Grammar Checker"}
        >
          {enabled ? (
            <ToggleRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <ToggleLeft className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      {/* Personal Dictionary Modal */}
      <AnimatePresence>
        {showDictionaryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
                    <BookMarked className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Personal Dictionary
                    </h3>
                    <p className="text-xs text-slate-400">
                      Words added here will not be marked as spelling mistakes.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDictionaryModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Add Word Form */}
              <form onSubmit={handleAddWord} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom word..."
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                >
                  Add
                </button>
              </form>

              {/* Dictionary Word List */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {dictionaryWords.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No words added to dictionary yet.
                  </div>
                ) : (
                  dictionaryWords.map((word) => (
                    <div
                      key={word}
                      className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      <span>{word}</span>
                      <button
                        onClick={() => handleRemoveWord(word)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Remove word"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowDictionaryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
