import React, { useState, useEffect } from 'react';
import { characterReactions, characterMoods, CharacterName, CharacterReaction, CharacterMood } from '../services/characterAnimations';

interface CharacterAvatarProps {
  name: string;
  isActive?: boolean;
  reaction?: CharacterReaction;
  size?: 'sm' | 'md' | 'lg';
  mood?: CharacterMood;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  name,
  isActive = false,
  reaction,
  size = 'md',
  mood = 'neutral'
}) => {
  const [showReaction, setShowReaction] = useState(false);
  const characterName: CharacterName = (name in characterReactions) ? (name as CharacterName) : 'Default';
  const character = characterReactions[characterName];
  const moodClass = characterMoods[mood];

  useEffect(() => {
    if (reaction) {
      setShowReaction(true);
      const timer = setTimeout(() => setShowReaction(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [reaction]);

  const sizeClasses = {
    sm: 'w-12 h-12 text-base',
    md: 'w-16 h-16 text-xl',
    lg: 'w-24 h-24 text-3xl'
  };

  const sizeNameClasses = {
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-[10px]'
  };

  return (
    <div className="relative">
      <div className={`
        ${sizeClasses[size]}
        rounded-2xl flex items-center justify-center
        font-bold font-display shadow-lg
        bg-gradient-to-br ${character.colors.gradient}
        text-white ring-4 ${character.colors.ring}
        transition-all duration-300
        ${isActive ? `${moodClass} ${character.colors.glow}` : moodClass}
      `}>
        {name[0].toUpperCase()}
      </div>

      {showReaction && reaction && (
        <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
          {character.reactions[reaction] || '✨'}
        </div>
      )}

      <p className={`${sizeNameClasses[size]} font-bold uppercase text-neutral-600 tracking-tight mt-1 text-center`}>
        {name}
      </p>
    </div>
  );
};
