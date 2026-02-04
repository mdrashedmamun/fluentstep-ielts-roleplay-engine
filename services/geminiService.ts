
import { GoogleGenAI } from "@google/genai";
import { UNIVERSAL_CHUNKS } from "../constants";

const checkApiKey = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is not configured.");
  }
};

/**
 * Generates a roleplay scenario using the Gemini API based on the user's strict pedagogical requirements.
 */
export const generateRoleplay = async (topic: string): Promise<string> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are a language-learning engine specialised in fluency acquisition through long, realistic role-play.
    Your task is to generate immersive role-plays that deliberately and repeatedly reuse a fixed set of UNIVERSAL CHUNKS, while minimising topic-specific language.

    GLOBAL RULES (NON-NEGOTIABLE):
    1. This system trains PATTERNS, not vocabulary. Novelty is a bug, not a feature.
    2. Chunk repetition is intentional and required. Locked chunks take priority over all other phrasing.
    3. Goal: automatic, fluent deployment of core conversational moves.
    4. Style: UK native, day-to-day English. Calm, understated, adult tone.

    STRICT FORMATTING RULES:
    - NO MARKDOWN BOLDING: Never use asterisks (*) or underscores (_) to highlight words.
    - Speaker Format: Always use "Speaker Name: Message".
    - Preface with Context: First line MUST be "Context: [Setting Description]".
    - Roleplay Header: "## Roleplay".
    - Blanks: Replace every instance of a Universal Chunk from the locked set with the EXACT string "________" (exactly 8 underscores).
    
    STEP 1 — ROLEPLAY GENERATION:
    - Topic: ${topic}.
    - Length: Long, multi-turn (15-20 dialogue turns). Must feel real, slightly messy, and human.
    - Constraints: HARD-ENFORCE reuse of 12-18 instances of universal chunks. Same chunks should reappear multiple times.

    STEP 2 — ANSWER GENERATION:
    - Heading: "## Answer Variations".
    - Format: 1. [PRIMARY CHUNK] / Alts: [Alternative native option 1], [Alternative native option 2]
    - Rule: Provide the PRIMARY answer using the user’s UNIVERSAL CHUNK. Then provide 1–2 alternatives ONLY if genuinely natural for a UK native.

    LOCKED UNIVERSAL CHUNKS:
    ${UNIVERSAL_CHUNKS}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Most stable for free tier RPM/RPD balance
      contents: `Start the practice for topic: ${topic}. Ensure every universal chunk used is replaced by "________" in the dialogue.`,
      config: {
        systemInstruction: systemInstruction.trim(),
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }
    return text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("QUOTA_EXHAUSTED: You've reached the Gemini API rate limit. Please check your billing at ai.google.dev/gemini-api/docs/billing or wait a minute before trying again.");
    }
    throw error;
  }
};
