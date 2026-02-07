
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RoleplayScript } from '../services/staticData';
import { progressService } from '../services/progressService';
import { useKeyboard } from '../hooks/useKeyboard';



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
    <span className="relative inline-block group mx-1 align-baseline interactive-blank-container">
      <button
        onClick={onReveal}
        className={`px-4 py-1.5 transition-all duration-300 rounded-xl font-bold border-2 flex items-center gap-2 justify-center ${isRevealed
          ? 'border-indigo-500 bg-white text-indigo-700 shadow-md ring-4 ring-indigo-500/10 scale-105 z-20 min-w-fit'
          : 'border-slate-200 bg-slate-50/50 text-slate-300 hover:border-indigo-400 hover:text-indigo-500 hover:bg-white z-0 min-w-[120px]'
          }`}
      >
        {!isRevealed && (
          <span className="text-[10px] text-slate-300 font-black uppercase tracking-tighter">Slot {index}</span>
        )}
        <span className="tracking-tight whitespace-nowrap font-semibold">
          {isRevealed ? answer : 'REVEAL'}
        </span>
        {isRevealed ? (
          <i className="fas fa-times text-[10px] text-slate-400 hover:text-red-500 ml-1"></i>
        ) : (
          <i className="fas fa-eye text-[10px] text-slate-300 group-hover:text-indigo-400"></i>
        )}
      </button>

      {isRevealed && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-64 p-5 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 z-[100] animate-in zoom-in-95 fade-in duration-300">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Native Alternatives</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  isClosingRef.current = true;
                  onReveal();
                  setTimeout(() => { isClosingRef.current = false; }, 100);
                }}
                className="text-slate-300 hover:text-slate-500"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {alternatives.length > 0 ? alternatives.map((alt, i) => (
                <span key={i} className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100">
                  {alt}
                </span>
              )) : <span className="text-slate-400 text-[10px] italic">No common alternatives</span>}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-4 h-4 bg-white border-b border-r border-slate-100 rotate-45"></div>
        </div>
      )}
    </span>
  );
};

import { speakText } from '../services/speechService';

const RoleplayViewer: React.FC<RoleplayViewerProps> = ({ script, onReset }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [revealedBlanks, setRevealedBlanks] = useState<Set<number>>(new Set());
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [activeSpeechIdx, setActiveSpeechIdx] = useState<number | null>(null);
  const [startTime] = useState(Date.now());

  const totalSteps = script.dialogue.length;

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
          const answer = script.answerVariations.find(v => v.index === blankIdx)?.answer || "";
          reconstructed += revealedBlanks.has(blankIdx) ? answer : "..."; // Slight pause for unrevealed
        }
      }
      textToSpeak = reconstructed;
    }

    speakText(textToSpeak, {
      onEnd: () => setActiveSpeechIdx(null)
    });
  };
  const isFinished = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      progressService.markScenarioCompleted(script.id);
      setShowDeepDive(true);
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

  // Keyboard navigation
  useKeyboard({
    onNext: handleNext,
    onEscape: () => {
      if (showDeepDive) {
        setShowDeepDive(false);
      }
    },
    onBack: handleReset
  });

  // Auto-scroll to bottom of dialogue
  useEffect(() => {
    const el = document.getElementById('dialogue-container');
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [currentStep]);

  let blankGlobalCounter = 0;

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col gap-6 animate-world-entry">
      {/* Header */}
      <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white shadow-sm">
        <button
          onClick={handleReset}
          className="group px-5 py-2.5 text-slate-600 hover:text-indigo-600 flex items-center gap-3 font-bold transition-all"
          title="Back to Library (Cmd/Ctrl + B)"
        >
          <i className="fas fa-chevron-left text-sm group-hover:-translate-x-1 transition-transform"></i>
          Back to Library
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{script.category}</span>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">{script.topic}</h2>
        </div>
        <div className="w-[120px] flex justify-end">
          <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black">
            {currentStep + 1} / {totalSteps}
          </div>
        </div>
      </div>

      {/* Main Story Area */}
      <div className="flex-grow bg-white rounded-[3rem] shadow-2xl shadow-indigo-500/5 border border-slate-100 overflow-hidden flex flex-col relative">
        {/* Environment Background Plate (Placeholder style) */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-indigo-50 to-transparent flex items-center justify-center pointer-events-none">
          <div className="text-[100px] opacity-[0.03] font-black select-none uppercase">{script.category}</div>
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
                  <div className={`w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center text-xl font-black ${isYou ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                    {char.avatarUrl ? (
                      <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      char.name[0]
                    )}
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{char.name}</span>
                </div>

                {/* Speech Bubble Container */}
                <div className={`relative max-w-[80%] group/bubble ${isYou ? 'flex flex-row-reverse' : 'flex'}`}>
                  <div className={`p-6 rounded-[2rem] text-lg leading-relaxed shadow-sm transition-all ${isYou
                    ? 'bg-slate-50 text-slate-800 rounded-tr-none border border-slate-100'
                    : 'bg-indigo-50 text-indigo-900 rounded-tl-none border border-indigo-100/50'
                    } ${activeSpeechIdx === idx ? 'ring-2 ring-indigo-400' : ''}`}>
                    <div className="inline">
                      {parts.map((part, pIdx) => (
                        <React.Fragment key={pIdx}>
                          <span className="font-medium">{part}</span>
                          {pIdx < parts.length - 1 && (
                            <InteractiveBlank
                              answer={script.answerVariations.find(v => v.index === lineBlanks[pIdx])?.answer || '??'}
                              alternatives={script.answerVariations.find(v => v.index === lineBlanks[pIdx])?.alternatives || []}
                              index={lineBlanks[pIdx]}
                              isRevealed={revealedBlanks.has(lineBlanks[pIdx])}
                              onReveal={() => toggleBlank(lineBlanks[pIdx])}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Listen Button */}
                  <button
                    onClick={() => handleListen(line.text, lineBlanks, idx)}
                    className={`mt-2 mx-2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeSpeechIdx === idx
                      ? 'bg-indigo-600 text-white animate-pulse shadow-lg shadow-indigo-200'
                      : 'bg-white text-slate-400 hover:text-indigo-600 border border-slate-100 shadow-sm opacity-0 group-hover/bubble:opacity-100'
                      }`}
                    title="Listen to native pronunciation"
                  >
                    <i className={`fas ${activeSpeechIdx === idx ? 'fa-volume-up' : 'fa-volume-low'} text-xs`}></i>
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
              className="group px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-500/40 hover:bg-slate-900 hover:shadow-slate-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-4 border-4 border-white"
              title="Advance (Space or Enter)"
            >
              {isFinished ? 'Complete Mastery' : 'Next Turn'}
              <i className="fas fa-chevron-right text-sm"></i>
            </button>
          )}
        </div>
      </div>

      {/* Deep Dive Overlay / Section */}
      {showDeepDive && (
        <div className="fixed inset-0 z-50 bg-slate-950/20 backdrop-blur-xl p-8 flex items-center justify-center animate-in fade-in duration-500">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Story Conclusion</span>
                <h3 className="text-2xl font-black text-slate-900">Author's Deep Dive</h3>
              </div>
              <button onClick={() => setShowDeepDive(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-8 space-y-6">
              {script.deepDive.map((dive) => (
                <div key={dive.index} className="flex gap-4 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/30">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black flex-shrink-0 shadow-lg shadow-indigo-500/20">
                    {dive.index}
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-indigo-900 text-lg uppercase tracking-tight">"{dive.phrase}"</p>
                    <p className="text-slate-600 leading-relaxed font-medium">{dive.insight}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <button
                onClick={handleReset}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:shadow-xl transition-all active:scale-95"
              >
                Finish Journey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleplayViewer;
