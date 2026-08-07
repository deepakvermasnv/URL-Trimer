import { GoogleGenAI, Type } from "@google/genai";
import { LanguageToolMatch } from "./types";

/**
 * Gemini Fallback Proofreader
 * Server-side AI assistant using Google Gemini (@google/genai) to detect advanced grammar,
 * awkward phrasing, missing/unnecessary punctuation, capitalization, and context errors
 * that LanguageTool might miss.
 */

interface GeminiIssue {
  substring: string;
  suggestedReplacements: string[];
  message: string;
  shortTitle: string;
  category: string;
  issueType: "spelling" | "grammar" | "style";
}

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    return aiClient;
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client:", err);
    return null;
  }
}

export async function analyzeWithGemini(
  text: string,
  existingMatches: LanguageToolMatch[]
): Promise<LanguageToolMatch[]> {
  const ai = getGeminiClient();
  if (!ai || !text || text.trim().length < 8) {
    return [];
  }

  try {
    const prompt = `You are an expert proofreader and grammar assistant like Grammarly. Analyze the following text for writing errors and enhancements.

Text to proofread:
"${text}"

Check for:
1. Capitalization errors (e.g. start of sentences, proper nouns, lower/upper case inconsistencies)
2. Missing or misplaced punctuation (commas, missing periods, question marks, exclamation marks, apostrophes in contractions like don't/it's/can't, quotes)
3. Unnecessary commas or double punctuation
4. Repeated words (e.g. "the the", "in in")
5. Extra spaces or missing spaces
6. Common grammar errors (subject-verb agreement, misplaced modifiers, tense consistency, confused words)
7. Awkward sentence construction or phrasing
8. Contextual spelling mistakes

Rules:
- Identify exact substrings from the original text that contain the issue.
- Do NOT flag words that are already correct.
- Provide clear, brief explanations.
- Provide 1 to 3 replacement options.
- Assign appropriate category ("Casing", "Punctuation", "Grammar", "Style", "Spelling", "Repetition").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issues: {
              type: Type.ARRAY,
              description: "List of detected writing issues",
              items: {
                type: Type.OBJECT,
                properties: {
                  substring: {
                    type: Type.STRING,
                    description: "The exact word or phrase from the original text that contains the error",
                  },
                  suggestedReplacements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "1 to 3 corrected replacement strings",
                  },
                  message: {
                    type: Type.STRING,
                    description: "User-friendly explanation of why this is an issue",
                  },
                  shortTitle: {
                    type: Type.STRING,
                    description: "Short title (e.g., 'Capitalization', 'Missing Comma', 'Awkward Phrasing')",
                  },
                  category: {
                    type: Type.STRING,
                    description: "Category name ('Casing', 'Punctuation', 'Grammar', 'Style', 'Spelling', 'Repetition')",
                  },
                  issueType: {
                    type: Type.STRING,
                    description: "'spelling', 'grammar', or 'style'",
                  },
                },
                required: ["substring", "suggestedReplacements", "message", "shortTitle", "category", "issueType"],
              },
            },
          },
          required: ["issues"],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) return [];

    const data = JSON.parse(jsonText);
    const issues: GeminiIssue[] = data.issues || [];
    const geminiMatches: LanguageToolMatch[] = [];

    // Existing covered ranges by LanguageTool
    const coveredRanges = existingMatches.map((m) => ({
      start: m.offset,
      end: m.offset + m.length,
    }));

    issues.forEach((issue, index) => {
      if (!issue.substring || !text.includes(issue.substring)) return;

      // Find offset of substring in text
      const offset = text.indexOf(issue.substring);
      if (offset < 0) return;

      const length = issue.substring.length;
      const end = offset + length;

      // Check if overlaps with any LanguageTool match
      const overlaps = coveredRanges.some(
        (range) => !(end <= range.start || offset >= range.end)
      );

      if (overlaps) return; // LanguageTool takes priority

      const isSpelling = issue.issueType === "spelling";

      geminiMatches.push({
        id: `gemini-${index}-${offset}`,
        message: issue.message,
        shortMessage: issue.shortTitle,
        offset,
        length,
        replacements: issue.suggestedReplacements.map((r) => ({ value: r })),
        rule: {
          id: `GEMINI_${issue.category.toUpperCase().replace(/\s+/g, "_")}`,
          description: issue.message,
          issueType: issue.issueType,
          category: {
            id: `AI_${issue.category.toUpperCase()}`,
            name: `AI ${issue.category}`,
          },
        },
        context: {
          text: text.slice(Math.max(0, offset - 10), Math.min(text.length, end + 10)),
          offset: Math.min(10, offset),
          length,
        },
        isSpelling,
        word: issue.substring,
      });

      // Track range to prevent self-overlap from Gemini
      coveredRanges.push({ start: offset, end });
    });

    return geminiMatches;
  } catch (error) {
    console.error("Gemini grammar fallback error:", error);
    return [];
  }
}
