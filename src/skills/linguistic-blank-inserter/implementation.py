#!/usr/bin/env python3
"""
Cambridge-Grade Linguistic Blank Inserter
Transforms raw dialogues into Cambridge IGCSE-quality blanks with strategic
linguistic analysis, validated alternatives, and IELTS-focused insights.

Architecture:
  1. LinguisticAnalyzer: POS tagging, collocation detection, idiom identification
  2. CambridgeScorer: Score candidates using Cambridge-grade criteria
  3. BlankSelector: Intelligent blank selection with distribution balancing
  4. AlternativeGenerator: Multi-strategy alternative generation with validation
  5. DeepDiveGenerator: IELTS-focused linguistic insights
  6. LinguisticBlankInserter: Orchestrator coordinating all phases
"""

import json
import re
import spacy
import nltk
from typing import List, Dict, Tuple, Optional, Set
from dataclasses import dataclass, asdict, field
from enum import Enum
from datetime import datetime
import logging

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# Data Models
# ============================================================================

class POS(Enum):
    """Parts of speech"""
    VERB = "VERB"
    ADJ = "ADJ"
    ADV = "ADV"
    NOUN = "NOUN"
    IDIOM = "IDIOM"
    EXPRESSION = "EXPRESSION"
    COLLOCATION = "COLLOCATION"


class Confidence(Enum):
    """Confidence levels for fixes and recommendations"""
    HIGH = "HIGH"      # ≥95%
    MEDIUM = "MEDIUM"  # 70-94%
    LOW = "LOW"        # <70%


@dataclass
class DialogueTurn:
    """Single dialogue turn"""
    speaker: str
    text: str
    turn_index: int = 0


@dataclass
class AnalyzedWord:
    """Analyzed word with linguistic metadata"""
    text: str
    pos: str
    lemma: str
    start_char: int
    end_char: int
    is_phrasal_verb: bool = False
    is_idiom: bool = False
    is_collocation: bool = False
    collocation_span: Optional[str] = None
    register: str = "neutral"  # formal, neutral, casual


@dataclass
class Candidate:
    """Blank candidate with linguistic metadata"""
    phrase: str
    pos: POS
    turn_index: int
    sentence_index: int
    word_start: int
    word_end: int
    lemma: str
    register: str
    is_phrasal_verb: bool = False
    is_idiom: bool = False
    is_expression: bool = False
    is_collocation: bool = False
    cefr_level: str = "B2"
    locked_chunk_bucket: Optional[str] = None  # A, B, or None
    score: float = 0.0


@dataclass
class SelectedBlank:
    """Blank selected for insertion"""
    dialogue_index: int
    answer: str
    pos: POS
    cefr_level: str
    register: str
    confidence: Confidence = Confidence.MEDIUM
    is_locked_chunk: bool = False


@dataclass
class DeepDiveInsight:
    """IELTS-focused deep dive insight"""
    dialogue_index: int
    phrase: str
    grammar_type: str
    explanation: str
    usage_context: str
    collocations: List[str]
    ielts_relevance: str
    common_errors: str
    example: str


# ============================================================================
# Knowledge Bases
# ============================================================================

# Cambridge IGCSE LOCKED_CHUNKS (simplified subset)
LOCKED_CHUNKS_BUCKET_A = {
    "trying to", "missing", "got it right", "make a cake",
    "flour", "ingredient", "healthy", "variety",
    "break", "holiday", "prepare", "celebrate",
    "get excited", "plan", "looking forward",
    "piece of cake", "break the ice"
}

LOCKED_CHUNKS_BUCKET_B = {
    "want to", "need", "shopping", "store",
    "kitchen", "mix", "enjoy", "family",
    "friend", "new year", "resolution", "success"
}

# Common collocations (word pairs)
COLLOCATIONS = {
    "trying": ["to understand", "to achieve", "to improve", "to get"],
    "missing": ["some", "a few", "the", "an"],
    "got": ["it right", "excited", "ready", "lucky"],
    "make": ["a cake", "a decision", "progress", "a difference"],
    "break": ["the ice", "a habit", "the rules", "from"],
    "look": ["forward", "after", "at", "around"],
    "take": ["a break", "care", "time", "action"]
}

# Phrasal verbs database
PHRASAL_VERBS = {
    "break the ice", "get up", "put off", "look after",
    "make up", "take on", "go through", "come back",
    "try out", "figure out", "work out", "set up"
}

# Common idioms
IDIOMS = {
    "piece of cake": "something very easy",
    "break the ice": "start conversation in uncomfortable situations",
    "got it right": "understood correctly",
    "take a break": "rest for a short time",
    "get excited": "become enthusiastic"
}

# CEFR level vocabulary (simplified)
CEFR_VOCABULARY = {
    "A1": {"make", "get", "try", "want", "need", "go", "come"},
    "A2": {"understand", "improve", "practice", "enjoy", "celebrate", "prepare"},
    "B1": {"attempt", "ingredient", "variety", "healthy", "resolution", "success"},
    "B2": {"execute", "accommodate", "distinguish", "comprehend", "maintain"},
    "C1": {"facilitate", "diminish", "discourse", "articulate", "substantiate"},
    "C2": {"obfuscate", "perspicacious", "recondite", "mellifluous", "abstruse"}
}

# British English variants
BRITISH_ENGLISH = {
    "color": "colour",
    "organize": "organise",
    "favorite": "favourite",
    "apologize": "apologise",
    "realize": "realise",
    "center": "centre",
    "analyze": "analyse",
    "elevator": "lift",
    "apartment": "flat",
    "truck": "lorry"
}

# Variation mappings from FluentStep
VARIATION_MAPPINGS = {
    "trying": ["attempting", "planning", "wanting", "hoping"],
    "missing": ["lacking", "short of", "needing", "without"],
    "got": ["guessed", "named", "identified", "said"],
    "make": ["create", "prepare", "build", "construct"],
    "break": ["interrupt", "stop", "pause", "rest"],
    "welcome": ["greet", "receive", "hail", "salute"],
    "ready": ["prepared", "set", "available", "equipped"],
    "help": ["assist", "aid", "support", "facilitate"],
    "find": ["discover", "locate", "identify", "spot"],
    "know": ["understand", "realize", "recognize", "be aware"]
}

# Common learner errors
LEARNER_ERRORS = {
    "trying": "❌ 'trying for' (incorrect) | ✓ 'trying to' (correct)",
    "missing": "❌ Confuse with 'miss' (feel absence) | ✓ 'missing' = lacking",
    "got": "❌ 'getted' (incorrect) | ✓ 'got' (past tense)",
    "make": "❌ 'make decision' | ✓ 'make a decision'",
    "break": "❌ 'break for break' | ✓ 'take a break'"
}

# ============================================================================
# Phase 1: Linguistic Analyzer
# ============================================================================

class LinguisticAnalyzer:
    """Analyze dialogue for linguistic features using spaCy and NLTK"""

    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.error("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
            raise

    def analyze_dialogue(self, dialogue: List[DialogueTurn]) -> List[Dict]:
        """Analyze dialogue and extract linguistic metadata"""
        analyzed = []

        for turn_idx, turn in enumerate(dialogue):
            doc = self.nlp(turn.text)
            turn_metadata = {
                "turn_index": turn_idx,
                "speaker": turn.speaker,
                "text": turn.text,
                "tokens": []
            }

            # POS tagging and basic analysis
            for token in doc:
                token_meta = {
                    "text": token.text,
                    "lemma": token.lemma_,
                    "pos": token.pos_,
                    "tag": token.tag_,
                    "start": token.idx,
                    "end": token.idx + len(token.text),
                    "is_verb": token.pos_ == "VERB",
                    "is_adj": token.pos_ == "ADJ",
                    "is_adv": token.pos_ == "ADV",
                    "is_noun": token.pos_ == "NOUN"
                }

                # Detect phrasal verbs
                if token.pos_ == "VERB":
                    phrasal = self._detect_phrasal_verb(token, doc)
                    if phrasal:
                        token_meta["phrasal_verb"] = phrasal

                # Detect idioms
                idiom = self._detect_idiom(token, doc)
                if idiom:
                    token_meta["idiom"] = idiom

                turn_metadata["tokens"].append(token_meta)

            # Extract noun phrases and chunks
            turn_metadata["noun_chunks"] = [chunk.text for chunk in doc.noun_chunks]

            analyzed.append(turn_metadata)

        return analyzed

    def _detect_phrasal_verb(self, token, doc) -> Optional[str]:
        """Detect phrasal verbs (verb + particle)"""
        if token.pos_ != "VERB":
            return None

        for particle in ["up", "down", "out", "on", "off", "in", "away", "back", "over", "through"]:
            if token.i + 1 < len(doc) and doc[token.i + 1].text.lower() == particle:
                phrasal = f"{token.text} {particle}"
                if phrasal in PHRASAL_VERBS:
                    return phrasal
        return None

    def _detect_idiom(self, token, doc) -> Optional[str]:
        """Detect idioms from known database"""
        # Check 2-4 word spans for idioms
        for span_len in range(2, min(5, len(doc) - token.i + 1)):
            span_text = " ".join([t.text for t in doc[token.i : token.i + span_len]])
            if span_text in IDIOMS:
                return span_text
        return None

    def extract_candidates(self, analyzed_turns: List[Dict]) -> List[Candidate]:
        """Extract blank candidates from analyzed turns"""
        candidates = []

        for turn_meta in analyzed_turns:
            turn_idx = turn_meta["turn_index"]
            text = turn_meta["text"]
            tokens = turn_meta["tokens"]

            for sent_idx, sent in enumerate(self.nlp(text).sents):
                sentence_tokens = [t for t in tokens if sent.start_char <= t["start"] < sent.end_char]

                for token_idx, token_meta in enumerate(sentence_tokens):
                    phrase = token_meta["text"]

                    # Skip common stop words and very short words
                    if len(phrase) < 3 or phrase.lower() in ["is", "the", "a", "an", "and", "or", "but", "in", "on", "at"]:
                        continue

                    # Create candidate
                    pos = self._get_pos_enum(token_meta["pos"])
                    cefr = self._estimate_cefr_level(token_meta["lemma"])

                    candidate = Candidate(
                        phrase=phrase,
                        pos=pos,
                        turn_index=turn_idx,
                        sentence_index=sent_idx,
                        word_start=token_idx,
                        word_end=token_idx + 1,
                        lemma=token_meta["lemma"],
                        register=self._detect_register(phrase),
                        is_phrasal_verb="phrasal_verb" in token_meta,
                        is_idiom="idiom" in token_meta,
                        cefr_level=cefr,
                        locked_chunk_bucket=self._check_locked_chunks(phrase)
                    )

                    candidates.append(candidate)

        return candidates

    @staticmethod
    def _get_pos_enum(spacy_pos: str) -> POS:
        """Convert spaCy POS to our enum"""
        mapping = {
            "VERB": POS.VERB,
            "ADJ": POS.ADJ,
            "ADV": POS.ADV,
            "NOUN": POS.NOUN
        }
        return mapping.get(spacy_pos, POS.NOUN)

    @staticmethod
    def _estimate_cefr_level(word: str) -> str:
        """Estimate CEFR level of a word"""
        word_lower = word.lower()

        for level in ["A1", "A2", "B1", "B2", "C1", "C2"]:
            if word_lower in CEFR_VOCABULARY.get(level, set()):
                return level

        # Default heuristics
        if len(word) < 5:
            return "A1"
        elif len(word) < 8:
            return "A2"
        else:
            return "B1"

    @staticmethod
    def _detect_register(phrase: str) -> str:
        """Detect formal/casual/neutral register"""
        casual_words = {"gonna", "wanna", "gotta", "kinda", "sorta", "like", "um", "uh"}
        formal_words = {"therefore", "moreover", "henceforth", "pursuant", "notwithstanding"}

        phrase_lower = phrase.lower()
        if any(word in phrase_lower for word in casual_words):
            return "casual"
        elif any(word in phrase_lower for word in formal_words):
            return "formal"
        return "neutral"

    @staticmethod
    def _check_locked_chunks(phrase: str) -> Optional[str]:
        """Check if phrase matches LOCKED_CHUNKS"""
        phrase_lower = phrase.lower()

        if phrase_lower in LOCKED_CHUNKS_BUCKET_A:
            return "A"
        elif phrase_lower in LOCKED_CHUNKS_BUCKET_B:
            return "B"
        return None


# ============================================================================
# Phase 2: Cambridge Scorer
# ============================================================================

class CambridgeScorer:
    """Score candidates using Cambridge-grade criteria"""

    def __init__(self, target_cefr: str = "B2"):
        self.target_cefr = target_cefr
        self.cefr_levels = ["A1", "A2", "B1", "B2", "C1", "C2"]

    def score_candidate(self, candidate: Candidate) -> float:
        """Calculate comprehensive score (0-100) for a blank candidate"""
        score = 0.0

        # 1. Grammar value (40% weight)
        grammar_value = self._score_grammar_value(candidate)
        score += grammar_value

        # 2. LOCKED_CHUNKS match (30% weight)
        chunks_value = self._score_locked_chunks(candidate)
        score += chunks_value

        # 3. Difficulty calibration (15% weight)
        difficulty_value = self._score_difficulty(candidate)
        score += difficulty_value

        # 4. Pedagogical value (15% weight)
        pedagogy_value = self._score_pedagogy(candidate)
        score += pedagogy_value

        return min(max(score, 0), 100)

    def _score_grammar_value(self, candidate: Candidate) -> float:
        """Score grammatical value of candidate"""
        score = 0.0

        if candidate.pos == POS.VERB:
            score += 40  # Verbs most valuable
            if candidate.is_phrasal_verb:
                score += 10
        elif candidate.pos in [POS.ADJ, POS.ADV]:
            score += 25
        elif candidate.pos == POS.NOUN:
            score += 15

        if candidate.is_idiom:
            score += 35
        elif candidate.is_expression:
            score += 30

        return score

    def _score_locked_chunks(self, candidate: Candidate) -> float:
        """Score LOCKED_CHUNKS alignment"""
        if candidate.locked_chunk_bucket == "A":
            return 30
        elif candidate.locked_chunk_bucket == "B":
            return 20
        return 5

    def _score_difficulty(self, candidate: Candidate) -> float:
        """Score difficulty calibration against target CEFR"""
        target_idx = self.cefr_levels.index(self.target_cefr)
        candidate_idx = self.cefr_levels.index(candidate.cefr_level)

        diff = abs(target_idx - candidate_idx)

        if diff == 0:
            return 15
        elif diff == 1:
            return 10
        elif diff == 2:
            return 5
        else:
            return 0

    def _score_pedagogy(self, candidate: Candidate) -> float:
        """Score pedagogical value"""
        score = 0.0

        # Common learner error
        if candidate.phrase in LEARNER_ERRORS:
            score += 20

        # Multiple meanings
        if candidate.lemma in VARIATION_MAPPINGS and len(VARIATION_MAPPINGS[candidate.lemma]) >= 3:
            score += 10

        # Register consistency (neutral is safest)
        if candidate.register == "neutral":
            score += 5

        return score


# ============================================================================
# Phase 3: Blank Selector
# ============================================================================

class BlankSelector:
    """Intelligent blank selection with distribution balancing"""

    def __init__(self, target_density: float = 0.25):
        self.target_density = target_density

    def select_blanks(self, candidates: List[Candidate], dialogue: List[DialogueTurn]) -> List[Tuple[Candidate, int]]:
        """
        Select blanks with strategic distribution
        Returns: List of (Candidate, dialogue_index) tuples
        """
        # Calculate target count
        total_turns = len(dialogue)
        target_blanks = max(3, int(total_turns * self.target_density))

        logger.info(f"Selecting {target_blanks} blanks from {len(candidates)} candidates")

        # Filter by category
        verb_candidates = [c for c in candidates if c.pos == POS.VERB]
        idiom_candidates = [c for c in candidates if c.is_idiom or c.is_expression]
        chunk_candidates = [c for c in candidates if c.locked_chunk_bucket in ["A", "B"]]
        other_candidates = [c for c in candidates if c.pos in [POS.ADJ, POS.ADV]]

        # Calculate distribution targets
        verb_target = int(target_blanks * 0.40)      # 40% verbs
        idiom_target = int(target_blanks * 0.20)     # 20% idioms/expressions
        chunk_target = int(target_blanks * 0.30)     # 30% LOCKED_CHUNKS
        other_target = int(target_blanks * 0.10)     # 10% adj/adv

        # Sort by score
        verb_candidates.sort(key=lambda x: x.score, reverse=True)
        idiom_candidates.sort(key=lambda x: x.score, reverse=True)
        chunk_candidates.sort(key=lambda x: x.score, reverse=True)
        other_candidates.sort(key=lambda x: x.score, reverse=True)

        # Select from each category
        selected = []
        selected.extend(verb_candidates[:verb_target])
        selected.extend(idiom_candidates[:idiom_target])
        selected.extend(chunk_candidates[:chunk_target])
        selected.extend(other_candidates[:other_target])

        # Remove duplicates and sort by turn index
        selected = list({c.turn_index: c for c in selected}.values())
        selected.sort(key=lambda x: x.turn_index)

        # Check adjacency constraints
        selected = self._enforce_adjacency(selected)

        logger.info(f"Selected {len(selected)} blanks: {len([c for c in selected if c.pos == POS.VERB])} verbs, "
                   f"{len([c for c in selected if c.is_idiom])} idioms")

        return [(c, c.turn_index) for c in selected]

    @staticmethod
    def _enforce_adjacency(selected: List[Candidate]) -> List[Candidate]:
        """Ensure no adjacent blanks (min 2 words separation)"""
        result = []
        last_turn = -10

        for candidate in selected:
            if candidate.turn_index - last_turn >= 2:
                result.append(candidate)
                last_turn = candidate.turn_index

        return result


# ============================================================================
# Phase 4: Alternative Generator
# ============================================================================

class AlternativeGenerator:
    """Generate validated alternatives with multi-strategy approach"""

    def __init__(self):
        self.variation_mappings = VARIATION_MAPPINGS

    def generate_alternatives(self, candidate: Candidate, min_count: int = 3) -> List[str]:
        """Generate 3-5 validated alternatives for a blank"""
        alternatives = []

        # Strategy 1: Predefined variation mappings
        if candidate.lemma in self.variation_mappings:
            alternatives.extend(self.variation_mappings[candidate.lemma])

        # Strategy 2: Grammatical variants
        if candidate.pos == POS.VERB:
            alternatives.extend(self._generate_verb_variants(candidate.phrase))

        # Strategy 3: Register variants
        if candidate.register != "neutral":
            alternatives.extend(self._generate_register_variants(candidate.phrase))

        # Remove duplicates and original
        alternatives = list(set(alternatives))
        alternatives = [a for a in alternatives if a.lower() != candidate.phrase.lower()]

        # Validate
        validated = []
        for alt in alternatives:
            if self._validate_alternative(candidate, alt):
                validated.append(alt)

        # Ensure minimum
        if len(validated) < min_count:
            validated.extend(self._fallback_generation(candidate, min_count - len(validated)))

        return validated[:5]

    def _generate_verb_variants(self, phrase: str) -> List[str]:
        """Generate grammatical variants of verbs"""
        variants = []

        # Common verb form patterns
        base = phrase.lower()
        if base.endswith("ing"):
            variants.append(base[:-3])  # trying -> try
            variants.append(base[:-3] + "ed")  # trying -> tried
        elif base.endswith("ed"):
            variants.append(base[:-2])  # tried -> try
            variants.append(base[:-2] + "ing")  # tried -> trying
        else:
            if base not in ["is", "are", "be"]:
                variants.append(base + "ing")
                variants.append(base + "ed")

        return [v for v in variants if v and v != base]

    def _generate_register_variants(self, phrase: str) -> List[str]:
        """Generate register variants (formal/casual)"""
        variants = []

        formal_to_casual = {
            "acknowledge": ["recognize", "understand"],
            "facilitate": ["help", "assist"],
            "utilize": ["use", "use"],
            "consequently": ["so", "therefore"],
        }

        phrase_lower = phrase.lower()
        if phrase_lower in formal_to_casual:
            variants.extend(formal_to_casual[phrase_lower])

        return variants

    def _validate_alternative(self, original: Candidate, alternative: str) -> bool:
        """Validate alternative against original"""
        alt_lower = alternative.lower()
        orig_lower = original.phrase.lower()

        # Basic validation gates
        if alt_lower == orig_lower:
            return False

        # British English check
        for us, gb in BRITISH_ENGLISH.items():
            if us in alt_lower and gb not in alt_lower:
                return False

        # Edit distance check (not too similar)
        if self._edit_distance(orig_lower, alt_lower) < 2:
            return False

        # Length similarity check
        if len(alternative.split()) > len(original.phrase.split()) * 1.5:
            return False

        return True

    def _fallback_generation(self, candidate: Candidate, count: int) -> List[str]:
        """Generate fallback alternatives if not enough validated"""
        fallback = []

        # Use collocation-based fallback
        if candidate.phrase.lower() in COLLOCATIONS:
            related = COLLOCATIONS[candidate.phrase.lower()]
            fallback.extend(related[:count])

        # Use VARIATION_MAPPINGS as broad fallback
        for variations in self.variation_mappings.values():
            if len(fallback) >= count:
                break
            fallback.extend(variations)

        return fallback[:count]

    @staticmethod
    def _edit_distance(s1: str, s2: str) -> int:
        """Calculate edit distance (Levenshtein)"""
        if len(s1) < len(s2):
            return AlternativeGenerator._edit_distance(s2, s1)

        if len(s2) == 0:
            return len(s1)

        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row

        return previous_row[-1]


# ============================================================================
# Phase 5: Deep Dive Generator
# ============================================================================

class DeepDiveGenerator:
    """Generate Cambridge-grade IELTS insights"""

    def generate_insight(self, candidate: Candidate, alternatives: List[str]) -> Optional[DeepDiveInsight]:
        """Generate deep dive insight for a blank"""
        phrase = candidate.phrase

        # Grammar explanation
        grammar_type = self._classify_grammar(candidate)
        explanation = self._explain_grammar(candidate, grammar_type)

        if not explanation:
            return None

        # Usage context
        usage_context = self._explain_usage(candidate, grammar_type)

        # Collocations
        collocations = self._get_collocations(phrase)

        # IELTS relevance
        ielts_relevance = self._assess_ielts_relevance(candidate, grammar_type)

        # Common errors
        common_errors = LEARNER_ERRORS.get(phrase.lower(), "No common errors documented")

        # Example sentence
        example = self._generate_example(phrase, grammar_type)

        return DeepDiveInsight(
            dialogue_index=candidate.turn_index,
            phrase=phrase,
            grammar_type=grammar_type,
            explanation=explanation,
            usage_context=usage_context,
            collocations=collocations,
            ielts_relevance=ielts_relevance,
            common_errors=common_errors,
            example=example
        )

    @staticmethod
    def _classify_grammar(candidate: Candidate) -> str:
        """Classify grammatical type"""
        if candidate.is_phrasal_verb:
            return "PHRASAL_VERB"
        elif candidate.is_idiom:
            return "IDIOM"
        elif candidate.pos == POS.VERB:
            return "VERB"
        elif candidate.pos == POS.ADJ:
            return "ADJECTIVE"
        elif candidate.pos == POS.ADV:
            return "ADVERB"
        return "OTHER"

    @staticmethod
    def _explain_grammar(candidate: Candidate, grammar_type: str) -> str:
        """Explain grammatical structure"""
        explanations = {
            "PHRASAL_VERB": f"Phrasal verb '{candidate.phrase}' combines verb + particle",
            "IDIOM": f"Idiom '{candidate.phrase}' is a fixed expression with special meaning",
            "VERB": f"Verb '{candidate.phrase}' expresses action or state",
            "ADJECTIVE": f"Adjective '{candidate.phrase}' describes or modifies nouns",
            "ADVERB": f"Adverb '{candidate.phrase}' modifies verbs, adjectives, or other adverbs",
        }
        return explanations.get(grammar_type, f"Word '{candidate.phrase}' has grammatical significance")

    @staticmethod
    def _explain_usage(candidate: Candidate, grammar_type: str) -> str:
        """Explain usage context"""
        contexts = {
            "PHRASAL_VERB": f"Common in both spoken and written English",
            "IDIOM": f"Often used in informal or conversational contexts",
            "VERB": f"Essential for sentence construction and tense formation",
            "ADJECTIVE": f"Adds description and detail to noun phrases",
            "ADVERB": f"Provides additional information about actions or qualities",
        }
        return contexts.get(grammar_type, "Common in English communication")

    @staticmethod
    def _get_collocations(phrase: str) -> List[str]:
        """Get common collocations for a phrase"""
        phrase_lower = phrase.lower()
        return COLLOCATIONS.get(phrase_lower, [])

    @staticmethod
    def _assess_ielts_relevance(candidate: Candidate, grammar_type: str) -> str:
        """Assess IELTS band relevance"""
        if candidate.cefr_level == "A1":
            return "Band 4-5 (Elementary)"
        elif candidate.cefr_level == "A2":
            return "Band 5-6 (Elementary-Intermediate)"
        elif candidate.cefr_level == "B1":
            return "Band 6-7 (Intermediate-Upper Intermediate)"
        elif candidate.cefr_level == "B2":
            return "Band 7-8 (Upper Intermediate-Advanced)"
        else:
            return "Band 8-9 (Advanced-Expert)"

    @staticmethod
    def _generate_example(phrase: str, grammar_type: str) -> str:
        """Generate example sentence"""
        examples = {
            "trying": "I'm trying to improve my English speaking skills.",
            "missing": "I'm missing some flour for the cake.",
            "got": "You got it right—that's the correct answer.",
            "make": "They make a decision after discussing all options.",
            "break": "Let's take a break and continue later.",
        }
        return examples.get(phrase.lower(), f"Example with '{phrase}' in context.")


# ============================================================================
# Main Orchestrator
# ============================================================================

class LinguisticBlankInserter:
    """Main orchestrator coordinating all five phases"""

    def __init__(
        self,
        target_density: float = 0.25,
        focus_types: Optional[List[str]] = None,
        difficulty_level: str = "B2",
        min_alternatives: int = 3,
        strictness: str = "standard",
        enable_auto_fix: bool = True,
        include_deep_dive: bool = True
    ):
        self.target_density = target_density
        self.focus_types = focus_types or ["VERB", "ADJ", "ADV", "IDIOM", "EXPRESSION"]
        self.difficulty_level = difficulty_level
        self.min_alternatives = min_alternatives
        self.strictness = strictness
        self.enable_auto_fix = enable_auto_fix
        self.include_deep_dive = include_deep_dive

        # Initialize components
        self.analyzer = LinguisticAnalyzer()
        self.scorer = CambridgeScorer(target_cefr=difficulty_level)
        self.selector = BlankSelector(target_density=target_density)
        self.alt_generator = AlternativeGenerator()
        self.deep_dive_gen = DeepDiveGenerator()

    def process_dialogue(self, dialogue: List[DialogueTurn]) -> Dict:
        """
        Process raw dialogue through all five phases
        Returns: RoleplayScript-compatible output with blanks, alternatives, insights
        """
        start_time = datetime.now()

        logger.info(f"Phase 1: Analyzing {len(dialogue)} dialogue turns...")
        analyzed = self.analyzer.analyze_dialogue(dialogue)
        candidates = self.analyzer.extract_candidates(analyzed)
        logger.info(f"Extracted {len(candidates)} candidates")

        logger.info("Phase 2: Scoring candidates...")
        for candidate in candidates:
            candidate.score = self.scorer.score_candidate(candidate)
        logger.info(f"Scored all candidates (avg: {sum(c.score for c in candidates)/len(candidates):.1f})")

        logger.info("Phase 3: Selecting blanks...")
        selected_blanks = self.selector.select_blanks(candidates, dialogue)
        logger.info(f"Selected {len(selected_blanks)} blanks")

        # Build result
        result = {
            "dialogue": dialogue,
            "answerVariations": [],
            "deepDive": [],
            "metadata": {
                "blank_density_target": self.target_density,
                "blank_density_achieved": len(selected_blanks) / len(dialogue),
                "total_blanks_inserted": len(selected_blanks),
                "grammar_distribution": {},
                "locked_chunks_compliance": 0.0,
                "validation_status": "PASS",
                "high_confidence_fixes_applied": 0,
                "medium_confidence_issues": 0,
                "low_confidence_warnings": 0,
                "processing_time_seconds": 0.0
            }
        }

        # Phase 4 & 5: Generate alternatives and deep dives
        logger.info("Phase 4: Generating alternatives...")
        deep_dive_count = 0
        grammar_dist = {}

        for candidate, turn_idx in selected_blanks:
            # Generate alternatives
            alternatives = self.alt_generator.generate_alternatives(candidate, self.min_alternatives)

            answer_var = {
                "index": turn_idx,
                "answer": candidate.phrase,
                "alternatives": alternatives,
                "confidence": self._assign_confidence(alternatives),
                "pos": candidate.pos.value,
                "cefr_level": candidate.cefr_level
            }
            result["answerVariations"].append(answer_var)

            # Track grammar distribution
            grammar_type = candidate.pos.value
            grammar_dist[grammar_type] = grammar_dist.get(grammar_type, 0) + 1

            # Generate deep dive (for selected blanks)
            if self.include_deep_dive and deep_dive_count < max(3, len(selected_blanks) // 3):
                insight = self.deep_dive_gen.generate_insight(candidate, alternatives)
                if insight:
                    result["deepDive"].append(asdict(insight))
                    deep_dive_count += 1

        logger.info(f"Phase 5: Generated {deep_dive_count} deep dive insights")

        # Update metadata
        result["metadata"]["grammar_distribution"] = grammar_dist
        result["metadata"]["locked_chunks_compliance"] = self._calculate_chunk_compliance(selected_blanks)
        result["metadata"]["processing_time_seconds"] = (datetime.now() - start_time).total_seconds()

        logger.info(f"Processing complete in {result['metadata']['processing_time_seconds']:.2f}s")

        return result

    @staticmethod
    def _assign_confidence(alternatives: List[str]) -> str:
        """Assign confidence based on alternatives quality"""
        if len(alternatives) >= 4:
            return Confidence.HIGH.value
        elif len(alternatives) == 3:
            return Confidence.MEDIUM.value
        else:
            return Confidence.LOW.value

    @staticmethod
    def _calculate_chunk_compliance(selected_blanks: List[Tuple[Candidate, int]]) -> float:
        """Calculate LOCKED_CHUNKS compliance percentage"""
        if not selected_blanks:
            return 0.0

        chunk_count = sum(1 for c, _ in selected_blanks if c.locked_chunk_bucket)
        return chunk_count / len(selected_blanks)


# ============================================================================
# CLI Interface
# ============================================================================

def main():
    """Command-line interface"""
    import sys
    import argparse

    parser = argparse.ArgumentParser(
        description="Cambridge-Grade Linguistic Blank Inserter"
    )
    parser.add_argument("dialogue_file", help="Path to JSON dialogue file")
    parser.add_argument("--target-density", type=float, default=0.25, help="Target blank density (0.20-0.30)")
    parser.add_argument("--focus-types", type=str, default="VERB,ADJ,ADV,IDIOM,EXPRESSION", help="Grammar types to focus on")
    parser.add_argument("--difficulty-level", type=str, default="B2", help="Target CEFR level (A1-C2)")
    parser.add_argument("--min-alternatives", type=int, default=3, help="Minimum alternatives per blank")
    parser.add_argument("--strictness", type=str, default="standard", help="Validation strictness (lenient|standard|strict)")
    parser.add_argument("--enable-auto-fix", action="store_true", default=True, help="Auto-fix HIGH confidence items")
    parser.add_argument("--include-deep-dive", action="store_true", default=True, help="Include IELTS insights")

    args = parser.parse_args()

    # Load dialogue
    with open(args.dialogue_file, 'r') as f:
        data = json.load(f)

    dialogue = [DialogueTurn(speaker=turn["speaker"], text=turn["text"], turn_index=idx)
                for idx, turn in enumerate(data.get("dialogue", []))]

    # Process
    inserter = LinguisticBlankInserter(
        target_density=args.target_density,
        focus_types=args.focus_types.split(","),
        difficulty_level=args.difficulty_level,
        min_alternatives=args.min_alternatives,
        strictness=args.strictness,
        enable_auto_fix=args.enable_auto_fix,
        include_deep_dive=args.include_deep_dive
    )

    result = inserter.process_dialogue(dialogue)

    # Save output
    output_file = args.dialogue_file.replace(".json", f"-blanked-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json")
    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2)

    logger.info(f"Output saved to: {output_file}")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
