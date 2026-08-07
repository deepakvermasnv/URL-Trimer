import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/languagetool/geminiFallback';
import { LanguageToolMatch } from '@/lib/languagetool/types';

/**
 * Next.js API Route for LanguageTool Check API proxy + Gemini AI Assistant
 * Endpoint: POST /api/languagetool/check
 *
 * Calls official LanguageTool API endpoint (https://api.languagetool.org/v2/check)
 * with strict rules ('level=picky') and uses Google Gemini as an intelligent fallback
 * for advanced grammar, sentence structure, punctuation, and awkward phrasing detection.
 */

const LANGUAGETOOL_API_URL = process.env.LANGUAGETOOL_API_URL || 'https://api.languagetool.org/v2/check';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text, language = 'en-US', disabledRules = [] } = body;

    if (typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: "text" must be a string' },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json({ matches: [] });
    }

    // Build Form Data for LanguageTool API
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('language', language || 'en-US');
    params.append('level', 'picky'); // Picky level enables strict grammar & style rules
    params.append(
      'enabledCategories',
      'CASING,PUNCTUATION,TYPOS,GRAMMAR,STYLE,REPETITION,CONFUSED_WORDS,MISC'
    );
    
    if (Array.isArray(disabledRules) && disabledRules.length > 0) {
      params.append('disabledRules', disabledRules.join(','));
    }

    // Timeout signal (8 seconds timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let ltMatches: LanguageToolMatch[] = [];
    let ltSuccess = false;

    try {
      const response = await fetch(LANGUAGETOOL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: params.toString(),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (response.ok) {
        const data = await response.json();
        ltMatches = data.matches || [];
        ltSuccess = true;
      }
    } catch (ltErr) {
      console.warn('LanguageTool primary call failed, proceeding to Gemini fallback:', ltErr);
    }

    // Call Gemini as intelligent fallback for advanced corrections if API key is present
    let geminiMatches: LanguageToolMatch[] = [];
    if (process.env.GEMINI_API_KEY) {
      try {
        geminiMatches = await analyzeWithGemini(text, ltMatches);
      } catch (geminiErr) {
        console.warn('Gemini fallback check failed:', geminiErr);
      }
    }

    const mergedMatches = [...ltMatches, ...geminiMatches];

    if (!ltSuccess && mergedMatches.length === 0) {
      return NextResponse.json(
        { error: 'Grammar checking service is currently unavailable.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ matches: mergedMatches });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'LanguageTool request timed out' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to check text with LanguageTool' },
      { status: 500 }
    );
  }
}

