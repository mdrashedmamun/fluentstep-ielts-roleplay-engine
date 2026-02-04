
import React, { useState, useMemo } from 'react';

interface RoleplayViewerProps {
  content: string;
  onReset: () => void;
}

const TOPIC_ICONS: Record<string, string> = {
  'daily': 'fa-mug-hot',
  'work': 'fa-briefcase',
  'travel': 'fa-plane-departure',
  'health': 'fa-heartbeat',
  'shopping': 'fa-shopping-bag',
  'education': 'fa-book-reader',
  'technology': 'fa-microchip',
  'environment': 'fa-seedling',
  'relationships': 'fa-hands-helping',
  'services': 'fa-concierge-bell',
  'problems': 'fa-shield-virus',
  'plans': 'fa-map-marked-alt'
};

const InteractiveBlank: React.FC<{ primary: string; alts: string; index: number; forceShow: boolean }> = ({ primary, alts, index, forceShow }) => {
  const [isOpen, setIsOpen] = useState(false);
  const showAnswer = isOpen || forceShow;

  return (
    <span className="relative inline-block group mx-1 align-baseline">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-1.5 transition-all duration-300 rounded-xl font-bold border-2 flex items-center gap-2 group/btn ${
          showAnswer 
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md ring-2 ring-emerald-500/10' 
            : 'border-emerald-200 bg-white text-emerald-300 hover:border-emerald-400 hover:text-emerald-500 hover:shadow-lg'
        }`}
      >
        <span className="text-[10px] opacity-40 font-black group-hover/btn:opacity-100 transition-opacity">{index}</span>
        <span className="tracking-tight whitespace-nowrap">
          {showAnswer ? primary.replace(/\*/g, '') : '________'}
        </span>
        {!showAnswer && (
          <i className="fas fa-eye text-[10px] opacity-0 group-hover/btn:opacity-40 transition-opacity"></i>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-80 p-6 bg-white rounded-3xl shadow-[0_20px_50px_rgba(6,78,59,0.15)] border border-emerald-100 z-50 animate-in zoom-in-95 fade-in duration-200">
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-emerald-100 rotate-45"></div>
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Locked Chunk</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-200 px-2 py-0.5 border border-emerald-50 rounded-full">Ref: {index}</span>
            </div>
            
            <p className="text-emerald-950 font-black leading-tight text-xl tracking-tight">{primary.replace(/\*/g, '')}</p>
            
            {alts && alts.trim() !== '' && (
              <div className="pt-4 border-t border-emerald-50">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Native Alternatives</span>
                <div className="space-y-2">
                  {alts.split(',').map((alt, i) => (
                    <div key={i} className="flex items-start gap-2 text-emerald-800/70 text-sm font-semibold italic bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                      <span className="text-emerald-300 mt-1">•</span>
                      <span>{alt.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              className="w-full mt-2 py-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
            >
              Close Detail
            </button>
          </div>
        </div>
      )}
    </span>
  );
};

const RoleplayViewer: React.FC<RoleplayViewerProps> = ({ content, onReset }) => {
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  const { contextLine, roleplayLines, answers, topicKey } = useMemo(() => {
    // Only clean asterisks to keep "________" intact
    const cleanContent = content.replace(/\*/g, '');
    
    const sections = cleanContent.split(/## (Roleplay|Answer Variations)/i);
    const rpRaw = sections.indexOf('Roleplay') !== -1 ? sections[sections.indexOf('Roleplay') + 1] : cleanContent;
    const ansRaw = sections.indexOf('Answer Variations') !== -1 ? sections[sections.indexOf('Answer Variations') + 1] : '';

    const lines = rpRaw.split('\n').filter(l => l.trim().length > 0);
    
    const contextMatch = cleanContent.match(/Context:\s*(.*)/i);
    const context = contextMatch ? contextMatch[1] : null;

    const lowContext = (context || "").toLowerCase();
    const topicKey = Object.keys(TOPIC_ICONS).find(k => lowContext.includes(k)) || 'daily';

    const parsedAns: { primary: string; alts: string }[] = [];
    const ansLines = ansRaw.split('\n');
    ansLines.forEach(line => {
      const match = line.match(/^\d+\.\s*(.*?)\s*\/\s*Alts:\s*(.*)/i);
      if (match) {
        parsedAns.push({ primary: match[1].trim(), alts: match[2].trim() });
      } else {
        const simpleMatch = line.match(/^\d+\.\s*(.*)/);
        if (simpleMatch) parsedAns.push({ primary: simpleMatch[1].trim(), alts: '' });
      }
    });

    return { 
      contextLine: context, 
      roleplayLines: lines.filter(l => !l.toLowerCase().startsWith('context:')), 
      answers: parsedAns,
      topicKey
    };
  }, [content]);

  let blankCounter = 0;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-700 pb-20">
      <div className="flex justify-between items-center px-2">
        <button 
          onClick={onReset}
          className="group px-5 py-2.5 bg-white border border-emerald-100 text-emerald-700 hover:text-emerald-900 rounded-xl flex items-center gap-3 font-bold shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-95"
        >
          <i className="fas fa-arrow-left text-xs group-hover:-translate-x-1 transition-transform"></i> 
          Change Topic
        </button>
        <button 
          onClick={() => setShowAllAnswers(!showAllAnswers)}
          className={`text-sm font-bold px-6 py-2.5 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 ${
            showAllAnswers 
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' 
              : 'bg-white border-emerald-100 text-emerald-600 hover:border-emerald-300'
          }`}
        >
          <i className={`fas ${showAllAnswers ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          {showAllAnswers ? 'Hide All Keys' : 'Reveal All Answers'}
        </button>
      </div>

      {contextLine && (
        <div className="relative overflow-hidden bg-white border border-emerald-100 rounded-[32px] p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-center gap-10 group transition-all hover:shadow-xl hover:shadow-emerald-900/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-20"></div>
          
          <div className="relative w-28 h-28 flex-shrink-0">
            <div className="absolute inset-0 bg-emerald-50 rounded-[2.5rem] rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
            <div className="absolute inset-0 bg-emerald-100/50 rounded-[2.5rem] -rotate-3 group-hover:-rotate-6 transition-transform duration-500"></div>
            <div className="relative w-full h-full bg-white border border-emerald-100 rounded-[2.5rem] flex items-center justify-center shadow-inner overflow-hidden">
               <div className="w-16 h-16 bg-emerald-500/10 rounded-full absolute -bottom-4 -left-4 blur-xl"></div>
               <div className="w-16 h-16 bg-teal-500/10 rounded-full absolute -top-4 -right-4 blur-xl"></div>
               <i className={`fas ${TOPIC_ICONS[topicKey] || 'fa-comment-dots'} text-4xl text-emerald-500 group-hover:scale-125 transition-transform duration-700`}></i>
            </div>
          </div>

          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Scenario Blueprint</span>
            </div>
            <p className="text-emerald-950 font-bold text-xl leading-tight tracking-tight">
              {contextLine}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
               <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-emerald-100">Practice Mode: Active Recall</span>
               <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-emerald-100">UK Native Tone</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/40 backdrop-blur-xl rounded-[40px] p-6 md:p-12 border border-emerald-100 shadow-2xl shadow-emerald-900/5 space-y-12">
        {roleplayLines.map((line, lineIdx) => {
          const speakerMatch = line.match(/^([^:]+):/);
          const speaker = speakerMatch ? speakerMatch[1] : null;
          const text = speaker ? line.substring(speaker.length + 1).trim() : line;
          const isYou = speaker?.toLowerCase().includes('you');

          // Split by exactly 8 underscores
          const parts = text.split(/________/);

          return (
            <div 
              key={lineIdx} 
              className={`flex flex-col ${isYou ? 'items-end' : 'items-start'} group/line animate-in fade-in slide-in-from-bottom-4 duration-700`}
              style={{ animationDelay: `${lineIdx * 150}ms` }}
            >
              {speaker && (
                <div className={`flex items-center gap-2 mb-2 mx-6 ${isYou ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-2 h-2 rounded-full ${isYou ? 'bg-emerald-400' : 'bg-emerald-200'}`}></div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isYou ? 'text-emerald-600' : 'text-emerald-300'}`}>
                    {speaker}
                  </span>
                </div>
              )}
              <div className={`max-w-[95%] md:max-w-[85%] px-10 py-8 rounded-[2.5rem] shadow-sm leading-relaxed transition-all duration-300 text-lg ${
                isYou 
                  ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-tr-none shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/30' 
                  : 'bg-white text-emerald-950 border border-emerald-100 rounded-tl-none group-hover/line:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/50'
              }`}>
                <div className="inline leading-relaxed">
                  {parts.map((part, partIdx) => {
                    const items = [];
                    items.push(<span key={`txt-${partIdx}`} className="font-medium inline">{part}</span>);
                    if (partIdx < parts.length - 1) {
                      const ans = answers[blankCounter] || { primary: '???', alts: '' };
                      items.push(
                        <InteractiveBlank 
                          key={`blank-${blankCounter}`} 
                          index={blankCounter + 1}
                          primary={ans.primary} 
                          alts={ans.alts}
                          forceShow={showAllAnswers}
                        />
                      );
                      blankCounter++;
                    }
                    return items;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-emerald-900 rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] -mr-48 -mt-48 opacity-20 transition-all duration-1000 group-hover:scale-150"></div>
        <div className="relative z-10 space-y-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-emerald-950 shadow-xl shadow-emerald-400/20">
                  <i className="fas fa-brain animate-pulse text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tight">Interactive Training</h3>
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em]">Synaptic Priming Protocol</span>
                </div>
              </div>
              <p className="text-emerald-100/70 text-lg leading-relaxed font-medium">
                Try to guess the missing <span className="text-white font-bold">Universal Chunk</span> before clicking a blank. This interactive reveal reinforces the <span className="text-emerald-400">pattern retrieval</span> mechanism in your brain.
              </p>
            </div>
            
            <div className="bg-emerald-950/50 backdrop-blur-md border border-emerald-800/50 p-10 rounded-[2rem] space-y-5 shadow-2xl">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
                <i className="fas fa-microscope"></i> Methodology
              </div>
              <h4 className="text-xl font-bold">Interleaved Practice</h4>
              <p className="text-emerald-100/60 text-base italic leading-relaxed">
                Clicking the blanks revealed the primary pattern while hovering shows native alternatives. This targeted difficulty forces <span className="text-emerald-400">Neuroplasticity</span> by simulating real conversational pressure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleplayViewer;
