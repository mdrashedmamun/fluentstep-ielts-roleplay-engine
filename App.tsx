
import React, { useState, useCallback } from 'react';
import { AppView } from './types';
import Layout from './components/Layout';
import TopicSelector from './components/TopicSelector';
import RoleplayViewer from './components/RoleplayViewer';
import { CURATED_ROLEPLAYS, RoleplayScript } from './services/staticData';

const App: React.FC = () => {
  const [currentView, setView] = useState<AppView>(AppView.TOPIC_SELECTION);
  const [isLoading, setIsLoading] = useState(false);
  const [activeScript, setActiveScript] = useState<RoleplayScript | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScriptSelect = useCallback((scriptId: string) => {
    setIsLoading(true);
    // Simulate minor loading for "entering world" effect
    setTimeout(() => {
      const script = CURATED_ROLEPLAYS.find(s => s.id === scriptId);
      if (script) {
        setActiveScript(script);
        setView(AppView.ROLEPLAY_DISPLAY);
      } else {
        setError("Script not found.");
      }
      setIsLoading(false);
    }, 800);
  }, []);

  const handleReset = useCallback(() => {
    setActiveScript(null);
    setError(null);
    setView(AppView.TOPIC_SELECTION);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-12 text-center animate-in fade-in duration-500">
          <div className="w-32 h-32 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="space-y-2">
            <p className="text-indigo-950 font-black text-2xl tracking-tight animate-pulse">Entering Story World</p>
            <p className="text-indigo-800/40 text-sm font-medium">Preparing immersive environment...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-red-50 text-red-500 border-red-100 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl border">
            <i className="fas fa-bolt-lightning animate-bounce"></i>
          </div>
          <div className="text-center space-y-4 max-w-lg">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Interruption</h2>
            <p className="text-slate-600 font-medium leading-relaxed px-6">{error}</p>
            <button onClick={handleReset} className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
              Reset
            </button>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case AppView.TOPIC_SELECTION:
        return <TopicSelector onSelect={handleScriptSelect} />;
      case AppView.ROLEPLAY_DISPLAY:
        return activeScript ? (
          <RoleplayViewer script={activeScript} onReset={handleReset} />
        ) : (
          <TopicSelector onSelect={handleScriptSelect} />
        );
      default:
        return <TopicSelector onSelect={handleScriptSelect} />;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
