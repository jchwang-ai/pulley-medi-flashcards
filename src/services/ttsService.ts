import { GoogleGenAI } from "@google/genai";
import { pcmToWav } from "../utils/audioUtils";

// In-memory cache for audio URLs
const audioCache: Record<string, string> = {};

export async function generateSpeech(text: string): Promise<string | null> {
  // Return from cache if available
  if (audioCache[text]) {
    return audioCache[text];
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }], // Minimal prompt for speed
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    const base64Audio = part?.inlineData?.data;
    
    if (base64Audio) {
      const audioUrl = pcmToWav(base64Audio);
      audioCache[text] = audioUrl; // Store in cache
      return audioUrl;
    }
    
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}
