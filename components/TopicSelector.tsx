
import React from 'react';
import { IELTS_TOPICS } from '../constants';

interface TopicSelectorProps {
  onSelect: (topic: string) => void;
  dailyUsage: number;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelect, dailyUsage }) => {
  const FREE_TIER_LIMIT = 100; // Updated limit to verify deployment propagation

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="text-center max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
          <i className="fas fa-bolt text-[10px]"></i>
          Fluent Acquisition Mode
        </div>
        <h1 className="text-5xl font-black text-emerald-950 tracking-tight leading-tight">
          Master Fluency <br /><span className="text-emerald-600">Through Roleplay</span>
        </h1>
        <p className="text-lg text-emerald-800/70 leading-relaxed">
          Select a topic to generate a high-fidelity roleplay. <br />
          Designed to drill core conversational patterns into your subconscious.
        </p>

        <div className="pt-4">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white border border-emerald-100 rounded-2xl shadow-sm">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-800/40">Daily Capacity <span className="ml-1 text-[8px] opacity-30 italic">v1.5-STABLE</span></span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-emerald-600">{dailyUsage}</span>
                <span className="text-sm font-bold text-emerald-800/30">/ {FREE_TIER_LIMIT} sessions</span>
              </div>
            </div>
            <div className="w-px h-8 bg-emerald-50"></div>
            <p className="text-xs font-medium text-emerald-800/60 max-w-[180px] text-left">
              {dailyUsage >= FREE_TIER_LIMIT
                ? "Limit reached. Caching enabled for previous topics."
                : "Optimization active: Patterns are cached for efficiency."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {IELTS_TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => onSelect(topic)}
            className="group p-8 bg-white border border-emerald-100 rounded-2xl hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all text-left flex flex-col items-center justify-center gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-full -mr-10 -mt-10 group-hover:bg-emerald-100 transition-colors"></div>
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:rotate-6 transition-all duration-300">
              <i className={`fas ${getIcon(topic)} text-emerald-500 group-hover:text-white text-2xl`}></i>
            </div>
            <span className="font-bold text-emerald-900 group-hover:text-emerald-600 text-center">{topic}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

function getIcon(topic: string) {
  switch (topic) {
    case 'Daily Life': return 'fa-mug-hot';
    case 'Work': return 'fa-briefcase';
    case 'Travel': return 'fa-plane';
    case 'Health': return 'fa-stethoscope';
    case 'Shopping': return 'fa-shopping-cart';
    case 'Education': return 'fa-graduation-cap';
    case 'Technology': return 'fa-laptop-code';
    case 'Environment': return 'fa-leaf';
    case 'Relationships': return 'fa-users';
    case 'Services': return 'fa-concierge-bell';
    case 'Problems': return 'fa-exclamation-triangle';
    case 'Plans': return 'fa-calendar-alt';
    default: return 'fa-comment';
  }
}

export default TopicSelector;
