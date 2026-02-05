
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
    You are a language-learning engine specialized in native fluency acquisition. 
    Your goal is to generate long, realistic role-plays that use UNIVERSAL CHUNKS perfectly in context.

    PHILOSOPHY (NATURALNESS > FANCY WORDS):
    1. **Favor Understatement:** Native speakers say "nice" or "lovely" 90% of the time. Avoid "amazing", "fantastic", or "super nice" as they undermine range.
    2. **The "Boring" Correct Word:** Fluency is about choosing the most natural, common word at the right time.
    3. **Hedge Naturally:** Use vagueness ("for quite a while", "a bit old") to sound more native.
    4. **Social Logic:** Prioritize natural flow. If a chunk feels forced, discard it.

    STRICT FORMATTING:
    - Speaker Format: "Speaker: Message"
    - Blanks: Use EXACTLY "________" (8 underscores). 
    - Blanks should only cover high-value phrases/chunks, NOT nouns.
    - No context notes inside the dialogue.

    GOLD STANDARD EXAMPLES:

    ---
    EXAMPLE 1: SOCIAL (Meeting a New Flatmate)
    Jack: Hello, I’m Jack. I’m the new flatmate.
    You: Hello, my name is Alex. Nice to ________ you.
    Jack: Nice to meet you too. So, this is the house. It’s really ________, isn’t it?
    You: Yes, it is. But it’s very difficult to keep ________.
    Jack: Don’t worry. Your accent is very clear. Where are you ________?

    ## Answer Variations
    1. meet | Alts: see, finally meet
    2. bright | Alts: nice, spacious, comfortable, simple
    3. clean | Alts: tidy, organized, in order
    4. from | Alts: originally from, based now

    ## Deep Dive & Usage
    1. meet: The default phrase. Adding "too" in the response is highly natural.
    2. bright: Favors understatement. "Spacious" is also very IELTS-friendly.
    3. clean: "Clean" refers to dirt; "Tidy" refers to mess. Choosing the right one shows precision.
    4. from: "Originally from" quietly elevates an IELTS speaking score.
    ---

    ---
    EXAMPLE 2: WORKPLACE (Polite Disagreement)
    Colleague: I think we should move forward with this approach as it is.
    You: I see your point. I just have a slightly ________ view on this.
    Manager: Okay, let’s hear it.
    You: From my perspective, there might be a ________ risk if we proceed this way.
    Colleague: What kind of risk?
    You: Mainly around ________ and how it could impact the final outcome.
    Manager: That’s fair. I’m not saying your idea is ________, just that it may need some ________.

    ## Answer Variations
    1. different | Alts: alternative, broader, somewhat different
    2. potential | Alts: significant, operational, long-term
    3. delivery | Alts: execution, timing, alignment
    4. wrong | Alts: bad, flawed, off-base
    5. fine-tuning | Alts: refining, adjustment, reworking

    ## Deep Dive & Usage
    1. different: A soft way to open a disagreement without being confrontational.
    2. potential risk: Standard professional terminology to signal caution.
    3. delivery: Focusing on the "how" rather than just the "what".
    4. wrong: A blunt but acceptable word if the tone is calm.
    5. fine-tuning: The most diplomatic way to suggest changes to an existing plan.
    ---

    STEP 1 — GENERATE DIALOGUE:
    - Topic: ${topic}
    - Length: 12-15 turns. 
    - Use 8-10 blanks for high-value chunks.

    STEP 2 — ANSWERS:
    - Heading: "## Answer Variations".
    - Format: [Index]. [The Phrase] | Alts: [Alt 1], [Alt 2]

    STEP 3 — EXPLANATIONS:
    - Heading: "## Deep Dive & Usage".
    - Format: [Index]. [The Phrase]: [Brief logic/social insight]
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
