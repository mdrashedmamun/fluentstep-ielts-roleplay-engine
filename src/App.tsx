
import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppView } from './types';
import Layout from './components/Layout';
import TopicSelector from './components/TopicSelector';
import RoleplayViewer from './components/RoleplayViewer';
import { OnboardingModal } from './components/OnboardingModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import ErrorBoundary from './components/ErrorBoundary';
import { useKeyboard } from './hooks/useKeyboard';
import { CURATED_ROLEPLAYS, RoleplayScript } from './services/staticData';

// Page Components
const TopicSelectorPage: React.FC<{ onSelect: (scriptId: string) => void }> = ({ onSelect }) => (
  <TopicSelector onSelect={onSelect} />
);

const ScenarioPage: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const [scriptId, setScriptId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract scenario ID from URL
    const pathParts = window.location.pathname.split('/');
    const scenarioIndex = pathParts.indexOf('scenario');
    if (scenarioIndex >= 0 && scenarioIndex + 1 < pathParts.length) {
      const id = pathParts[scenarioIndex + 1];
      setScriptId(decodeURIComponent(id));
    }
  }, []);

  if (!scriptId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-in zoom-in-95 duration-300">
        <div className="w-24 h-24 bg-red-50 text-red-500 border-red-100 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl border">
          <i className="fas fa-question"></i>
        </div>
        <div className="text-center space-y-4 max-w-lg">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Scenario Not Found</h2>
          <p className="text-slate-600 font-medium leading-relaxed px-6">The scenario you're looking for doesn't exist or has been moved.</p>
          <a href="/" className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all inline-block">
            Back to Scenarios
          </a>
        </div>
      </div>
    );
  }

  const script = CURATED_ROLEPLAYS.find(s => s.id === scriptId);

  if (!script) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-in zoom-in-95 duration-300">
        <div className="w-24 h-24 bg-red-50 text-red-500 border-red-100 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl border">
          <i className="fas fa-exclamation-triangle animate-bounce"></i>
        </div>
        <div className="text-center space-y-4 max-w-lg">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Invalid Scenario</h2>
          <p className="text-slate-600 font-medium leading-relaxed px-6">This scenario ID is invalid or no longer available.</p>
          <a href="/" className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all inline-block">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return <RoleplayViewer script={script} onReset={onReset} />;
};

const App: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Show onboarding on first visit
  useEffect(() => {
    const skipOnboarding = localStorage.getItem('fluentstep:skipOnboarding');
    if (!skipOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Keyboard shortcuts
  useKeyboard({
    onHelp: () => setShowKeyboardShortcuts(!showKeyboardShortcuts)
  });

  const handleReset = useCallback(() => {
    window.location.href = '/';
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Layout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-200 motion-safe:duration-300">
            <Routes>
              <Route path="/" element={<TopicSelectorPage onSelect={(id) => window.location.href = `/scenario/${id}`} />} />
              <Route path="/scenario/:scenarioId" element={<ScenarioPage onReset={handleReset} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Modals */}
          <OnboardingModal
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
          />
          <KeyboardShortcutsModal
            isOpen={showKeyboardShortcuts}
            onClose={() => setShowKeyboardShortcuts(false)}
          />
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
