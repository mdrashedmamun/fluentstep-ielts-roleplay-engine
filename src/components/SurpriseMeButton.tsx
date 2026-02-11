import React, { useState } from 'react';
import { RoleplayScript } from '../services/staticData';

interface SurpriseMeButtonProps {
  scenarios: RoleplayScript[];
  completedIds: string[];
  onSelect: (scenarioId: string) => void;
}

const SurpriseMeButton: React.FC<SurpriseMeButtonProps> = ({
  scenarios,
  completedIds,
  onSelect
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [isAllCompleted, setIsAllCompleted] = useState(completedIds.length === scenarios.length);

  // Filter out completed scenarios
  const availableScenarios = scenarios.filter(s => !completedIds.includes(s.id));

  const handleSurpriseMe = () => {
    if (availableScenarios.length === 0) return;

    setIsRolling(true);

    // Simulate dice roll animation (300ms)
    const rollDuration = 300;
    const rollInterval = setInterval(() => {
      // Visual feedback during roll
    }, 30);

    setTimeout(() => {
      clearInterval(rollInterval);
      setIsRolling(false);

      // Select random scenario
      const randomIndex = Math.floor(Math.random() * availableScenarios.length);
      const selectedScenario = availableScenarios[randomIndex];

      onSelect(selectedScenario.id);
    }, rollDuration);
  };

  if (isAllCompleted && completedIds.length === scenarios.length) {
    return (
      <button
        disabled
        className="
          px-6 py-3 rounded-2xl font-bold text-lg
          bg-gradient-to-r from-primary-100 to-accent-100
          text-primary-700 border-2 border-primary-300
          flex items-center gap-3 transition-all
          cursor-default opacity-75
        "
        title="You've completed all scenarios!"
        aria-label="All scenarios completed"
      >
        <i className="fas fa-trophy text-xl"></i>
        <span>All Completed!</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleSurpriseMe}
      disabled={isRolling || availableScenarios.length === 0}
      className={`
        px-6 py-3 rounded-2xl font-bold text-lg
        bg-gradient-to-r from-primary-500 to-primary-600
        text-white border-2 border-white
        flex items-center gap-3 transition-all duration-300
        shadow-lg shadow-primary-500/40
        hover:shadow-xl hover:shadow-primary-500/50 hover:scale-105
        active:scale-95
        disabled:opacity-60 disabled:cursor-not-allowed
        ${isRolling ? 'animate-bounce' : ''}
      `}
      title={`Discover a random scenario (${availableScenarios.length} remaining)`}
      aria-label="Surprise me with a random scenario"
    >
      <i
        className={`fas ${isRolling ? 'fa-dice' : 'fa-sparkles'} text-xl ${
          isRolling ? 'animate-spin' : 'animate-pulse'
        }`}
      ></i>
      <span>{isRolling ? 'Rolling...' : 'Surprise Me'}</span>
    </button>
  );
};

export default SurpriseMeButton;
