
import { GoogleGenAI, Type } from "@google/genai";
import { SkillType } from './types';

export const matchSkillWithAI = async (query: string): Promise<{ skill: SkillType | null; reason: string }> => {
  try {
    const availableSkills = Object.values(SkillType).join(', ');
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `User query: "${query}". Available skills: [${availableSkills}]. Match the query to exactly ONE of the available skills. If no clear match, return 'None'.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING, description: "The matched skill from the list, or 'None' if no match." },
                    reason: { type: Type.STRING, description: "Brief explanation of the match." }
                },
                propertyOrdering: ["skill", "reason"],
            }
        }
    });

    const text = response.text;
    if (!text) return { skill: null, reason: "No response text received" };
    const result = JSON.parse(text.trim());
    const matchedSkill = Object.values(SkillType).find(s => s === result.skill) || null;
    return { skill: matchedSkill, reason: result.reason || "Matched by Gemini AI" };
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    return { skill: null, reason: "Analysis temporarily unavailable." };
  }
};

export const generateBioWithAI = async (rawInput: string, skill: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Transform this raw input into a professional, concise short bio (max 30 words) for a ${skill} worker app profile. Raw input: "${rawInput}"`,
        });
        return response.text?.trim() || rawInput;
    } catch (e) {
        return rawInput;
    }
}
