
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useFloating, flip, shift, offset } from '@floating-ui/react';
import { RoleplayScript, CURATED_ROLEPLAYS } from '../services/staticData';
import { progressService } from '../services/progressService';
import { audioService } from '../services/audioService';
import { navigationService } from '../services/navigationService';
import { useKeyboard } from '../hooks/useKeyboard';
import NavigationButtons from './NavigationButtons';
import CelebrationOverlay from './CelebrationOverlay';
import FeedbackCard from './FeedbackCard';
import { AchievementType } from '../types/ux-enhancements';



interface RoleplayViewerProps {
  script: RoleplayScript;
  onReset: () => void;
}

const InteractiveBlank: React.FC<{
  answer: string;
  alternatives: string[];
  index: number;
  isRevealed: boolean;
  onReveal: () => void;
}> = ({ answer, alternatives, index, isRevealed, onReveal }) => {
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
        className={`px-4 py-1.5 transition-all duration-300 rounded-xl font-bold border-2 flex items-center gap-2 justify-center ${isRevealed
          ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 shadow-md ring-4 ring-primary-500/20 scale-105 z-20 min-w-fit'
          : 'border-dashed border-primary-300 bg-gradient-to-r from-orange-100/50 to-teal-100/50 text-neutral-600 hover:border-primary-400 hover:text-primary-600 hover:bg-gradient-to-r hover:from-orange-100 hover:to-teal-100 z-0 min-w-[140px]'
          }`}
      >
        {!isRevealed && (
          <span className="text-[10px] text-primary-500 font-bold uppercase tracking-tighter">✨ Tap to discover</span>
        )}
        <span className="tracking-tight whitespace-nowrap font-semibold">
          {isRevealed ? answer : ''}
        </span>
        {isRevealed ? (
          <i className="fas fa-times text-[10px] text-neutral-400 hover:text-neutral-600 ml-1"></i>
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
              {/* Main answer in highlight */}
              <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-4 rounded-xl border border-primary-100">
                <p className="text-sm text-neutral-500 uppercase tracking-wider font-semibold mb-1">Answer</p>
                <p className="text-lg font-bold text-primary-700">{answer}</p>
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

  const totalSteps = script.dialogue.length;

  // Track previous completion percentage for milestone detection
  const previousCompletionRef = useRef(0);

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

  let blankGlobalCounter = 0;

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
                          {pIdx < parts.length - 1 && lineBlanks[pIdx] !== undefined && (
                            <InteractiveBlank
                              answer={script.answerVariations.find(v => v.index === lineBlanks[pIdx])?.answer || '??'}
                              alternatives={script.answerVariations.find(v => v.index === lineBlanks[pIdx])?.alternatives || []}
                              index={lineBlanks[pIdx]!}
                              isRevealed={revealedBlanks.has(lineBlanks[pIdx]!)}
                              onReveal={() => handleBlankReveal(lineBlanks[pIdx]!)}
                            />
                          )}
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
            {/* Warm gradient header */}
            <div className="p-8 bg-gradient-to-r from-primary-50 to-accent-50 border-b-2 border-primary-100 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Pattern Recognition</span>
                <h3 className="text-2xl font-black text-neutral-800 font-display">Chunk Feedback</h3>
              </div>
              <button onClick={() => setShowDeepDive(false)} className="w-10 h-10 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:border-primary-300 transition-all">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Feedback list */}
            <div className="flex-grow overflow-y-auto p-8 space-y-4">
              {(() => {
                const filteredFeedback = (script.chunkFeedback || []).filter(
                  feedback => revealedBlanks.has(feedback.blankIndex)
                );

                if (filteredFeedback.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-12 text-neutral-600">
                      <div className="text-4xl mb-4">✨</div>
                      <p className="font-semibold text-lg">Reveal more blanks to unlock chunk feedback</p>
                      <p className="text-sm mt-2 text-neutral-500">Each chunk you reveal opens personalized insights</p>
                    </div>
                  );
                }

                return filteredFeedback.map((feedback) => (
                  <FeedbackCard
                    key={feedback.blankIndex}
                    feedback={feedback}
                    isExpanded={false}
                  />
                ));
              })()}
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
