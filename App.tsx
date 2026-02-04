
import React, { useState, useCallback, useMemo } from 'react';
import { AppView } from './types';
import Layout from './components/Layout';
import TopicSelector from './components/TopicSelector';
import RoleplayViewer from './components/RoleplayViewer';
import { generateRoleplay } from './services/groqService';

const LEARNING_QUOTES = [
  { text: "The limits of my language mean the limits of my world.", author: "Ludwig Wittgenstein" },
  { text: "Learning is the only thing the mind never exhausts, never fears, and never regrets.", author: "Leonardo da Vinci" },
  { text: "To have another language is to possess a second soul.", author: "Charlemagne" },
  { text: "Knowledge is the only treasure that increases when shared.", author: "Bhartrihari" },
  { text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King" }
];

const TOPIC_ICONS: Record<string, string> = {
  'Daily Life': 'fa-mug-hot',
  'Work': 'fa-briefcase',
  'Travel': 'fa-plane-departure',
  'Health': 'fa-heartbeat',
  'Shopping': 'fa-shopping-bag',
  'Education': 'fa-book-reader',
  'Technology': 'fa-microchip',
  'Environment': 'fa-seedling',
  'Relationships': 'fa-hands-helping',
  'Services': 'fa-concierge-bell',
  'Problems': 'fa-shield-virus',
  'Plans': 'fa-map-marked-alt'
};

const App: React.FC = () => {
  const [currentView, setView] = useState<AppView>(AppView.TOPIC_SELECTION);
  const [isLoading, setIsLoading] = useState(false);
  const [roleplayContent, setRoleplayContent] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roleplayCache, setRoleplayCache] = useState<Record<string, string>>({});
  const [dailyUsage, setDailyUsage] = useState<number>(() => {
    const saved = localStorage.getItem('fluentstep_daily_usage');
    const lastDate = localStorage.getItem('fluentstep_usage_date');
    const today = new Date().toDateString();

    if (lastDate !== today) {
      localStorage.setItem('fluentstep_usage_date', today);
      localStorage.setItem('fluentstep_daily_usage', '0');
      return 0;
    }
    return saved ? parseInt(saved, 10) : 0;
  });

  const activeQuote = useMemo(() => {
    return LEARNING_QUOTES[Math.floor(Math.random() * LEARNING_QUOTES.length)];
  }, [isLoading]);

  const handleTopicSelect = useCallback(async (topic: string) => {
    // Check Cache First (Zero cost)
    if (roleplayCache[topic]) {
      setRoleplayContent(roleplayCache[topic]);
      setSelectedTopic(topic);
      setView(AppView.ROLEPLAY_DISPLAY);
      return;
    }

    // Hard Limit for Free Tier Protection
    if (dailyUsage >= 50) {
      setError("Daily Free Tier Limit Reached (50/50). Please try again tomorrow or select a previously generated topic from your cache.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedTopic(topic);
    try {
      const content = await generateRoleplay(topic);
      if (content && content.length > 0) {
        setRoleplayContent(content);
        setRoleplayCache(prev => ({ ...prev, [topic]: content }));

        // Update Daily Usage
        const newUsage = dailyUsage + 1;
        setDailyUsage(newUsage);
        localStorage.setItem('fluentstep_daily_usage', newUsage.toString());

        setView(AppView.ROLEPLAY_DISPLAY);
      }
    } catch (err: any) {
      console.error("Error generating roleplay:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [roleplayCache, dailyUsage]);

  const handleReset = () => {
    setRoleplayContent(null);
    setSelectedTopic(null);
    setError(null);
    setView(AppView.TOPIC_SELECTION);
  };

  const renderContent = () => {
    if (isLoading) {
      const iconClass = selectedTopic ? TOPIC_ICONS[selectedTopic] || 'fa-brain' : 'fa-brain';
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-12 text-center animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-32 h-32 border-[6px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className={`fas ${iconClass} text-emerald-600 text-3xl animate-pulse`}></i>
            </div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-emerald-50">
              <i className="fas fa-bolt text-emerald-400"></i>
            </div>
          </div>

          <div className="max-w-md space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                Synthesizing Experience
              </div>
              <h2 className="text-4xl font-black text-emerald-950 tracking-tight leading-tight italic">
                "{activeQuote.text}"
              </h2>
              <p className="text-emerald-600 font-bold tracking-widest uppercase text-xs">— {activeQuote.author}</p>
            </div>

            <div className="pt-6 border-t border-emerald-100">
              <p className="text-emerald-800/40 text-sm font-medium">Constructing neural patterns for "{selectedTopic}"...</p>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      const isQuotaError = error.includes("QUOTA_EXHAUSTED");
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-in zoom-in-95 duration-300">
          <div className={`w-24 h-24 ${isQuotaError ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-red-50 text-red-500 border-red-100'} rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl border`}>
            <i className={`fas ${isQuotaError ? 'fa-hourglass-half' : 'fa-bolt-lightning'} animate-bounce`}></i>
          </div>
          <div className="text-center space-y-4 max-w-lg">
            <h2 className="text-3xl font-black text-emerald-950 tracking-tight">
              {isQuotaError ? "Quota Exceeded" : "System Interruption"}
            </h2>
            <p className="text-emerald-800/60 font-medium leading-relaxed px-6 whitespace-pre-wrap">
              {error}
            </p>
            {isQuotaError && (
              <a
                href="https://ai.google.dev/gemini-api/docs/billing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-emerald-600 font-bold underline hover:text-emerald-700"
              >
                Learn about API Billing & Quota
              </a>
            )}
            <div className="flex gap-4 justify-center pt-4">
              <button
                onClick={() => handleTopicSelect(selectedTopic || '')}
                className="px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 hover:-translate-y-1 active:scale-95"
              >
                Retry Synapse
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-3.5 bg-white border border-emerald-200 text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-all active:scale-95"
              >
                Abort
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case AppView.TOPIC_SELECTION:
        return <TopicSelector onSelect={handleTopicSelect} dailyUsage={dailyUsage} />;
      case AppView.ROLEPLAY_DISPLAY:
        return roleplayContent ? (
          <RoleplayViewer content={roleplayContent} onReset={handleReset} />
        ) : (
          <TopicSelector onSelect={handleTopicSelect} />
        );
      default:
        return <TopicSelector onSelect={handleTopicSelect} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setView}>
      {renderContent()}
    </Layout>
  );
};

export default App;
