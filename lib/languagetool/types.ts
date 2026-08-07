export interface LanguageToolReplacement {
  value: string;
}

export interface LanguageToolRuleCategory {
  id: string;
  name: string;
}

export interface LanguageToolRule {
  id: string;
  description: string;
  issueType?: string; // 'misspelling', 'grammar', 'style', 'typographical', etc.
  category: LanguageToolRuleCategory;
}

export interface LanguageToolMatch {
  id: string;
  message: string;
  shortMessage?: string;
  offset: number;
  length: number;
  replacements: LanguageToolReplacement[];
  rule: LanguageToolRule;
  context: {
    text: string;
    offset: number;
    length: number;
  };
  // Processed ProseMirror positions
  from?: number;
  to?: number;
  isSpelling?: boolean;
  word?: string;
}

export interface LanguageToolCheckResponse {
  software?: {
    name: string;
    version: string;
  };
  warnings?: {
    incompleteResults: boolean;
  };
  language?: {
    name: string;
    code: string;
    detectedLanguage?: {
      name: string;
      code: string;
    };
  };
  matches: LanguageToolMatch[];
}

export interface CheckOptions {
  language?: string;
  disabledRules?: string[];
  force?: boolean;
}
