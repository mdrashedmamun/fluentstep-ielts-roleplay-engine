import React, { ReactNode } from 'react';

type CardVariant = 'story' | 'panel' | 'bubble' | 'flat';
type SpeakerType = 'user' | 'assistant';

interface CardProps {
  variant?: CardVariant;
  speaker?: SpeakerType;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'panel',
  speaker,
  children,
  onClick,
  className = '',
  interactive = false
}) => {
  const baseClasses = 'bg-white overflow-hidden';

  const variantClasses: Record<CardVariant, string> = {
    story: 'h-96 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-primary-100 transition-all duration-300 border border-slate-100 flex flex-col p-8 hover:-translate-y-1 cursor-pointer',
    panel: 'rounded-xl shadow-md border border-slate-100 p-6 transition-all',
    bubble: 'p-6 rounded-2xl shadow-sm transition-all',
    flat: 'rounded-lg border border-slate-100 p-4'
  };

  const bubbleClasses = speaker === 'user'
    ? 'bg-slate-50 text-slate-900 rounded-tr-none border border-slate-100'
    : 'bg-primary-50 text-primary-900 rounded-tl-none border border-primary-100';

  const interactiveClasses = interactive && variant !== 'story'
    ? 'hover:border-primary-300 hover:shadow-md cursor-pointer transition-all'
    : '';

  const finalClasses = variant === 'bubble'
    ? `${baseClasses} ${variantClasses.bubble} ${bubbleClasses} ${className}`
    : `${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`;

  return (
    <div onClick={onClick} className={finalClasses} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      {children}
    </div>
  );
};
