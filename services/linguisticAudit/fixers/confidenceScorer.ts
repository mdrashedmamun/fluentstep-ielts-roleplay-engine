/**
 * Confidence Scoring System
 * Determines which fixes should be auto-applied vs require user approval
 */

import { FixConfidence } from '../types';

export interface ConfidenceScore {
  score: number;                    // 0-1
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
}

/**
 * Score the confidence of a fix based on multiple factors
 */
export function scoreConfidence(params: {
  issueType: string;               // e.g., 'british-spelling', 'vocabulary'
  affectedText: string;            // The text being fixed
  suggestedFix: string;
  context?: string;                // Surrounding dialogue
  ruleCertainty?: number;           // 0-1 how certain the rule is
  hasException?: boolean;           // Whether exceptions exist
  category?: string;               // Scenario category
}): ConfidenceScore {
  let score = 0;
  const factors: string[] = [];

  const {
    issueType,
    affectedText,
    suggestedFix,
    context = '',
    ruleCertainty = 1.0,
    hasException = false,
    category = ''
  } = params;

  // British spelling rules are high-confidence (100% auto-fix)
  if (issueType === 'british-spelling') {
    score = 1.0;
    factors.push('British spelling rules are standardized');
    if (hasException) {
      score *= 0.95;
      factors.push('Some exceptions exist in formal contexts');
    }
  }

  // UK vocabulary mappings are very high confidence
  else if (issueType === 'uk-vocabulary') {
    score = 0.98;
    factors.push('UK/US vocabulary mappings are well-established');
    if (affectedText.length > 15) {
      // Longer phrases less certain
      score *= 0.95;
      factors.push('Multi-word phrase has higher variability');
    }
  }

  // Grammar errors are very high confidence
  else if (issueType === 'grammar-error') {
    score = 1.0;
    factors.push('Grammar corrections are standard');
  }

  // Double negatives - clear grammar error (auto-fix)
  else if (issueType === 'double-negative') {
    score = 1.0;
    factors.push('Double negatives are clear grammatical errors');
  }

  // Redundancy - word repetition (high confidence)
  else if (issueType === 'redundancy') {
    score = 0.98;
    factors.push('Unintended word repetition is a clear error');
  }

  // POS mismatches - requires more care
  else if (issueType === 'pos-mismatch') {
    score = 0.90;
    factors.push('Part-of-speech mismatches are grammar errors');
    if (affectedText.length < 4) {
      score *= 0.95;
      factors.push('Short words have clearer POS');
    } else {
      score *= 0.85;
      factors.push('Longer words may have multiple POS forms');
    }
  }

  // Data integrity issues (missing references, etc)
  else if (issueType === 'data-integrity') {
    score = 1.0;
    factors.push('Data integrity errors are always critical');
  }

  // Invalid categories or missing data
  else if (issueType === 'invalid-category' || issueType === 'missing-content') {
    score = 0.95;
    factors.push('Data validation errors are high confidence');
  }

  // Duplicate alternatives
  else if (issueType === 'duplicate-alternative') {
    score = 1.0;
    factors.push('Duplicate alternatives are always an error');
  }

  // Semantic alignment issues
  else if (issueType === 'semantic-alignment') {
    score = 0.80;
    factors.push('Semantic alignment depends on context interpretation');
  }

  // Low diversity in alternatives
  else if (issueType === 'low-diversity') {
    score = 0.85;
    factors.push('Alternative diversity can be subjective');
  }

  // Contextual fit - alternatives in context
  else if (issueType === 'contextual-fit') {
    score = 0.75;
    factors.push('Contextual fit depends on sentence semantics');
    if (context.length > 50) {
      score *= 0.95;
      factors.push('Sufficient context improves confidence');
    }
  }

  // Tonality issues are medium-confidence (context-dependent)
  else if (issueType === 'tonality') {
    score = 0.75;
    factors.push('Tonality depends on scenario context');
    // If category is casual and fix is more formal, lower confidence
    if (category === 'Social' && suggestedFix.length > affectedText.length) {
      score *= 0.85;
      factors.push('Casual context + more formal fix = less certain');
    }
  }

  // Natural patterns (detecting textbook English)
  else if (issueType === 'textbook-phrase') {
    score = 0.8;
    factors.push('Textbook pattern detection uses heuristics');
    if (context.length > 0) {
      score *= 0.9;
      factors.push('Context available for validation');
    }
  }

  // Dialogue flow issues (more ambiguous)
  else if (issueType === 'dialogue-flow') {
    score = 0.65;
    factors.push('Dialogue coherence is subjective');
    if (context.length > 50) {
      score *= 0.95;
      factors.push('Sufficient context improves confidence');
    }
  }

  // Alternative quality checks
  else if (issueType === 'alternative-quality') {
    score = 0.7;
    factors.push('Alternative quality depends on semantics');
  }

  // Default for unknown types
  else {
    score = 0.6;
    factors.push('Unknown issue type defaults to medium confidence');
  }

  // Adjust by rule certainty if provided
  score *= ruleCertainty;

  // Cap at reasonable bounds
  score = Math.max(0, Math.min(1, score));

  // Determine confidence level
  let level: 'HIGH' | 'MEDIUM' | 'LOW';
  if (score >= FixConfidence.HIGH) {
    level = 'HIGH';
  } else if (score >= FixConfidence.MEDIUM) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  return {
    score: Math.round(score * 100) / 100,
    level,
    reason: factors.join('; ')
  };
}

/**
 * Determine if a confidence score warrants auto-fixing
 */
export function shouldAutoFix(score: ConfidenceScore): boolean {
  return score.level === 'HIGH' && score.score >= FixConfidence.HIGH;
}

/**
 * Determine if a confidence score warrants presenting for user approval
 */
export function requiresApproval(score: ConfidenceScore): boolean {
  return score.level === 'MEDIUM' && score.score >= FixConfidence.MEDIUM;
}

/**
 * Determine if a finding should be reported as low-confidence
 */
export function isLowConfidence(score: ConfidenceScore): boolean {
  return score.level === 'LOW' && score.score < FixConfidence.MEDIUM;
}
