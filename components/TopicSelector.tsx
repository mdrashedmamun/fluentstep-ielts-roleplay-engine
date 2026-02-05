
import React, { useState } from 'react';
import { CURATED_ROLEPLAYS } from '../services/staticData';

interface TopicSelectorProps {
  onSelect: (scriptId: string) => void;
}

const CATEGORIES = ['Social', 'Workplace', 'Service/Logistics', 'Advanced'] as const;

const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelect }) => {
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>('Social');

  const filteredScripts = CURATED_ROLEPLAYS.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest">
          <i className="fas fa-book-open"></i>
          The Immersion Library
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Enter Your <br /><span className="text-indigo-600 italic">Fluency Story</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed font-medium">
          Choose a scenario from our curated collection. <br />
          Each story is crafted for 100% natural, high-impact English acquisition.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center gap-2 p-1 bg-slate-100 rounded-2xl max-w-fit mx-auto border border-slate-200">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 py-3 rounded-xl font-bold transition-all text-sm ${activeCategory === cat
                ? 'bg-white text-indigo-600 shadow-md scale-105'
                : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Storybook Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredScripts.map((script) => (
          <button
            key={script.id}
            onClick={() => onSelect(script.id)}
            className="group relative h-96 bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 overflow-hidden border border-slate-100 text-left flex flex-col p-8 hover:-translate-y-2"
          >
            {/* Background Aesthetic */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[10rem] group-hover:bg-indigo-100 transition-colors -mr-16 -mt-16"></div>

            <div className="relative z-10 h-full flex flex-col">
              <div className="mb-6 w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-500">
                <i className={`fas ${getIcon(script.category)} text-indigo-500 group-hover:text-white text-xl`}></i>
              </div>

              <div className="space-y-4 flex-grow">
                <h3 className="text-2xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                  {script.topic}
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {script.context}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-50 mt-auto flex items-center justify-between">
                <div className="flex -space-x-2">
                  {script.characters.map((char, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {char.name[0]}
                    </div>
                  ))}
                </div>
                <div className="text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                  Enter Story
                  <i className="fas fa-arrow-right"></i>
                </div>
              </div>
            </div>

            {/* Book Spine Aesthetic */}
            <div className="absolute left-0 top-0 w-1.5 h-full bg-indigo-600/10 group-hover:bg-indigo-600 transition-colors"></div>
          </button>
        ))}
      </div>
    </div>
  );
};

function getIcon(category: string) {
  switch (category) {
    case 'Social': return 'fa-users';
    case 'Workplace': return 'fa-briefcase';
    case 'Service/Logistics': return 'fa-concierge-bell';
    case 'Advanced': return 'fa-brain';
    default: return 'fa-book';
  }
}

export default TopicSelector;
