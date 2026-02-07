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
      description: 'Master IELTS speaking through pattern recognition, not vocabulary memorization.',
      icon: '🎯',
      content: 'FluentStep uses native expressions and answer variations to help you sound like a native English speaker.'
    },
    {
      title: 'Reveal Patterns',
      description: 'Click blanks to reveal native expressions and alternative answers.',
      icon: '🔍',
      content: 'Every blank contains multiple valid answers. Learn what variations native speakers use and when to use them.'
    },
    {
      title: 'Listen & Practice',
      description: 'Hear British English pronunciation and practice until you master the patterns.',
      icon: '🎧',
      content: 'Click the speaker icon to listen to native speakers deliver each line. Repetition builds muscle memory.'
    },
    {
      title: 'Track Progress',
      description: 'Your progress is saved automatically. Return to any scenario and continue where you left off.',
      icon: '✅',
      content: 'Complete all 36 scenarios to build a comprehensive inventory of IELTS-ready patterns.'
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

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300 shadow-2xl">
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= step ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center space-y-6 mb-8">
          <div className="text-6xl animate-bounce">{currentStep.icon}</div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">{currentStep.title}</h2>
            <p className="text-lg text-slate-600 font-medium">{currentStep.description}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{currentStep.content}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)} className="flex-1">
                Back
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleNext}
              className={!step ? 'flex-1' : ''}
            >
              {step === steps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>

          {/* Skip and checkbox */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-600">Don't show this again</span>
            </label>
            <button
              onClick={handleSkip}
              className="w-full text-sm text-slate-500 hover:text-slate-700 font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Skip tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
