
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 cursor-pointer group hover:opacity-75 transition-opacity">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-primary-200 group-hover:scale-105 transition-transform">FS</div>
            <span className="font-black text-slate-900 text-xl tracking-tight">FluentStep</span>
          </a>

          <div className="flex items-center gap-3">
            <button
              title="Keyboard Shortcuts (Press ?)"
              onClick={() => {}}
              className="hidden sm:flex px-3 py-1.5 text-slate-600 hover:text-primary-600 font-medium text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <i className="fas fa-keyboard mr-2"></i>
              ? Help
            </button>
            <span className="text-[10px] bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border border-primary-200">Pro Engine v1</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="bg-slate-900 py-10 mt-auto text-slate-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center gap-4 text-slate-500">
             <i className="fab fa-twitter hover:text-slate-300 cursor-pointer transition-colors"></i>
             <i className="fab fa-linkedin hover:text-slate-300 cursor-pointer transition-colors"></i>
             <i className="fas fa-envelope hover:text-slate-300 cursor-pointer transition-colors"></i>
          </div>
          <p className="text-sm text-slate-500 font-medium">© 2024 FluentStep. Master IELTS speaking through native pattern recognition.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
