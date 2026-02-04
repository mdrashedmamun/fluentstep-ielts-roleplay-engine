
import React from 'react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView(AppView.TOPIC_SELECTION)}>
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform">FS</div>
            <span className="font-extrabold text-emerald-900 text-xl tracking-tight">FluentStep</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setView(AppView.TOPIC_SELECTION)}
              className={`text-sm font-semibold transition-colors ${currentView === AppView.TOPIC_SELECTION || currentView === AppView.ROLEPLAY_DISPLAY ? 'text-emerald-600' : 'text-emerald-900/40 hover:text-emerald-700'}`}
            >
              Roleplays
            </button>
          </nav>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-emerald-200">Pro Engine</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12">
        {children}
      </main>

      <footer className="bg-emerald-950 py-10 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center gap-4 text-emerald-500/50">
             <i className="fab fa-twitter"></i>
             <i className="fab fa-linkedin"></i>
             <i className="fas fa-envelope"></i>
          </div>
          <p className="text-sm text-emerald-600 font-medium">© 2024 FluentStep AI Engine. Elevating language acquisition through design.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
