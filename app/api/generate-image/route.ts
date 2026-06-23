import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Helper for high-quality free image generation using Pollinations.ai (Flux)
function getPollinationsUrl(prompt: string, aspectRatio: string, seed?: number): string {
  let width = 1024;
  let height = 1024;

  if (aspectRatio === "16:9") {
    width = 1024;
    height = 576;
  } else if (aspectRatio === "9:16") {
    width = 576;
    height = 1024;
  } else if (aspectRatio === "4:3") {
    width = 1024;
    height = 768;
  } else if (aspectRatio === "3:4") {
    width = 768;
    height = 1024;
  }

  const finalSeed = seed ?? (Math.floor(Math.random() * 999999) + 1);
  // Route to flux model on pollinations explicitly as it is guaranteed to support all custom resolutions/aspect ratios
  return `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${finalSeed}&nologo=true&model=flux&private=true&feed=false`;
}

export async function POST(req: NextRequest) {
  let promptText = "";
  let ratio = "1:1";
  let size = "1K";
  let engine = "free"; // Default to high-speed free engine to verify successful out-of-the-box operation

  try {
    const { prompt, aspectRatio, imageSize = "1K", engine: requestedEngine = "free" } = await req.json();
    promptText = prompt;
    ratio = aspectRatio || "1:1";
    size = imageSize;
    engine = requestedEngine;

    if (!promptText) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    // Standard High-Speed Engine (completely free, unlimited, zero secrets or keys required)
    if (engine === "free") {
      const imagesList = Array.from({ length: 4 }).map(() => {
        const seed = Math.floor(Math.random() * 999999) + 1;
        return {
          url: getPollinationsUrl(promptText, ratio, seed),
          engine: "free",
          seed
        };
      });
      return NextResponse.json({
        success: true,
        images: imagesList,
        isFallback: false,
        engine: "free"
      });
    }

    // Google Imagen Premium (using client/server provided API key)
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error("No API key configured for Google Imagen.");
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const generateSingleWithGemini = async (index: number) => {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image',
          contents: {
            parts: [
              {
                text: promptText,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: ratio === "16:9" ? "16:9" : ratio === "9:16" ? "9:16" : ratio === "4:3" ? "4:3" : ratio === "3:4" ? "3:4" : "1:1",
              imageSize: size === "2K" ? "2K" : size === "4K" ? "4K" : "1K"
            }
          }
        });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
          throw new Error("No image candidates returned by Google Imagen.");
        }

        const parts = candidates[0].content?.parts;
        if (!parts || parts.length === 0) {
          throw new Error("Generation response parts are empty from Google Imagen.");
        }

        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            return {
              base64: part.inlineData.data,
              mimeType: part.inlineData.mimeType || "image/png",
              engine: "gemini"
            };
          }
        }

        throw new Error("No image inlineData found in response parts.");
      } catch (geminiError: any) {
        console.warn(`Gemini generation #${index + 1} failed, using Pollinations fallback...`, geminiError);
        const seed = Math.floor(Math.random() * 999999) + 1;
        return {
          url: getPollinationsUrl(promptText, ratio, seed),
          engine: "free",
          seed,
          isFallback: true
        };
      }
    };

    const imagesList = await Promise.all(
      Array.from({ length: 4 }).map((_, i) => generateSingleWithGemini(i))
    );

    const hasFallbacks = imagesList.some(img => img.engine === "free");

    return NextResponse.json({
      success: true,
      images: imagesList,
      isFallback: hasFallbacks,
      engine: hasFallbacks ? "mixed" : "gemini"
    });

  } catch (error: any) {
    console.error("Gemini Image generation failed; executing seamless Pollinations.ai fallback...", error);
    
    // Attempt free, keyless fallback so the user doesn't face any 429 quota or 400 expired key errors
    try {
      if (promptText) {
        const imagesList = Array.from({ length: 4 }).map(() => {
          const seed = Math.floor(Math.random() * 999999) + 1;
          return {
            url: getPollinationsUrl(promptText, ratio, seed),
            engine: "free",
            seed,
            isFallback: true
          };
        });
        return NextResponse.json({
          success: true,
          images: imagesList,
          isFallback: true,
          errorFallbackReason: error?.message || "Gemini API key exceeded or unavailable.",
          engine: "free"
        });
      }
    } catch (fallbackError: any) {
      console.error("Fallback generation failed as well:", fallbackError);
    }

    let errorMessage = error?.message || "An error occurred during image generation.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
