import { GoogleGenAI } from "@google/genai";

export const generateTitleSuggestions = async (context: string): Promise<string[]> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    return ["Error: API Key Missing", "Please configure environment"];
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      You are a YouTube expert. I will give you a topic or description of a video.
      Generate 5 catchy, clickbait-style, short (max 5-6 words) video titles/captions suitable for a thumbnail.
      Return ONLY a JSON array of strings. No markdown formatting.
      
      Topic: "${context}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return [];

    try {
      const titles = JSON.parse(text);
      if (Array.isArray(titles)) {
        return titles;
      }
    } catch (e) {
      console.error("Failed to parse JSON from Gemini", e);
    }

    return ["New Video", "Must Watch", "Epic Moments"];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return ["API Error", "Try Again"];
  }
};