'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  X, 
  BookPlus, 
  EyeOff, 
  Sparkles, 
  AlertCircle, 
  Wand2,
  HelpCircle
} from 'lucide-react';
import { LanguageToolMatch } from '@/lib/languagetool/types';
import { cn } from '@/lib/utils';

interface SuggestionPopupProps {
  match: LanguageToolMatch | null;
  coords: { top: number; left: number } | null;
  onReplace: (match: LanguageToolMatch, replacement: string) => void;
  onIgnore: (match: LanguageToolMatch) => void;
  onAddToDictionary: (word: string) => void;
  onClose: () => void;
}

export default function SuggestionPopup({
  match,
  coords,
  onReplace,
  onIgnore,
  onAddToDictionary,
  onClose,
}: SuggestionPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!match || !coords) return null;

  const isSpelling = match.isSpelling;
  const word = match.word || '';
  const replacements = match.replacements?.slice(0, 5) || [];
  const ruleTitle = match.shortMessage || match.rule?.description || (isSpelling ? 'Spelling Mistake' : 'Grammar Issue');

  // Adjust popup position for fixed viewport positioning
  const popupWidth = 320;
  const popupHeight = 220;
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  const adjustedLeft = Math.max(16, Math.min(coords.left, screenWidth - popupWidth - 16));
  let adjustedTop = coords.top + 6;

  // Flip popup above if it would overflow the bottom of viewport
  if (adjustedTop + popupHeight > screenHeight - 16) {
    adjustedTop = Math.max(16, coords.top - popupHeight - 24);
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={popupRef}
        initial={{ opacity: 0, y: 6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.96 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: `${adjustedTop}px`,
          left: `${adjustedLeft}px`,
          zIndex: 9999,
        }}
        className={cn(
          "w-80 rounded-2xl shadow-2xl border backdrop-blur-xl p-4 transition-colors",
          "bg-white/95 dark:bg-slate-900/95 border-slate-200/90 dark:border-slate-800",
          "text-slate-900 dark:text-slate-100 ring-1 ring-black/5"
        )}
      >
        {/* Header Badge & Title */}
        <div className="flex items-start justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                "p-1.5 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold",
                isSpelling
                  ? "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                  : "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
              )}
            >
              {isSpelling ? <AlertCircle className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
            </span>
            <div className="min-w-0">
              <h4 className="text-xs font-bold leading-snug truncate text-slate-900 dark:text-slate-100">
                {ruleTitle}
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase tracking-wider font-semibold">
                {isSpelling ? 'Spelling Check' : (match.rule?.category?.name || 'Grammar & Style')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Issue Explanation */}
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
          {match.message}
        </p>

        {/* Suggestions List */}
        {replacements.length > 0 ? (
          <div className="space-y-1.5 mb-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Suggestions:
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-0.5">
              {replacements.map((rep, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onReplace(match, rep.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm border",
                    isSpelling
                      ? "bg-red-500/10 hover:bg-red-500 text-red-700 hover:text-white border-red-200/50 dark:border-red-900/40 dark:text-red-300"
                      : "bg-blue-500/10 hover:bg-blue-500 text-blue-700 hover:text-white border-blue-200/50 dark:border-blue-900/40 dark:text-blue-300"
                  )}
                >
                  <Check className="w-3 h-3 opacity-70" />
                  <span>{rep.value}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs italic text-slate-400 mb-3 px-1">
            No automated replacements available.
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={() => onIgnore(match)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            <span>Ignore</span>
          </button>

          {isSpelling && word && (
            <button
              onClick={() => onAddToDictionary(word)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              title={`Add "${word}" to personal dictionary`}
            >
              <BookPlus className="w-3.5 h-3.5" />
              <span>Add to Dictionary</span>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
