
import Groq from "groq-sdk";

const getApiKey = () => {
    const key = process.env.GROQ_API_KEY || process.env.API_KEY;
    if (!key || key === 'PLACEHOLDER_API_KEY') {
        throw new Error("Groq API Key (GROQ_API_KEY) is not configured in environment variables.");
    }
    return key;
};

/**
 * Generates 3 real-life, high-fidelity example sentences for a specific language chunk.
 */
export const getChunkContext = async (phrase: string, topic: string): Promise<string[]> => {
    try {
        const key = process.env.GROQ_API_KEY || process.env.API_KEY;
        if (!key || key === 'PLACEHOLDER_API_KEY' || key === 'PLACEHOLDER_GROQ_KEY') {
            console.warn("Groq API Key missing, using fallback examples.");
            return getFallbackExamples(phrase);
        }

        const groq = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });

        const systemInstruction = `
        You are a linguistic expert specialized in high-fidelity, natural English (UK/Native tone).
        Your goal is to provide exactly 3 distinct, realistic, and understated example sentences for a specific phrase (chunk).

        PHRASE: "${phrase}"
        SCENARIO CONTEXT: "${topic}"

        RULES:
        1. **Understatement:** Avoid overly dramatic or "textbook" sentences.
        2. **Natural Flow:** Use contractions (it's, I'm) and native social logic.
        3. **Variety:** Provide 3 different situations (one similar to the topic, two others).
        4. **Conciseness:** Keep each sentence under 15 words.
        5. **Format:** Return only the sentences, one per line, no numbers or bullets.
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemInstruction.trim() },
                { role: "user", content: `Give me 3 examples for: ${phrase}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.6,
            max_tokens: 500,
        });

        const text = chatCompletion.choices[0]?.message?.content;
        if (!text) throw new Error("Empty response");

        return text.split('\n').filter(l => l.trim().length > 0).slice(0, 3);
    } catch (error: any) {
        console.error("Groq Context Error:", error);
        return getFallbackExamples(phrase);
    }
};

const getFallbackExamples = (phrase: string): string[] => {
    return [
        `Could you help me with this ${phrase}?`,
        `It's always better to ${phrase} before you start.`,
        `I really appreciate you taking the time to ${phrase}.`
    ];
};

/**
 * Legacy support for dynamic generation (optional fallback)
 */
export const generateRoleplay = async (topic: string): Promise<string> => {
    // Keeping this for compatibility if needed elsewhere, but stripped down.
    const apiKey = getApiKey();
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: `Generate a short 5-turn dialogue about ${topic}.` }],
        model: "llama-3.3-70b-versatile",
    });
    return completion.choices[0]?.message?.content || "";
};
