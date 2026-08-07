import { LanguageToolMatch } from './types';
import { LanguageToolService } from './LanguageToolService';
import { DictionaryManager } from './DictionaryManager';

/**
 * SpellCheckManager
 * Manages spelling-specific check logic, suggestion handling, and personal dictionary operations.
 */
export class SpellCheckManager {
  /**
   * Filter matches down to spelling errors only
   */
  public static getSpellingMatches(matches: LanguageToolMatch[]): LanguageToolMatch[] {
    return matches.filter((m) => m.isSpelling);
  }

  /**
   * Add misspelled word from a match to dictionary
   */
  public static addWordToDictionary(match: LanguageToolMatch, fullText: string): string {
    const word = match.word || LanguageToolService.extractWord(match, fullText);
    if (word) {
      DictionaryManager.addWord(word);
    }
    return word;
  }

  /**
   * Ignore spelling match
   */
  public static ignoreSpellingMatch(match: LanguageToolMatch): void {
    if (match.id) {
      DictionaryManager.ignoreMatch(match.id);
    }
    if (match.word) {
      DictionaryManager.ignoreMatch(match.word);
    }
  }
}
