import React, { useState, useEffect } from 'react';
import { Button } from '../design-system/components/Button';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const steps = [
    {
      title: 'Welcome to FluentStep',
      description: 'Master IELTS speaking through pattern recognition and real-world conversations.',
      icon: '👋',
      content: 'FluentStep teaches you how native speakers truly talk. You\'ll learn authentic expressions that sound natural and confident.'
    },
    {
      title: 'Discover Native Patterns',
      description: 'Tap blanks to reveal native expressions and alternative answers.',
      icon: '✨',
      content: 'Every blank contains multiple valid answers. Learn what variations native speakers use and when to use them. It\'s about naturalness, not perfection.'
    },
    {
      title: 'Listen to Real English',
      description: 'Hear British English pronunciation from native speakers.',
      icon: '🎧',
      content: 'Click the speaker icon to listen to natural pronunciation. Hearing native speakers helps your brain lock in authentic patterns through repetition.'
    },
    {
      title: 'Climb Your Journey',
      description: 'Watch your progress as you complete scenarios and unlock achievements.',
      icon: '🏔️',
      content: 'Complete all 36 scenarios to reach the summit! Your progress is saved automatically, and you\'ll earn badges for your milestones.'
    }
  ];

  useEffect(() => {
    if (dontShowAgain && isOpen) {
      localStorage.setItem('fluentstep:skipOnboarding', 'true');
    }
  }, [dontShowAgain, isOpen]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('fluentstep:skipOnboarding', 'true');
    }
    onClose();
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    setDontShowAgain(true);
    handleClose();
  };

  if (!isOpen) return null;

  const currentStep = steps[step]!;
  const stepPercent = ((step + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-neutral-950/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
        {/* Warm Gradient Header */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 px-8 py-8 border-b-2 border-primary-100">
          {/* Progress indicator */}
          <div className="flex gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < step ? 'bg-success-500' : i === step ? 'bg-primary-500' : 'bg-neutral-300'
                }`}
              />
            ))}
          </div>

          {/* Step indicator */}
          <div className="text-right text-xs font-bold text-primary-700 uppercase tracking-wider">
            Step {step + 1} of {steps.length}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="text-7xl animate-bounce transition-all duration-300">
              {currentStep.icon}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-neutral-800 font-display">
                {currentStep.title}
              </h2>
              <p className="text-sm text-primary-700 font-semibold">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Detailed explanation */}
          <div className="bg-gradient-to-br from-neutral-50 to-orange-50 p-4 rounded-xl border-2 border-neutral-200">
            <p className="text-sm text-neutral-700 leading-relaxed">
              {currentStep.content}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 space-y-4 border-t border-neutral-100">
          <div className="flex gap-3 pt-4">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 px-4 py-2.5 border-2 border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:border-neutral-400 hover:bg-neutral-50 transition-all"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              className={`${
                step > 0 ? 'flex-1' : 'flex-1'
              } px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all hover:scale-105 active:scale-95`}
            >
              {step === steps.length - 1 ? 'Begin Your Journey! 🚀' : 'Next →'}
            </button>
          </div>

          {/* Skip option */}
          <button
            onClick={handleSkip}
            className="w-full text-xs text-neutral-500 hover:text-neutral-700 font-medium py-2 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Skip for now
          </button>

          {/* Don't show again */}
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-neutral-50 transition-colors">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
            <span className="text-xs text-neutral-600">Don't show this again</span>
          </label>
        </div>
      </div>
    </div>
  );
};
