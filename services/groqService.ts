
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
    - Blanks: Replace every instance of a Universal Chunk from the locked set with a clearly visible blank (e.g., "________").
    
    STEP 1 — ROLEPLAY GENERATION:
    - Topic: ${topic}.
    - Logical Flow is Paramount: Chunks must ONLY be used where they fit 100% naturally. Do NOT force a chunk if it sounds awkward.
    - Length: Long, multi-turn (12-15 dialogue turns).
    - Constraints: Use 8-12 unique universal chunks. Quality and naturalness over quantity.

    STEP 2 — ANSWER GENERATION:
    - Heading: "## Answer Variations".
    - Rule: For EVERY blank used above, provide:
      [Index]. [The Universal Chunk used] | Alternatives: [IELTS Band 9 Option 1], [Natural UK Idiom 2]

    STEP 3 — EDUCATIONAL DEEP DIVE:
    - Heading: "## Deep Dive & Usage".
    - Format: [Index]. [Chunk Name]: [One sentence explaining WHY this specific phrase was used in this context and how it affects the tone (e.g., 'Polite redirection', 'Softening a request')].
    - Rule: Focus on the "Social Logic" of the phrase.

    LOCKED UNIVERSAL CHUNKS:
    ${UNIVERSAL_CHUNKS}
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
