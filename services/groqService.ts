
import Groq from "groq-sdk";
import { UNIVERSAL_CHUNKS } from "../constants";

const getApiKey = () => {
    const key = process.env.GROQ_API_KEY || process.env.API_KEY;
    if (!key || key === 'PLACEHOLDER_API_KEY') {
        throw new Error("Groq API Key (GROQ_API_KEY) is not configured in environment variables.");
    }
    return key;
};

/**
 * Generates a roleplay scenario using the Groq API (Llama 3.3 70B).
 */
export const generateRoleplay = async (topic: string): Promise<string> => {
    const apiKey = getApiKey();
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    const systemInstruction = `
    You are a language-learning engine specialised in fluency acquisition through long, realistic role-play.
    Your task is to generate immersive role-plays that deliberately and repeatedly reuse a fixed set of UNIVERSAL CHUNKS, while minimising topic-specific language.

    GLOBAL RULES (NATURALNESS > PATTERNS):
    1. **PRIORITY #1: NATURAL LOGIC.** The dialogue must make perfect sense. If a "Universal Chunk" feels even slightly forced, DO NOT USE IT.
    2. **Roleplay First:** Write a completely natural, high-level native conversation first.
    3. **Blanks Second:** *After* writing the dialogue, identify 8-10 phrases that are excellent for learning (idioms, collocations, natural reactions) and turn THOSE into blanks.
    4. **No Forced Chunks:** Do not try to shoehorn specific words from a list if they don't fit.

    STRICT FORMATTING RULES:
    - Speaker Format: "Speaker: Message"
    - Blanks: Use EXACTLY "________" (8 underscores) for the learning phrases.
    - NO context notes inside the dialogue.

    STEP 1 — GENERATE NATURAL DIALOGUE:
    - Topic: ${topic}
    - Create a 12-15 turn conversation. It must flow like real life.
    - Select 8-10 "High Value" phrases to blank out. These can be from the Universal List OR new natural phrases that fit the context perfectly.

    STEP 2 — ANSWERS:
    - Heading: "## Answer Variations".
    - Rule: [Index]. [The Phrase You Blanked Out] | Alts: [Alt 1], [Alt 2]

    STEP 3 — EXPLANATIONS:
    - Heading: "## Deep Dive & Usage".
    - Rule: [Index]. [The Phrase]: [Why this is the perfect thing to say here]
  `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemInstruction.trim() },
                { role: "user", content: `Start the practice for topic: ${topic}. Ensure every universal chunk used is replaced by "________" in the dialogue.` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 4096,
        });

        const text = chatCompletion.choices[0]?.message?.content;
        if (!text) {
            throw new Error("Empty response from Groq API");
        }
        return text;
    } catch (error: any) {
        console.error("Groq API Error:", error);
        if (error.status === 429) {
            throw new Error("QUOTA_EXHAUSTED: You've reached the Groq rate limit. Please wait a minute or upgrade your plan.");
        }
        throw new Error(error.message || "An error occurred while connecting to Groq.");
    }
};
