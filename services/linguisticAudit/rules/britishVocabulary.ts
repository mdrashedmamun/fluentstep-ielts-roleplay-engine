/**
 * British English Vocabulary Mappings
 * Maps American English words to British equivalents
 */

export interface VocabularyMapping {
  american: string;
  british: string;
  category: string;
  confidence: number;  // 0-1, how certain the mapping is
}

export const UK_US_VOCABULARY: VocabularyMapping[] = [
  // Transport
  { american: 'elevator', british: 'lift', category: 'Transport', confidence: 1.0 },
  { american: 'subway', british: 'underground', category: 'Transport', confidence: 1.0 },
  { american: 'trunk', british: 'boot', category: 'Transport', confidence: 1.0 },
  { american: 'gas', british: 'petrol', category: 'Transport', confidence: 0.95 }, // Context-dependent
  { american: 'truck', british: 'lorry', category: 'Transport', confidence: 1.0 },

  // Housing
  { american: 'apartment', british: 'flat', category: 'Housing', confidence: 1.0 },
  { american: 'first floor', british: 'ground floor', category: 'Housing', confidence: 0.9 }, // US vs UK floor numbering
  { american: 'restroom', british: 'toilet', category: 'Housing', confidence: 1.0 },

  // Food & Dining
  { american: 'french fries', british: 'chips', category: 'Food', confidence: 1.0 },
  { american: 'fries', british: 'chips', category: 'Food', confidence: 1.0 },
  { american: 'cookie', british: 'biscuit', category: 'Food', confidence: 0.95 }, // 'biscuit' is more formal
  { american: 'cracker', british: 'biscuit', category: 'Food', confidence: 0.85 }, // Context matters
  { american: 'chips', british: 'crisps', category: 'Food', confidence: 1.0 },

  // General
  { american: 'vacation', british: 'holiday', category: 'General', confidence: 1.0 },
  { american: 'garbage', british: 'rubbish', category: 'General', confidence: 1.0 },
  { american: 'trash', british: 'rubbish', category: 'General', confidence: 1.0 },
  { american: 'sidewalk', british: 'pavement', category: 'General', confidence: 1.0 },
  { american: 'flashlight', british: 'torch', category: 'General', confidence: 1.0 },
  { american: 'eraser', british: 'rubber', category: 'General', confidence: 0.9 }, // 'rubber' has other meanings
  { american: 'cell phone', british: 'mobile phone', category: 'General', confidence: 1.0 },
  { american: 'cell', british: 'mobile', category: 'General', confidence: 1.0 },

  // Education
  { american: 'high school', british: 'secondary school', category: 'Education', confidence: 0.9 },
  { american: 'elementary school', british: 'primary school', category: 'Education', confidence: 1.0 },

  // Money
  { american: 'dollar', british: 'pound', category: 'Money', confidence: 0.8 }, // Context-dependent
  { american: 'checkbook', british: 'chequebook', category: 'Money', confidence: 1.0 },
];

/**
 * Check if a word should be replaced with British equivalent
 */
export function getBritishEquivalent(word: string): VocabularyMapping | null {
  const lowerWord = word.toLowerCase();

  for (const mapping of UK_US_VOCABULARY) {
    if (lowerWord === mapping.american.toLowerCase()) {
      return mapping;
    }
  }

  return null;
}

/**
 * Find all American English words in text
 */
export function findAmericanisms(text: string): Array<{
  word: string;
  mapping: VocabularyMapping;
}> {
  const americanisms: Array<{ word: string; mapping: VocabularyMapping }> = [];

  // Split into words
  const words = text.match(/\b[\w\s]+\b/g) || [];

  for (const word of words) {
    const mapping = getBritishEquivalent(word.trim());
    if (mapping && mapping.confidence >= 0.9) {
      // Only high-confidence mappings
      americanisms.push({ word: word.trim(), mapping });
    }
  }

  return americanisms;
}

/**
 * Get all British vocabulary mappings by category
 */
export function getMappingsByCategory(category: string): VocabularyMapping[] {
  return UK_US_VOCABULARY.filter(m => m.category === category);
}

/**
 * Get all distinct categories
 */
export function getCategories(): string[] {
  return [...new Set(UK_US_VOCABULARY.map(m => m.category))];
}
