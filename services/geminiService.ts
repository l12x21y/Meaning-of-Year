import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// Using process.env.API_KEY as mandated
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyMeaning = async (date: string, userContext?: string, categoryName?: string, year?: number): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `Please generate a short, inspiring, and thoughtful "Meaning of the Day" based on this specific memory.
      If this date has historical significance in that specific year, you may briefly mention it if relevant to the user's context.
      If a category is provided, match the tone (e.g. celebration for Birthday, professional for Work).
      Keep it under 40 words. Be warm, aesthetic, and reflective.`;

    const contents = `I want to find meaning for this date: ${date} in the year ${year || 'unknown'}.
      ${userContext ? `The user provided this context about the memory: "${userContext}".` : ''}
      ${categoryName ? `The user categorized this memory as: "${categoryName}".` : ''}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "Could not generate meaning at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Make today count in your own way.";
  }
};