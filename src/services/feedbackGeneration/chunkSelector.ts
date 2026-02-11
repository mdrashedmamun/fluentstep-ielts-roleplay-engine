import { RoleplayScript, ChunkCategory } from '../staticData';

interface ChunkScore {
    index: number;
    pedagogicalValue: number;   // 0-40
    patternRecognition: number; // 0-30
    bucketScore: number;        // 0-20
    contrastPotential: number;  // 0-10
    totalScore: number;         // 0-100
}

interface SelectionResult {
    selectedIndices: number[];
    totalBlanks: number;
    selectionRate: number;
    categoryDistribution: Record<string, number>;
    scores: ChunkScore[];
}

// Get BUCKET classification for a chunk (you may need to adjust based on your actual data)
function getBucketScore(phrase: string): number {
    // BUCKET_A: Most common phrases (20 pts)
    const bucketA = [
        'meet', 'quite a while', 'friendly', 'nice to', 'keep track',
        'I see your point', 'to be honest', 'I appreciate that',
        'legally obligated', 'in two minds', 'bear in mind', 'by all means'
    ];

    if (bucketA.some(a => phrase.toLowerCase().includes(a.toLowerCase()))) {
        return 20;
    }

    // BUCKET_B: Medium frequency phrases (12 pts)
    const bucketB = [
        'come to', 'work out', 'get by', 'sort out', 'think about'
    ];

    if (bucketB.some(b => phrase.toLowerCase().includes(b.toLowerCase()))) {
        return 12;
    }

    // NOVEL: Less common phrases (5 pts)
    return 5;
}

// Estimate pedagogical value based on phrase characteristics
function getPedagogicalValue(phrase: string, context: string): number {
    let score = 0;

    // Softening phrases are highly valuable (IELTS speaking)
    if (isLikelyCategory(phrase, 'Softening')) {
        score += 15;
    }

    // Disagreement phrases are valuable for conversation
    if (isLikelyCategory(phrase, 'Disagreement')) {
        score += 12;
    }

    // Openers are foundational
    if (isLikelyCategory(phrase, 'Openers')) {
        score += 10;
    }

    // Phrases with multiple usage contexts
    if (phrase.length > 3) {
        score += 5;
    }

    // Phrases that appear in high-value scenarios
    if (phrase.match(/honest|sure|think|appreciate|point/i)) {
        score += 8;
    }

    return Math.min(score, 40);
}

// Estimate pattern recognition potential
function getPatternRecognitionScore(phrase: string): number {
    let score = 0;

    // Phrases with clear grammatical patterns
    if (phrase.match(/^(to|I|be)/i)) {
        score += 10;
    }

    // Phrases that appear in multiple contexts
    if (phrase.length > 5) {
        score += 8;
    }

    // Colloquial vs formal contrasts
    if (phrase.match(/contractions|it's|i'm|don't|can't/i)) {
        score += 12;
    }

    return Math.min(score, 30);
}

// Estimate contrast potential (how well native vs non-native comparison works)
function getContrastPotentialScore(phrase: string): number {
    let score = 0;

    // Softening phrases have clear native/non-native contrasts
    if (phrase.match(/honestly|sure|kind of|sort of|rather|quite/i)) {
        score += 7;
    }

    // Common phrases that learners misuse
    if (phrase.match(/very|much|important|like|think|say/i)) {
        score += 5;
    }

    // Phrases with formality levels
    if (phrase.match(/please|thanks|sorry|excuse/i)) {
        score += 8;
    }

    return Math.min(score, 10);
}

function isLikelyCategory(phrase: string, category: ChunkCategory): boolean {
    const patternMap: Record<ChunkCategory, RegExp> = {
        'Openers': /^(hello|hi|nice|good|meet|how|what)/i,
        'Softening': /(honestly|sure|think|kind|sort|rather|quite|fairly|perhaps|actually|anyway)/i,
        'Disagreement': /(disagree|think|not|point|see|mean|suggest|try|should)/i,
        'Repair': /(excuse|pardon|sorry|mean|clarify|actually|wait|minute)/i,
        'Exit': /(bye|goodbye|take|see|later|thanks|cheers|good)/i,
        'Idioms': /(track|work|mind|bear|means|long|time|way)/i
    };

    return patternMap[category]?.test(phrase) ?? false;
}

export function selectHighValueChunks(script: RoleplayScript, config?: {
    targetSelectionRate?: number;
    minChunks?: number;
    maxChunks?: number;
}): SelectionResult {
    const {
        targetSelectionRate = 0.25,
        minChunks = 3,
        maxChunks = 12
    } = config || {};

    const targetCount = Math.round(script.answerVariations.length * targetSelectionRate);
    const selectionCount = Math.max(minChunks, Math.min(targetCount, maxChunks));

    // Score all blanks
    const scores: ChunkScore[] = script.answerVariations.map(answer => {
        const pedagogical = getPedagogicalValue(answer.answer, script.context);
        const pattern = getPatternRecognitionScore(answer.answer);
        const bucket = getBucketScore(answer.answer);
        const contrast = getContrastPotentialScore(answer.answer);

        return {
            index: answer.index,
            pedagogicalValue: pedagogical,
            patternRecognition: pattern,
            bucketScore: bucket,
            contrastPotential: contrast,
            totalScore: pedagogical + pattern + bucket + contrast
        };
    });

    // Sort by total score descending
    const sorted = [...scores].sort((a, b) => b.totalScore - a.totalScore);

    // Select top N chunks
    const selected = sorted.slice(0, selectionCount);
    const selectedIndices = selected
        .sort((a, b) => a.index - b.index)
        .map(s => s.index);

    // Calculate category distribution
    const categoryDistribution: Record<string, number> = {};
    selected.forEach(score => {
        for (const [category, pattern] of Object.entries({
            'Softening': /honest|sure|think|kind|sort/i,
            'Disagreement': /disagree|point|think|see/i,
            'Openers': /hello|nice|meet|good/i,
            'Idioms': /track|work|mind|bear/i,
            'Repair': /excuse|sorry|mean|actually/i,
            'Exit': /bye|thanks|see|later/i
        })) {
            if (pattern.test(script.answerVariations.find(a => a.index === score.index)?.answer || '')) {
                categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
            }
        }
    });

    return {
        selectedIndices,
        totalBlanks: script.answerVariations.length,
        selectionRate: selectionCount / script.answerVariations.length,
        categoryDistribution,
        scores: sorted
    };
}
