
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import MuteToggle from './MuteToggle';
import { audioService } from '../services/audioService';
import { urlService } from '../services/urlService';
import { useKeyboard } from '../hooks/useKeyboard';
import { FilterState } from '../types/ux-enhancements';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(audioService.isMuted());
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Handle mute toggle
  const handleMuteToggle = () => {
    const newMuteState = audioService.toggleMute();
    setIsMuted(newMuteState);
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    // Update URL with new search query (debounced by urlService)
    const filters: FilterState = {
      difficulty: (searchParams.get('difficulty')?.split(',') || []) as ('B2' | 'C1')[],
      duration: (searchParams.get('duration')?.split(',') || []) as ('short' | 'medium' | 'long')[],
      status: (searchParams.get('status')?.split(',') || []) as ('not_started' | 'in_progress' | 'completed')[]
    };
    const sort = searchParams.get('sort') as any || 'recommended';
    urlService.updateURLWithFilters(filters, value, sort);
  };

  // Handle search clear
  const handleSearchClear = () => {
    setSearchValue('');
    urlService.clearURLFilters();
  };

  // Handle search focus from keyboard shortcut
  const handleSearchFocus = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      // Select all text for better UX
      searchInputRef.current.select();
    }
  };

  // Setup keyboard shortcuts
  useKeyboard({
    onSearch: handleSearchFocus
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2 cursor-pointer group hover:opacity-75 transition-opacity flex-shrink-0">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-primary-200 group-hover:scale-105 transition-transform">FS</div>
            <span className="font-black text-slate-900 text-xl tracking-tight hidden sm:inline">FluentStep</span>
          </a>

          {/* Search Bar - centered in header */}
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchValue}
              onChange={handleSearchChange}
              onClear={handleSearchClear}
              placeholder="Search scenarios..."
              inputRef={searchInputRef}
            />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Mute Toggle */}
            <MuteToggle
              isMuted={isMuted}
              onToggle={handleMuteToggle}
            />

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
