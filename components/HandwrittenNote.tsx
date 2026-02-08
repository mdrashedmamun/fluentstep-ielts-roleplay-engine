/**
 * HandwrittenNote Component
 * Sticky note-style card with Caveat handwritten font
 * Used for milestone encouragement messages
 */

import React from 'react';

interface HandwrittenNoteProps {
  message: string;
  author?: string;
  rotation?: number;
  color?: 'yellow' | 'orange' | 'teal';
}

const HandwrittenNote: React.FC<HandwrittenNoteProps> = ({
  message,
  author = "Your FluentStep Coach",
  rotation = 0,
  color = 'yellow'
}) => {
  const bgColors = {
    yellow: 'bg-gradient-to-br from-yellow-100 to-orange-50',
    orange: 'bg-gradient-to-br from-orange-100 to-primary-50',
    teal: 'bg-gradient-to-br from-teal-100 to-accent-50'
  };

  const borderColors = {
    yellow: 'border-yellow-200',
    orange: 'border-orange-200',
    teal: 'border-teal-200'
  };

  const pinColors = {
    yellow: 'from-yellow-400 to-yellow-500',
    orange: 'from-primary-400 to-primary-500',
    teal: 'from-accent-400 to-accent-500'
  };

  return (
    <div
      className={`relative ${bgColors[color]} p-6 rounded-2xl shadow-md border-2 ${borderColors[color]} animate-in fade-in zoom-in-95 duration-500`}
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center',
        fontFamily: "'Caveat', cursive",
        fontSize: '1.5rem',
        lineHeight: '1.6'
      }}
    >
      {/* Main message text */}
      <p className="text-neutral-800 font-semibold tracking-wide">{message}</p>

      {/* Author signature */}
      <p className="text-xs font-normal text-neutral-600 mt-3 italic">
        — {author}
      </p>

      {/* Decorative pin */}
      <div
        className={`absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br ${pinColors[color]} rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform`}
      >
        <div className="w-3 h-3 bg-white rounded-full"></div>
      </div>

      {/* Tape effect (subtle) */}
      <div
        className="absolute -top-2 -left-2 w-12 h-8 bg-white opacity-20 rounded-sm"
        style={{
          transform: 'rotate(-5deg)',
          boxShadow: 'inset 0 0 4px rgba(0,0,0,0.05)'
        }}
      ></div>
    </div>
  );
};

export default HandwrittenNote;
