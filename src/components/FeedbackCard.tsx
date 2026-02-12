import React, { useState } from 'react';
import { ChunkFeedback, ChunkFeedbackV2 } from '../services/staticData';

interface FeedbackCardProps {
  feedback: ChunkFeedback | ChunkFeedbackV2;
  isExpanded?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Openers': '👋',
  'Softening': '🤝',
  'Disagreement': '💭',
  'Repair': '🔧',
  'Exit': '👋',
  'Idioms': '💡',
  'Chunk': '📌'  // Neutral category for V2 feedback
};

const CATEGORY_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  'Openers': { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  'Softening': { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
  'Disagreement': { bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  'Repair': { bg: 'from-green-50 to-green-100', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
  'Exit': { bg: 'from-red-50 to-red-100', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
  'Idioms': { bg: 'from-indigo-50 to-indigo-100', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700' },
  'Chunk': { bg: 'from-slate-50 to-slate-100', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700' }  // Neutral for V2
};

/**
 * Type guard to differentiate between V1 ChunkFeedback and V2 ChunkFeedbackV2
 */
function isChunkFeedbackV2(feedback: ChunkFeedback | ChunkFeedbackV2): feedback is ChunkFeedbackV2 {
  return 'native' in feedback && 'learner' in feedback;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, isExpanded: initialExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  // TWEAK 5: For V2, use 'Chunk' category (neutral, not domain-specific)
  // For V1, use the actual category
  const category = isChunkFeedbackV2(feedback) ? 'Chunk' : (feedback as ChunkFeedback).category;
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS['Idioms'];
  const icon = CATEGORY_ICONS[category] || '💡';

  return (
    <div className={`rounded-2xl border-2 ${colors.border} overflow-hidden transition-all duration-300`}>
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-6 py-4 bg-gradient-to-r ${colors.bg} flex items-center justify-between hover:opacity-90 transition-opacity cursor-pointer`}
      >
        <div className="flex items-center gap-4 text-left">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="text-sm font-bold text-neutral-600 uppercase tracking-wider">
              {category}
            </p>
            <p className="text-lg font-bold text-neutral-800">
              "{isChunkFeedbackV2(feedback) ? feedback.native : (feedback as ChunkFeedback).chunk}"
            </p>
          </div>
        </div>
        <div className={`text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <i className="fas fa-chevron-down"></i>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-white p-6 space-y-6 animate-in slide-in-from-top duration-300">
          {isChunkFeedbackV2(feedback) ? (
            // V2 Layout (Template-compliant)
            <>
              {/* Meaning */}
              <div>
                <h4 className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-2">Meaning</h4>
                <p className="text-neutral-700 leading-relaxed">{feedback.learner.meaning}</p>
              </div>

              {/* Use When */}
              <div>
                <h4 className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-2">Use When</h4>
                <p className="text-neutral-700 leading-relaxed">{feedback.learner.useWhen}</p>
              </div>

              {/* Common Wrong */}
              <div>
                <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">❌ Common Mistake</h4>
                <p className="text-neutral-700 italic bg-red-50 p-3 rounded-lg border border-red-100">{feedback.learner.commonWrong}</p>
              </div>

              {/* Fix */}
              <div>
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">✓ Better Way</h4>
                <p className="text-neutral-700 font-semibold bg-green-50 p-3 rounded-lg border border-green-100">{feedback.learner.fix}</p>
              </div>

              {/* Why It Sounds Odd */}
              <div>
                <h4 className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-2">Why It Sounds Odd</h4>
                <p className="text-neutral-700 leading-relaxed">{feedback.learner.whyOdd}</p>
              </div>

              {/* Examples */}
              {feedback.examples && feedback.examples.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-3">Examples</h4>
                  <div className="space-y-2">
                    {feedback.examples.map((example, idx) => (
                      <div key={idx} className="text-neutral-700 italic p-3 bg-primary-50 rounded-lg border border-primary-100">
                        "{example}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            // V1 Layout (Original)
            <>
              {/* A. Core Function */}
              <div>
                <h4 className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-2">Why It Works</h4>
                <p className="text-neutral-700 leading-relaxed text-base">{(feedback as ChunkFeedback).coreFunction}</p>
              </div>

              {/* B. Real-Life Situations */}
              <div>
                <h4 className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-3">3 Real-Life Situations</h4>
                <div className="space-y-3">
                  {((feedback as ChunkFeedback).situations || []).map((situation, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-primary-50 to-accent-50 p-4 rounded-xl border border-primary-100">
                      <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
                        {situation?.context || 'Context'}
                      </p>
                      <p className="text-neutral-700 italic">
                        <span className="font-bold text-primary-700">"{(feedback as ChunkFeedback).chunk}"</span>
                        {situation?.example?.includes((feedback as ChunkFeedback).chunk)
                          ? ` ${(situation?.example || '').replace((feedback as ChunkFeedback).chunk, '').trim()}`
                          : ` - ${situation?.example || ''}`
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* C. Native Usage Notes */}
              <div>
                <h4 className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-2">Native Usage Notes</h4>
                <ul className="space-y-2">
                  {((feedback as ChunkFeedback).nativeUsageNotes || []).map((note, idx) => (
                    <li key={idx} className="flex gap-3 text-neutral-700 line-clamp-2">
                      <span className="text-primary-500 font-bold flex-shrink-0">✓</span>
                      <span>{note || ''}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* D. Non-Native Contrast */}
              <div>
                <h4 className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-3">Non-Native vs Native</h4>
                <div className="space-y-3">
                  {((feedback as ChunkFeedback).nonNativeContrast || []).map((contrast, idx) => (
                    <div key={idx} className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                      {/* Non-Native */}
                      <div className="flex gap-3">
                        <span className="text-red-500 font-bold text-lg flex-shrink-0">✗</span>
                        <p className="text-neutral-600 italic line-clamp-2">{contrast?.nonNative || ''}</p>
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center gap-3 px-6">
                        <div className="flex-grow h-px bg-gradient-to-r from-transparent to-neutral-300"></div>
                        <span className="text-xs text-neutral-400 font-semibold">vs</span>
                        <div className="flex-grow h-px bg-gradient-to-l from-transparent to-neutral-300"></div>
                      </div>

                      {/* Native */}
                      <div className="flex gap-3">
                        <span className="text-green-500 font-bold text-lg flex-shrink-0">✓</span>
                        <p className="text-neutral-700 font-semibold line-clamp-2">{contrast?.native || ''}</p>
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-neutral-600 mt-2 pt-2 border-t border-neutral-200 line-clamp-3">
                        <span className="font-semibold">Why:</span> {contrast?.explanation || ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackCard;
