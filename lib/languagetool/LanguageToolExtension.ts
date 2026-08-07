import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { LanguageToolMatch, CheckOptions } from './types';
import { LanguageToolService } from './LanguageToolService';
import { HighlightRenderer } from './HighlightRenderer';

export const languageToolPluginKey = new PluginKey<LanguageToolPluginState>('languagetool');

export interface LanguageToolPluginState {
  matches: LanguageToolMatch[];
  decorations: DecorationSet;
  loading: boolean;
  error: string | null;
  enabled: boolean;
  activeMatch: LanguageToolMatch | null;
  popupCoords: { top: number; left: number } | null;
}

export interface LanguageToolOptions {
  language?: string;
  debounceMs?: number;
  enabled?: boolean;
  onMatchesChange?: (matches: LanguageToolMatch[], loading: boolean) => void;
  onMatchSelect?: (match: LanguageToolMatch | null, coords: { top: number; left: number } | null) => void;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    languageTool: {
      /** Trigger manual check */
      checkGrammarAndSpelling: () => ReturnType;
      /** Toggle language tool enabled/disabled */
      toggleLanguageTool: (enabled?: boolean) => ReturnType;
      /** Ignore a match */
      ignoreLanguageToolMatch: (matchId: string) => ReturnType;
      /** Replace match with selected replacement */
      replaceLanguageToolMatch: (match: LanguageToolMatch, replacement: string) => ReturnType;
      /** Clear active popup */
      clearLanguageToolPopup: () => ReturnType;
    };
  }
}

export const LanguageToolExtension = Extension.create<LanguageToolOptions>({
  name: 'languageTool',

  addOptions() {
    return {
      language: 'en-US',
      debounceMs: 600,
      enabled: true,
      onMatchesChange: undefined,
      onMatchSelect: undefined,
    };
  },

  addCommands() {
    return {
      checkGrammarAndSpelling:
        () =>
        ({ editor }) => {
          const pluginState = languageToolPluginKey.getState(editor.state);
          if (pluginState && pluginState.enabled) {
            triggerCheck(editor, this.options);
          }
          return true;
        },

      toggleLanguageTool:
        (enabled) =>
        ({ editor, tr }) => {
          const currentState = languageToolPluginKey.getState(editor.state);
          const nextEnabled = enabled !== undefined ? enabled : !currentState?.enabled;

          const newState: Partial<LanguageToolPluginState> = {
            enabled: nextEnabled,
            matches: nextEnabled ? currentState?.matches || [] : [],
            decorations: nextEnabled ? currentState?.decorations || DecorationSet.empty : DecorationSet.empty,
            activeMatch: null,
            popupCoords: null,
          };

          tr.setMeta(languageToolPluginKey, newState);
          if (nextEnabled) {
            triggerCheck(editor, this.options);
          }
          return true;
        },

      ignoreLanguageToolMatch:
        (matchId) =>
        ({ editor, tr }) => {
          const currentState = languageToolPluginKey.getState(editor.state);
          if (!currentState) return false;

          const updatedMatches = currentState.matches.filter((m) => m.id !== matchId && m.word !== matchId);
          const decorations = buildDecorations(editor.state.doc, updatedMatches);

          tr.setMeta(languageToolPluginKey, {
            matches: updatedMatches,
            decorations,
            activeMatch: null,
            popupCoords: null,
          });

          if (this.options.onMatchesChange) {
            this.options.onMatchesChange(updatedMatches, false);
          }
          if (this.options.onMatchSelect) {
            this.options.onMatchSelect(null, null);
          }

          return true;
        },

      replaceLanguageToolMatch:
        (match, replacement) =>
        ({ editor, tr }) => {
          if (!match.from || !match.to) return false;

          // Replace content in ProseMirror document preserving selection
          editor.chain().focus().insertContentAt({ from: match.from, to: match.to }, replacement).run();

          // Clear popup state
          const currentState = languageToolPluginKey.getState(editor.state);
          if (currentState) {
            const updatedMatches = currentState.matches.filter((m) => m.id !== match.id);
            const decorations = buildDecorations(editor.state.doc, updatedMatches);

            tr.setMeta(languageToolPluginKey, {
              matches: updatedMatches,
              decorations,
              activeMatch: null,
              popupCoords: null,
            });

            if (this.options.onMatchesChange) {
              this.options.onMatchesChange(updatedMatches, false);
            }
            if (this.options.onMatchSelect) {
              this.options.onMatchSelect(null, null);
            }
          }

          return true;
        },

      clearLanguageToolPopup:
        () =>
        ({ editor, tr }) => {
          const currentState = languageToolPluginKey.getState(editor.state);
          if (currentState?.activeMatch) {
            tr.setMeta(languageToolPluginKey, {
              activeMatch: null,
              popupCoords: null,
            });
            if (this.options.onMatchSelect) {
              this.options.onMatchSelect(null, null);
            }
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const options = this.options;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    return [
      new Plugin<LanguageToolPluginState>({
        key: languageToolPluginKey,

        state: {
          init(_, state) {
            return {
              matches: [],
              decorations: DecorationSet.empty,
              loading: false,
              error: null,
              enabled: options.enabled ?? true,
              activeMatch: null,
              popupCoords: null,
            };
          },

          apply(tr, oldState, _, newState) {
            const meta = tr.getMeta(languageToolPluginKey);

            // Handle metadata updates dispatched via commands
            if (meta) {
              return {
                ...oldState,
                ...meta,
              };
            }

            // Map existing decorations as document changes
            if (tr.docChanged && oldState.decorations !== DecorationSet.empty) {
              const mappedDecorations = oldState.decorations.map(tr.mapping, tr.doc);
              
              // Also map `from` and `to` on match objects
              const mappedMatches = oldState.matches.map((match) => {
                if (match.from && match.to) {
                  const newFrom = tr.mapping.map(match.from);
                  const newTo = tr.mapping.map(match.to);
                  return { ...match, from: newFrom, to: newTo };
                }
                return match;
              });

              return {
                ...oldState,
                decorations: mappedDecorations,
                matches: mappedMatches,
              };
            }

            return oldState;
          },
        },

        props: {
          decorations(state) {
            return this.getState(state)?.decorations || DecorationSet.empty;
          },

          handleClick(view, pos, event) {
            const pluginState = languageToolPluginKey.getState(view.state);
            if (!pluginState || !pluginState.enabled || pluginState.matches.length === 0) {
              return false;
            }

            // Find if target clicked element or position matches any issue match
            const targetEl = event.target as HTMLElement;
            const clickedSpan = targetEl?.closest('.lt-spelling-error, .lt-grammar-error') as HTMLElement | null;

            let matchedItem: LanguageToolMatch | null = null;

            if (clickedSpan) {
              const matchId = clickedSpan.getAttribute('data-lt-id');
              if (matchId) {
                matchedItem = pluginState.matches.find((m) => m.id === matchId) || null;
              }
            }

            if (!matchedItem) {
              // Check by document position `pos` (with 1 char tolerance)
              matchedItem =
                pluginState.matches.find(
                  (m) => m.from !== undefined && m.to !== undefined && pos >= m.from - 1 && pos <= m.to + 1
                ) || null;
            }

            if (matchedItem) {
              let top = event.clientY;
              let left = event.clientX;

              if (clickedSpan) {
                const rect = clickedSpan.getBoundingClientRect();
                top = rect.bottom;
                left = rect.left;
              }

              // Use fixed viewport coordinates
              const coords = { top, left };

              const tr = view.state.tr;
              tr.setMeta(languageToolPluginKey, {
                activeMatch: matchedItem,
                popupCoords: coords,
              });
              view.dispatch(tr);

              if (options.onMatchSelect) {
                options.onMatchSelect(matchedItem, coords);
              }
              return true;
            } else if (pluginState.activeMatch) {
              // Dismiss popup on clicking elsewhere
              const tr = view.state.tr;
              tr.setMeta(languageToolPluginKey, {
                activeMatch: null,
                popupCoords: null,
              });
              view.dispatch(tr);

              if (options.onMatchSelect) {
                options.onMatchSelect(null, null);
              }
            }

            return false;
          },
        },

        view(editorView) {
          // Trigger check when plugin initializes
          if (options.enabled) {
            scheduleCheck(editorView, options);
          }

          return {
            update(view, prevState) {
              const state = view.state;
              const prevDoc = prevState.doc;

              // If doc content changed and plugin enabled, schedule debounced check
              if (prevDoc !== state.doc) {
                const pluginState = languageToolPluginKey.getState(state);
                if (pluginState && pluginState.enabled) {
                  if (debounceTimer) clearTimeout(debounceTimer);
                  debounceTimer = setTimeout(() => {
                    scheduleCheck(view, options);
                  }, options.debounceMs || 600);
                }
              }
            },
            destroy() {
              if (debounceTimer) clearTimeout(debounceTimer);
            },
          };
        },
      }),
    ];
  },
});

/**
 * Builds inline decorations for ProseMirror document from matches
 */
function buildDecorations(doc: any, matches: LanguageToolMatch[]): DecorationSet {
  const decos: Decoration[] = [];

  matches.forEach((match) => {
    if (match.from !== undefined && match.to !== undefined && match.from < match.to) {
      const isSpelling = match.isSpelling;
      const className = isSpelling ? 'lt-spelling-error' : 'lt-grammar-error';

      decos.push(
        Decoration.inline(match.from, match.to, {
          class: className,
          'data-lt-id': match.id,
          'data-lt-word': match.word || '',
          'data-lt-title': match.message || '',
        })
      );
    }
  });

  return DecorationSet.create(doc, decos);
}

/**
 * Triggers asynchronous check with LanguageToolService and dispatches state update
 */
async function scheduleCheck(view: any, options: LanguageToolOptions) {
  const doc = view.state.doc;
  const { text, indexToPos } = HighlightRenderer.extractTextAndMap(doc);

  if (!text.trim()) {
    const tr = view.state.tr;
    tr.setMeta(languageToolPluginKey, {
      matches: [],
      decorations: DecorationSet.empty,
      loading: false,
      error: null,
    });
    view.dispatch(tr);
    if (options.onMatchesChange) options.onMatchesChange([], false);
    return;
  }

  // Set loading state
  const loadingTr = view.state.tr;
  loadingTr.setMeta(languageToolPluginKey, { loading: true });
  view.dispatch(loadingTr);
  if (options.onMatchesChange) options.onMatchesChange([], true);

  const checkResult = await LanguageToolService.checkText(text, {
    language: options.language || 'en-US',
  });

  // Re-verify document hasn't changed dramatically or plugin disabled
  const currentDoc = view.state.doc;
  const currentMapping = HighlightRenderer.extractTextAndMap(currentDoc);
  const mappedMatches = HighlightRenderer.mapMatchesToProseMirrorPositions(
    checkResult.matches,
    currentMapping
  );

  const decorations = buildDecorations(currentDoc, mappedMatches);

  const updateTr = view.state.tr;
  updateTr.setMeta(languageToolPluginKey, {
    matches: mappedMatches,
    decorations,
    loading: false,
    error: checkResult.error || null,
  });
  view.dispatch(updateTr);

  if (options.onMatchesChange) {
    options.onMatchesChange(mappedMatches, false);
  }
}

function triggerCheck(editor: any, options: LanguageToolOptions) {
  if (editor?.view) {
    scheduleCheck(editor.view, options);
  }
}
