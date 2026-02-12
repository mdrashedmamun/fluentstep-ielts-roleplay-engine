
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useFloating, flip, shift, offset } from '@floating-ui/react';
import { RoleplayScript, CURATED_ROLEPLAYS, ChunkFeedback, ChunkFeedbackV2 } from '../services/staticData';
import { progressService } from '../services/progressService';
import { audioService } from '../services/audioService';
import { navigationService } from '../services/navigationService';
import { useKeyboard } from '../hooks/useKeyboard';
import NavigationButtons from './NavigationButtons';
import CelebrationOverlay from './CelebrationOverlay';
import FeedbackCard from './FeedbackCard';
import PatternSummaryView from './PatternSummaryView';
import { AchievementType } from '../types/ux-enhancements';



interface RoleplayViewerProps {
  script: RoleplayScript;
  onReset: () => void;
}

/**
 * Validate that a blank can only be filled with its assigned answer
 * Returns true if the answer is valid for this blank
 */
function validateBlankAnswerMatch(
  blankIndex: number,
  answerText: string,
  script: RoleplayScript
): boolean {
  // Get expected chunkId for this blank
  const blankMapping = script.blanksInOrder?.[blankIndex];
  if (!blankMapping) return true; // No blanksInOrder, skip validation

  const expectedChunkId = blankMapping.chunkId;
  if (!expectedChunkId) return true; // No chunkId requirement, skip validation

  // Get the answer for this blank
  const answerData = script.answerVariations.find(v => v.index === blankIndex);
  if (!answerData) return false; // No answer found

  // Check if the answer text matches
  const isMatch = answerData.answer === answerText ||
                  answerData.alternatives?.includes(answerText);

  if (!isMatch) {
    console.warn(
      `⚠️ Blank ${blankIndex} validation failed: "${answerText}" is not valid for ${expectedChunkId}`
    );
  }

  return isMatch;
}

const InteractiveBlank: React.FC<{
  answer: string;
  alternatives: string[];
  index: number;
  isRevealed: boolean;
  onReveal: () => void;
  expectedChunkId?: string;
  actualChunkId?: string;
}> = ({ answer, alternatives, index, isRevealed, onReveal, expectedChunkId, actualChunkId }) => {
  // Validate chunkId match
  const isValidChunk = !expectedChunkId || !actualChunkId || expectedChunkId === actualChunkId;
  const chunkMismatch = expectedChunkId && actualChunkId && expectedChunkId !== actualChunkId;
  const isClosingRef = useRef(false);
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [floatingElement, setFloatingElement] = useState<HTMLDivElement | null>(null);

  const { floatingStyles, placement } = useFloating({
    elements: { reference: referenceElement, floating: floatingElement },
    middleware: [
      offset(12),
      flip(),
      shift({ padding: 8 })
    ]
  });

  useEffect(() => {
    if (!isRevealed) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (isClosingRef.current) return;
      const target = e.target as HTMLElement;
      if (!target.closest('.interactive-blank-container')) {
        onReveal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRevealed, onReveal]);

  return (
    <span className="inline-block group mx-1 align-baseline interactive-blank-container">
      <button
        ref={setReferenceElement}
        onClick={onReveal}
        className={`px-4 py-1.5 transition-all duration-300 rounded-xl font-bold border-2 flex items-center gap-2 justify-center ${
          chunkMismatch
            ? 'border-red-400 bg-gradient-to-r from-red-50 to-orange-50 text-red-700 shadow-md ring-4 ring-red-500/20 scale-105 z-20 min-w-fit'
            : isRevealed
              ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 shadow-md ring-4 ring-primary-500/20 scale-105 z-20 min-w-fit'
              : 'border-dashed border-primary-300 bg-gradient-to-r from-orange-100/50 to-teal-100/50 text-neutral-600 hover:border-primary-400 hover:text-primary-600 hover:bg-gradient-to-r hover:from-orange-100 hover:to-teal-100 z-0 min-w-[140px]'
        }`}
        title={chunkMismatch ? `⚠️ This blank expects a different answer (${expectedChunkId})` : undefined}
      >
        {chunkMismatch && (
          <span className="text-xs text-red-600 font-bold">⚠️</span>
        )}
        {!isRevealed && !chunkMismatch && (
          <span className="text-[10px] text-primary-500 font-bold uppercase tracking-tighter">✨ Tap to discover</span>
        )}
        <span className="tracking-tight whitespace-nowrap font-semibold">
          {isRevealed ? answer : ''}
        </span>
        {isRevealed ? (
          <i className="fas fa-times text-[10px] text-neutral-400 hover:text-neutral-600 ml-1"></i>
        ) : chunkMismatch ? (
          <i className="fas fa-exclamation-triangle text-[10px] text-red-500"></i>
        ) : (
          <i className="fas fa-sparkles text-[10px] text-primary-400 group-hover:text-primary-500 animate-pulse"></i>
        )}
      </button>

      {isRevealed && (
        <div
          ref={setFloatingElement}
          style={floatingStyles}
          className="fixed w-72 rounded-2xl z-[100] animate-in zoom-in-95 fade-in duration-300 overflow-hidden"
        >
          {/* Warm gradient background with elegant shadow */}
          <div className="bg-white shadow-2xl border-2 border-primary-100 rounded-2xl overflow-hidden">
            {/* Header with warm gradient */}
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 px-6 py-4 border-b border-primary-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary-700 uppercase tracking-wider block">Native Alternatives</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    isClosingRef.current = true;
                    onReveal();
                    setTimeout(() => { isClosingRef.current = false; }, 100);
                  }}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Validation warning if chunk mismatch */}
              {chunkMismatch && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-700">
                  <p className="font-semibold">⚠️ Blank Mismatch</p>
                  <p className="text-xs mt-1">This blank expects: <code className="bg-red-100 px-1 rounded">{expectedChunkId}</code></p>
                </div>
              )}

              {/* Main answer in highlight */}
              <div className={`p-4 rounded-xl border ${
                chunkMismatch
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gradient-to-r from-primary-50 to-accent-50 border-primary-100'
              }`}>
                <p className={`text-sm uppercase tracking-wider font-semibold mb-1 ${
                  chunkMismatch ? 'text-red-600' : 'text-neutral-500'
                }`}>Answer</p>
                <p className={`text-lg font-bold ${
                  chunkMismatch ? 'text-red-700' : 'text-primary-700'
                }`}>{answer}</p>
              </div>

              {/* Alternatives */}
              {alternatives.length > 0 && (
                <div>
                  <p className="text-xs text-neutral-600 font-semibold uppercase tracking-wider mb-2">Other ways to say it</p>
                  <div className="flex flex-wrap gap-2">
                    {alternatives.map((alt, i) => (
                      <span key={i} className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors">
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Arrow */}
          {placement === 'bottom' && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t-2 border-l-2 border-primary-100 rotate-45"></div>
          )}
          {placement === 'top' && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-primary-100 rotate-45"></div>
          )}
        </div>
      )}
    </span>
  );
};

import { speakText } from '../services/speechService';
import { speakWithGoogle } from '../services/ttsService';

const RoleplayViewer: React.FC<RoleplayViewerProps> = ({ script, onReset }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [revealedBlanks, setRevealedBlanks] = useState<Set<number>>(new Set());
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [activeTab, setActiveTab] = useState<'chunks' | 'summary'>('chunks');
  const [activeSpeechIdx, setActiveSpeechIdx] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [userProgress, setUserProgress] = useState(progressService.getProgress());
  const [celebration, setCelebration] = useState<{
    isVisible: boolean;
    achievement: {
      type: AchievementType;
      message: string;
      soundId?: 'completion' | 'celebration';
    };
  }>({
    isVisible: false,
    achievement: { type: 'scenario_complete', message: '' }
  });

  // Active Recall Quiz State
  const [showActiveRecall, setShowActiveRecall] = useState(false);
  const [activeRecallState, setActiveRecallState] = useState<{
    currentQuestionIndex: number;
    answers: Record<string, string[]>;  // questionId -> selected chunkIds
    startTime: number;
    results: {
      correct: string[];    // question IDs
      incorrect: string[];  // question IDs
    } | null;
  }>({
    currentQuestionIndex: 0,
    answers: {},
    startTime: Date.now(),
    results: null
  });

  const totalSteps = script.dialogue.length;

  // Track previous completion percentage for milestone detection
  const previousCompletionRef = useRef(0);

  // FIX 1: Build unified chunk map (V2 preferred, V1 fallback)
  const allChunks = useMemo(() => {
    if (script.chunkFeedbackV2 && script.chunkFeedbackV2.length > 0) {
      return script.chunkFeedbackV2.map(c => ({
        chunkId: c.chunkId,
        native: c.native,
        meaning: c.learner.meaning
      }));
    } else if (script.chunkFeedback && script.chunkFeedback.length > 0) {
      return script.chunkFeedback.map(c => ({
        chunkId: c.chunkId || `${script.id}-b${c.blankIndex}`,
        native: c.chunk,
        meaning: c.coreFunction
      }));
    }
    return [];
  }, [script]);

  // FIX 5: Precompute O(1) lookup map
  const chunkMap = useMemo(() => {
    return new Map(allChunks.map(c => [c.chunkId, c]));
  }, [allChunks]);

  // FIX 2: Generate relevant options (8-12 per question)
  const getQuestionOptions = useCallback((questionId: string): string[] => {
    const question = script.activeRecall?.find(q => q.id === questionId);
    if (!question) return [];

    // Start with correct answers
    const options = [...question.targetChunkIds];

    // Add 6-10 random distractors (excluding correct answers)
    const distractors = allChunks
      .filter(c => !question.targetChunkIds.includes(c.chunkId))
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    distractors.forEach(d => options.push(d.chunkId));

    // Final shuffle and limit to 8-12 total
    return options.sort(() => Math.random() - 0.5).slice(0, 12);
  }, [script.activeRecall, allChunks]);

  // Initialize progress tracking on mount
  useEffect(() => {
    progressService.markScenarioStarted(script.id);
  }, [script.id]);

  // Save progress on step/blank change
  useEffect(() => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    progressService.updateScenarioProgress(
      script.id,
      currentStep,
      Array.from(revealedBlanks),
      timeSpent
    );
  }, [currentStep, revealedBlanks, script.id, startTime]);

  // Validate chunkFeedback blankIndex values on component mount
  useEffect(() => {
    if (script.chunkFeedback && script.chunkFeedback.length > 0) {
      const maxBlankIndex = script.answerVariations.length;
      const invalidFeedback = script.chunkFeedback.filter(
        f => f.blankIndex < 1 || f.blankIndex > maxBlankIndex
      );

      if (invalidFeedback.length > 0) {
        console.error(
          `[ChunkFeedback Validation] Invalid blankIndex in scenario "${script.id}":`,
          invalidFeedback.map(f => ({
            blankIndex: f.blankIndex,
            chunk: f.chunk,
            maxAllowed: maxBlankIndex
          }))
        );
      }
    }
  }, [script]);

  const handleListen = (lineText: string, lineBlanks: number[], idx: number) => {
    setActiveSpeechIdx(idx);

    // Replace blanks with answers if revealed, otherwise use a placeholder/pause
    let textToSpeak = lineText;
    const parts = lineText.split(/_{6,}/);

    if (parts.length > 1) {
      let reconstructed = "";
      for (let i = 0; i < parts.length; i++) {
        reconstructed += parts[i];
        if (i < lineBlanks.length) {
          const blankIdx = lineBlanks[i];
          if (blankIdx !== undefined) {
            const answer = script.answerVariations.find(v => v.index === blankIdx)?.answer || "";
            reconstructed += revealedBlanks.has(blankIdx) ? answer : "..."; // Slight pause for unrevealed
          }
        }
      }
      textToSpeak = reconstructed;
    }

    speakWithGoogle({
      text: textToSpeak,
      rate: 0.95,
      onEnd: () => setActiveSpeechIdx(null)
    });
  };
  const isFinished = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Mark scenario as completed and trigger celebration
      progressService.markScenarioCompleted(script.id);
      setUserProgress(progressService.getProgress());

      // Show completion celebration
      setCelebration({
        isVisible: true,
        achievement: {
          type: 'scenario_complete',
          message: 'You mastered this conversation!',
          soundId: 'completion'
        }
      });

      // Auto-show deep dive after celebration
      setTimeout(() => {
        setShowDeepDive(true);
      }, 1500);

      // Check for milestones
      const updatedProgress = progressService.getProgress();
      const completionPercentage = (updatedProgress.completedScenarios.length / CURATED_ROLEPLAYS.length) * 100;
      const previousCompletion = previousCompletionRef.current;

      if (completionPercentage >= 50 && previousCompletion < 50) {
        // 50% milestone
        setTimeout(() => {
          setCelebration({
            isVisible: true,
            achievement: {
              type: 'milestone_50',
              message: 'You\'re halfway to mastery!',
              soundId: 'celebration'
            }
          });
        }, 3500);
      } else if (completionPercentage >= 75 && previousCompletion < 75) {
        // 75% milestone
        setTimeout(() => {
          setCelebration({
            isVisible: true,
            achievement: {
              type: 'milestone_75',
              message: 'Almost there! Keep it up!',
              soundId: 'celebration'
            }
          });
        }, 3500);
      } else if (completionPercentage === 100) {
        // 100% milestone
        setTimeout(() => {
          setCelebration({
            isVisible: true,
            achievement: {
              type: 'milestone_100',
              message: 'You\'ve mastered all scenarios!',
              soundId: 'celebration'
            }
          });
        }, 3500);
      }

      previousCompletionRef.current = completionPercentage;
    }
  };

  const handleReset = useCallback(() => {
    progressService.markScenarioCompleted(script.id);
    onReset();
  }, [script.id, onReset]);

  const toggleBlank = useCallback((index: number) => {
    setRevealedBlanks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleBlankReveal = useCallback((blankIndex: number) => {
    // Toggle reveal state
    setRevealedBlanks(prev => {
      const newSet = new Set(prev);
      const wasRevealed = newSet.has(blankIndex);

      if (wasRevealed) {
        newSet.delete(blankIndex);  // Close popup
      } else {
        newSet.add(blankIndex);     // Open popup

        // Play audio for the answer when revealing
        const answerData = script.answerVariations.find(v => v.index === blankIndex);
        if (answerData) {
          // Small delay allows popup to appear first (better UX)
          setTimeout(() => {
            speakWithGoogle({
              text: answerData.answer,
              rate: 0.95
            });
          }, 150);
        }
      }

      return newSet;
    });
  }, [script.answerVariations]);

  // Handler for navigation buttons
  const handleNavigate = useCallback((scenarioId: string) => {
    // Navigate using window location for full page reload/state reset
    window.location.href = `/scenario/${scenarioId}`;
  }, []);

  // Handler for arrow key navigation - previous scenario
  const handleNavigatePrevious = useCallback(() => {
    const prevId = navigationService.getPreviousScenario(script.id, CURATED_ROLEPLAYS);
    if (prevId) {
      handleNavigate(prevId);
    }
  }, [script.id, handleNavigate]);

  // Handler for arrow key navigation - next scenario
  const handleNavigateNext = useCallback(() => {
    const nextId = navigationService.getNextScenario(script.id, CURATED_ROLEPLAYS, userProgress);
    if (nextId) {
      handleNavigate(nextId);
    }
  }, [script.id, userProgress, handleNavigate]);

  // Active Recall Quiz Handlers
  const checkAnswer = useCallback((questionId: string, selectedChunkIds: string[]): boolean => {
    const question = script.activeRecall?.find(q => q.id === questionId);
    if (!question) return false;

    // Must match length (for multi-blank questions)
    if (selectedChunkIds.length !== question.targetChunkIds.length) return false;

    // All targets must be selected (order doesn't matter)
    return question.targetChunkIds.every(id => selectedChunkIds.includes(id));
  }, [script.activeRecall]);

  const calculateResults = useCallback(() => {
    const correct: string[] = [];
    const incorrect: string[] = [];

    script.activeRecall?.forEach(question => {
      const userAnswer = activeRecallState.answers[question.id] || [];
      if (checkAnswer(question.id, userAnswer)) {
        correct.push(question.id);
      } else {
        incorrect.push(question.id);
      }
    });

    setActiveRecallState(prev => ({
      ...prev,
      results: { correct, incorrect }
    }));
  }, [script.activeRecall, activeRecallState.answers, checkAnswer]);

  const handleChunkSelect = useCallback((chunkId: string) => {
    const currentQuestion = script.activeRecall?.[activeRecallState.currentQuestionIndex];
    if (!currentQuestion) return;

    const selectedChunks = activeRecallState.answers[currentQuestion.id] || [];
    const maxSelections = currentQuestion.targetChunkIds.length;

    // If already selected, deselect
    if (selectedChunks.includes(chunkId)) {
      setActiveRecallState(prev => ({
        ...prev,
        answers: {
          ...prev.answers,
          [currentQuestion.id]: selectedChunks.filter(id => id !== chunkId)
        }
      }));
      return;
    }

    // Multi-select (for multi-blank questions)
    if (maxSelections > 1) {
      if (selectedChunks.length < maxSelections) {
        setActiveRecallState(prev => ({
          ...prev,
          answers: {
            ...prev.answers,
            [currentQuestion.id]: [...selectedChunks, chunkId]
          }
        }));
      }
    } else {
      // Single select - replace
      setActiveRecallState(prev => ({
        ...prev,
        answers: {
          ...prev.answers,
          [currentQuestion.id]: [chunkId]
        }
      }));
    }
  }, [script.activeRecall, activeRecallState]);

  const handleQuestionSubmit = useCallback(() => {
    const currentQuestion = script.activeRecall?.[activeRecallState.currentQuestionIndex];
    if (!currentQuestion) return;

    const userAnswer = activeRecallState.answers[currentQuestion.id] || [];

    if (userAnswer.length === 0) {
      // Show validation: "Please select an answer"
      return;
    }

    if (activeRecallState.currentQuestionIndex === (script.activeRecall?.length || 0) - 1) {
      calculateResults();
    } else {
      setActiveRecallState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  }, [script.activeRecall, activeRecallState, calculateResults]);

  // Keyboard navigation
  useKeyboard({
    onNext: handleNext,
    onEscape: () => {
      if (showDeepDive) {
        setShowDeepDive(false);
      }
    },
    onBack: handleReset,
    onNavigatePrevious: handleNavigatePrevious,
    onNavigateNext: handleNavigateNext
  });

  // Auto-scroll to bottom of dialogue
  useEffect(() => {
    const el = document.getElementById('dialogue-container');
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [currentStep]);

  // Phase 5: Save Active Recall results to progress service
  useEffect(() => {
    if (activeRecallState.results) {
      const progress = progressService.getProgress();
      const scenarioProgress = progress.scenarioProgress[script.id];

      if (scenarioProgress) {
        const attempts = scenarioProgress.activeRecallAttempts || [];
        attempts.push({
          attemptedAt: Date.now(),
          score: activeRecallState.results.correct.length,
          totalQuestions: script.activeRecall!.length,
          timeSpentSeconds: Math.floor((Date.now() - activeRecallState.startTime) / 1000)
        });

        scenarioProgress.activeRecallAttempts = attempts;
        progressService.saveProgress(progress);
      }
    }
  }, [activeRecallState.results, script.id, activeRecallState.startTime]);

  let blankGlobalCounter = -1;

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col gap-6 animate-world-entry">
      {/* Header - Warm Gradient */}
      <div className="flex justify-between items-center bg-gradient-to-r from-orange-50 via-white to-teal-50 backdrop-blur-md p-4 rounded-3xl border-2 border-orange-100 shadow-sm gap-4">
        <button
          onClick={handleReset}
          className="group px-5 py-2.5 text-neutral-600 hover:text-primary-600 flex items-center gap-3 font-bold transition-all flex-shrink-0"
          title="Back to Library (Cmd/Ctrl + B)"
        >
          <i className="fas fa-chevron-left text-sm group-hover:-translate-x-1 transition-transform"></i>
          Back to Library
        </button>
        <div className="flex flex-col items-center flex-1">
          <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">{script.category}</span>
          <h2 className="text-lg font-black text-neutral-800 tracking-tight font-display">{script.topic}</h2>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Navigation Buttons */}
          <NavigationButtons
            currentScenarioId={script.id}
            allScenarios={CURATED_ROLEPLAYS}
            onNavigate={handleNavigate}
            isLoading={false}
          />

          {/* Progress Counter */}
          <div className="px-4 py-1.5 bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 rounded-full text-[10px] font-bold whitespace-nowrap">
            {currentStep + 1} / {totalSteps}
          </div>
        </div>
      </div>

      {/* Main Story Area - Warm Gradient */}
      <div className="flex-grow bg-gradient-to-br from-white via-orange-50/20 to-white rounded-[3rem] shadow-2xl shadow-primary-500/10 border-2 border-orange-100 overflow-hidden flex flex-col relative">
        {/* Environment Background Plate - Warm Watercolor */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-orange-50/30 to-transparent flex items-center justify-center pointer-events-none">
          <div className="text-[100px] opacity-[0.05] font-black select-none uppercase">{script.category}</div>
        </div>

        {/* Dialogue Scroll Area */}
        <div
          id="dialogue-container"
          className="flex-grow overflow-y-auto p-8 md:p-12 space-y-8 scroll-smooth"
          style={{ paddingBottom: '240px' }}
        >
          {script.dialogue.slice(0, currentStep + 1).map((line, idx) => {
            const isYou = line.speaker.toLowerCase() === 'you';
            const char = script.characters.find(c => c.name === line.speaker) || { name: line.speaker, description: '' };

            // Handle blanks
            const parts = line.text.split(/_{6,}/);
            const lineBlanks: number[] = [];
            if (parts.length > 1) {
              for (let i = 0; i < parts.length - 1; i++) {
                lineBlanks.push(++blankGlobalCounter);
              }
            }

            return (
              <div
                key={idx}
                className={`flex gap-6 ${isYou ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
              >
                {/* Avatar Slot */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2 animate-float">
                  <div className={`w-16 h-16 rounded-2xl shadow-md flex items-center justify-center text-xl font-bold font-display ${isYou
                    ? 'bg-gradient-to-br from-primary-400 to-primary-500 text-white ring-3 ring-orange-100'
                    : 'bg-gradient-to-br from-accent-400 to-accent-500 text-white ring-3 ring-teal-100'
                    }`}>
                    {char.avatarUrl ? (
                      <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      char?.name?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <span className="text-[9px] font-bold uppercase text-neutral-600 tracking-tight">{char.name}</span>
                </div>

                {/* Speech Bubble Container */}
                <div className={`relative max-w-[80%] group/bubble ${isYou ? 'flex flex-row-reverse' : 'flex'}`}>
                  <div className={`p-6 rounded-3xl text-lg leading-relaxed shadow-md transition-all ${isYou
                    ? 'bg-gradient-to-br from-primary-50 to-primary-100 text-neutral-800 rounded-tr-none border-2 border-primary-200'
                    : 'bg-gradient-to-br from-accent-50 to-accent-100 text-neutral-800 rounded-tl-none border-2 border-accent-200'
                    } ${activeSpeechIdx === idx ? 'ring-2 ring-primary-400 shadow-lg' : ''}`}>
                    <div className="inline">
                      {parts.map((part, pIdx) => (
                        <React.Fragment key={pIdx}>
                          <span className="font-medium">{part}</span>
                          {pIdx < parts.length - 1 && lineBlanks[pIdx] !== undefined && (() => {
                            const blankIdx = lineBlanks[pIdx]!;
                            const answerData = script.answerVariations.find(v => v.index === blankIdx);
                            const blankMapping = script.blanksInOrder?.[blankIdx];
                            const expectedChunkId = blankMapping?.chunkId;
                            return (
                              <InteractiveBlank
                                answer={answerData?.answer || '??'}
                                alternatives={answerData?.alternatives || []}
                                index={blankIdx}
                                isRevealed={revealedBlanks.has(blankIdx)}
                                onReveal={() => handleBlankReveal(blankIdx)}
                                expectedChunkId={expectedChunkId}
                              />
                            );
                          })()}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Listen Button */}
                  <button
                    onClick={() => handleListen(line.text, lineBlanks, idx)}
                    className={`mt-2 mx-2 w-12 h-12 rounded-full flex items-center justify-center transition-all font-bold ${activeSpeechIdx === idx
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white animate-pulse shadow-lg shadow-primary-500/40'
                      : 'bg-white text-neutral-400 hover:text-primary-600 border-2 border-neutral-200 hover:border-primary-300 shadow-md opacity-0 group-hover/bubble:opacity-100'
                      }`}
                    title="Listen to native pronunciation"
                  >
                    <i className={`fas ${activeSpeechIdx === idx ? 'fa-volume-up' : 'fa-volume-low'}`}></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Bar */}
        <div className="absolute bottom-0 left-0 w-full p-10 bg-gradient-to-t from-white via-white/95 to-transparent flex justify-center z-50">
          {!showDeepDive && (
            <button
              onClick={handleNext}
              className="group px-12 py-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-bold text-xl shadow-2xl shadow-primary-500/40 hover:shadow-lg hover:shadow-primary-400/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-4 border-4 border-white"
              title="Advance (Space or Enter)"
            >
              {isFinished ? '✨ Complete Mastery' : 'Next Turn →'}
              <i className="fas fa-chevron-right text-sm group-hover:translate-x-1 transition-transform"></i>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Overlay - Personalized Chunk Feedback */}
      {showDeepDive && (
        <div className="fixed inset-0 z-50 bg-neutral-950/20 backdrop-blur-xl p-8 flex items-center justify-center animate-in fade-in duration-500">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
            {/* Warm gradient header with tabs */}
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 border-b-2 border-primary-100">
              <div className="p-8 flex justify-between items-center">
                <div>
                  {(() => {
                    // TWEAK 3: Derive completion from userProgress
                    const isCompleted = userProgress?.completedScenarios?.includes(script.id) || false;
                    return (
                      <>
                        <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">
                          {isCompleted ? '🎉 Mastery Unlocked' : 'Pattern Recognition'}
                        </span>
                        <h3 className="text-2xl font-black text-neutral-800 font-display">
                          {isCompleted ? 'Your Results' : 'Learning Insights'}
                        </h3>
                      </>
                    );
                  })()}
                </div>
                <button onClick={() => setShowDeepDive(false)} className="w-10 h-10 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:border-primary-300 transition-all">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-t border-primary-200 px-8">
                <button
                  onClick={() => setActiveTab('chunks')}
                  className={`flex-1 py-4 font-semibold text-center transition-colors border-b-2 ${
                    activeTab === 'chunks'
                      ? 'border-primary-500 text-primary-700 bg-white/50'
                      : 'border-transparent text-neutral-600 hover:text-primary-600'
                  }`}
                >
                  💭 Chunk Feedback
                </button>
                {script.patternSummary && (
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`flex-1 py-4 font-semibold text-center transition-colors border-b-2 ${
                      activeTab === 'summary'
                        ? 'border-primary-500 text-primary-700 bg-white/50'
                        : 'border-transparent text-neutral-600 hover:text-primary-600'
                    }`}
                  >
                    📊 Pattern Summary
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-grow overflow-y-auto">
              {activeTab === 'chunks' ? (
                // Chunk Feedback Tab
                <div className="p-8 space-y-4">
                  {(() => {
                    // TWEAK 3: Derive completion from userProgress (reactive)
                    const isCompleted = userProgress?.completedScenarios?.includes(script.id) || false;

                    let filteredFeedback: (ChunkFeedback | ChunkFeedbackV2)[] = [];

                    // TWEAK 4: Always use blanksInOrder if it exists (even for V1)
                    if (script.blanksInOrder && script.blanksInOrder.length > 0) {
                      // TWEAK 2: Build lookup maps once (O(1) lookups instead of O(n²))
                      const v2Map = new Map((script.chunkFeedbackV2 || []).map(f => [f.chunkId, f]));
                      const v1Map = new Map((script.chunkFeedback || []).map(f => [f.chunkId, f]));

                      script.blanksInOrder.forEach((mapping, index) => {
                        // Show if completed OR this index is revealed
                        if (isCompleted || revealedBlanks.has(index)) {
                          // TWEAK 1: Prefer V2, only fallback to V1 if V2 missing (no duplication)
                          const feedback = v2Map.get(mapping.chunkId) || v1Map.get(mapping.chunkId);
                          if (feedback) {
                            filteredFeedback.push(feedback);
                          }
                        }
                      });
                    } else {
                      // Legacy V1 scenarios without blanksInOrder (fallback to blankIndex)
                      const v1Feedback = script.chunkFeedback || [];
                      filteredFeedback = v1Feedback.filter(feedback => {
                        return isCompleted || revealedBlanks.has(feedback.blankIndex);
                      });
                    }

                    // Empty state handling
                    if (filteredFeedback.length === 0) {
                      if (!isCompleted) {
                        return (
                          <div className="flex flex-col items-center justify-center py-12 text-neutral-600">
                            <div className="text-4xl mb-4">✨</div>
                            <p className="font-semibold text-lg">Reveal more blanks to unlock chunk feedback</p>
                            <p className="text-sm mt-2 text-neutral-500">Each chunk you reveal opens personalized insights</p>
                          </div>
                        );
                      } else {
                        // Completed but no feedback data
                        return (
                          <div className="flex flex-col items-center justify-center py-12 text-neutral-600">
                            <div className="text-4xl mb-4">📝</div>
                            <p className="font-semibold text-lg">No chunk feedback available</p>
                            <p className="text-sm mt-2 text-neutral-500">This scenario doesn't have detailed feedback yet</p>
                          </div>
                        );
                      }
                    }

                    // Render feedback cards
                    return filteredFeedback.map((feedback, idx) => (
                      <FeedbackCard
                        key={'chunkId' in feedback ? feedback.chunkId : `${(feedback as ChunkFeedback).blankIndex}`}
                        feedback={feedback}
                        isExpanded={false}
                      />
                    ));
                  })()}
                </div>
              ) : (
                // Pattern Summary Tab
                <div className="p-8 space-y-8">
                  {script.patternSummary ? (
                    <>
                      <PatternSummaryView summary={script.patternSummary} scenario={script} />

                      {/* Active Recall CTA - Only show after completion */}
                      {(() => {
                        const isCompleted = userProgress?.completedScenarios?.includes(script.id) || false;
                        return isCompleted && script.activeRecall && script.activeRecall.length > 0 ? (
                          <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200">
                            <div className="flex items-start gap-4">
                              <div className="text-3xl">🧠</div>
                              <div className="flex-grow">
                                <h3 className="text-lg font-bold text-neutral-800 mb-2">
                                  Test Your Knowledge
                                </h3>
                                <p className="text-sm text-neutral-600 mb-4">
                                  Reinforce what you learned with {script.activeRecall.length} active recall questions
                                </p>
                                <button
                                  onClick={() => {
                                    // FIX 1: Unified chunk validation (V2 or V1)
                                    const hasChunks = (script.chunkFeedbackV2 && script.chunkFeedbackV2.length > 0) ||
                                                      (script.chunkFeedback && script.chunkFeedback.length > 0);
                                    if (!hasChunks) {
                                      console.error('Active Recall requires chunk feedback data (V1 or V2)');
                                      return;
                                    }
                                    setShowActiveRecall(true);
                                  }}
                                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors active:scale-95"
                                >
                                  Start Active Recall →
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-neutral-600">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="font-semibold text-lg">No pattern summary available</p>
                      <p className="text-sm mt-2 text-neutral-500">This scenario doesn't have consolidated pattern insights yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer with warm gradient */}
            <div className="p-8 bg-gradient-to-r from-orange-50 to-teal-50 border-t-2 border-orange-100">
              <button
                onClick={handleReset}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                🏆 Return to Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Recall Modal */}
      {showActiveRecall && script.activeRecall && (
        <div className="fixed inset-0 z-50 bg-neutral-950/20 backdrop-blur-xl p-8 flex items-center justify-center animate-in fade-in duration-500">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
            {/* Header with progress bar */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-b-2 border-orange-100 p-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <i className="fas fa-brain text-white text-lg"></i>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">
                      Active Recall Test
                    </span>
                    <h3 className="text-2xl font-black text-neutral-800">
                      Question {activeRecallState.currentQuestionIndex + 1} of {script.activeRecall.length}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!activeRecallState.results && Object.keys(activeRecallState.answers).length > 0) {
                      const confirmed = window.confirm('Are you sure you want to exit? Your progress will be lost.');
                      if (!confirmed) return;
                    }
                    setShowActiveRecall(false);
                    setActiveRecallState({
                      currentQuestionIndex: 0,
                      answers: {},
                      startTime: Date.now(),
                      results: null
                    });
                  }}
                  className="w-10 h-10 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:border-orange-300 transition-all"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-1">
                {script.activeRecall.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                    i < activeRecallState.currentQuestionIndex ? 'bg-success-500' :
                    i === activeRecallState.currentQuestionIndex ? 'bg-orange-500' :
                    'bg-neutral-300'
                  }`} />
                ))}
              </div>
            </div>

            {/* Content area - questions or results */}
            <div className="flex-grow overflow-y-auto p-8">
              {!activeRecallState.results ? (
                // Question View
                (() => {
                  const currentQuestion = script.activeRecall?.[activeRecallState.currentQuestionIndex];
                  if (!currentQuestion) return null;

                  const questionOptions = getQuestionOptions(currentQuestion.id);
                  const selectedChunks = activeRecallState.answers[currentQuestion.id] || [];
                  const hasAnswer = selectedChunks.length > 0;

                  return (
                    <div className="space-y-6">
                      {/* Question Prompt */}
                      <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                        <p className="text-lg font-semibold text-neutral-800">
                          {currentQuestion.prompt}
                        </p>

                        {/* FIX 4: Selection Counter with "any order" guidance */}
                        {currentQuestion.targetChunkIds.length > 1 && (
                          <p className="text-sm text-neutral-600 mt-2">
                            Select {currentQuestion.targetChunkIds.length} chunks (any order)
                            — {selectedChunks.length}/{currentQuestion.targetChunkIds.length} selected
                          </p>
                        )}
                      </div>

                      {/* Chunk Options */}
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">
                          Select Answer:
                        </p>
                        {questionOptions.map(chunkId => {
                          const chunk = chunkMap.get(chunkId);
                          if (!chunk) return null;

                          const isSelected = selectedChunks.includes(chunkId);

                          return (
                            <button
                              key={chunkId}
                              onClick={() => handleChunkSelect(chunkId)}
                              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                isSelected
                                  ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                                  : 'border-neutral-200 hover:border-orange-300 hover:bg-neutral-50'
                              }`}
                            >
                              <p className="font-bold text-neutral-800">{chunk.native}</p>
                              <p className="text-sm text-neutral-600 mt-1">{chunk.meaning}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()
              ) : (
                // Results View
                (() => {
                  const getPerformanceMessage = (score: number, total: number): string => {
                    const percentage = (score / total) * 100;
                    if (percentage === 100) return "Perfect! You've mastered these patterns.";
                    if (percentage >= 80) return "Excellent work! You're building strong pattern recognition.";
                    if (percentage >= 60) return "Good progress! Review the mistakes to reinforce learning.";
                    return "Keep practicing! These patterns will become natural with repetition.";
                  };

                  return (
                    <div className="space-y-6">
                      {/* FIX 7: Score Summary without emojis, with icons instead */}
                      <div className="text-center space-y-4 pb-6 border-b-2 border-neutral-200">
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                          activeRecallState.results.correct.length === script.activeRecall!.length
                            ? 'bg-success-100 text-success-700'
                            : activeRecallState.results.correct.length >= script.activeRecall!.length * 0.7
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          <i className={`fas ${
                            activeRecallState.results.correct.length === script.activeRecall!.length
                              ? 'fa-trophy'
                              : activeRecallState.results.correct.length >= script.activeRecall!.length * 0.7
                              ? 'fa-star'
                              : 'fa-chart-line'
                          } text-4xl`}></i>
                        </div>
                        <h3 className="text-3xl font-black text-neutral-800">
                          {activeRecallState.results.correct.length} / {script.activeRecall!.length} Correct
                        </h3>
                        <p className="text-xl text-neutral-600">
                          {Math.round((activeRecallState.results.correct.length / script.activeRecall!.length) * 100)}% Accuracy
                        </p>
                        <p className="text-sm text-neutral-500">
                          {getPerformanceMessage(
                            activeRecallState.results.correct.length,
                            script.activeRecall!.length
                          )}
                        </p>
                      </div>

                      {/* Question Review */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-neutral-700">Review Your Answers:</h4>
                        {script.activeRecall!.map((question, idx) => {
                          const isCorrect = activeRecallState.results!.correct.includes(question.id);
                          const userAnswer = activeRecallState.answers[question.id] || [];

                          return (
                            <div key={question.id} className={`p-4 rounded-xl border-2 ${
                              isCorrect ? 'border-success-500 bg-success-50' : 'border-red-500 bg-red-50'
                            }`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  isCorrect ? 'bg-success-500' : 'bg-red-500'
                                }`}>
                                  <i className={`fas ${isCorrect ? 'fa-check' : 'fa-times'} text-white text-sm`}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-neutral-800 mb-2 break-words">
                                    Q{idx + 1}: {question.prompt}
                                  </p>
                                  <div className="text-sm space-y-1">
                                    <div>
                                      <span className="font-semibold text-neutral-700">Your answer: </span>
                                      <span className="text-neutral-600">
                                        {/* FIX 5: Use chunkMap instead of .find() */}
                                        {userAnswer.map(chunkId => chunkMap.get(chunkId)?.native).filter(Boolean).join(', ') || '(not answered)'}
                                      </span>
                                    </div>
                                    {!isCorrect && (
                                      <div>
                                        <span className="font-semibold text-success-700">Correct answer: </span>
                                        <span className="text-success-600">
                                          {/* FIX 5: Use chunkMap instead of .find() */}
                                          {question.targetChunkIds.map(chunkId => chunkMap.get(chunkId)?.native).filter(Boolean).join(', ')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => {
                            setActiveRecallState({
                              currentQuestionIndex: 0,
                              answers: {},
                              startTime: Date.now(),
                              results: null
                            });
                          }}
                          className="flex-1 py-3 border-2 border-orange-500 text-orange-700 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          Retry Quiz
                        </button>
                        <button
                          onClick={() => {
                            setShowActiveRecall(false);
                            setActiveRecallState({
                              currentQuestionIndex: 0,
                              answers: {},
                              startTime: Date.now(),
                              results: null
                            });
                          }}
                          className="flex-1 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Footer with navigation */}
            <div className="p-6 border-t border-neutral-200 flex gap-3">
              <button
                onClick={() => {
                  setActiveRecallState(prev => ({
                    ...prev,
                    currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1)
                  }));
                }}
                disabled={activeRecallState.currentQuestionIndex === 0 || !!activeRecallState.results}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeRecallState.currentQuestionIndex === 0 || activeRecallState.results
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                ← Back
              </button>
              <button
                onClick={handleQuestionSubmit}
                disabled={(() => {
                  const currentQuestion = script.activeRecall?.[activeRecallState.currentQuestionIndex];
                  const hasAnswer = (activeRecallState.answers[currentQuestion?.id || '']?.length || 0) > 0;
                  return !hasAnswer || !!activeRecallState.results;
                })()}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  (() => {
                    const currentQuestion = script.activeRecall?.[activeRecallState.currentQuestionIndex];
                    const hasAnswer = (activeRecallState.answers[currentQuestion?.id || '']?.length || 0) > 0;
                    return hasAnswer && !activeRecallState.results
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-neutral-300 text-neutral-500 cursor-not-allowed';
                  })()
                }`}
              >
                {activeRecallState.currentQuestionIndex === (script.activeRecall?.length || 0) - 1 ? 'Submit Quiz' : 'Next Question'} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Overlay */}
      <CelebrationOverlay
        isVisible={celebration.isVisible}
        achievement={celebration.achievement}
        onDismiss={() => setCelebration({ ...celebration, isVisible: false })}
      />
    </div>
  );
};

export default RoleplayViewer;
