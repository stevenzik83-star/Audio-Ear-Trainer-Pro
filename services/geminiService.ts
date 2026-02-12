
import { GoogleGenAI } from "@google/genai";
import { GameMode, Difficulty, DrumInstrument } from "../types";

const modelId = "gemini-3-flash-preview";

export async function getFeedback(
  gameMode: GameMode,
  difficulty: Difficulty,
  targetValue: number,
  userValue: number,
  instrument?: DrumInstrument
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const instrumentName = instrument ? instrument.replace('_', ' ').toLowerCase() : 'pink noise';
  
  const prompt = `
    I am an audio engineering student. 
    Task: Frequency ${gameMode === GameMode.FREQUENCY_BOOST ? 'Boost' : 'Cut'} drill on ${instrumentName}.
    Target: ${targetValue} Hz. My guess: ${userValue} Hz.
    Give a professional engineering tip about these frequencies on this instrument. Max 60 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "Focus on the tonal balance and transparency.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Keep practicing. Critical listening takes time.";
  }
}

export async function analyzeAudio(base64Data: string, mimeType: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const audioPart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: "Describe this audio clip as a professional mix engineer. What are its spectral characteristics? Any frequency masking or dynamic issues? Provide 3 actionable mixing tips."
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [audioPart, textPart] },
    });
    return response.text || "Scan complete. Signal appears balanced.";
  } catch (error) {
    console.error("Gemini Audio Analysis Error:", error);
    return "Neural scan failed. Check signal integrity.";
  }
}
