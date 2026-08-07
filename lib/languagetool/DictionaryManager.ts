/**
 * DictionaryManager
 * Manages user's personal custom dictionary and ignored rules/matches
 * using localStorage for client-side persistence.
 */

const DICTIONARY_STORAGE_KEY = 'languagetool_personal_dictionary';
const IGNORED_MATCHES_KEY = 'languagetool_ignored_matches';

export class DictionaryManager {
  private static dictionaryCache: Set<string> | null = null;
  private static ignoredMatchesCache: Set<string> | null = null;

  /**
   * Get set of user added custom dictionary words (lowercased)
   */
  public static getDictionary(): Set<string> {
    if (this.dictionaryCache) return this.dictionaryCache;
    if (typeof window === 'undefined') return new Set();

    try {
      const saved = localStorage.getItem(DICTIONARY_STORAGE_KEY);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        this.dictionaryCache = new Set(parsed.map(w => w.toLowerCase()));
      } else {
        this.dictionaryCache = new Set();
      }
    } catch (e) {
      console.error('Failed to load personal dictionary:', e);
      this.dictionaryCache = new Set();
    }
    return this.dictionaryCache;
  }

  /**
   * Add a word to personal dictionary
   */
  public static addWord(word: string): void {
    if (!word || !word.trim()) return;
    const cleanWord = word.trim().toLowerCase();
    const dict = this.getDictionary();
    dict.add(cleanWord);
    this.saveDictionary();
  }

  /**
   * Remove a word from personal dictionary
   */
  public static removeWord(word: string): void {
    const cleanWord = word.trim().toLowerCase();
    const dict = this.getDictionary();
    if (dict.delete(cleanWord)) {
      this.saveDictionary();
    }
  }

  /**
   * Check if a word is in personal dictionary
   */
  public static hasWord(word: string): boolean {
    if (!word) return false;
    const cleanWord = word.trim().toLowerCase();
    return this.getDictionary().has(cleanWord);
  }

  /**
   * Ignore a specific match by ID or word signature
   */
  public static ignoreMatch(matchIdOrWord: string): void {
    const ignored = this.getIgnoredMatches();
    ignored.add(matchIdOrWord.toLowerCase());
    this.saveIgnoredMatches();
  }

  /**
   * Check if match or word is ignored
   */
  public static isIgnored(matchIdOrWord: string): boolean {
    return this.getIgnoredMatches().has(matchIdOrWord.toLowerCase());
  }

  public static getIgnoredMatches(): Set<string> {
    if (this.ignoredMatchesCache) return this.ignoredMatchesCache;
    if (typeof window === 'undefined') return new Set();

    try {
      const saved = localStorage.getItem(IGNORED_MATCHES_KEY);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        this.ignoredMatchesCache = new Set(parsed.map(i => i.toLowerCase()));
      } else {
        this.ignoredMatchesCache = new Set();
      }
    } catch (e) {
      console.error('Failed to load ignored matches:', e);
      this.ignoredMatchesCache = new Set();
    }
    return this.ignoredMatchesCache;
  }

  private static saveDictionary(): void {
    if (typeof window === 'undefined' || !this.dictionaryCache) return;
    try {
      const array = Array.from(this.dictionaryCache);
      localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(array));
    } catch (e) {
      console.error('Failed to save dictionary:', e);
    }
  }

  private static saveIgnoredMatches(): void {
    if (typeof window === 'undefined' || !this.ignoredMatchesCache) return;
    try {
      const array = Array.from(this.ignoredMatchesCache);
      localStorage.setItem(IGNORED_MATCHES_KEY, JSON.stringify(array));
    } catch (e) {
      console.error('Failed to save ignored matches:', e);
    }
  }

  public static clearAll(): void {
    this.dictionaryCache = new Set();
    this.ignoredMatchesCache = new Set();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DICTIONARY_STORAGE_KEY);
      localStorage.removeItem(IGNORED_MATCHES_KEY);
    }
  }
}
