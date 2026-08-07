import { LanguageToolMatch } from './types';
import { DictionaryManager } from './DictionaryManager';

/**
 * GrammarManager
 * Manages grammar, style, punctuation, and typographical check logic.
 */
export class GrammarManager {
  /**
   * Filter matches down to grammar & style errors only (non-spelling)
   */
  public static getGrammarMatches(matches: LanguageToolMatch[]): LanguageToolMatch[] {
    return matches.filter((m) => !m.isSpelling);
  }

  /**
   * Ignore a specific grammar suggestion
   */
  public static ignoreGrammarMatch(match: LanguageToolMatch): void {
    if (match.id) {
      DictionaryManager.ignoreMatch(match.id);
    }
  }

  /**
   * Formats rule description and suggestions for UI popup
   */
  public static formatIssueSummary(match: LanguageToolMatch): {
    title: string;
    description: string;
    category: string;
  } {
    const categoryName = match.rule?.category?.name || 'Grammar';
    const title = match.shortMessage || match.rule?.description || 'Grammar Suggestion';
    const description = match.message || 'Consider revising this phrase.';

    return {
      title,
      description,
      category: categoryName,
    };
  }
}
