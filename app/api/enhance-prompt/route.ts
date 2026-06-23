import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Fallback high-quality local descriptor expander in case Gemini is out of quota
function offlineEnhancePrompt(prompt: string): string {
  const subjects = prompt.trim();
  const styles = [
    "highly detailed, cinematic lighting, shot on 85mm lens, photorealistic textures",
    "soft volumetric gold rays, intricate depth of field, dramatic shadows, 8k resolution",
    "stunning digital matte painting concept art, vibrant color grading, masterpiece level",
    "hyper-realistic detailing, award-winning composition, moody atmospheric background",
    "elegant classical painting aesthetic, perfect golden ratio, ethereal ambient glow"
  ];
  const selectedStyle = styles[Math.floor(Math.random() * styles.length)];
  return `${subjects}, ${selectedStyle}`;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt text is required for enhancement." },
        { status: 400 }
      );
    }

    const cleanPrompt = prompt.trim();
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      // Return offline enhancement if developer hasn't configured key
      return NextResponse.json({
        success: true,
        enhancedText: offlineEnhancePrompt(cleanPrompt),
        isFallback: true
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Use gemini-2.5-flash since 3.5-flash is brand new or we want maximal speed & reliability
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              text: `You are an expert prompt engineer for AI image generators (such as Midjourney, DALL-E 3, and Imagen). 
Your task is to take a short, simple user prompt and expand it into a visually rich, descriptive, high-quality prompt.
Add details about the scene, composition, camera lens/settings, realistic lighting (e.g., volumetric, cinematic, golden hour), environment, textures, and artist styles (where appropriate).
Ensure the core meaning of the user's original concept is preserved, but made much more vivid and stunning.

User simple prompt: "${cleanPrompt}"

Write ONLY the enhanced descriptive prompt. Do not include introductory text, quotes, or conversational explanations. Just the final prompt text.`,
            },
          ],
        },
      });

      const enhancedText = response.text ? response.text.trim() : null;
      if (enhancedText) {
        return NextResponse.json({
          success: true,
          enhancedText: enhancedText,
          isFallback: false
        });
      } else {
        throw new Error("No text returned by the model.");
      }

    } catch (innerError: any) {
      console.warn("Gemini prompt enhancement failed. Falling back to local offline expander...", innerError);
      return NextResponse.json({
        success: true,
        enhancedText: offlineEnhancePrompt(cleanPrompt),
        isFallback: true
      });
    }

  } catch (error: any) {
    console.error("Error in enhance prompt API route:", error);
    return NextResponse.json(
      { error: error?.message || "An error occurred during prompt enhancement." },
      { status: 500 }
    );
  }
}
