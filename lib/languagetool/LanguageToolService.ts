import { LanguageToolMatch, LanguageToolCheckResponse, CheckOptions } from './types';
import { CacheManager } from './CacheManager';
import { DictionaryManager } from './DictionaryManager';

/**
 * LanguageToolService
 * Handles text checking, caching, batching, retry logic,
 * and dictionary filtering.
 */

export class LanguageToolService {
  private static activeController: AbortController | null = null;

  /**
   * Categorizes a match as spelling error vs grammar/style issue
   */
  public static isSpellingIssue(match: LanguageToolMatch): boolean {
    const issueType = match.rule?.issueType?.toLowerCase() || '';
    const categoryId = match.rule?.category?.id?.toUpperCase() || '';
    
    return (
      issueType === 'misspelling' ||
      issueType === 'spelling' ||
      categoryId === 'TYPOS' ||
      categoryId === 'SPELLING'
    );
  }

  /**
   * Extracts target misspelled word from match context
   */
  public static extractWord(match: LanguageToolMatch, fullText: string): string {
    if (match.offset >= 0 && match.length > 0 && match.offset + match.length <= fullText.length) {
      return fullText.slice(match.offset, match.offset + match.length);
    }
    return '';
  }

  /**
   * Main text checking method with caching, retry logic, and error handling
   */
  public static async checkText(
    text: string,
    options: CheckOptions = {}
  ): Promise<{ matches: LanguageToolMatch[]; error?: string }> {
    if (!text || text.trim().length === 0) {
      return { matches: [] };
    }

    const language = options.language || 'en-US';

    // 1. Check Cache unless forced
    if (!options.force) {
      const cached = CacheManager.get(text, language);
      if (cached) {
        return { matches: this.filterIgnoredAndDictionary(cached, text) };
      }
    }

    // Cancel any in-flight request to avoid race conditions
    if (this.activeController) {
      this.activeController.abort();
    }
    this.activeController = new AbortController();

    // Retry configuration
    const maxRetries = 2;
    let attempt = 0;
    let lastError = '';

    while (attempt <= maxRetries) {
      try {
        const response = await fetch('/api/languagetool/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            language,
            disabledRules: options.disabledRules || [],
          }),
          signal: this.activeController.signal,
        });

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }

        const data: LanguageToolCheckResponse = await response.json();
        const rawMatches = data.matches || [];

        // Enrich matches with unique id, isSpelling and extracted word
        const enrichedMatches: LanguageToolMatch[] = rawMatches.map((m, idx) => {
          const isSpelling = m.isSpelling !== undefined ? m.isSpelling : this.isSpellingIssue(m);
          const word = m.word || this.extractWord(m, text);
          return {
            ...m,
            id: m.id || `lt-${idx}-${m.offset}-${m.length}`,
            isSpelling,
            word,
          };
        });

        // Save to cache
        CacheManager.set(text, enrichedMatches, language);

        // Filter dictionary & ignored
        const filteredMatches = this.filterIgnoredAndDictionary(enrichedMatches, text);

        return { matches: filteredMatches };
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return { matches: [] };
        }

        lastError = err.message || 'Check failed';
        attempt++;

        if (attempt <= maxRetries) {
          // Wait before retrying (backoff 300ms, 600ms)
          await new Promise((res) => setTimeout(res, attempt * 300));
        }
      }
    }

    // Fallback: If API proxy route fails, attempt direct call to public endpoint as graceful fallback
    try {
      const fallbackResult = await this.directFallbackCheck(text, language, options.disabledRules);
      return { matches: this.filterIgnoredAndDictionary(fallbackResult, text) };
    } catch {
      return { matches: [], error: lastError };
    }
  }

  /**
   * Direct fallback to public LanguageTool endpoint if local API route has issues
   */
  private static async directFallbackCheck(
    text: string,
    language: string,
    disabledRules?: string[]
  ): Promise<LanguageToolMatch[]> {
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('language', language);
    if (disabledRules && disabledRules.length > 0) {
      params.append('disabledRules', disabledRules.join(','));
    }

    const res = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!res.ok) throw new Error('Direct LanguageTool fallback failed');
    const data: LanguageToolCheckResponse = await res.json();
    return (data.matches || []).map((m, idx) => ({
      ...m,
      id: m.id || `lt-fb-${idx}-${m.offset}-${m.length}`,
      isSpelling: this.isSpellingIssue(m),
      word: this.extractWord(m, text),
    }));
  }

  /**
   * Filters out matches that exist in personal dictionary or ignored list
   */
  public static filterIgnoredAndDictionary(
    matches: LanguageToolMatch[],
    fullText: string
  ): LanguageToolMatch[] {
    return matches.filter((match) => {
      const word = match.word || this.extractWord(match, fullText);

      // Check personal dictionary for spelling errors
      if (match.isSpelling && word && DictionaryManager.hasWord(word)) {
        return false;
      }

      // Check if match ID or word is explicitly ignored
      if (match.id && DictionaryManager.isIgnored(match.id)) {
        return false;
      }
      if (word && DictionaryManager.isIgnored(word)) {
        return false;
      }

      return true;
    });
  }
}
