/**
 * Tonality & Register Mappings
 * Defines formality levels and expected tone by category
 */

export enum RegisterLevel {
  CASUAL = 'CASUAL',
  NEUTRAL = 'NEUTRAL',
  PROFESSIONAL = 'PROFESSIONAL',
  FORMAL = 'FORMAL'
}

export interface ToneMarker {
  text: string;
  register: RegisterLevel;
  examples: string[];
}

export const TONE_MARKERS: ToneMarker[] = [
  // CASUAL markers
  { register: RegisterLevel.CASUAL, text: 'mate', examples: ["Cheers, mate", "See you, mate"] },
  { register: RegisterLevel.CASUAL, text: 'cheers', examples: ["Cheers!", "Cheers for that"] },
  { register: RegisterLevel.CASUAL, text: 'bloke', examples: ["That bloke", "Nice bloke"] },
  { register: RegisterLevel.CASUAL, text: 'fancy', examples: ["Fancy a drink?", "Do you fancy it?"] },
  { register: RegisterLevel.CASUAL, text: 'loads of', examples: ["Loads of people", "Loads of fun"] },
  { register: RegisterLevel.CASUAL, text: 'brilliant', examples: ["That's brilliant!", "Brilliant idea"] },
  { register: RegisterLevel.CASUAL, text: 'gonna', examples: ["I'm gonna go", "It's gonna be fun"] },
  { register: RegisterLevel.CASUAL, text: 'wanna', examples: ["Do you wanna go?", "I wanna know"] },
  { register: RegisterLevel.CASUAL, text: 'yeah', examples: ["Yeah, sure", "Yeah, I know"] },
  { register: RegisterLevel.CASUAL, text: 'cool', examples: ["That's cool", "Cool with me"] },

  // NEUTRAL markers
  { register: RegisterLevel.NEUTRAL, text: 'quite', examples: ["Quite good", "Quite interested"] },
  { register: RegisterLevel.NEUTRAL, text: 'rather', examples: ["Rather nice", "Rather interesting"] },
  { register: RegisterLevel.NEUTRAL, text: 'fairly', examples: ["Fairly confident", "Fairly sure"] },
  { register: RegisterLevel.NEUTRAL, text: 'generally', examples: ["Generally speaking", "I generally agree"] },
  { register: RegisterLevel.NEUTRAL, text: 'I think', examples: ["I think so", "I think it's good"] },
  { register: RegisterLevel.NEUTRAL, text: 'I suppose', examples: ["I suppose so", "I suppose you're right"] },

  // PROFESSIONAL markers
  { register: RegisterLevel.PROFESSIONAL, text: 'regarding', examples: ["Regarding your email", "Regarding the project"] },
  { register: RegisterLevel.PROFESSIONAL, text: 'ensure', examples: ["Ensure completion", "Please ensure accuracy"] },
  { register: RegisterLevel.PROFESSIONAL, text: 'coordinate', examples: ["Coordinate the effort", "Let's coordinate"] },
  { register: RegisterLevel.PROFESSIONAL, text: 'facilitate', examples: ["Facilitate the meeting", "To facilitate"] },
  { register: RegisterLevel.PROFESSIONAL, text: 'leverage', examples: ["Leverage this opportunity", "We can leverage"] },
  { register: RegisterLevel.PROFESSIONAL, text: 'stakeholder', examples: ["Key stakeholders", "Stakeholder engagement"] },

  // FORMAL markers
  { register: RegisterLevel.FORMAL, text: 'furthermore', examples: ["Furthermore, we must", "Furthermore, consider"] },
  { register: RegisterLevel.FORMAL, text: 'nevertheless', examples: ["Nevertheless, the fact", "Nevertheless, it seems"] },
  { register: RegisterLevel.FORMAL, text: 'accordingly', examples: ["Accordingly, we propose", "Accordingly, the decision"] },
  { register: RegisterLevel.FORMAL, text: 'pursuant to', examples: ["Pursuant to the agreement"] },
  { register: RegisterLevel.FORMAL, text: 'theretofore', examples: ["Theretofore established"] },
];

/**
 * Expected tone by scenario category
 */
export const CATEGORY_EXPECTED_TONE: Record<string, RegisterLevel | RegisterLevel[]> = {
  'Social': RegisterLevel.CASUAL,
  'Workplace': RegisterLevel.PROFESSIONAL,
  'Service/Logistics': RegisterLevel.NEUTRAL,
  'Advanced': [RegisterLevel.PROFESSIONAL, RegisterLevel.FORMAL]
};

/**
 * Analyze register level of a phrase based on tone markers
 */
export function analyzeRegister(text: string): RegisterLevel {
  const lowerText = text.toLowerCase();
  const scores: Record<RegisterLevel, number> = {
    [RegisterLevel.CASUAL]: 0,
    [RegisterLevel.NEUTRAL]: 0,
    [RegisterLevel.PROFESSIONAL]: 0,
    [RegisterLevel.FORMAL]: 0
  };

  for (const marker of TONE_MARKERS) {
    if (lowerText.includes(marker.text)) {
      scores[marker.register]++;
    }
  }

  // Find register with highest score
  let maxScore = 0;
  let detectedRegister = RegisterLevel.NEUTRAL;

  for (const register of Object.values(RegisterLevel)) {
    if (scores[register] > maxScore) {
      maxScore = scores[register];
      detectedRegister = register;
    }
  }

  return detectedRegister;
}

/**
 * Check if a phrase's tone matches expected category tone
 */
export function checkToneMatch(
  text: string,
  category: string
): { matches: boolean; detected: RegisterLevel; expected: RegisterLevel | RegisterLevel[] } {
  const detected = analyzeRegister(text);
  const expected = CATEGORY_EXPECTED_TONE[category] || RegisterLevel.NEUTRAL;

  let matches = false;
  if (Array.isArray(expected)) {
    matches = expected.includes(detected);
  } else {
    // Allow adjacent registers (casual vs neutral, neutral vs professional)
    const registerOrder = [
      RegisterLevel.CASUAL,
      RegisterLevel.NEUTRAL,
      RegisterLevel.PROFESSIONAL,
      RegisterLevel.FORMAL
    ];

    const expectedIndex = registerOrder.indexOf(expected);
    const detectedIndex = registerOrder.indexOf(detected);

    // Allow detection within 1 level of expected
    matches = Math.abs(expectedIndex - detectedIndex) <= 1;
  }

  return { matches, detected, expected };
}

/**
 * Get tone markers for a register level
 */
export function getMarkersByRegister(register: RegisterLevel): string[] {
  return TONE_MARKERS.filter(m => m.register === register).map(m => m.text);
}

/**
 * Detect hedging language (typical of British English)
 */
export const BRITISH_HEDGING: string[] = [
  'I was wondering if',
  'Would you mind',
  'Perhaps',
  'I might suggest',
  'Possibly',
  'In my opinion',
  'It seems that',
  'One could argue',
  'Somewhat'
];

export function containsHedging(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BRITISH_HEDGING.some(hedge => lowerText.includes(hedge.toLowerCase()));
}
