
import React, { useState, useEffect } from 'react';
import { CURATED_ROLEPLAYS } from '../services/staticData';
import { Button } from '../design-system/components/Button';
import { Badge } from '../design-system/components/Badge';
import { progressService } from '../services/progressService';

interface TopicSelectorProps {
  onSelect: (scriptId: string) => void;
}

const CATEGORIES = ['Social', 'Workplace', 'Service/Logistics', 'Advanced'] as const;

const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelect }) => {
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>('Social');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());

  useEffect(() => {
    const progress = progressService.getProgress();
    setCompletedScenarios(new Set(progress.completedScenarios));
    setCompletionPercentage(progressService.getCompletionPercentage(CURATED_ROLEPLAYS.length));
  }, []);

  const filteredScripts = CURATED_ROLEPLAYS.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000">
      {/* Hero Section with Progress */}
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

        {/* Progress Bar */}
        <div className="mt-8 space-y-2 max-w-xs mx-auto">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-900">Your Progress</span>
            <span className="font-bold text-indigo-600">{completionPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">{completedScenarios.size} of {CURATED_ROLEPLAYS.length} scenarios completed</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center gap-2 p-1 bg-slate-100 rounded-2xl max-w-fit mx-auto border border-slate-200">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className={activeCategory === cat ? 'scale-105' : ''}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Storybook Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredScripts.map((script) => {
          const isCompleted = completedScenarios.has(script.id);
          return (
            <button
              key={script.id}
              onClick={() => onSelect(script.id)}
              className="group relative h-96 bg-white rounded-[2.5rem] shadow-lg hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 overflow-hidden border border-slate-100 text-left flex flex-col p-8 hover:-translate-y-1"
            >
              {/* Background Aesthetic */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[10rem] group-hover:bg-indigo-100 transition-colors -mr-16 -mt-16"></div>

              {/* Completion Badge */}
              {isCompleted && (
                <div className="absolute top-6 right-6 z-20">
                  <Badge variant="success" size="sm" icon="✓">
                    Complete
                  </Badge>
                </div>
              )}

              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-6 w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300">
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
                    {isCompleted ? 'Review' : 'Enter Story'}
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </div>
              </div>

              {/* Book Spine Aesthetic */}
              <div className="absolute left-0 top-0 w-1.5 h-full bg-indigo-600/10 group-hover:bg-indigo-600 transition-colors"></div>
            </button>
          );
        })}
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
