import React from 'react';
import { PatternSummary, ChunkCategory, RoleplayScript } from '../services/staticData';
import { resolveChunkIds } from '../services/feedbackGeneration/chunkIdGenerator';

interface PatternSummaryViewProps {
  summary: PatternSummary;
  scenario?: RoleplayScript;  // NEW - Optional scenario for resolving chunkIds
}

// Category colors and icons (consistent with FeedbackCard)
const CATEGORY_COLORS: Record<ChunkCategory, { bg: string; text: string; border: string }> = {
  'Openers': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Softening': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Disagreement': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Repair': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Exit': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Idioms': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
};

const CATEGORY_ICONS: Record<ChunkCategory, string> = {
  'Openers': '👋',
  'Softening': '🤝',
  'Disagreement': '💭',
  'Repair': '🔧',
  'Exit': '👋',
  'Idioms': '💡',
};

/**
 * Display consolidated pattern insights from a scenario's chunkFeedback
 * Shows category breakdown, learning outcome, and cross-chunk patterns
 * NEW: Resolves chunkIds and displays native/non-native contrast if available
 */
const PatternSummaryView: React.FC<PatternSummaryViewProps> = ({ summary, scenario }) => {
  if (!summary) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No pattern summary available for this scenario.</p>
      </div>
    );
  }

  // Helper to resolve chunkIds to text
  const resolveChunksForDisplay = (chunkIds?: string[]): string[] => {
    if (!chunkIds || !scenario) return [];
    return resolveChunkIds(chunkIds, scenario);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Overall Learning Outcome */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span>🎯</span>
          <span>Learning Outcome</span>
        </h3>
        <p className="text-gray-700 leading-relaxed text-sm">
          {summary.overallInsight}
        </p>
      </div>

      {/* Category Breakdown */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>📊</span>
          <span>Pattern Categories</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summary.categoryBreakdown.map((breakdown, idx) => {
            // Use categoryKey for styling (machine key, always a standard enum)
            // Fall back to deprecated category field for backward compatibility
            const styleKey = (breakdown.categoryKey || breakdown.category || 'Idioms') as ChunkCategory;
            const colors = CATEGORY_COLORS[styleKey] || CATEGORY_COLORS['Idioms'];
            const icon = CATEGORY_ICONS[styleKey] || '💡';
            // Display label: prefer new categoryLabel, fall back to old customLabel, then styleKey
            const displayLabel = breakdown.categoryLabel || breakdown.customLabel || styleKey;
            // NEW: Prefer exampleChunkIds over examples (with fallback)
            const displayChunks = resolveChunksForDisplay(breakdown.exampleChunkIds) || breakdown.examples || [];

            return (
              <div
                key={idx}
                className={`${colors.bg} border ${colors.border} rounded-lg p-3`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-semibold ${colors.text}`}>
                        {displayLabel}
                      </h4>
                      <span className="text-xs font-medium px-2 py-1 rounded bg-white/60">
                        {breakdown.count} chunk{breakdown.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {breakdown.insight}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {displayChunks.map((chunk, i) => (
                        <span
                          key={i}
                          className="text-xs bg-white/80 px-2 py-1 rounded border border-gray-200"
                        >
                          "{chunk}"
                        </span>
                      ))}
                    </div>
                    {/* NEW: Display native/non-native contrast if available */}
                    {breakdown.nativePatterns && breakdown.commonMistakes && (
                      <div className="mt-2 pt-2 border-t border-gray-300 space-y-1">
                        {breakdown.nativePatterns.map((native, i) => (
                          <div key={i} className="grid grid-cols-2 gap-1 text-xs">
                            <div className="bg-red-100/60 border border-red-300 rounded px-1.5 py-0.5">
                              <span className="text-red-700 font-medium">✗</span>
                              <span className="text-red-700 ml-0.5 line-clamp-1">{breakdown.commonMistakes![i]}</span>
                            </div>
                            <div className="bg-green-100/60 border border-green-300 rounded px-1.5 py-0.5">
                              <span className="text-green-700 font-medium">✓</span>
                              <span className="text-green-700 ml-0.5 line-clamp-1">{native}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Patterns */}
      {summary.keyPatterns.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>🔗</span>
            <span>Cross-Chunk Patterns</span>
          </h3>
          <div className="space-y-3">
            {summary.keyPatterns.map((pattern, idx) => {
              // NEW: Prefer chunkIds over chunks (with fallback)
              const displayChunks = resolveChunksForDisplay(pattern.chunkIds) || pattern.chunks || [];

              return (
                <div
                  key={idx}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">🔍</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {pattern.pattern}
                      </h4>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-3">
                        {pattern.explanation}
                      </p>
                      {displayChunks.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-500 font-medium">Related chunks:</span>
                          {displayChunks.map((chunk, i) => (
                            <span
                              key={i}
                              className="text-xs bg-white px-2 py-1 rounded border border-gray-300"
                            >
                              "{chunk}"
                            </span>
                          ))}
                        </div>
                      )}
                      {/* NEW: Display native/non-native contrast if available */}
                      {pattern.nativePatterns && pattern.commonMistakes && (
                        <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                          {pattern.nativePatterns.map((native, i) => (
                            <div key={i} className="grid grid-cols-2 gap-1 text-xs">
                              <div className="bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
                                <span className="text-red-700 font-medium">✗</span>
                                <span className="text-red-700 ml-0.5 line-clamp-1">{pattern.commonMistakes![i]}</span>
                              </div>
                              <div className="bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                                <span className="text-green-700 font-medium">✓</span>
                                <span className="text-green-700 ml-0.5 line-clamp-1">{native}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips for Learning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>How to Use This</span>
        </h4>
        <ul className="text-xs text-gray-700 space-y-1 ml-6 list-disc">
          <li>Review each pattern category to understand your focus areas</li>
          <li>Notice the cross-chunk patterns to see how they work together</li>
          <li>Compare your approach with the insights to improve fluency</li>
          <li>Try using these patterns in future conversations</li>
        </ul>
      </div>
    </div>
  );
};

export default PatternSummaryView;
