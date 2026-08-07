import { LanguageToolMatch } from './types';

/**
 * CacheManager
 * Implements an in-memory result cache for LanguageTool check responses
 * to maximize performance and avoid redundant network requests.
 */

interface CacheEntry {
  matches: LanguageToolMatch[];
  timestamp: number;
}

export class CacheManager {
  private static cache = new Map<string, CacheEntry>();
  private static MAX_CACHE_SIZE = 150;
  private static TTL_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Generates a cache key based on text and language code
   */
  private static generateKey(text: string, language: string = 'auto'): string {
    return `${language}:${text.length}:${this.simpleHash(text)}`;
  }

  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Get cached matches for text
   */
  public static get(text: string, language: string = 'auto'): LanguageToolMatch[] | null {
    if (!text || text.trim().length === 0) return [];
    
    const key = this.generateKey(text, language);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check expiration
    if (Date.now() - entry.timestamp > this.TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return entry.matches;
  }

  /**
   * Store matches in cache
   */
  public static set(text: string, matches: LanguageToolMatch[], language: string = 'auto'): void {
    if (!text || text.trim().length === 0) return;

    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Evict oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    const key = this.generateKey(text, language);
    this.cache.set(key, {
      matches,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  public static clear(): void {
    this.cache.clear();
  }
}
